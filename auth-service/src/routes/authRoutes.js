const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../db'); // Importaremos la conexión a la BD desde un archivo separado

const router = express.Router();

// Endpoint: POST /api/auth/register
router.post('/register', async (req, res) => {
    const { firstName, lastName, email, password } = req.body;

    // 1. Validación simple de los datos de entrada
    if (!firstName || !lastName || !email || !password) {
        return res.status(400).json({ message: 'Todos los campos son obligatorios.' });
    }

    try {
        // 2. Hashear la contraseña antes de guardarla
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        // 3. Insertar el nuevo usuario en la base de datos
        // Usamos consultas parametrizadas ($1, $2, ...) para prevenir inyección SQL
        const newUser = await pool.query(
            "INSERT INTO users (first_name, last_name, email, password_hash) VALUES ($1, $2, $3, $4) RETURNING id, email, created_at",
            [firstName, lastName, email, passwordHash]
        );

        // 4. Devolver una respuesta de éxito
        res.status(201).json({
            message: 'Usuario registrado con éxito.',
            user: newUser.rows[0]
        });

    } catch (error) {
        // Manejo de errores (ej: email duplicado)
        if (error.code === '23505') { // Código de error de PostgreSQL para violación de unicidad
            return res.status(409).json({ message: 'El correo electrónico ya está registrado.' });
        }
        console.error('Error en el registro de usuario:', error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
});

router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Email y contraseña son obligatorios.' });
    }

    try {
        // 1. Buscar al usuario por su email
        const userResult = await pool.query("SELECT * FROM users WHERE email = $1", [email]);

        if (userResult.rows.length === 0) {
            return res.status(401).json({ message: 'Credenciales inválidas.' }); // No decimos si es el user o el pass por seguridad
        }
        const user = userResult.rows[0];

        // 2. Comparar la contraseña proporcionada con el hash almacenado
        const isMatch = await bcrypt.compare(password, user.password_hash);

        if (!isMatch) {
            return res.status(401).json({ message: 'Credenciales inválidas.' });
        }

        // 3. ¡NUEVO! Buscar los roles del usuario
        const userRolesResult = await pool.query(
            "SELECT r.name FROM roles r JOIN user_roles ur ON r.id = ur.role_id WHERE ur.user_id = $1",
            [user.id]
        );
        const roles = userRolesResult.rows.map(r => r.name); // ej: ['Admin', 'User']

        // 4. Si las credenciales son correctas, crear el JWT
        const payload = {
            id: user.id,
            email: user.email,
            roles: roles
        };

        // 5. Firmar el token
        const token = jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '1h' } // El token expira en 1 hora
        );

        // 6. Enviar el token al cliente
        res.status(200).json({
            message: 'Inicio de sesión exitoso.',
            token: token
        });

    } catch (error) {
        console.error('Error en el inicio de sesión:', error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
});

module.exports = router;