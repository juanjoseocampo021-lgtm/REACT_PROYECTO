from datetime import date, datetime

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload

from ..database import get_db
from ..models import Reserva, Producto, Servicio, Usuario, Venta, DetalleVenta
from ..schemas import ReservaInput, CambiarEstadoReservaInput
from ..dependencies import obtener_usuario_actual, requerir_roles

router = APIRouter(prefix="/api/reservas", tags=["reservas"])


def _reserva_a_dict(r: Reserva, incluir_cliente: bool = False) -> dict:
    datos = {
        "id": r.id,
        "usuario_id": r.usuario_id,
        "tipo": r.tipo,
        "item_id": r.item_id,
        "nombre_item": r.nombre_item,
        "precio_item": float(r.precio_item),
        "fecha_viaje": r.fecha_viaje,
        "personas": r.personas,
        "notas": r.notas,
        "estado": r.estado,
        "creado_en": r.creado_en,
    }
    if incluir_cliente and r.usuario:
        datos["cliente_nombre"] = r.usuario.nombre
        datos["cliente_apellido"] = r.usuario.apellido
        datos["cliente_correo"] = r.usuario.correo
    return datos


# ------------------------------------------------------------
# POST /api/reservas (cualquier usuario autenticado, pensado para clientes)
# ------------------------------------------------------------
@router.post("", status_code=201)
def crear_reserva(
    datos: ReservaInput,
    db: Session = Depends(get_db),
    usuario: dict = Depends(obtener_usuario_actual),
):
    if datos.tipo not in ("producto", "servicio"):
        raise HTTPException(status_code=400, detail={"mensaje": "El tipo debe ser 'producto' o 'servicio'"})
    if not datos.itemId:
        raise HTTPException(
            status_code=400,
            detail={"mensaje": "Debes indicar qué producto o servicio deseas reservar"},
        )
    if not datos.fechaViaje:
        raise HTTPException(status_code=400, detail={"mensaje": "La fecha del viaje es obligatoria"})

    try:
        fecha = datetime.strptime(datos.fechaViaje, "%Y-%m-%d").date()
    except ValueError:
        raise HTTPException(
            status_code=400,
            detail={"mensaje": "La fecha del viaje debe ser hoy o una fecha futura"},
        )
    if fecha < date.today():
        raise HTTPException(
            status_code=400,
            detail={"mensaje": "La fecha del viaje debe ser hoy o una fecha futura"},
        )

    num_personas = datos.personas or 1
    if num_personas < 1 or num_personas > 20:
        raise HTTPException(status_code=400, detail={"mensaje": "El número de personas debe estar entre 1 y 20"})

    Modelo = Producto if datos.tipo == "producto" else Servicio
    item = db.query(Modelo).filter(Modelo.id == datos.itemId, Modelo.estado == "activo").first()
    if not item:
        raise HTTPException(
            status_code=404,
            detail={"mensaje": "El producto o servicio seleccionado no existe o no está disponible"},
        )

    nueva = Reserva(
        usuario_id=usuario["id"],
        tipo=datos.tipo,
        item_id=datos.itemId,
        nombre_item=item.nombre,
        precio_item=item.precio,
        fecha_viaje=fecha,
        personas=num_personas,
        notas=datos.notas,
        estado="pendiente",
    )
    db.add(nueva)
    db.commit()
    db.refresh(nueva)

    return {"mensaje": "Reserva creada correctamente", "id": nueva.id}


# ------------------------------------------------------------
# GET /api/reservas/mias (el usuario ve solo sus propias reservas)
# ------------------------------------------------------------
@router.get("/mias")
def listar_mis_reservas(db: Session = Depends(get_db), usuario: dict = Depends(obtener_usuario_actual)):
    reservas = (
        db.query(Reserva)
        .filter(Reserva.usuario_id == usuario["id"])
        .order_by(Reserva.creado_en.desc())
        .all()
    )
    return [_reserva_a_dict(r) for r in reservas]


