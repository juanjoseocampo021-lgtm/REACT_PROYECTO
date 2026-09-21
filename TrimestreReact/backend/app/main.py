from pathlib import Path

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, FileResponse
from fastapi.staticfiles import StaticFiles
from starlette.exceptions import HTTPException as StarletteHTTPException

from .config import CORS_ORIGINS
from .database import Base, engine

from .routers import (
    auth,
    contacto,
    perfil,
    productos,
    reservas,
    servicios,
    usuarios,
    dashboard,
    uploads,
    ventas,
    facturas,
    pqr,
    chatbot,
    reportes,
)


# ============================================================
# BASE DE DATOS
# ============================================================

# Solo crea tablas que todavía no existan.
#
# Las modificaciones de tablas existentes se realizan
# mediante las migraciones SQL.
#
Base.metadata.create_all(
    bind=engine
)


# ============================================================
# SEMBRAR DATOS INICIALES (SQLite)
# ============================================================
from .database import SessionLocal
from .seed import sembrar_datos

_db = SessionLocal()
try:
    sembrar_datos(_db)
except Exception:
    pass
finally:
    _db.close()


# ============================================================
# CARPETA DE IMÁGENES
# ============================================================
#
# __file__:
# backend/app/main.py
#
# parents[0] -> backend/app
# parents[1] -> backend
#
# Resultado:
# backend/uploads
#
# IMPORTANTE:
# Esta es exactamente la misma carpeta que utiliza
# routers/uploads.py para guardar las imágenes.
# ============================================================

BACKEND_DIR = Path(
    __file__
).resolve().parents[1]


STATIC_DIR = BACKEND_DIR / "app" / "static"


UPLOAD_DIR = (
    BACKEND_DIR / "uploads"
)


UPLOAD_DIR.mkdir(
    parents=True,
    exist_ok=True,
)


# ============================================================
# APLICACIÓN FASTAPI
# ============================================================

app = FastAPI(
    title="Horizonte Viajes API",
    description=(
        "API REST para Horizonte Viajes "
        "— Cuarto Avance React + Vite + FastAPI"
    ),
    version="2.0.0",
)


# ============================================================
# CORS
# ============================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=[
        "GET",
        "POST",
        "PUT",
        "PATCH",
        "DELETE",
        "OPTIONS",
    ],
    allow_headers=[
        "Authorization",
        "Content-Type",
    ],
)


# ============================================================
# MANEJO DE ERRORES HTTP
# ============================================================

@app.exception_handler(
    StarletteHTTPException
)
async def manejar_http_exception(
    request: Request,
    exc: StarletteHTTPException,
):

    detalle = exc.detail


    if isinstance(
        detalle,
        dict,
    ):
        contenido = detalle

    else:
        contenido = {
            "mensaje": str(
                detalle
            )
        }


    return JSONResponse(
        status_code=exc.status_code,
        content=contenido,
    )


# ============================================================
# MANEJO DE ERRORES DE VALIDACIÓN
# ============================================================
#
# Antes solamente devolvíamos:
#
# "Los datos enviados no cumplen el formato esperado"
#
# Ahora devolvemos también los detalles para saber
# exactamente qué campo produjo el problema.
# ============================================================

@app.exception_handler(
    RequestValidationError
)
async def manejar_validation_exception(
    request: Request,
    exc: RequestValidationError,
):

    errores = []


    for error in exc.errors():

        ubicacion = error.get(
            "loc",
            [],
        )

        mensaje = error.get(
            "msg",
            "Valor inválido",
        )

        tipo = error.get(
            "type",
            "validation_error",
        )


        errores.append(
            {
                "campo": ".".join(
                    str(parte)
                    for parte in ubicacion
                ),
                "mensaje": mensaje,
                "tipo": tipo,
            }
        )


    return JSONResponse(
        status_code=422,
        content={
            "mensaje": (
                "Los datos enviados "
                "no cumplen el formato esperado."
            ),
            "errores": errores,
        },
    )


# ============================================================
# RUTAS
# ============================================================

app.include_router(
    auth.router
)

app.include_router(
    usuarios.router
)

app.include_router(
    productos.router
)

app.include_router(
    servicios.router
)

app.include_router(
    reservas.router
)

app.include_router(
    contacto.router
)

app.include_router(
    perfil.router
)

app.include_router(
    dashboard.router
)

app.include_router(
    uploads.router
)

app.include_router(
    ventas.router
)

app.include_router(
    facturas.router
)

app.include_router(
    pqr.router
)

app.include_router(
    chatbot.router
)

app.include_router(
    reportes.router
)


# ============================================================
# ARCHIVOS ESTÁTICOS
# ============================================================
#
# Las imágenes guardadas en:
#
# backend/uploads/
#
# estarán disponibles mediante:
#
# http://localhost:8000/uploads/nombre.jpg
#
# ============================================================

app.mount(
    "/uploads",
    StaticFiles(
        directory=UPLOAD_DIR
    ),
    name="uploads",
)


# ============================================================
# RUTA PRINCIPAL
# ============================================================

@app.get(
    "/",
    tags=["Sistema"],
)
def raiz():
    if STATIC_DIR.exists():
        return FileResponse(STATIC_DIR / "index.html")
    return {
        "mensaje": (
            "API de Horizonte Viajes "
            "funcionando correctamente"
        ),
        "version": app.version,
    }


# ============================================================
# SALUD DE LA API
# ============================================================

@app.get(
    "/api/salud",
    tags=["Sistema"],
)
def salud():

    return {
        "estado": "ok",
        "servicio": (
            "horizonte-viajes-api"
        ),
    }


# ============================================================
# ARCHIVOS ESTÁTICOS DEL FRONTEND (producción)
# ============================================================

if STATIC_DIR.exists():
    app.mount(
        "/assets",
        StaticFiles(directory=STATIC_DIR / "assets"),
        name="static-assets",
    )

    @app.get("/{full_path:path}", include_in_schema=False)
    async def servir_frontend(full_path: str):
        if full_path.startswith("api") or full_path.startswith("uploads"):
            from fastapi.responses import JSONResponse as FJ
            return FJ(status_code=404, content={"mensaje": "No encontrado"})
        file_path = STATIC_DIR / full_path
        if full_path and file_path.is_file():
            return FileResponse(file_path)
        return FileResponse(STATIC_DIR / "index.html")