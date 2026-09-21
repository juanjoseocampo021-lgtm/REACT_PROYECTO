import os
import json
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from ..database import get_db
from ..dependencies import obtener_usuario_actual
from ..models import Conversacion, MensajeChat, Producto, Servicio
from ..schemas import MensajeChatInput, ConversacionInput

router = APIRouter(prefix="/api/chatbot", tags=["Chatbot"])


class ChatPublicoInput(BaseModel):
    mensaje: str
    historial: list = []

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")

BASE_SYSTEM_PROMPT = (
    "Eres el asistente virtual de Horizonte Viajes, una agencia de viajes colombiana. "
    "Tu nombre es Aria. Tu función es ayudar a los clientes con información REAL sobre la agencia.\n\n"
    "REGLAS IMPORTANTES:\n"
    "- SOLO usa la información de productos, destinos y servicios que te proporciono abajo. NO inventes productos, precios ni destinos que no estén en la lista.\n"
    "- Si el cliente pregunta algo que no tienes en la base de datos, di honestamente: 'Esa información no la tengo disponible, pero puedes contactar a nuestro equipo para más detalles.'\n"
    "- Siempre recomienda los productos/servicios reales de la agencia.\n"
    "- Sé cálida, profesional y concisa. Máximo 4-5 oraciones por respuesta.\n"
    "- Responde SIEMPRE en español.\n"
    "- Cuando el cliente pregunte por reservar, guíalo con estos pasos:\n"
    "  1. Explora los destinos en la sección de 'Paquetes' de la página\n"
    "  2. Selecciona el producto que más le guste\n"
    "  3. Haz clic en 'Reservar'\n"
    "  4. Completa los datos (fecha, personas, notas)\n"
    "  5. Confirma la reserva\n"
    "- Cuando pregunte por PQR, explícale que puede registrar una desde su panel en la sección 'PQR'.\n"
    "- Cuando pregunte por facturas, explícale que las encuentra en su panel de 'Facturación'.\n"
)


def _obtener_catalogo(db: Session) -> str:
    productos = db.query(Producto).filter(Producto.estado == 'activo').all()
    servicios = db.query(Servicio).filter(Servicio.estado == 'activo').all()

    partes = []

    if productos:
        partes.append("=== PAQUETES TURÍSTICOS DISPONIBLES ===")
        for p in productos:
            region = p.region or 'Sin región'
            precio = f"${float(p.precio or 0):,.0f}"
            duracion = p.duracion or 'Consultar'
            experiencia = p.tipo_experiencia or ''
            desc = p.descripcion or ''
            partes.append(f"- {p.nombre} | Región: {region} | Precio: {precio} | Duración: {duracion} | Tipo: {experiencia}")
            if desc:
                partes.append(f"  Descripción: {desc[:150]}")
        partes.append("")

    if servicios:
        partes.append("=== SERVICIOS DISPONIBLES ===")
        for s in servicios:
            precio = f"${float(s.precio or 0):,.0f}"
            desc = s.descripcion or ''
            partes.append(f"- {s.nombre} | Precio: {precio}")
            if desc:
                partes.append(f"  Descripción: {desc[:150]}")
        partes.append("")

    if not partes:
        return "No hay productos ni servicios registrados actualmente."

    return "\n".join(partes)


RESPUESTAS_PREDEFINIDAS = {
    "hola": None,
    "buenos": None,
    "buenas": None,
    "hey": None,
}


def buscar_respuesta_predefinida(mensaje: str) -> str | None:
    mensaje_lower = mensaje.lower().strip()
    for clave, respuesta in RESPUESTAS_PREDEFINIDAS.items():
        if clave in mensaje_lower:
            return respuesta
    return None


async def generar_respuesta_ia(mensaje: str, historial: list, db: Session) -> str:
    predefinida = buscar_respuesta_predefinida(mensaje)
    if predefinida is not None:
        return predefinida

    if not GEMINI_API_KEY or GEMINI_API_KEY == "YOUR_GEMINI_API_KEY_HERE":
        return (
            "Gracias por tu mensaje. Actualmente estoy en modo asistente básico. "
            "Puedo ayudarte con información general sobre:\n"
            "- Servicios y paquetes turísticos\n"
            "- Destinos disponibles\n"
            "- Reservas\n"
            "- Facturación\n"
            "- PQR (peticiones, quejas y reclamos)\n\n"
            "Escribe una palabra clave como: servicios, destinos, reservas, precios, contacto, factura, pqr o ayuda."
        )

    try:
        import httpx

        catalogo = _obtener_catalogo(db)
        system_prompt_completo = BASE_SYSTEM_PROMPT + "\n\n=== CATÁLOGO REAL DE LA AGENCIA ===\n" + catalogo

        contents = []
        for h in historial[-10:]:
            role = "user" if h["rol"] == "usuario" else "model"
            contents.append({"role": role, "parts": [{"text": h["contenido"]}]})
        contents.append({"role": "user", "parts": [{"text": mensaje}]})

        payload = {
            "contents": contents,
            "systemInstruction": {
                "parts": [{"text": system_prompt_completo}]
            },
            "generationConfig": {
                "temperature": 0.7,
                "maxOutputTokens": 600,
                "topP": 0.95,
            },
        }

        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent?key={GEMINI_API_KEY}"

        async with httpx.AsyncClient(timeout=30.0) as client:
            respuesta = await client.post(
                url,
                headers={"Content-Type": "application/json"},
                json=payload,
            )

            if respuesta.status_code == 200:
                datos = respuesta.json()
                candidates = datos.get("candidates", [])
                if candidates:
                    parts = candidates[0].get("content", {}).get("parts", [])
                    if parts:
                        return parts[0].get("text", "")
                return ""
            else:
                return (
                    "No pude conectar con el servicio de IA en este momento. "
                    "Pero puedo ayudarte con información sobre nuestros servicios, destinos y reservas. "
                    "Prueba escribiendo: servicios, destinos, reservas, precios, contacto o ayuda."
                )

    except Exception:
        return (
            "No pude conectar con el servicio de IA en este momento. "
            "Pero puedo ayudarte con información sobre nuestros servicios, destinos y reservas. "
            "Prueba escribiendo: servicios, destinos, reservas, precios, contacto o ayuda."
        )


