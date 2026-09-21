from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from ..dependencies import obtener_usuario_actual, requerir_roles
from ..models import Factura, Venta
from ..schemas import FacturaInput, CambiarEstadoFacturaInput

router = APIRouter(prefix="/api/facturas", tags=["Facturas"])


def generar_numero_factura(db: Session) -> str:
    ultimo = db.query(Factura).order_by(Factura.id.desc()).first()
    if ultimo and ultimo.numero_factura:
        try:
            num = int(ultimo.numero_factura.split("-")[-1])
            return f"FC-{num + 1:06d}"
        except (ValueError, IndexError):
            pass
    return "FC-000001"


@router.get("/")
def listar_facturas(
    numero_factura: str = None,
    cliente: str = None,
    fecha: str = None,
    usuario: dict = Depends(obtener_usuario_actual),
    db: Session = Depends(get_db),
):
    rol = usuario.get("rol")
    query = db.query(Factura)

    if rol == "cliente":
        query = query.filter(Factura.cliente_correo == usuario.get("correo", ""))

    if numero_factura:
        query = query.filter(Factura.numero_factura.ilike(f"%{numero_factura}%"))

    if cliente:
        query = query.filter(Factura.cliente_nombre.ilike(f"%{cliente}%"))

    if fecha:
        try:
            fecha_obj = datetime.strptime(fecha, "%Y-%m-%d")
            fecha_fin = fecha_obj.replace(hour=23, minute=59, second=59)
            query = query.filter(Factura.creado_en >= fecha_obj, Factura.creado_en <= fecha_fin)
        except ValueError:
            pass

    facturas = query.order_by(Factura.creado_en.desc()).all()

    return [
        {
            "id": f.id,
            "venta_id": f.venta_id,
            "numero_factura": f.numero_factura,
            "cliente_nombre": f.cliente_nombre,
            "cliente_documento": f.cliente_documento,
            "cliente_correo": f.cliente_correo,
            "cliente_telefono": f.cliente_telefono,
            "subtotal": float(f.subtotal),
            "impuestos": float(f.impuestos),
            "descuento": float(f.descuento),
            "total": float(f.total),
            "estado": f.estado,
            "creado_en": f.creado_en.isoformat() if f.creado_en else None,
        }
        for f in facturas
    ]


@router.get("/{factura_id}")
def obtener_factura(
    factura_id: int,
    usuario: dict = Depends(obtener_usuario_actual),
    db: Session = Depends(get_db),
):
    factura = db.query(Factura).filter(Factura.id == factura_id).first()
    if not factura:
        raise HTTPException(status_code=404, detail={"mensaje": "Factura no encontrada"})

    venta = db.query(Venta).filter(Venta.id == factura.venta_id).first()
    detalles = []
    if venta:
        detalles = [
            {
                "nombre_item": d.nombre_item,
                "tipo": d.tipo,
                "cantidad": d.cantidad,
                "precio_unitario": float(d.precio_unitario),
                "subtotal": float(d.subtotal),
            }
            for d in venta.detalles
        ]

    return {
        "id": factura.id,
        "venta_id": factura.venta_id,
        "numero_factura": factura.numero_factura,
        "cliente_nombre": factura.cliente_nombre,
        "cliente_documento": factura.cliente_documento,
        "cliente_correo": factura.cliente_correo,
        "cliente_telefono": factura.cliente_telefono,
        "subtotal": float(factura.subtotal),
        "impuestos": float(factura.impuestos),
        "descuento": float(factura.descuento),
        "total": float(factura.total),
        "estado": factura.estado,
        "creado_en": factura.creado_en.isoformat() if factura.creado_en else None,
        "detalles": detalles,
    }


@router.post("/", status_code=201)
def crear_factura(
    datos: FacturaInput,
    usuario: dict = Depends(requerir_roles("administrador", "empleado")),
    db: Session = Depends(get_db),
):
    venta = db.query(Venta).filter(Venta.id == datos.ventaId).first()
    if not venta:
        raise HTTPException(status_code=404, detail={"mensaje": "Venta no encontrada"})

    existente = db.query(Factura).filter(Factura.venta_id == datos.ventaId).first()
    if existente:
        raise HTTPException(status_code=409, detail={"mensaje": "Ya existe una factura para esta venta"})

    numero = generar_numero_factura(db)

    factura = Factura(
        venta_id=venta.id,
        numero_factura=numero,
        cliente_nombre=venta.cliente_nombre,
        cliente_documento=venta.cliente_documento,
        cliente_correo=venta.cliente_correo,
        cliente_telefono=venta.cliente_telefono,
        subtotal=venta.subtotal,
        impuestos=venta.impuestos,
        descuento=venta.descuento,
        total=venta.total,
        estado="pendiente",
    )
    db.add(factura)
    db.commit()
    db.refresh(factura)

    return {"mensaje": "Factura generada correctamente", "facturaId": factura.id, "numero_factura": numero}


@router.patch("/{factura_id}/estado")
def cambiar_estado_factura(
    factura_id: int,
    datos: CambiarEstadoFacturaInput,
    usuario: dict = Depends(requerir_roles("administrador", "empleado")),
    db: Session = Depends(get_db),
):
    factura = db.query(Factura).filter(Factura.id == factura_id).first()
    if not factura:
        raise HTTPException(status_code=404, detail={"mensaje": "Factura no encontrada"})

    factura.estado = datos.estado
    db.commit()

    return {"mensaje": f"Factura actualizada a {datos.estado}"}


@router.get("/estadisticas/resumen")
def estadisticas_facturas(
    usuario: dict = Depends(requerir_roles("administrador", "empleado")),
    db: Session = Depends(get_db),
):
    total = db.query(Factura).count()
    pendientes = db.query(Factura).filter(Factura.estado == "pendiente").count()
    pagadas = db.query(Factura).filter(Factura.estado == "pagada").count()
    anuladas = db.query(Factura).filter(Factura.estado == "anulada").count()

    return {
        "total": total,
        "pendientes": pendientes,
        "pagadas": pagadas,
        "anuladas": anuladas,
    }
