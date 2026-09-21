# Horizonte Viajes — Cuarto avance mejorado

Proyecto React + Vite + FastAPI con autenticación JWT, roles, reservas, paneles independientes y catálogo de destinos.

## Mejoras incluidas

- Dashboard independiente del sitio público para administrador, empleado y cliente.
- Sidebar y topbar reutilizables con navegación por rol.
- Resumen con métricas y actividad reciente.
- Buscadores, filtros por estado y badges de estado.
- Modales propios de confirmación en lugar de `confirm()` del navegador.
- Skeleton loading en tablas.
- Subida de imágenes desde el PC (JPG, PNG, WEBP, GIF; máximo 5 MB) con vista previa.
- Almacenamiento local en `backend/uploads` preparado para sustituirse por Cloudinary al desplegar.
- Regiones para paquetes: Colombia, Caribe, América, Europa, Asia, África y Oceanía.
- Nueva página `/destinos` con búsqueda y filtro por región.
- Footer con enlaces funcionales a regiones.
- Formulario de contacto precargable para sugerir destinos sin resultados.
- Validación de fecha de viaje futura ya existente y conservada.
- Página 404 personalizada.
- Reporte CSV descargable compatible con Excel.
- Diseño responsive para paneles y catálogo.

## 1. Base de datos

### Instalación nueva
Ejecuta en MySQL:

```sql
SOURCE backend/sql/horizonte_viajes.sql;
```

### Base existente
Ejecuta después:

```sql
SOURCE backend/sql/actualizacion_mejoras.sql;
```

Esta migración agrega `productos.region`.

## 2. Backend

Desde `backend/`:

```bash
python -m venv .venv
```

Windows:

```bash
.venv\Scripts\activate
```

Linux/macOS:

```bash
source .venv/bin/activate
```

Instala dependencias:

```bash
pip install -r requirements.txt
```

Copia `.env.example` como `.env` y configura MySQL y una clave JWT privada.

Inicia FastAPI:

```bash
uvicorn app.main:app --reload --port 8000
```

Comprueba:

- `http://localhost:8000/`
- `http://localhost:8000/api/salud`

Las imágenes locales se sirven desde `http://localhost:8000/uploads/...`.

## 3. Frontend

Desde `frontend/`:

```bash
npm install
npm run dev
```

Si el backend está en otra dirección, crea `.env` a partir de `.env.example`:

```env
VITE_API_URL=http://localhost:8000/api
```

## 4. Rutas principales

### Público

- `/`
- `/quienes`
- `/servicios`
- `/destinos`
- `/destino/:id`
- `/contacto`
- `/login`
- `/recuperar`

### Paneles

- `/panel-admin`
- `/panel-empleado`
- `/panel-cliente`

Los paneles requieren autenticación y respetan los roles existentes.

## 5. Prueba funcional recomendada

1. Levanta MySQL.
2. Ejecuta la migración.
3. Levanta FastAPI.
4. Levanta Vite.
5. Inicia sesión con un administrador.
6. Abre el panel y verifica métricas, usuarios, paquetes, servicios, reservas y mensajes.
7. Crea un paquete y selecciona una región.
8. Sube una imagen desde el PC y verifica la vista previa.
9. Abre `/destinos` y prueba búsqueda y filtros.
10. Cierra sesión y prueba empleado y cliente.
11. Como cliente crea una reserva con fecha futura.
12. Como empleado/admin confirma o cancela la reserva.
13. Verifica el reporte CSV en el panel administrativo.

## 6. Antes de Render

El almacenamiento local de imágenes es intencional para esta etapa. Render puede utilizar almacenamiento efímero, por lo que antes del despliegue conviene cambiar la implementación de `/api/uploads/imagen` para subir a Cloudinary y conservar las URLs.

También se debe configurar `CORS_ORIGINS`, `JWT_SECRET`, las variables de MySQL y `VITE_API_URL` con las direcciones reales de producción.
