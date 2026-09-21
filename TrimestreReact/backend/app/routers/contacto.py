import re

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import MensajeContacto
from ..schemas import ContactoInput
from ..dependencies import requerir_roles

router = APIRouter(prefix="/api/contacto", tags=["contacto"])

REGEX_CORREO = re.compile(r"^[^\s@]+@[^\s@]+\.[^\s@]+$")


def _mensaje_a_dict(m: MensajeContacto) -> dict:
    return {
        "id": m.id,
        "nombre": m.nombre,
        "correo": m.correo,
        "mensaje": m.mensaje,
        "leido": m.leido,
        "creado_en": m.creado_en,
    }


# ------------------------------------------------------------
# POST /api/contacto (público, cualquier visitante puede escribir)
# ------------------------------------------------------------
@router.post("", status_code=201)
def crear_mensaje(datos: ContactoInput, db: Session = Depends(get_db)):
    errores = {}
    nombre = (datos.nombre or "").strip()
    correo = datos.correo or ""
    mensaje = (datos.mensaje or "").strip()

    if not nombre:
        errores["nombre"] = "El nombre es obligatorio"
    elif len(nombre) < 2 or len(nombre) > 30:
        errores["nombre"] = "Debe tener entre 2 y 30 caracteres"

    if not correo:
        errores["correo"] = "El correo es obligatorio"
    elif not REGEX_CORREO.match(correo):
        errores["correo"] = "Formato de correo inválido"
    elif len(correo) > 50:
        errores["correo"] = "Máximo 50 caracteres"

    if not mensaje:
        errores["mensaje"] = "El mensaje es obligatorio"
    elif len(mensaje) < 10 or len(mensaje) > 300:
        errores["mensaje"] = "Debe tener entre 10 y 300 caracteres"

    if errores:
        raise HTTPException(status_code=400, detail={"mensaje": "Revisa los datos del formulario", "errores": errores})

    nuevo = MensajeContacto(nombre=nombre, correo=correo, mensaje=mensaje)
    db.add(nuevo)
    db.commit()

    return {"mensaje": "¡Gracias por escribirnos! Te responderemos pronto."}


# GET /api/contacto (solo administrador)
@router.get("", dependencies=[Depends(requerir_roles("administrador"))])
def listar_mensajes(db: Session = Depends(get_db)):
    mensajes = db.query(MensajeContacto).order_by(MensajeContacto.creado_en.desc()).all()
    return [_mensaje_a_dict(m) for m in mensajes]


# PATCH /api/contacto/{id}/leido (solo administrador)
@router.patch("/{id}/leido", dependencies=[Depends(requerir_roles("administrador"))])
def marcar_leido(id: int, db: Session = Depends(get_db)):
    mensaje = db.query(MensajeContacto).filter(MensajeContacto.id == id).first()
    if not mensaje:
        raise HTTPException(status_code=404, detail={"mensaje": "Mensaje no encontrado"})
    mensaje.leido = True
    db.commit()
    return {"mensaje": "Mensaje marcado como leído"}


# DELETE /api/contacto/{id} (solo administrador)
@router.delete("/{id}", dependencies=[Depends(requerir_roles("administrador"))])
def eliminar_mensaje(id: int, db: Session = Depends(get_db)):
    mensaje = db.query(MensajeContacto).filter(MensajeContacto.id == id).first()
    if mensaje:
        db.delete(mensaje)
        db.commit()
    return {"mensaje": "Mensaje eliminado correctamente"}
