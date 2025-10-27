# Usamos una imagen oficial de Node.js
FROM node:20-alpine

# Creamos el directorio de trabajo
WORKDIR /usr/src/app

# Copiamos los archivos de dependencias DESDE EL CONTEXTO (la raíz del proyecto)
# a la carpeta de trabajo actual (WORKDIR)
COPY auth-service/package*.json ./

# Instalamos las dependencias
RUN npm install

# Copiamos el resto del código de la aplicación DESDE EL CONTEXTO
# a la carpeta de trabajo actual (WORKDIR)
COPY auth-service/. .

# Exponemos el puerto que usará la aplicación
EXPOSE 3000

# El comando para iniciar la aplicación
CMD [ "npm", "run", "dev" ]
