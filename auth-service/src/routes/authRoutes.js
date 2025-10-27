const express = require('express');
const bcrypt = require('bcryptjs');
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

module.exports = router;
