// src/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');

// 1. Guardián Básico: Verifica que el token sea válido
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Formato "Bearer TOKEN"

    if (token == null) {
        return res.status(401).json({ message: 'No se proporcionó token de autenticación.' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ message: 'Token inválido o expirado.' });
        }
        req.user = user; // Adjuntamos la información del usuario (del token) a la petición
        next(); // El token es válido, continuamos
    });
};

// 2. Guardián Avanzado: Verifica roles específicos
const authorizeRoles = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user || !req.user.roles) {
            return res.status(403).json({ message: 'Acceso denegado: no se encontraron roles.' });
        }

        const hasRequiredRole = req.user.roles.some(role => allowedRoles.includes(role));
        if (!hasRequiredRole) {
            return res.status(403).json({ message: 'No tienes los permisos necesarios para realizar esta acción.' });
        }
        next(); // El usuario tiene el rol requerido, continuamos
    };
};

module.exports = { authenticateToken, authorizeRoles };