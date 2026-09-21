from datetime import datetime
from sqlalchemy import func
from sqlalchemy.orm import Session
from fastapi import APIRouter, Depends

from ..database import get_db
from ..dependencies import obtener_usuario_actual, requerir_roles
from ..models import Usuario, Producto, Servicio, Reserva, MensajeContacto, Venta, Factura, PQR

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])

@router.get("/resumen")
def resumen(usuario: dict = Depends(obtener_usuario_actual), db: Session = Depends(get_db)):
    rol = usuario.get("rol")
    if rol == "administrador":
        return {
            "rol": rol,
            "usuarios_activos": db.query(Usuario).filter(Usuario.estado == "activo").count(),
            "reservas_pendientes": db.query(Reserva).filter(Reserva.estado == "pendiente").count(),
            "mensajes_sin_leer": db.query(MensajeContacto).filter(MensajeContacto.leido == False).count(),
            "ventas_mes": float(db.query(func.coalesce(func.sum(Venta.total), 0)).filter(
                Venta.estado == "completada", Venta.creado_en >= datetime.now().replace(day=1, hour=0, minute=0, second=0, microsecond=0)
            ).scalar() or 0),
            "total_ventas": db.query(Venta).count(),
            "total_facturas": db.query(Factura).count(),
            "facturas_pendientes": db.query(Factura).filter(Factura.estado == "pendiente").count(),
            "pqr_pendientes": db.query(PQR).filter(PQR.estado == "pendiente").count(),
            "pqr_total": db.query(PQR).count(),
            "productos_activos": db.query(Producto).filter(Producto.estado == "activo").count(),
            "servicios_activos": db.query(Servicio).filter(Servicio.estado == "activo").count(),
        }
    if rol == "empleado":
        return {
            "rol": rol,
            "reservas_pendientes": db.query(Reserva).filter(Reserva.estado == "pendiente").count(),
            "paquetes_activos": db.query(Producto).filter(Producto.estado == "activo").count(),
            "servicios_activos": db.query(Servicio).filter(Servicio.estado == "activo").count(),
            "ventas_mes": float(db.query(func.coalesce(func.sum(Venta.total), 0)).filter(
                Venta.estado == "completada", Venta.creado_en >= datetime.now().replace(day=1, hour=0, minute=0, second=0, microsecond=0)
            ).scalar() or 0),
            "total_ventas": db.query(Venta).count(),
            "pqr_pendientes": db.query(PQR).filter(PQR.estado == "pendiente").count(),
        }
    reservas = db.query(Reserva).filter(Reserva.usuario_id == usuario["id"]).order_by(Reserva.creado_en.desc()).all()
    return {
        "rol": rol,
        "mis_reservas": len(reservas),
        "pendientes": sum(1 for r in reservas if r.estado == "pendiente"),
        "confirmadas": sum(1 for r in reservas if r.estado == "confirmada"),
        "ultima_compra": reservas[0].nombre_item if reservas else None,
        "mis_pqr": db.query(PQR).filter(PQR.usuario_id == usuario["id"]).count(),
        "pqr_pendientes": db.query(PQR).filter(PQR.usuario_id == usuario["id"], PQR.estado == "pendiente").count(),
    }
