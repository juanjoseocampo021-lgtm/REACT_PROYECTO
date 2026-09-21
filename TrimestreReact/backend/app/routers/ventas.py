from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func
from sqlalchemy.orm import Session

from ..database import get_db
from ..dependencies import obtener_usuario_actual, requerir_roles
from ..models import Venta, DetalleVenta, Factura
from ..schemas import VentaInput, CambiarEstadoVentaInput

router = APIRouter(prefix="/api/ventas", tags=["Ventas"])


@router.get("/")
def listar_ventas(
    fecha_inicio: str = None,
    fecha_fin: str = None,
    estado: str = None,
    usuario: dict = Depends(obtener_usuario_actual),
    db: Session = Depends(get_db),
):
    rol = usuario.get("rol")
    query = db.query(Venta)

    if rol == "cliente":
        query = query.filter(Venta.usuario_id == usuario["id"])

    if fecha_inicio:
        try:
            fi = datetime.strptime(fecha_inicio, "%Y-%m-%d")
            query = query.filter(Venta.creado_en >= fi)
        except ValueError:
            pass

    if fecha_fin:
        try:
            ff = datetime.strptime(fecha_fin, "%Y-%m-%d").replace(hour=23, minute=59, second=59)
            query = query.filter(Venta.creado_en <= ff)
        except ValueError:
            pass

    if estado and estado != "todos":
        query = query.filter(Venta.estado == estado)

    ventas = query.order_by(Venta.creado_en.desc()).all()

    return [
        {
            "id": v.id,
            "usuario_id": v.usuario_id,
            "cliente_nombre": v.cliente_nombre,
            "cliente_documento": v.cliente_documento,
            "cliente_correo": v.cliente_correo,
            "cliente_telefono": v.cliente_telefono,
            "subtotal": float(v.subtotal),
            "impuestos": float(v.impuestos),
            "descuento": float(v.descuento),
            "total": float(v.total),
            "estado": v.estado,
            "notas": v.notas,
            "creado_en": v.creado_en.isoformat() if v.creado_en else None,
            "detalles": [
                {
                    "id": d.id,
                    "tipo": d.tipo,
                    "item_id": d.item_id,
                    "nombre_item": d.nombre_item,
                    "cantidad": d.cantidad,
                    "precio_unitario": float(d.precio_unitario),
                    "subtotal": float(d.subtotal),
                }
                for d in v.detalles
            ],
        }
        for v in ventas
    ]


@router.get("/historial")
def historial_ventas(
    fecha_inicio: str = None,
    fecha_fin: str = None,
    cliente: str = None,
    estado: str = None,
    usuario: dict = Depends(requerir_roles("administrador", "empleado")),
    db: Session = Depends(get_db),
):
    query = db.query(Venta)

    if fecha_inicio:
        try:
            fi = datetime.strptime(fecha_inicio, "%Y-%m-%d")
            query = query.filter(Venta.creado_en >= fi)
        except ValueError:
            pass

    if fecha_fin:
        try:
            ff = datetime.strptime(fecha_fin, "%Y-%m-%d").replace(hour=23, minute=59, second=59)
            query = query.filter(Venta.creado_en <= ff)
        except ValueError:
            pass

    if cliente:
        query = query.filter(Venta.cliente_nombre.ilike(f"%{cliente}%"))

    if estado and estado != "todos":
        query = query.filter(Venta.estado == estado)

    ventas = query.order_by(Venta.creado_en.desc()).all()

    return [
        {
            "id": v.id,
            "usuario_id": v.usuario_id,
            "cliente_nombre": v.cliente_nombre,
            "cliente_documento": v.cliente_documento,
            "cliente_correo": v.cliente_correo,
            "cliente_telefono": v.cliente_telefono,
            "subtotal": float(v.subtotal),
            "impuestos": float(v.impuestos),
            "descuento": float(v.descuento),
            "total": float(v.total),
            "estado": v.estado,
            "notas": v.notas,
            "creado_en": v.creado_en.isoformat() if v.creado_en else None,
            "detalles": [
                {
                    "id": d.id,
                    "tipo": d.tipo,
                    "item_id": d.item_id,
                    "nombre_item": d.nombre_item,
                    "cantidad": d.cantidad,
                    "precio_unitario": float(d.precio_unitario),
                    "subtotal": float(d.subtotal),
                }
                for d in v.detalles
            ],
        }
        for v in ventas
    ]


