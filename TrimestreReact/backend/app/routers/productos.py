from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Producto
from ..schemas import ProductoServicioInput
from ..dependencies import requerir_roles

router = APIRouter(prefix="/api/productos", tags=["productos"])


def _producto_a_dict(p: Producto) -> dict:
    return {
        "id": p.id,
        "nombre": p.nombre,
        "descripcion": p.descripcion,
        "descripcion_detallada": p.descripcion_detallada,
        "duracion": p.duracion,
        "tipo_experiencia": p.tipo_experiencia,
        "que_puedes_esperar": p.que_puedes_esperar,
        "precio": float(p.precio),
        "imagen_url": p.imagen_url,
        "region": p.region,
        "estado": p.estado,
        "creado_en": p.creado_en,
    }


# GET /api/productos - cualquier persona, incluso sin sesión, puede verlos
@router.get("")
def listar_productos(db: Session = Depends(get_db)):
    productos = db.query(Producto).order_by(Producto.creado_en.desc()).all()
    return [_producto_a_dict(p) for p in productos]


# GET /api/productos/{id}
@router.get("/{id}")
def obtener_producto(id: int, db: Session = Depends(get_db)):
    producto = db.query(Producto).filter(Producto.id == id).first()
    if not producto:
        raise HTTPException(status_code=404, detail={"mensaje": "Producto no encontrado"})
    return _producto_a_dict(producto)


# POST /api/productos - administrador y empleado
@router.post("", status_code=201, dependencies=[Depends(requerir_roles("administrador", "empleado"))])
def crear_producto(datos: ProductoServicioInput, db: Session = Depends(get_db)):
    if not datos.nombre or not datos.nombre.strip():
        raise HTTPException(status_code=400, detail={"mensaje": "El nombre del producto es obligatorio"})
    if datos.precio is None or datos.precio < 0:
        raise HTTPException(status_code=400, detail={"mensaje": "El precio debe ser un número válido"})

    nuevo = Producto(
        nombre=datos.nombre,
        descripcion=datos.descripcion or "",
        descripcion_detallada=datos.descripcion_detallada or "",
        duracion=datos.duracion or "",
        tipo_experiencia=datos.tipo_experiencia or "",
        que_puedes_esperar=datos.que_puedes_esperar or "",
        precio=datos.precio,
        imagen_url=datos.imagen_url or None,
        region=datos.region or "Colombia",
    )
    db.add(nuevo)
    db.commit()
    db.refresh(nuevo)

    return {"mensaje": "Producto creado correctamente", "id": nuevo.id}


# PUT /api/productos/{id} - administrador y empleado
@router.put("/{id}", dependencies=[Depends(requerir_roles("administrador", "empleado"))])
def actualizar_producto(id: int, datos: ProductoServicioInput, db: Session = Depends(get_db)):
    if not datos.nombre or not datos.nombre.strip():
        raise HTTPException(status_code=400, detail={"mensaje": "El nombre del producto es obligatorio"})

    producto = db.query(Producto).filter(Producto.id == id).first()
    if not producto:
        raise HTTPException(status_code=404, detail={"mensaje": "Producto no encontrado"})

    producto.nombre = datos.nombre
    producto.descripcion = datos.descripcion or ""
    producto.descripcion_detallada = datos.descripcion_detallada or ""
    producto.duracion = datos.duracion or ""
    producto.tipo_experiencia = datos.tipo_experiencia or ""
    producto.que_puedes_esperar = datos.que_puedes_esperar or ""
    producto.precio = datos.precio if datos.precio is not None else producto.precio
    producto.imagen_url = datos.imagen_url if datos.imagen_url is not None else producto.imagen_url
    producto.region = datos.region or producto.region
    producto.estado = datos.estado or "activo"
    db.commit()

    return {"mensaje": "Producto actualizado correctamente"}


# DELETE /api/productos/{id} - solo administrador
@router.delete("/{id}", dependencies=[Depends(requerir_roles("administrador"))])
def eliminar_producto(id: int, db: Session = Depends(get_db)):
    producto = db.query(Producto).filter(Producto.id == id).first()
    if producto:
        db.delete(producto)
        db.commit()
    return {"mensaje": "Producto eliminado correctamente"}
