const express = require('express');
require('dotenv').config();
const { Pool } = require('pg'); // Importamos el cliente de PostgreSQL

// Creamos una instancia de la aplicación
const app = express();
const PORT = process.env.PORT || 3000;

// Configuración de la conexión a la base de datos
// La variable DATABASE_URL la lee automáticamente desde el entorno que definimos en docker-compose.yml
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Función asíncrona para probar la conexión
const checkDbConnection = async () => {
  try {
    await pool.query('SELECT NOW()'); // Hacemos una consulta simple para verificar la conexión
    console.log('Conexión a la base de datos establecida con éxito.');
  } catch (error) {
    console.error('Error al conectar con la base de datos:', error);
  }
};

// Rutas de la API
app.get('/api/auth', (req, res) => {
  res.status(200).json({ message: '¡El microservicio de autenticación está vivo y responde!' });
});

// Iniciamos el servidor
app.listen(PORT, () => {
  console.log(`Servicio de autenticación corriendo en el puerto ${PORT}`);
  checkDbConnection(); // Llamamos a la función de verificación cuando el servidor arranca
});
