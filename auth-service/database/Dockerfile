# Empezamos desde la imagen oficial de PostGIS que ya usamos.
FROM postgis/postgis:15-3.4

# Copiamos nuestro script de inicialización DENTRO de la imagen durante el proceso de construcción.
# Este comando es a prueba de fallos. Si init.sql no existe, el build fallará.
COPY ./init.sql /docker-entrypoint-initdb.d/init.sql