# ------------------------------------------------------------
# GET /api/reservas (administrador y empleado ven todas)
# ------------------------------------------------------------
@router.get("", dependencies=[Depends(requerir_roles("administrador", "empleado"))])
def listar_todas_las_reservas(db: Session = Depends(get_db)):
    reservas = (
        db.query(Reserva)
        .options(joinedload(Reserva.usuario))
        .order_by(Reserva.creado_en.desc())
        .all()
    )
    return [_reserva_a_dict(r, incluir_cliente=True) for r in reservas]


# ------------------------------------------------------------
# PATCH /api/reservas/{id}/estado
# - administrador/empleado: pueden poner cualquier estado en cualquier reserva.
# - cliente: solo puede cancelar SU PROPIA reserva, y solo si sigue "pendiente".
# - Al confirmar: se crea automáticamente la venta con sus detalles.
# ------------------------------------------------------------
@router.patch("/{id}/estado")
def cambiar_estado_reserva(
    id: int,
    datos: CambiarEstadoReservaInput,
    db: Session = Depends(get_db),
    usuario: dict = Depends(obtener_usuario_actual),
):
    if datos.estado not in ("pendiente", "confirmada", "cancelada"):
        raise HTTPException(status_code=400, detail={"mensaje": "Estado inválido"})

    reserva = db.query(Reserva).filter(Reserva.id == id).first()
    if not reserva:
        raise HTTPException(status_code=404, detail={"mensaje": "Reserva no encontrada"})

    es_gestor = usuario.get("rol") in ("administrador", "empleado")

    if not es_gestor:
        if reserva.usuario_id != usuario["id"]:
            raise HTTPException(status_code=403, detail={"mensaje": "No puedes modificar la reserva de otro usuario"})
        if datos.estado != "cancelada" or reserva.estado != "pendiente":
            raise HTTPException(
                status_code=403,
                detail={"mensaje": "Solo puedes cancelar reservas que estén pendientes"},
            )

    estado_anterior = reserva.estado
    reserva.estado = datos.estado

    # --------------------------------------------------------
    # AL CONFIRMAR: crear venta automáticamente
    # --------------------------------------------------------
    if datos.estado == "confirmada" and estado_anterior != "confirmada":
        cliente = reserva.usuario
        subtotal = float(reserva.precio_item) * reserva.personas
        impuestos = round(subtotal * 0.19, 2)
        total = subtotal + impuestos

        nueva_venta = Venta(
            usuario_id=reserva.usuario_id,
            cliente_nombre=f"{cliente.nombre} {cliente.apellido}",
            cliente_documento=cliente.numero_documento,
            cliente_correo=cliente.correo,
            cliente_telefono=cliente.telefono,
            subtotal=subtotal,
            impuestos=impuestos,
            descuento=0,
            total=total,
            estado="completada",
            notas=f"Generada automáticamente desde reserva #{reserva.id}",
        )
        db.add(nueva_venta)
        db.flush()

        detalle = DetalleVenta(
            venta_id=nueva_venta.id,
            tipo=reserva.tipo,
            item_id=reserva.item_id,
            nombre_item=reserva.nombre_item,
            cantidad=reserva.personas,
            precio_unitario=float(reserva.precio_item),
            subtotal=subtotal,
        )
        db.add(detalle)

    db.commit()
    return {"mensaje": f"Reserva marcada como {datos.estado}"}


# ------------------------------------------------------------
# DELETE /api/reservas/{id} (solo administrador)
# ------------------------------------------------------------
@router.delete("/{id}", dependencies=[Depends(requerir_roles("administrador"))])
def eliminar_reserva(id: int, db: Session = Depends(get_db)):
    reserva = db.query(Reserva).filter(Reserva.id == id).first()
    if reserva:
        db.delete(reserva)
        db.commit()
    return {"mensaje": "Reserva eliminada correctamente"}
