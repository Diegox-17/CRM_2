# Usamos una imagen oficial de Node.js como base.
FROM node:20-alpine

# Establecemos el directorio de trabajo dentro del contenedor.
WORKDIR /usr/src/app

# Copiamos los archivos de dependencias.
COPY package*.json ./

# --- PASO DE DEPURACIÓN ---
# Listamos el contenido del directorio de trabajo para verificar si el COPY anterior funcionó.
RUN ls -la

# Instalamos las dependencias del proyecto.
RUN npm install

# Copiamos el resto del código fuente de nuestra aplicación.
COPY . .

# Exponemos el puerto 3000
EXPOSE 3000

# El comando que se ejecutará cuando el contenedor se inicie.
CMD [ "npm", "run", "dev" ]
