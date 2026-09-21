-- ============================================================
-- HORIZONTE VIAJES - BASE DE DATOS INICIAL
-- Compatible con el cuarto avance: React + Vite + FastAPI + SQL
-- ============================================================

CREATE DATABASE IF NOT EXISTS horizonte_viajes
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE horizonte_viajes;

CREATE TABLE IF NOT EXISTS roles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(30) NOT NULL UNIQUE
);

INSERT INTO roles (id, nombre) VALUES
  (1, 'administrador'),
  (2, 'empleado'),
  (3, 'cliente')
ON DUPLICATE KEY UPDATE nombre = VALUES(nombre);

CREATE TABLE IF NOT EXISTS usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(30) NOT NULL,
  apellido VARCHAR(30) NOT NULL,
  tipo_documento ENUM('CC', 'TI', 'CE') NOT NULL,
  numero_documento VARCHAR(10) NOT NULL UNIQUE,
  direccion VARCHAR(60) NOT NULL,
  telefono VARCHAR(10) NOT NULL,
  correo VARCHAR(50) NOT NULL UNIQUE,
  contrasena_hash VARCHAR(255) NOT NULL,
  rol_id INT NOT NULL DEFAULT 3,
  estado ENUM('activo', 'inactivo') NOT NULL DEFAULT 'activo',
  creado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_usuarios_rol FOREIGN KEY (rol_id) REFERENCES roles(id)
);

CREATE TABLE IF NOT EXISTS permisos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  rol_id INT NOT NULL,
  descripcion VARCHAR(100) NOT NULL,
  CONSTRAINT fk_permisos_rol FOREIGN KEY (rol_id) REFERENCES roles(id)
);

INSERT INTO permisos (rol_id, descripcion)
SELECT r.id, 'Gestionar usuarios, productos, servicios y reservas'
FROM roles r
WHERE r.nombre = 'administrador'
  AND NOT EXISTS (SELECT 1 FROM permisos p WHERE p.rol_id = r.id);

INSERT INTO permisos (rol_id, descripcion)
SELECT r.id, 'Gestionar productos, servicios y reservas'
FROM roles r
WHERE r.nombre = 'empleado'
  AND NOT EXISTS (SELECT 1 FROM permisos p WHERE p.rol_id = r.id);

INSERT INTO permisos (rol_id, descripcion)
SELECT r.id, 'Consultar experiencias y gestionar sus reservas y perfil'
FROM roles r
WHERE r.nombre = 'cliente'
  AND NOT EXISTS (SELECT 1 FROM permisos p WHERE p.rol_id = r.id);

CREATE TABLE IF NOT EXISTS productos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(80) NOT NULL,
  descripcion VARCHAR(255),
  precio DECIMAL(10, 2) NOT NULL DEFAULT 0,
  imagen_url VARCHAR(500),
  region VARCHAR(30) NOT NULL DEFAULT 'Colombia',
  estado ENUM('activo', 'inactivo') NOT NULL DEFAULT 'activo',
  creado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_productos_estado (estado)
);

CREATE TABLE IF NOT EXISTS servicios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(80) NOT NULL,
  descripcion VARCHAR(255),
  precio DECIMAL(10, 2) NOT NULL DEFAULT 0,
  imagen_url VARCHAR(500),
  estado ENUM('activo', 'inactivo') NOT NULL DEFAULT 'activo',
  creado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_servicios_estado (estado)
);

CREATE TABLE IF NOT EXISTS reservas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT NOT NULL,
  tipo ENUM('producto', 'servicio') NOT NULL,
  item_id INT NOT NULL,
  nombre_item VARCHAR(80) NOT NULL,
  precio_item DECIMAL(10, 2) NOT NULL,
  fecha_viaje DATE NOT NULL,
  personas INT NOT NULL DEFAULT 1,
  notas VARCHAR(255),
  estado ENUM('pendiente', 'confirmada', 'cancelada') NOT NULL DEFAULT 'pendiente',
  creado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_reservas_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
  INDEX idx_reservas_usuario (usuario_id),
  INDEX idx_reservas_estado (estado)
);

CREATE TABLE IF NOT EXISTS mensajes_contacto (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(30) NOT NULL,
  correo VARCHAR(50) NOT NULL,
  mensaje VARCHAR(300) NOT NULL,
  leido BOOLEAN NOT NULL DEFAULT FALSE,
  creado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Datos de demostración: se insertan solo si todavía no existen.
INSERT INTO productos (nombre, descripcion, precio, imagen_url)
SELECT 'Paquete Cascada de Otoño',
       'Tour guiado de un día a la cascada con almuerzo incluido',
       250000,
       'https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?w=1200&q=85'
WHERE NOT EXISTS (SELECT 1 FROM productos WHERE nombre = 'Paquete Cascada de Otoño');

INSERT INTO productos (nombre, descripcion, precio, imagen_url)
SELECT 'Paquete Cabañas frente al Mar',
       'Estadía de 3 noches en cabaña frente al mar',
       890000,
       'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=1200&q=85'
WHERE NOT EXISTS (SELECT 1 FROM productos WHERE nombre = 'Paquete Cabañas frente al Mar');

INSERT INTO servicios (nombre, descripcion, precio, imagen_url)
SELECT 'Guía turístico privado',
       'Acompañamiento personalizado durante todo el recorrido',
       120000,
       'https://images.unsplash.com/photo-1517824806704-9040b037703b?w=1200&q=85'
WHERE NOT EXISTS (SELECT 1 FROM servicios WHERE nombre = 'Guía turístico privado');

INSERT INTO servicios (nombre, descripcion, precio, imagen_url)
SELECT 'Transporte ida y vuelta',
       'Transporte cómodo desde el punto de encuentro hasta el destino',
       80000,
       'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=1200&q=85'
WHERE NOT EXISTS (SELECT 1 FROM servicios WHERE nombre = 'Transporte ida y vuelta');
