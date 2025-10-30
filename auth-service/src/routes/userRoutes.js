// src/routes/userRoutes.js
const express = require('express');
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

// (Más adelante añadiremos POST para crear, PUT para editar, DELETE para eliminar)

module.exports = router;