@router.post("/publico")
async def chatbot_publico(datos: ChatPublicoInput, db: Session = Depends(get_db)):
    historial_formateado = [{"rol": m.get("rol", "usuario"), "contenido": m.get("contenido", "")} for m in (datos.historial or [])]
    respuesta = await generar_respuesta_ia(datos.mensaje, historial_formateado, db)
    return {"respuesta": respuesta}


@router.get("/conversaciones")
def listar_conversaciones(
    usuario: dict = Depends(obtener_usuario_actual),
    db: Session = Depends(get_db),
):
    conversaciones = (
        db.query(Conversacion)
        .filter(Conversacion.usuario_id == usuario["id"])
        .order_by(Conversacion.creado_en.desc())
        .all()
    )

    return [
        {
            "id": c.id,
            "titulo": c.titulo,
            "creado_en": c.creado_en.isoformat() if c.creado_en else None,
            "total_mensajes": len(c.mensajes),
        }
        for c in conversaciones
    ]


@router.post("/conversaciones", status_code=201)
def crear_conversacion(
    datos: ConversacionInput,
    usuario: dict = Depends(obtener_usuario_actual),
    db: Session = Depends(get_db),
):
    conversacion = Conversacion(
        usuario_id=usuario["id"],
        titulo=datos.titulo,
    )
    db.add(conversacion)
    db.commit()
    db.refresh(conversacion)

    return {
        "mensaje": "Conversación creada",
        "conversacionId": conversacion.id,
    }


@router.get("/conversaciones/{conversacion_id}")
def obtener_conversacion(
    conversacion_id: int,
    usuario: dict = Depends(obtener_usuario_actual),
    db: Session = Depends(get_db),
):
    conversacion = db.query(Conversacion).filter(
        Conversacion.id == conversacion_id,
        Conversacion.usuario_id == usuario["id"],
    ).first()

    if not conversacion:
        raise HTTPException(status_code=404, detail={"mensaje": "Conversación no encontrada"})

    return {
        "id": conversacion.id,
        "titulo": conversacion.titulo,
        "creado_en": conversacion.creado_en.isoformat() if conversacion.creado_en else None,
        "mensajes": [
            {
                "id": m.id,
                "rol": m.rol,
                "contenido": m.contenido,
                "creado_en": m.creado_en.isoformat() if m.creado_en else None,
            }
            for m in conversacion.mensajes
        ],
    }


@router.post("/conversaciones/{conversacion_id}/mensajes")
async def enviar_mensaje(
    conversacion_id: int,
    datos: MensajeChatInput,
    usuario: dict = Depends(obtener_usuario_actual),
    db: Session = Depends(get_db),
):
    conversacion = db.query(Conversacion).filter(
        Conversacion.id == conversacion_id,
        Conversacion.usuario_id == usuario["id"],
    ).first()

    if not conversacion:
        raise HTTPException(status_code=404, detail={"mensaje": "Conversación no encontrada"})

    mensaje_usuario = MensajeChat(
        conversacion_id=conversacion_id,
        rol="usuario",
        contenido=datos.mensaje,
    )
    db.add(mensaje_usuario)
    db.flush()

    historial = [
        {"rol": m.rol, "contenido": m.contenido}
        for m in conversacion.mensajes
    ]
    historial.append({"rol": "usuario", "contenido": datos.mensaje})

    respuesta_ia = await generar_respuesta_ia(datos.mensaje, historial, db)

    mensaje_asistente = MensajeChat(
        conversacion_id=conversacion_id,
        rol="asistente",
        contenido=respuesta_ia,
    )
    db.add(mensaje_asistente)
    db.commit()

    return {
        "mensaje": {
            "id": mensaje_usuario.id,
            "rol": "usuario",
            "contenido": datos.mensaje,
        },
        "respuesta": {
            "id": mensaje_asistente.id,
            "rol": "asistente",
            "contenido": respuesta_ia,
        },
    }


@router.delete("/conversaciones/{conversacion_id}")
def eliminar_conversacion(
    conversacion_id: int,
    usuario: dict = Depends(obtener_usuario_actual),
    db: Session = Depends(get_db),
):
    conversacion = db.query(Conversacion).filter(
        Conversacion.id == conversacion_id,
        Conversacion.usuario_id == usuario["id"],
    ).first()

    if not conversacion:
        raise HTTPException(status_code=404, detail={"mensaje": "Conversación no encontrada"})

    db.delete(conversacion)
    db.commit()

    return {"mensaje": "Conversación eliminada"}
