// Importamos la librería Express
const express = require('express');

// Creamos una instancia de la aplicación
const app = express();

// Definimos el puerto en el que escuchará el servidor.
// Tomará el valor de la variable de entorno PORT que definimos en docker-compose.yml, o 3000 si no existe.
const PORT = process.env.PORT || 3000;

// Definimos una ruta de prueba en la raíz del servidor
app.get('/', (req, res) => {
  res.json({ message: '¡El microservicio de autenticación está vivo!' });
});

// Iniciamos el servidor para que escuche peticiones en el puerto especificado
app.listen(PORT, () => {
  console.log(`Servicio de autenticación corriendo en el puerto ${PORT}`);
});
