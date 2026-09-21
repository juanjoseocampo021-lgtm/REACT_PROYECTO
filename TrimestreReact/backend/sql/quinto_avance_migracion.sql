-- ============================================================
-- MIGRACIÓN: Quinto Avance - Horizonte Viajes
-- Nuevas tablas: ventas, detalle_ventas, facturas, pqr,
--                conversaciones, mensajes_chat
-- ============================================================

-- Tabla de ventas
CREATE TABLE IF NOT EXISTS `ventas` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `usuario_id` INT NOT NULL,
    `cliente_nombre` VARCHAR(60) NOT NULL,
    `cliente_documento` VARCHAR(10) NOT NULL,
    `cliente_correo` VARCHAR(50) NOT NULL,
    `cliente_telefono` VARCHAR(10) NOT NULL,
    `subtotal` DECIMAL(10,2) NOT NULL DEFAULT 0,
    `impuestos` DECIMAL(10,2) NOT NULL DEFAULT 0,
    `descuento` DECIMAL(10,2) NOT NULL DEFAULT 0,
    `total` DECIMAL(10,2) NOT NULL DEFAULT 0,
    `estado` ENUM('pendiente', 'completada', 'cancelada') NOT NULL DEFAULT 'pendiente',
    `notas` VARCHAR(255),
    `creado_en` DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`usuario_id`) REFERENCES `usuarios`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabla de detalle de ventas
CREATE TABLE IF NOT EXISTS `detalle_ventas` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `venta_id` INT NOT NULL,
    `tipo` ENUM('producto', 'servicio') NOT NULL,
    `item_id` INT NOT NULL,
    `nombre_item` VARCHAR(80) NOT NULL,
    `cantidad` INT NOT NULL DEFAULT 1,
    `precio_unitario` DECIMAL(10,2) NOT NULL,
    `subtotal` DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (`venta_id`) REFERENCES `ventas`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabla de facturas
CREATE TABLE IF NOT EXISTS `facturas` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `venta_id` INT NOT NULL,
    `numero_factura` VARCHAR(20) UNIQUE NOT NULL,
    `cliente_nombre` VARCHAR(60) NOT NULL,
    `cliente_documento` VARCHAR(10) NOT NULL,
    `cliente_correo` VARCHAR(50) NOT NULL,
    `cliente_telefono` VARCHAR(10) NOT NULL,
    `subtotal` DECIMAL(10,2) NOT NULL DEFAULT 0,
    `impuestos` DECIMAL(10,2) NOT NULL DEFAULT 0,
    `descuento` DECIMAL(10,2) NOT NULL DEFAULT 0,
    `total` DECIMAL(10,2) NOT NULL DEFAULT 0,
    `estado` ENUM('pendiente', 'pagada', 'anulada') NOT NULL DEFAULT 'pendiente',
    `creado_en` DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`venta_id`) REFERENCES `ventas`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabla de PQR (Peticiones, Quejas, Reclamos)
CREATE TABLE IF NOT EXISTS `pqr` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `usuario_id` INT NOT NULL,
    `tipo` ENUM('peticion', 'queja', 'reclamo') NOT NULL,
    `asunto` VARCHAR(100) NOT NULL,
    `descripcion` VARCHAR(500) NOT NULL,
    `estado` ENUM('pendiente', 'en_proceso', 'respondida', 'cerrada') NOT NULL DEFAULT 'pendiente',
    `respuesta` VARCHAR(500),
    `creado_en` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `actualizado_en` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (`usuario_id`) REFERENCES `usuarios`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabla de conversaciones (chatbot)
CREATE TABLE IF NOT EXISTS `conversaciones` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `usuario_id` INT NOT NULL,
    `titulo` VARCHAR(100) NOT NULL DEFAULT 'Nueva conversación',
    `creado_en` DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`usuario_id`) REFERENCES `usuarios`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabla de mensajes del chatbot
CREATE TABLE IF NOT EXISTS `mensajes_chat` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `conversacion_id` INT NOT NULL,
    `rol` ENUM('usuario', 'asistente') NOT NULL,
    `contenido` VARCHAR(2000) NOT NULL,
    `creado_en` DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`conversacion_id`) REFERENCES `conversaciones`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
