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

// --- Ruta para Obtener un usuario por su ID (solo para Admins) ---
router.get('/:id', [authenticateToken, authorizeRoles('Superadmin', 'Admin')], async (req, res) => {
    const { id } = req.params;

    try {
        // Obtenemos el perfil del usuario
        const userQuery = await pool.query("SELECT id, first_name, last_name, email, position, phone_number, is_active FROM users WHERE id = $1", [id]);
        if (userQuery.rows.length === 0) {
            return res.status(404).json({ message: 'Usuario no encontrado.' });
        }
        const user = userQuery.rows[0];

        // Obtenemos los roles del usuario
        const rolesQuery = await pool.query("SELECT r.name FROM roles r JOIN user_roles ur ON r.id = ur.role_id WHERE ur.user_id = $1", [id]);
        user.roles = rolesQuery.rows.map(r => r.name);

        res.json(user);

    } catch (error) {
        console.error(`Error al obtener el usuario ${id}:`, error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
});

// --- Ruta para Actualizar un usuario (lógica de roles diferenciada) ---
router.put('/:id', [authenticateToken, authorizeRoles('Superadmin', 'Admin')], async (req, res) => {
    const { id } = req.params;
    const { firstName, lastName, email, position, phoneNumber, isActive, roles } = req.body;
    const requestingUser = req.user; // El usuario que está haciendo la petición (del token JWT)

    // Validación de datos básicos
    if (!firstName || !lastName || !email) {
        return res.status(400).json({ message: 'Nombre, apellido y email son obligatorios.' });
    }

    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // 1. Actualizar la tabla 'users'
        await client.query(
            "UPDATE users SET first_name = $1, last_name = $2, email = $3, position = $4, phone_number = $5, is_active = $6, updated_at = NOW() WHERE id = $7",
            [firstName, lastName, email, position, phoneNumber, isActive, id]
        );

        // 2. Lógica de roles: solo el Superadmin puede cambiar roles
        if (requestingUser.roles.includes('Superadmin')) {
            if (!roles || !Array.isArray(roles)) {
                throw new Error('La lista de roles es obligatoria para el Superadmin.');
            }

            // Borramos los roles antiguos del usuario
            await client.query("DELETE FROM user_roles WHERE user_id = $1", [id]);

            // Insertamos los nuevos roles
            const rolesResult = await client.query("SELECT id FROM roles WHERE name = ANY($1::text[])", [roles]);
            if (rolesResult.rows.length !== roles.length) {
                throw new Error('Uno o más roles proporcionados no son válidos.');
            }
            for (const role of rolesResult.rows) {
                await client.query("INSERT INTO user_roles (user_id, role_id) VALUES ($1, $2)", [id, role.id]);
            }
        }
        // Si el usuario es un 'Admin' (y no 'Superadmin'), simplemente ignoramos la parte de los roles.
        // No puede cambiarlos, pero sí puede editar el resto de la información.

        await client.query('COMMIT');
        res.status(200).json({ message: `Usuario ${email} actualizado con éxito.` });

    } catch (error) {
        await client.query('ROLLBACK');
        console.error(`Error al actualizar el usuario ${id}:`, error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    } finally {
        client.release();
    }
});

// --- Ruta para Deshabilitar/Habilitar un usuario (solo Superadmin) ---
// Usamos el método DELETE por semántica REST (eliminar el acceso), pero la operación es un UPDATE.
router.delete('/:id', [authenticateToken, authorizeRoles('Superadmin')], async (req, res) => {
    const { id } = req.params;

    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // 1. Obtenemos el estado actual del usuario
        const userQuery = await client.query("SELECT is_active FROM users WHERE id = $1", [id]);
        if (userQuery.rows.length === 0) {
            return res.status(404).json({ message: 'Usuario no encontrado.' });
        }
        const currentState = userQuery.rows[0].is_active;

        // 2. Cambiamos el estado (si está activo, lo desactivamos, y viceversa)
        const newState = !currentState;
        await client.query("UPDATE users SET is_active = $1 WHERE id = $2", [newState, id]);
        
        // 3. Opcional pero recomendado: Invalidar sesiones activas del usuario.
        // Por ahora, lo dejamos pendiente. En un sistema más avanzado, aquí revocaríamos sus tokens JWT.

        await client.query('COMMIT');

        const actionMessage = newState ? 'habilitado' : 'deshabilitado';
        res.status(200).json({ message: `Usuario ${actionMessage} con éxito.` });

    } catch (error) {
        await client.query('ROLLBACK');
        console.error(`Error al cambiar el estado del usuario ${id}:`, error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    } finally {
        client.release();
    }
});

module.exports = router;