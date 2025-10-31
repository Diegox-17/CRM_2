// src/routes/roleRoutes.js
const express = require('express');
const { pool } = require('../db');
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');

const router = express.Router();

// Ruta para obtener todos los roles disponibles
// Protegida para que solo los admins puedan ver la lista de roles
router.get('/', [authenticateToken, authorizeRoles('Superadmin', 'Admin')], async (req, res) => {
    try {
        const roles = await pool.query("SELECT id, name FROM roles ORDER BY name");
        res.json(roles.rows);
    } catch (error) {
        console.error('Error al obtener los roles:', error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
});

module.exports = router;