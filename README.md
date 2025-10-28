# CRM Consilium - v1.0.1

## Descripción

CRM Consilium es un sistema de gestión de relaciones con clientes (CRM) y de proyectos, diseñado a medida para las necesidades de una consultora de ingeniería y medio ambiente. Construido sobre una arquitectura de microservicios, el sistema está diseñado para ser altamente escalable, resiliente y personalizable, con el objetivo de automatizar y optimizar los flujos de trabajo de la empresa.

Esta primera versión establece la base fundamental del sistema: el servicio de autenticación y gestión de usuarios.

## Características Principales (v1.0.1)

*   **Servicio de Autenticación:** Módulo central para la gestión de la seguridad.
*   **Registro de Usuarios:** Creación de nuevas cuentas de usuario con contraseñas seguras (hasheadas con bcrypt).
*   **Inicio de Sesión (Login):** Verificación de credenciales y emisión de JSON Web Tokens (JWT) para sesiones seguras.
*   **Base de Datos Persistente:** La información de usuarios y roles se almacena de forma segura y persistente.
*   **Entorno 100% Dockerizado:** Toda la aplicación se ejecuta en contenedores, garantizando la consistencia entre entornos de desarrollo y producción.

## Arquitectura y Stack Tecnológico

*   **Backend:** Node.js con Express.js
*   **Base de Datos:** PostgreSQL con la extensión PostGIS
*   **Contenerización:** Docker y Docker Compose
*   **Orquestación y Despliegue:** Portainer
*   **Proxy Inverso y SSL:** NGINX Proxy Manager

## Puesta en Marcha (Entorno de Desarrollo Local)

Sigue estos pasos para levantar el proyecto en un entorno de desarrollo.

**Prerrequisitos:**
*   Git
*   Docker
*   Docker Compose

**Pasos:**

1.  **Clonar el repositorio:**
    ```bash
    git clone https://github.com/Diegox-17/CRM_2.git
    cd CRM_2
    ```

2.  **Configurar las variables de entorno:**
    (Opcional, pero buena práctica) Se puede crear un archivo `.env` en la raíz para gestionar los secretos, que no debe ser subido a Git.

3.  **Levantar los servicios:**
    Este comando construirá las imágenes de los servicios y los iniciará en segundo plano.
    ```bash
    docker-compose up -d --build
    ```

4.  **Verificar el estado:**
    ```bash
    docker ps
    ```
    Deberías ver los contenedores `crm_auth` y `crm_db` en estado `Up`.

## Endpoints de la API (v1.0.1)

### Autenticación

#### `POST /api/auth/register`
Registra un nuevo usuario en el sistema.

**Body (JSON):**
```json
{
    "firstName": "Nombre",
    "lastName": "Apellido",
    "email": "correo@ejemplo.com",
    "password": "una-contraseña-segura"
}
```

Respuesta Exitosa (201 Created):
```json
{
    "message": "Usuario registrado con éxito.",
    "user": {
        "id": "el-uuid-del-usuario",
        "email": "correo@ejemplo.com",
        "created_at": "la-fecha-de-creacion"
    }
}
```

POST /api/auth/login
Inicia sesión y devuelve un token de autenticación.
```json
{
    "email": "correo@ejemplo.com",
    "password": "una-contraseña-segura"
}
```

Respuesta Exitosa (200 OK):
```json
{
    "message": "Inicio de sesión exitoso.",
    "token": "el.token.jwt"
}
```


### 2. El "System Prompt" para Futuros Microservicios

Este es el documento estratégico. Es una guía clara y concisa para que cualquier desarrollador (o IA) pueda crear un nuevo módulo que se integre perfectamente en tu arquitectura. Guárdalo como un documento aparte, por ejemplo `SYSTEM_PROMPT.md`.

```markdown
# System Prompt: Creación de un Nuevo Microservicio para CRM Consilium

## 1. Contexto General del Proyecto

Eres un desarrollador experto en backend encargado de extender las funcionalidades de CRM Consilium. Este es un CRM interno para una consultora de ingeniería y medio ambiente. El sistema está completamente pulverizado en microservicios, diseñado para ser MUY escalable y a prueba de rupturas. El objetivo es la máxima automatización y eficiencia.

## 2. Principios de Arquitectura (Reglas Obligatorias)

Todo nuevo microservicio DEBE seguir estos principios sin excepción:

*   **Aislamiento:** Cada microservicio es una aplicación independiente y autocontenida. No comparte código directamente con otros servicios, solo se comunica a través de APIs.
*   **Contenerización:** Cada microservicio debe tener su propio `Dockerfile` y ser gestionado a través del `docker-compose.yml` principal.
*   **Base de Datos Centralizada:** Todos los microservicios que necesiten persistencia de datos utilizarán la única base de datos central de PostgreSQL (`crm_db`). La comunicación se realiza a través de la red interna de Docker.
*   **Comunicación Interna:** La comunicación entre microservicios se realiza a través de la red interna de Docker (`crm-internal`), llamando a los otros servicios por su nombre de contenedor (ej: `http://crm_auth:3000`).

## 3. Stack Tecnológico Estándar

*   **Lenguaje/Framework:** Node.js con Express.js
*   **Cliente de Base de Datos:** `pg` (node-postgres)
*   **Gestión de Dependencias:** `npm`
*   **Variables de Entorno:** `dotenv`

## 4. Estructura de Archivos a Replicar

Cada nuevo microservicio debe seguir la estructura de carpetas establecida. Por ejemplo, para un nuevo servicio llamado "proyectos":
/proyectos-service/
├── src/
│ ├── routes/
│ │ └── proyectosRoutes.js # Lógica de las rutas
│ ├── controllers/
│ │ └── proyectosController.js # Lógica de negocio
│ ├── db.js # Configuración y exportación del pool de conexión a la BD
│ └── index.js # Punto de entrada del servidor Express
├── .dockerignore
├── Dockerfile
└── package.json
code
Code
## 5. Integración con el Stack Existente (`docker-compose.yml`)

El nuevo servicio debe ser añadido al `docker-compose.yml` principal. El siguiente es un template que debes adaptar:

```yaml
# ... (dentro de la sección 'services')

  <nombre-servicio>: # ej: proyectos
    container_name: crm_<nombre-servicio> # ej: crm_proyectos
    build:
      context: ./auth-service/<nombre-servicio>-service # ej: ./auth-service/proyectos-service
      dockerfile: Dockerfile
    restart: unless-stopped
    environment:
      - DATABASE_URL=postgres://consilium_user:supersecretpassword@crm_db:5432/consilium_db
      - PORT=3000
      # ... (otras variables de entorno que necesites)
    depends_on:
      - db
    networks:
      # Si necesita ser accesible desde el exterior vía NGINX
      - proxy-net
      # Siempre debe estar en la red interna para hablar con la BD y otros servicios
      - crm-internal

## 6. Tarea Específica a Desarrollar
[AQUÍ SE INCLUIRÁ LA DESCRIPCIÓN DETALLADA DEL NUEVO MICROSERVICIO]
Ejemplo: "Tu tarea es crear el microservicio de 'Proyectos'. Debe exponer endpoints CRUD (Crear, Leer, Actualizar, Eliminar) para gestionar los proyectos de la consultora. Un proyecto debe tener un nombre, un cliente asociado, una fecha de inicio y una fecha de fin. Debes crear una nueva tabla projects en la base de datos..."
