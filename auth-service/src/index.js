const express = require('express');
require('dotenv').config();
const { pool } = require('./db'); // Importamos la conexión
const authRoutes = require('./routes/authRoutes'); // Importamos nuestras rutas
const userRoutes = require('./routes/userRoutes'); // Importamos rutas de usuarios

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware para que Express pueda entender JSON en el cuerpo de las peticiones
app.use(express.json());

// Función para probar la conexión a la BD
const checkDbConnection = async () => {
    try {
        await pool.query('SELECT NOW()');
        console.log('Conexión a la base de datos establecida con éxito.');
    } catch (error) {
        console.error('Error al conectar con la base de datos:', error);
    }
};

// Rutas de la API
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

// Iniciamos el servidor
app.listen(PORT, () => {
    console.log(`Servicio de autenticación corriendo en el puerto ${PORT}`);
    checkDbConnection();
});
