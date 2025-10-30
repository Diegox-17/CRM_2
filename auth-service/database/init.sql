CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT
);

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    phone_number VARCHAR(50), -- NUEVO CAMPO
    position VARCHAR(100),    -- NUEVO CAMPO (puesto de trabajo)
    is_active BOOLEAN NOT NULL DEFAULT true, -- NUEVO CAMPO (para desactivar usuarios en lugar de borrarlos)
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE user_roles (
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, role_id)
);

INSERT INTO roles (name, description) VALUES ('Superadmin', 'Control total del sistema.');
INSERT INTO roles (name, description) VALUES ('Admin', 'Administrador de un área específica.');
INSERT INTO roles (name, description) VALUES ('User', 'Usuario con permisos de lectura y operación básica.');
