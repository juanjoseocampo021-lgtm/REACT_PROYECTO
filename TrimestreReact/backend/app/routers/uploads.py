from pathlib import Path
from uuid import uuid4

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile

from ..dependencies import requerir_roles


router = APIRouter(
    prefix="/api/uploads",
    tags=["uploads"],
)


# ============================================================
# CARPETA DE IMÁGENES
# ============================================================
#
# __file__:
# backend/app/routers/uploads.py
#
# parents[0] -> backend/app/routers
# parents[1] -> backend/app
# parents[2] -> backend
#
# Por lo tanto:
# backend/uploads
#
# Esta MISMA carpeta será utilizada por main.py
# para servir las imágenes.
# ============================================================

BACKEND_DIR = Path(__file__).resolve().parents[2]

UPLOAD_DIR = BACKEND_DIR / "uploads"

UPLOAD_DIR.mkdir(
    parents=True,
    exist_ok=True,
)


# ============================================================
# FORMATOS PERMITIDOS
# ============================================================

ALLOWED_TYPES = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
    "image/gif": ".gif",
}


ALLOWED_EXTENSIONS = {
    ".jpg",
    ".jpeg",
    ".png",
    ".webp",
    ".gif",
}


MAX_FILE_SIZE = 5 * 1024 * 1024


# ============================================================
# SUBIR IMAGEN
# ============================================================

@router.post(
    "/imagen",
    dependencies=[
        Depends(
            requerir_roles(
                "administrador",
                "empleado",
            )
        )
    ],
)
async def subir_imagen(
    file: UploadFile = File(...),
):

    # --------------------------------------------------------
    # Verificar que realmente se haya enviado un archivo
    # --------------------------------------------------------

    if not file:
        raise HTTPException(
            status_code=400,
            detail={
                "mensaje": "No se recibió ninguna imagen."
            },
        )


    # --------------------------------------------------------
    # Obtener extensión
    # --------------------------------------------------------

    nombre_original = (
        file.filename or ""
    ).lower()


    extension = ""

    if "." in nombre_original:
        extension = (
            Path(nombre_original)
            .suffix
            .lower()
        )


    # --------------------------------------------------------
    # Validar tipo MIME
    # --------------------------------------------------------

    tipo_mime = (
        file.content_type or ""
    ).lower()


    tipo_permitido = (
        tipo_mime in ALLOWED_TYPES
    )


    extension_permitida = (
        extension in ALLOWED_EXTENSIONS
    )


    if (
        not tipo_permitido
        and not extension_permitida
    ):
        raise HTTPException(
            status_code=400,
            detail={
                "mensaje": (
                    "Formato de imagen no permitido. "
                    "Usa JPG, JPEG, PNG, WEBP o GIF."
                )
            },
        )


    # --------------------------------------------------------
    # Leer archivo
    # --------------------------------------------------------

    contenido = await file.read()


    # --------------------------------------------------------
    # Verificar que no esté vacío
    # --------------------------------------------------------

    if not contenido:
        raise HTTPException(
            status_code=400,
            detail={
                "mensaje": (
                    "La imagen está vacía o "
                    "no pudo ser leída."
                )
            },
        )


    # --------------------------------------------------------
    # Verificar tamaño
    # --------------------------------------------------------

    if len(contenido) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=400,
            detail={
                "mensaje": (
                    "La imagen no puede superar "
                    "los 5 MB."
                )
            },
        )


    # --------------------------------------------------------
    # Determinar extensión final
    # --------------------------------------------------------

    if tipo_permitido:
        extension_final = ALLOWED_TYPES[
            tipo_mime
        ]

    elif extension == ".jpeg":
        extension_final = ".jpg"

    else:
        extension_final = extension


    # Seguridad adicional
    if (
        extension_final
        not in {
            ".jpg",
            ".png",
            ".webp",
            ".gif",
        }
    ):
        raise HTTPException(
            status_code=400,
            detail={
                "mensaje": (
                    "La extensión de la imagen "
                    "no es válida."
                )
            },
        )


    # --------------------------------------------------------
    # Crear nombre único
    # --------------------------------------------------------

    nombre = (
        f"{uuid4().hex}"
        f"{extension_final}"
    )


    # --------------------------------------------------------
    # Ruta final del archivo
    # --------------------------------------------------------

    ruta_archivo = (
        UPLOAD_DIR / nombre
    )


    # --------------------------------------------------------
    # Guardar imagen
    # --------------------------------------------------------

    try:

        ruta_archivo.write_bytes(
            contenido
        )

    except Exception as error:

        raise HTTPException(
            status_code=500,
            detail={
                "mensaje": (
                    "No se pudo guardar la imagen."
                ),
                "error": str(error),
            },
        )


    # --------------------------------------------------------
    # Verificación adicional
    # --------------------------------------------------------

    if not ruta_archivo.exists():
        raise HTTPException(
            status_code=500,
            detail={
                "mensaje": (
                    "La imagen fue procesada, "
                    "pero no se encontró en el servidor."
                )
            },
        )


    # --------------------------------------------------------
    # URL pública
    # --------------------------------------------------------

    url = (
        f"/uploads/{nombre}"
    )


    return {
        "mensaje": (
            "Imagen subida correctamente."
        ),
        "url": url,
        "nombre": nombre,
    }