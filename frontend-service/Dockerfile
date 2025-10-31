# --- Etapa 1: Construcción (Builder) ---
# Usamos una imagen de Node para tener acceso a npm y construir nuestro proyecto
FROM node:20-alpine as builder

# Establecemos el directorio de trabajo
WORKDIR /app

# Copiamos los archivos de dependencias e instalamos
COPY package*.json ./
RUN npm install

# Copiamos todo el código fuente
COPY . .

# Construimos la aplicación para producción. Esto crea una carpeta 'dist' optimizada.
RUN npm run build

# --- Etapa 2: Producción (Production) ---
# Usamos una imagen de NGINX súper ligera para servir nuestros archivos estáticos
FROM nginx:1.25-alpine

# Copiamos los archivos estáticos construidos en la etapa anterior a la carpeta pública de NGINX
COPY --from=builder /app/dist /usr/share/nginx/html

# Exponemos el puerto 80, que es el puerto por defecto de NGINX
EXPOSE 80

# El comando por defecto de la imagen de NGINX se encargará de iniciar el servidor
CMD ["nginx", "-g", "daemon off;"]

# Esto sobrescribirá la configuración por defecto de NGINX
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]