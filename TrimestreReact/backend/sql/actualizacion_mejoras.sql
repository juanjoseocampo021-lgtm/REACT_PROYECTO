USE horizonte_viajes;

ALTER TABLE productos ADD COLUMN IF NOT EXISTS region VARCHAR(30) NOT NULL DEFAULT 'Colombia';
UPDATE productos SET region = 'Colombia' WHERE region IS NULL OR region = '';

-- Las imágenes nuevas se almacenan en backend/uploads durante desarrollo/local.
-- Para Render, esta capa se puede sustituir posteriormente por Cloudinary.
