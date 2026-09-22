# Horizonte Viajes - Plataforma Turistica Full Stack

Plataforma web completa para la gestion de viajes y experiencias turisticas, desarrollada con React + Vite en el frontend y FastAPI + MySQL en el backend, integrando inteligencia artificial para atencion al cliente.

## Enlaces de Despliegue

| Servicio | URL |
|---|---|
| **Frontend** | https://horizonte-frontend.onrender.com |
| **Backend API** | https://horizonte-api-722f.onrender.com |
| **Swagger (Documentacion)** | https://horizonte-api-722f.onrender.com/docs |
| **Base de Datos** | Railway (MySQL) |
| **Repositorio GitHub** | https://github.com/juanjoseocampo021-lgtm/REACT_PROYECTO |

## Credenciales de Acceso

| Rol | Correo | Contrasena |
|---|---|---|
| Administrador | admin@horizonteviajes.com | admin123 |
| Empleado | empleado@horizonteviajes.com | empleado123 |
| Cliente | carlos@correo.com | cliente123 |

## Tecnologias Utilizadas

### Frontend
- **React 19** con Vite 8
- **React Router** para navegacion
- **CSS custom** con variables de marca (teal #073f3d / dorado #f4b740)
- **Chatbot widget** con mascot SVG personalizado (Aria - colibri piloto)

### Backend
- **FastAPI** framework web Python
- **SQLAlchemy** ORM para bases de datos
- **PyMySQL** driver MySQL
- **JWT** (python-jose) para autenticacion
- **bcrypt** para hashing de contrasenas
- **Google Gemini API** para chatbot con IA
- **ReportLab** para generacion de PDFs
- **openpyxl** para generacion de Excel

### Base de Datos
- **MySQL 8** en Railway (nube)
- 12 tablas relacionales
- Roles: administrador, empleado, cliente

### Despliegue
- **Render** - Frontend (Static Site) y Backend (Web Service)
- **Railway** - Base de datos MySQL en la nube

## Funcionalidades Implementadas

### Modulo de Ventas (REQ-01 a REQ-03)
- Registro de ventas con cliente, productos/servicios, cantidades, precios, descuentos, subtotal, impuestos y total
- Detalle de ventas con relacion producto-venta
- Historial de ventas con filtros por fecha, cliente y estado

### Reportes y Facturacion (REQ-04 a REQ-09)
- Reporte diario de ventas
- Exportacion de reportes en PDF con logo de la empresa
- Exportacion de reportes en Excel (.xlsx)
- Generacion de facturas de venta con numero, fecha, datos del cliente
- Consulta de facturas con busqueda por numero, cliente y fecha
- Descarga de facturas individuales en PDF

### Dashboards y Analitica (REQ-10 a REQ-13)
- Dashboard administrativo con indicadores en cards (usuarios, productos, servicios, ventas, facturas, PQR)
- Dashboard de ventas con graficos de barras, graficos lineales e indicadores numericos
- Dashboard por roles (Administrador, Empleado, Cliente) con informacion filtrada por permisos
- Filtros por fecha inicial, fecha final, producto, servicio, estado y cliente

### Backend FastAPI (REQ-14 a REQ-15)
- 14 routers REST con endpoints completos (CRUD)
- Integracion entre React y FastAPI consumiendo endpoints reales
- Base de datos SQL con datos dinamicos (sin datos quemados)

### Modulo PQR (REQ-16)
- Registro de Peticiones, Quejas y Reclamos
- Consulta de estado (pendiente, en proceso, respondida, cerrada)
- Respuesta y cambio de estado por administradores
- PQR publico sin necesidad de autenticacion

### Chatbot con IA (REQ-17 a REQ-19)
- Chatbot integrado en el Frontend con mascot SVG personalizado (Aria)
- Integracion con Google Gemini API para respuestas naturales y contextualizadas
- Catalogo real de productos y servicios desde la base de datos
- Configuracion de API Key mediante variables de entorno (.env)

### Despliegue en la Nube (REQ-20)
- Frontend desplegado en Render como Static Site
- Backend desplegado en Render como Web Service
- Base de datos MySQL en Railway
- URLs publicas activas y funcionales

### Base de Datos SQL (REQ-21)
- 12 tablas: roles, usuarios, permisos, productos, servicios, reservas, mensajes_contacto, ventas, detalle_ventas, facturas, pqr, conversaciones, mensajes_chat
- Relaciones foraneas entre todas las entidades
- Migraciones SQL incluidas en `/sql/`

### Modelos ORM y Esquemas (REQ-22)
- Modelos SQLAlchemy en `backend/app/models.py`
- Esquemas Pydantic para validacion en `backend/app/schemas.py`

### Componentes React (REQ-23)
- 13+ componentes reutilizables en `frontend/src/components/`
- Componentes: Header, Footer, Carrusel, ChatbotWidget, DashboardLayout, RegisterModal, ReservaModal, WhatsAppButton, RutaProtegida, Toast, Button, Input, Select

### Seguridad (REQ-24)
- Autenticacion JWT en todas las peticiones protegidas
- Control estricto de roles en el backend (Administrador, Empleado, Cliente)
- Hashing de contrasenas con bcrypt
- Proteccion de credenciales y variables de entorno .env
- CORS configurado por variables de entorno

## Estructura del Proyecto

```
HorizonteViajes-mejorado/
├── TrimestreReact/
│   ├── backend/
│   │   ├── app/
│   │   │   ├── main.py          # Aplicacion FastAPI
│   │   │   ├── models.py        # Modelos SQLAlchemy (12 tablas)
│   │   │   ├── schemas.py       # Esquemas Pydantic
│   │   │   ├── security.py      # JWT y bcrypt
│   │   │   ├── config.py        # Variables de entorno
│   │   │   ├── database.py      # Conexion a BD
│   │   │   ├── dependencies.py  # Dependencias de autenticacion
│   │   │   ├── seed.py          # Datos iniciales
│   │   │   ├── validators.py    # Validaciones
│   │   │   └── routers/         # 14 routers API
│   │   │       ├── auth.py
│   │   │       ├── ventas.py
│   │   │       ├── facturas.py
│   │   │       ├── reportes.py
│   │   │       ├── dashboard.py
│   │   │       ├── pqr.py
│   │   │       ├── chatbot.py
│   │   │       ├── productos.py
│   │   │       ├── servicios.py
│   │   │       ├── reservas.py
│   │   │       ├── usuarios.py
│   │   │       ├── contacto.py
│   │   │       ├── perfil.py
│   │   │       └── uploads.py
│   │   ├── sql/                 # Scripts SQL
│   │   ├── requirements.txt
│   │   └── build.sh
│   └── frontend/
│       ├── src/
│       │   ├── components/      # 13+ componentes React
│       │   ├── pages/           # Paginas principales
│       │   ├── context/         # AuthContext (API_URL)
│       │   ├── assets/          # Imagenes y SVG
│       │   ├── App.jsx
│       │   └── main.jsx
│       ├── package.json
│       └── build.sh
├── render.yaml                  # Configuracion Render (2 servicios)
├── build.sh
└── .gitignore
```

## Endpoints de la API

### Publicos (sin autenticacion)
| Metodo | Endpoint | Descripcion |
|---|---|---|
| GET | /api/productos | Listar productos |
| GET | /api/servicios | Listar servicios |
| POST | /api/auth/login | Iniciar sesion |
| POST | /api/auth/registro | Registrar usuario |
| POST | /api/contacto | Enviar mensaje de contacto |
| POST | /api/pqr/publico | Crear PQR sin login |
| POST | /api/chatbot/publico | Chatbot con IA |

### Protegidos (requieren JWT)
| Metodo | Endpoint | Roles |
|---|---|---|
| GET | /api/ventas | admin, empleado |
| POST | /api/ventas | admin, empleado |
| GET | /api/facturas | admin, empleado |
| POST | /api/facturas | admin |
| GET | /api/dashboard/resumen | admin, empleado, cliente |
| GET | /api/reportes/ventas/pdf | admin |
| GET | /api/reportes/ventas/excel | admin |
| GET | /api/reportes/facturas/pdf | admin |
| GET | /api/reportes/facturas/excel | admin |
| GET | /api/pqr | admin, empleado |
| PATCH | /api/pqr/{id}/responder | admin, empleado |
| GET | /api/usuarios | admin |
| GET | /api/reservas | admin, empleado |
| POST | /api/reservas | todos |

## Como Ejecutar Localmente

### Requisitos
- Python 3.12+
- Node.js 20+
- MySQL local o XAMPP

### Backend
```bash
cd TrimestreReact/backend
python -m venv .venv
.venv\Scripts\activate        # Windows
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### Frontend
```bash
cd TrimestreReact/frontend
npm install
npm run dev
```

El frontend estara en `http://localhost:5173` y el backend en `http://localhost:8000`.

## Integrantes del Proyecto

- **Programa de Formacion:** Analisis y Desarrollo de Software (ADSO)
- **Ficha:** 3406204
- **Regional:** Antioquia
- **Instructor Lider:** Jhan Hader Munoz
- **Competencia:** React + Vite / FastAPI
- **Trimestre:** 03

## Licencia

Proyecto academico SENA - Regional Antioquia
