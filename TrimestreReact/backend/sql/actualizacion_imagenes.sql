-- ============================================================
-- MIGRACIÓN PARA UNA BASE DE DATOS HORIZONTE YA EXISTENTE
-- Ejecutar una sola vez si productos/servicios no tienen imagen_url.
-- ============================================================
USE horizonte_viajes;

ALTER TABLE productos ADD COLUMN IF NOT EXISTS imagen_url VARCHAR(500);
ALTER TABLE servicios ADD COLUMN IF NOT EXISTS imagen_url VARCHAR(500);

UPDATE productos
SET imagen_url = 'https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?w=1200&q=85'
WHERE nombre LIKE '%Cascada de Otoño%' AND (imagen_url IS NULL OR imagen_url = '');

UPDATE productos
SET imagen_url = 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=1200&q=85'
WHERE nombre LIKE '%Cabañas frente al Mar%' AND (imagen_url IS NULL OR imagen_url = '');

UPDATE servicios
SET imagen_url = 'https://images.unsplash.com/photo-1517824806704-9040b037703b?w=1200&q=85'
WHERE nombre LIKE '%Guía turístico privado%' AND (imagen_url IS NULL OR imagen_url = '');

UPDATE servicios
SET imagen_url = 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=1200&q=85'
WHERE nombre LIKE '%Transporte ida y vuelta%' AND (imagen_url IS NULL OR imagen_url = '');
