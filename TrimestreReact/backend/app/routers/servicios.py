from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Servicio
from ..schemas import ProductoServicioInput
from ..dependencies import requerir_roles

router = APIRouter(prefix="/api/servicios", tags=["servicios"])


def _servicio_a_dict(s: Servicio) -> dict:
    return {
        "id": s.id,
        "nombre": s.nombre,
        "descripcion": s.descripcion,
        "precio": float(s.precio),
        "imagen_url": s.imagen_url,
        "estado": s.estado,
        "creado_en": s.creado_en,
    }


# GET /api/servicios - cualquier persona, incluso sin sesión, puede verlos
@router.get("")
def listar_servicios(db: Session = Depends(get_db)):
    servicios = db.query(Servicio).order_by(Servicio.creado_en.desc()).all()
    return [_servicio_a_dict(s) for s in servicios]


# GET /api/servicios/{id}
@router.get("/{id}")
def obtener_servicio(id: int, db: Session = Depends(get_db)):
    servicio = db.query(Servicio).filter(Servicio.id == id).first()
    if not servicio:
        raise HTTPException(status_code=404, detail={"mensaje": "Servicio no encontrado"})
    return _servicio_a_dict(servicio)


# POST /api/servicios - administrador y empleado
@router.post("", status_code=201, dependencies=[Depends(requerir_roles("administrador", "empleado"))])
def crear_servicio(datos: ProductoServicioInput, db: Session = Depends(get_db)):
    if not datos.nombre or not datos.nombre.strip():
        raise HTTPException(status_code=400, detail={"mensaje": "El nombre del servicio es obligatorio"})
    if datos.precio is None or datos.precio < 0:
        raise HTTPException(status_code=400, detail={"mensaje": "El precio debe ser un número válido"})

    nuevo = Servicio(
        nombre=datos.nombre,
        descripcion=datos.descripcion or "",
        precio=datos.precio,
        imagen_url=datos.imagen_url or None,
    )
    db.add(nuevo)
    db.commit()
    db.refresh(nuevo)

    return {"mensaje": "Servicio creado correctamente", "id": nuevo.id}


# PUT /api/servicios/{id} - administrador y empleado
@router.put("/{id}", dependencies=[Depends(requerir_roles("administrador", "empleado"))])
def actualizar_servicio(id: int, datos: ProductoServicioInput, db: Session = Depends(get_db)):
    if not datos.nombre or not datos.nombre.strip():
        raise HTTPException(status_code=400, detail={"mensaje": "El nombre del servicio es obligatorio"})

    servicio = db.query(Servicio).filter(Servicio.id == id).first()
    if not servicio:
        raise HTTPException(status_code=404, detail={"mensaje": "Servicio no encontrado"})

    servicio.nombre = datos.nombre
    servicio.descripcion = datos.descripcion or ""
    servicio.precio = datos.precio if datos.precio is not None else servicio.precio
    servicio.imagen_url = datos.imagen_url if datos.imagen_url is not None else servicio.imagen_url
    servicio.estado = datos.estado or "activo"
    db.commit()

    return {"mensaje": "Servicio actualizado correctamente"}


# DELETE /api/servicios/{id} - solo administrador
@router.delete("/{id}", dependencies=[Depends(requerir_roles("administrador"))])
def eliminar_servicio(id: int, db: Session = Depends(get_db)):
    servicio = db.query(Servicio).filter(Servicio.id == id).first()
    if servicio:
        db.delete(servicio)
        db.commit()
    return {"mensaje": "Servicio eliminado correctamente"}
