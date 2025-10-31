// src/routes/userRoutes.js
const express = require('express');
const bcrypt = require('bcryptjs');
const { pool } = require('../db');
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');

const router = express.Router();

// Ruta para que un usuario obtenga su propia información
router.get('/me', authenticateToken, async (req, res) => {
    try {
        // La info del usuario (id, email, roles) ya está en req.user gracias al middleware
        const userProfile = await pool.query(
            "SELECT id, first_name, last_name, email, phone_number, position, created_at FROM users WHERE id = $1",
            [req.user.id]
        );
        if (userProfile.rows.length === 0) {
            return res.status(404).json({ message: 'Usuario no encontrado.' });
        }
        res.json(userProfile.rows[0]);
    } catch (error) {
        console.error('Error al obtener el perfil del usuario:', error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
});

// --- Rutas solo para Administradores ---

// Obtener todos los usuarios
router.get('/', [authenticateToken, authorizeRoles('Superadmin', 'Admin')], async (req, res) => {
    try {
        const allUsers = await pool.query("SELECT id, first_name, last_name, email, position, is_active FROM users ORDER BY created_at DESC");
        res.json(allUsers.rows);
    } catch (error) {
        console.error('Error al obtener todos los usuarios:', error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
});

// --- Ruta para Crear un nuevo usuario (solo para Admins) ---
router.post('/', [authenticateToken, authorizeRoles('Superadmin', 'Admin')], async (req, res) => {
    const { firstName, lastName, email, password, position, phoneNumber, roles } = req.body;

    // Validación
    if (!firstName || !lastName || !email || !password || !roles || !Array.isArray(roles) || roles.length === 0) {
        return res.status(400).json({ message: 'Nombre, apellido, email, contraseña y al menos un rol son obligatorios.' });
    }

    const client = await pool.connect(); // Obtenemos un cliente del pool para la transacción

    try {
        // --- INICIO DE LA TRANSACCIÓN ---
        await client.query('BEGIN');

        // 1. Hashear la contraseña
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        // 2. Insertar el nuevo usuario y obtener su ID
        const newUserQuery = await client.query(
            "INSERT INTO users (first_name, last_name, email, password_hash, position, phone_number) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id",
            [firstName, lastName, email, passwordHash, position, phoneNumber]
        );
        const userId = newUserQuery.rows[0].id;

        // 3. Obtener los IDs de los roles a partir de sus nombres
        // Usamos ANY($1::text[]) para buscar eficientemente en un array de strings
        const rolesResult = await client.query("SELECT id FROM roles WHERE name = ANY($1::text[])", [roles]);
        if (rolesResult.rows.length !== roles.length) {
            throw new Error('Uno o más roles proporcionados no son válidos.');
        }

        // 4. Insertar las relaciones en la tabla user_roles
        for (const role of rolesResult.rows) {
            await client.query("INSERT INTO user_roles (user_id, role_id) VALUES ($1, $2)", [userId, role.id]);
        }

        // --- FIN DE LA TRANSACCIÓN: Confirmar los cambios ---
        await client.query('COMMIT');

        res.status(201).json({ message: `Usuario ${email} creado con éxito.` });

    } catch (error) {
        // --- Si algo falla, revertir TODOS los cambios ---
        await client.query('ROLLBACK');
        console.error('Error al crear el usuario:', error);
        if (error.code === '23505') { // Email duplicado
            return res.status(409).json({ message: 'El correo electrónico ya está registrado.' });
        }
        res.status(500).json({ message: 'Error interno del servidor.' });
    } finally {
        // Liberar el cliente de vuelta al pool
        client.release();
    }
});

// (Más adelante añadiremos POST para crear, PUT para editar, DELETE para eliminar)

module.exports = router;