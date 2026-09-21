from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from ..dependencies import obtener_usuario_actual, requerir_roles
from ..models import PQR
from ..schemas import PQRInput, ResponderPQRInput, CambiarEstadoPQRInput

router = APIRouter(prefix="/api/pqr", tags=["PQR"])


@router.get("/")
def listar_pqr(
    estado: str = None,
    tipo: str = None,
    usuario: dict = Depends(obtener_usuario_actual),
    db: Session = Depends(get_db),
):
    rol = usuario.get("rol")
    query = db.query(PQR)

    if rol == "cliente":
        query = query.filter(PQR.usuario_id == usuario["id"])

    if estado and estado != "todos":
        query = query.filter(PQR.estado == estado)

    if tipo and tipo != "todos":
        query = query.filter(PQR.tipo == tipo)

    pqr_list = query.order_by(PQR.creado_en.desc()).all()

    return [
        {
            "id": p.id,
            "usuario_id": p.usuario_id,
            "tipo": p.tipo,
            "asunto": p.asunto,
            "descripcion": p.descripcion,
            "estado": p.estado,
            "respuesta": p.respuesta,
            "creado_en": p.creado_en.isoformat() if p.creado_en else None,
            "actualizado_en": p.actualizado_en.isoformat() if p.actualizado_en else None,
        }
        for p in pqr_list
    ]


@router.get("/{pqr_id}")
def obtener_pqr(
    pqr_id: int,
    usuario: dict = Depends(obtener_usuario_actual),
    db: Session = Depends(get_db),
):
    pqr = db.query(PQR).filter(PQR.id == pqr_id).first()
    if not pqr:
        raise HTTPException(status_code=404, detail={"mensaje": "PQR no encontrada"})

    rol = usuario.get("rol")
    if rol == "cliente" and pqr.usuario_id != usuario["id"]:
        raise HTTPException(status_code=403, detail={"mensaje": "No tienes acceso a esta PQR"})

    return {
        "id": pqr.id,
        "usuario_id": pqr.usuario_id,
        "tipo": pqr.tipo,
        "asunto": pqr.asunto,
        "descripcion": pqr.descripcion,
        "estado": pqr.estado,
        "respuesta": pqr.respuesta,
        "creado_en": pqr.creado_en.isoformat() if pqr.creado_en else None,
        "actualizado_en": pqr.actualizado_en.isoformat() if pqr.actualizado_en else None,
    }


@router.post("/", status_code=201)
def crear_pqr(
    datos: PQRInput,
    usuario: dict = Depends(obtener_usuario_actual),
    db: Session = Depends(get_db),
):
    pqr = PQR(
        usuario_id=usuario["id"],
        tipo=datos.tipo,
        asunto=datos.asunto,
        descripcion=datos.descripcion,
        estado="pendiente",
    )
    db.add(pqr)
    db.commit()
    db.refresh(pqr)

    return {"mensaje": "PQR registrada correctamente", "pqrId": pqr.id}


@router.post("/publico", status_code=201)
def crear_pqr_publico(
    datos: PQRInput,
    db: Session = Depends(get_db),
):
    if not datos.tipo or datos.tipo not in ("peticion", "queja", "reclamo"):
        raise HTTPException(status_code=400, detail={"mensaje": "Tipo de PQR inválido"})
    if not (datos.asunto or "").strip():
        raise HTTPException(status_code=400, detail={"mensaje": "El asunto es obligatorio"})
    if not (datos.descripcion or "").strip():
        raise HTTPException(status_code=400, detail={"mensaje": "La descripción es obligatoria"})

    pqr = PQR(
        usuario_id=1,
        tipo=datos.tipo,
        asunto=datos.asunto.strip(),
        descripcion=datos.descripcion.strip(),
        estado="pendiente",
    )
    db.add(pqr)
    db.commit()
    db.refresh(pqr)

    return {"mensaje": "Tu petición/queja/reclamo ha sido registrado correctamente. Te contactaremos pronto.", "pqrId": pqr.id}


@router.patch("/{pqr_id}/responder")
def responder_pqr(
    pqr_id: int,
    datos: ResponderPQRInput,
    usuario: dict = Depends(requerir_roles("administrador", "empleado")),
    db: Session = Depends(get_db),
):
    pqr = db.query(PQR).filter(PQR.id == pqr_id).first()
    if not pqr:
        raise HTTPException(status_code=404, detail={"mensaje": "PQR no encontrada"})

    pqr.respuesta = datos.respuesta
    pqr.estado = datos.estado
    db.commit()

    return {"mensaje": "PQR respondida correctamente"}


@router.patch("/{pqr_id}/estado")
def cambiar_estado_pqr(
    pqr_id: int,
    datos: CambiarEstadoPQRInput,
    usuario: dict = Depends(requerir_roles("administrador", "empleado")),
    db: Session = Depends(get_db),
):
    pqr = db.query(PQR).filter(PQR.id == pqr_id).first()
    if not pqr:
        raise HTTPException(status_code=404, detail={"mensaje": "PQR no encontrada"})

    pqr.estado = datos.estado
    db.commit()

    return {"mensaje": f"PQR actualizada a {datos.estado}"}


@router.delete("/{pqr_id}")
def eliminar_pqr(
    pqr_id: int,
    usuario: dict = Depends(requerir_roles("administrador")),
    db: Session = Depends(get_db),
):
    pqr = db.query(PQR).filter(PQR.id == pqr_id).first()
    if not pqr:
        raise HTTPException(status_code=404, detail={"mensaje": "PQR no encontrada"})

    db.delete(pqr)
    db.commit()

    return {"mensaje": "PQR eliminada correctamente"}


@router.get("/estadisticas/resumen")
def estadisticas_pqr(
    usuario: dict = Depends(requerir_roles("administrador", "empleado")),
    db: Session = Depends(get_db),
):
    total = db.query(PQR).count()
    pendientes = db.query(PQR).filter(PQR.estado == "pendiente").count()
    en_proceso = db.query(PQR).filter(PQR.estado == "en_proceso").count()
    respondidas = db.query(PQR).filter(PQR.estado == "respondida").count()
    cerradas = db.query(PQR).filter(PQR.estado == "cerrada").count()

    peticiones = db.query(PQR).filter(PQR.tipo == "peticion").count()
    quejas = db.query(PQR).filter(PQR.tipo == "queja").count()
    reclamos = db.query(PQR).filter(PQR.tipo == "reclamo").count()

    return {
        "total": total,
        "pendientes": pendientes,
        "en_proceso": en_proceso,
        "respondidas": respondidas,
        "cerradas": cerradas,
        "peticiones": peticiones,
        "quejas": quejas,
        "reclamos": reclamos,
    }
