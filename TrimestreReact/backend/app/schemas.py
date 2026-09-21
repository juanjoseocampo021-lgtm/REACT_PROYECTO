from typing import Optional
from pydantic import BaseModel, ConfigDict, Field


class RegistroInput(BaseModel):
    nombre: str = Field(default="", max_length=30)
    apellido: str = Field(default="", max_length=30)
    tipoDocumento: str = ""
    numeroDocumento: str = Field(default="", max_length=10)
    direccion: str = Field(default="", max_length=60)
    telefono: str = Field(default="", max_length=10)
    correo: str = Field(default="", max_length=50)
    contrasena: str = Field(default="", max_length=20)
    confirmarContrasena: str = Field(default="", max_length=20)


class LoginInput(BaseModel):
    correo: str = Field(default="", max_length=50)
    contrasena: str = Field(default="", max_length=100)


class CrearUsuarioInput(RegistroInput):
    rolId: Optional[int] = None


class ActualizarUsuarioInput(BaseModel):
    nombre: str = Field(default="", max_length=30)
    apellido: str = Field(default="", max_length=30)
    direccion: str = Field(default="", max_length=60)
    telefono: str = Field(default="", max_length=10)
    correo: str = Field(default="", max_length=50)
    contrasena: Optional[str] = Field(default=None, max_length=20)
    rolId: Optional[int] = None


class CambiarEstadoUsuarioInput(BaseModel):
    estado: str = ""


class ProductoServicioInput(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)
    nombre: str = Field(default="", max_length=80)
    descripcion: str = Field(default="", max_length=255)
    descripcion_detallada: str = Field(default="", max_length=1200)
    duracion: str = Field(default="", max_length=60)
    tipo_experiencia: str = Field(default="", max_length=80)
    que_puedes_esperar: str = Field(default="", max_length=1200)
    precio: Optional[float] = None
    imagen_url: str = Field(default="", max_length=500)
    region: str = Field(default="Colombia", max_length=30)
    estado: Optional[str] = None


class ReservaInput(BaseModel):
    tipo: str = ""
    itemId: Optional[int] = None
    fechaViaje: str = ""
    personas: int = Field(default=1, ge=1, le=20)
    notas: Optional[str] = Field(default=None, max_length=255)


class CambiarEstadoReservaInput(BaseModel):
    estado: str = ""


class ContactoInput(BaseModel):
    nombre: str = Field(default="", max_length=30)
    correo: str = Field(default="", max_length=50)
    mensaje: str = Field(default="", max_length=300)


# ============================================================
# VENTAS
# ============================================================

class DetalleVentaInput(BaseModel):
    tipo: str = Field(default="producto")
    itemId: int
    nombreItem: str = Field(default="", max_length=80)
    cantidad: int = Field(default=1, ge=1)
    precioUnitario: float = Field(default=0, ge=0)


class VentaInput(BaseModel):
    clienteNombre: str = Field(default="", max_length=60)
    clienteDocumento: str = Field(default="", max_length=10)
    clienteCorreo: str = Field(default="", max_length=50)
    clienteTelefono: str = Field(default="", max_length=10)
    descuento: float = Field(default=0, ge=0)
    notas: Optional[str] = Field(default=None, max_length=255)
    detalles: list[DetalleVentaInput] = Field(default=[])


class CambiarEstadoVentaInput(BaseModel):
    estado: str = ""


# ============================================================
# FACTURAS
# ============================================================

class FacturaInput(BaseModel):
    ventaId: int


class CambiarEstadoFacturaInput(BaseModel):
    estado: str = ""


# ============================================================
# PQR
# ============================================================

class PQRInput(BaseModel):
    tipo: str = Field(default="peticion")
    asunto: str = Field(default="", max_length=100)
    descripcion: str = Field(default="", max_length=500)


class ResponderPQRInput(BaseModel):
    respuesta: str = Field(default="", max_length=500)
    estado: str = Field(default="respondida")


class CambiarEstadoPQRInput(BaseModel):
    estado: str = ""


# ============================================================
# CHATBOT
# ============================================================

class MensajeChatInput(BaseModel):
    mensaje: str = Field(default="", max_length=500)


class ConversacionInput(BaseModel):
    titulo: str = Field(default="Nueva conversación", max_length=100)
