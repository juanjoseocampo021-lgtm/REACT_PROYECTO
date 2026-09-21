from fastapi import APIRouter, Depends

from ..dependencies import obtener_usuario_actual

router = APIRouter(prefix="/api/perfil", tags=["Perfil"])


@router.get("")
def obtener_perfil(usuario: dict = Depends(obtener_usuario_actual)):
    return {"usuario": usuario}
