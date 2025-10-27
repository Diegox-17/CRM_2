// Importamos la librería Express
const express = require('express');
require('dotenv').config(); // Importamos dotenv para leer variables de entorno

// Creamos una instancia de la aplicación
const app = express();

// Definimos el puerto en el que escuchará el servidor.
// Tomará el valor de la variable de entorno PORT, o 3000 si no existe.
const PORT = process.env.PORT || 3000;

// Definimos una ruta de prueba en la raíz del servidor
app.get('/api/auth', (req, res) => {
  res.status(200).json({ message: '¡El microservicio de autenticación está vivo y responde!' });
});

// Iniciamos el servidor para que escuche peticiones en el puerto especificado
app.listen(PORT, () => {
  console.log(`Servicio de autenticación corriendo en el puerto ${PORT}`);
});
