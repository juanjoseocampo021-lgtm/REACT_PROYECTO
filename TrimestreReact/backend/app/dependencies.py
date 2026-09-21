from fastapi import Depends, Header, HTTPException
from jose import JWTError
from sqlalchemy.orm import Session, joinedload

from .database import get_db
from .models import Usuario
from .security import decodificar_token


def obtener_usuario_actual(
    authorization: str | None = Header(default=None),
    db: Session = Depends(get_db),
) -> dict:
    if not authorization:
        raise HTTPException(status_code=401, detail={"mensaje": "No se proporcionó un token de autenticación"})

    partes = authorization.split(" ", 1)
    if len(partes) != 2 or partes[0].lower() != "bearer" or not partes[1].strip():
        raise HTTPException(status_code=401, detail={"mensaje": "Formato de token inválido"})

    try:
        payload = decodificar_token(partes[1].strip())
        usuario_id = int(payload.get("sub"))
    except (JWTError, TypeError, ValueError):
        raise HTTPException(status_code=401, detail={"mensaje": "Token inválido o expirado"})

    usuario = (
        db.query(Usuario)
        .options(joinedload(Usuario.rol))
        .filter(Usuario.id == usuario_id)
        .first()
    )

    if not usuario:
        raise HTTPException(status_code=401, detail={"mensaje": "El usuario asociado al token ya no existe"})
    if usuario.estado != "activo":
        raise HTTPException(status_code=403, detail={"mensaje": "Tu cuenta se encuentra inactiva"})

    return {
        "id": usuario.id,
        "nombre": usuario.nombre,
        "apellido": usuario.apellido,
        "correo": usuario.correo,
        "rol": usuario.rol.nombre if usuario.rol else None,
    }


def requerir_roles(*roles_permitidos: str):
    def verificador(usuario: dict = Depends(obtener_usuario_actual)) -> dict:
        if usuario.get("rol") not in roles_permitidos:
            raise HTTPException(
                status_code=403,
                detail={"mensaje": "No tienes permisos para acceder a este recurso"},
            )
        return usuario

    return verificador
