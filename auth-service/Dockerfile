# Usamos una imagen oficial de Node.js como base. La versión 20 es LTS (Long Term Support).
FROM node:20-alpine

# Establecemos el directorio de trabajo dentro del contenedor.
WORKDIR /usr/src/app

# Copiamos los archivos de dependencias PRIMERO.
# Esto aprovecha el sistema de caché de Docker. Si no cambiamos las dependencias,
# no se volverán a instalar cada vez, haciendo la construcción mucho más rápida.
COPY package*.json ./

# Instalamos las dependencias del proyecto.
RUN npm install

# Copiamos el resto del código fuente de nuestra aplicación.
COPY . .

# Exponemos el puerto 3000 (el que usará nuestra app Node.js dentro del contenedor).
EXPOSE 3000

# El comando que se ejecutará cuando el contenedor se inicie.
# 'npm run dev' iniciará el servidor en modo de desarrollo (lo definiremos en package.json).
CMD [ "npm", "run", "dev" ]
