-- Habilitamos la extensión para poder usar UUIDs como identificadores únicos.
-- Son mejores que los números secuenciales en sistemas distribuidos.
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabla para almacenar los roles del sistema
CREATE TABLE roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) UNIQUE NOT NULL, -- Ej: 'Superadmin', 'Contador', 'Ingeniero'
    description TEXT
);

-- Tabla para almacenar la información de los usuarios
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL, -- Guardaremos el hash de la contraseña, no la contraseña real
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tabla intermedia (pivote) para asignar roles a los usuarios
-- Un usuario puede tener múltiples roles, y un rol puede tener múltiples usuarios.
CREATE TABLE user_roles (
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, role_id) -- La clave primaria es la combinación de ambas IDs
);

-- Opcional: Insertamos los roles base para que existan desde el principio
INSERT INTO roles (name, description) VALUES ('Superadmin', 'Control total del sistema.');
INSERT INTO roles (name, description) VALUES ('Admin', 'Administrador de un área específica.');
INSERT INTO roles (name, description) VALUES ('User', 'Usuario con permisos de lectura y operación básica.');