@router.post("/", status_code=201)
def crear_venta(
    datos: VentaInput,
    usuario: dict = Depends(requerir_roles("administrador", "empleado")),
    db: Session = Depends(get_db),
):
    if not datos.detalles:
        raise HTTPException(status_code=400, detail={"mensaje": "La venta debe tener al menos un producto o servicio"})

    subtotal = sum(d.cantidad * d.precioUnitario for d in datos.detalles)
    impuestos = subtotal * 0.19
    total = subtotal + impuestos - datos.descuento

    venta = Venta(
        usuario_id=usuario["id"],
        cliente_nombre=datos.clienteNombre,
        cliente_documento=datos.clienteDocumento,
        cliente_correo=datos.clienteCorreo,
        cliente_telefono=datos.clienteTelefono,
        subtotal=subtotal,
        impuestos=impuestos,
        descuento=datos.descuento,
        total=total,
        estado="pendiente",
        notas=datos.notas,
    )
    db.add(venta)
    db.flush()

    for d in datos.detalles:
        detalle = DetalleVenta(
            venta_id=venta.id,
            tipo=d.tipo,
            item_id=d.itemId,
            nombre_item=d.nombreItem,
            cantidad=d.cantidad,
            precio_unitario=d.precioUnitario,
            subtotal=d.cantidad * d.precioUnitario,
        )
        db.add(detalle)

    db.commit()
    db.refresh(venta)

    return {"mensaje": "Venta registrada correctamente", "ventaId": venta.id}


@router.patch("/{venta_id}/estado")
def cambiar_estado_venta(
    venta_id: int,
    datos: CambiarEstadoVentaInput,
    usuario: dict = Depends(requerir_roles("administrador", "empleado")),
    db: Session = Depends(get_db),
):
    venta = db.query(Venta).filter(Venta.id == venta_id).first()
    if not venta:
        raise HTTPException(status_code=404, detail={"mensaje": "Venta no encontrada"})

    venta.estado = datos.estado
    db.commit()

    return {"mensaje": f"Venta actualizada a {datos.estado}"}


@router.delete("/{venta_id}")
def eliminar_venta(
    venta_id: int,
    usuario: dict = Depends(requerir_roles("administrador")),
    db: Session = Depends(get_db),
):
    venta = db.query(Venta).filter(Venta.id == venta_id).first()
    if not venta:
        raise HTTPException(status_code=404, detail={"mensaje": "Venta no encontrada"})

    db.delete(venta)
    db.commit()

    return {"mensaje": "Venta eliminada correctamente"}


@router.get("/reporte-diario")
def reporte_diario(
    fecha: str = None,
    usuario: dict = Depends(requerir_roles("administrador", "empleado")),
    db: Session = Depends(get_db),
):
    if fecha:
        try:
            fecha_obj = datetime.strptime(fecha, "%Y-%m-%d")
        except ValueError:
            fecha_obj = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
    else:
        fecha_obj = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)

    fecha_fin = fecha_obj.replace(hour=23, minute=59, second=59)

    ventas = (
        db.query(Venta)
        .filter(Venta.creado_en >= fecha_obj, Venta.creado_en <= fecha_fin)
        .order_by(Venta.creado_en.desc())
        .all()
    )

    total_ventas = sum(float(v.total) for v in ventas)
    total_impuestos = sum(float(v.impuestos) for v in ventas)
    total_descuentos = sum(float(v.descuento) for v in ventas)

    return {
        "fecha": fecha_obj.strftime("%Y-%m-%d"),
        "total_ventas": len(ventas),
        "total_ingresos": total_ventas,
        "total_impuestos": total_impuestos,
        "total_descuentos": total_descuentos,
        "ventas": [
            {
                "id": v.id,
                "cliente_nombre": v.cliente_nombre,
                "total": float(v.total),
                "estado": v.estado,
                "creado_en": v.creado_en.isoformat() if v.creado_en else None,
                "detalles": [
                    {
                        "nombre_item": d.nombre_item,
                        "cantidad": d.cantidad,
                        "precio_unitario": float(d.precio_unitario),
                        "subtotal": float(d.subtotal),
                    }
                    for d in v.detalles
                ],
            }
            for v in ventas
        ],
    }


@router.get("/estadisticas")
def estadisticas_ventas(
    usuario: dict = Depends(requerir_roles("administrador", "empleado")),
    db: Session = Depends(get_db),
):
    now = datetime.now()
    inicio_mes = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)

    ventas_mes = (
        db.query(Venta)
        .filter(Venta.estado == "completada", Venta.creado_en >= inicio_mes)
        .all()
    )

    total_mes = sum(float(v.total) for v in ventas_mes)

    ventas_por_dia = {}
    for v in ventas_mes:
        if v.creado_en:
            dia = v.creado_en.strftime("%Y-%m-%d")
            ventas_por_dia[dia] = ventas_por_dia.get(dia, 0) + float(v.total)

    return {
        "ventas_mes": len(ventas_mes),
        "ingresos_mes": total_mes,
        "ventas_por_dia": [{"fecha": k, "total": v} for k, v in sorted(ventas_por_dia.items())],
    }
