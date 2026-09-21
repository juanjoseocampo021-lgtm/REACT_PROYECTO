from sqlalchemy import (
    Column, Integer, String, DECIMAL, DateTime, Date, Boolean, Enum, ForeignKey
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from .database import Base


class Rol(Base):
    __tablename__ = "roles"

    id = Column(Integer, primary_key=True)
    nombre = Column(String(30), unique=True, nullable=False)


class Usuario(Base):
    __tablename__ = "usuarios"

    id = Column(Integer, primary_key=True)
    nombre = Column(String(30), nullable=False)
    apellido = Column(String(30), nullable=False)
    tipo_documento = Column(Enum("CC", "TI", "CE", name="tipo_documento_enum"), nullable=False)
    numero_documento = Column(String(10), unique=True, nullable=False)
    direccion = Column(String(60), nullable=False)
    telefono = Column(String(10), nullable=False)
    correo = Column(String(50), unique=True, nullable=False)
    contrasena_hash = Column(String(255), nullable=False)
    rol_id = Column(Integer, ForeignKey("roles.id"), nullable=False, default=3)
    estado = Column(Enum("activo", "inactivo", name="usuario_estado_enum"), nullable=False, default="activo")
    creado_en = Column(DateTime, server_default=func.now())

    rol = relationship("Rol")


class Permiso(Base):
    __tablename__ = "permisos"

    id = Column(Integer, primary_key=True)
    rol_id = Column(Integer, ForeignKey("roles.id"), nullable=False)
    descripcion = Column(String(100), nullable=False)


class Producto(Base):
    __tablename__ = "productos"

    id = Column(Integer, primary_key=True)
    nombre = Column(String(80), nullable=False)
    descripcion = Column(String(255))
    descripcion_detallada = Column(String(1200))
    duracion = Column(String(60))
    tipo_experiencia = Column(String(80))
    que_puedes_esperar = Column(String(1200))
    precio = Column(DECIMAL(10, 2), nullable=False, default=0)
    imagen_url = Column(String(500))
    region = Column(String(30), nullable=False, default="Colombia")
    estado = Column(Enum("activo", "inactivo", name="producto_estado_enum"), nullable=False, default="activo")
    creado_en = Column(DateTime, server_default=func.now())


class Servicio(Base):
    __tablename__ = "servicios"

    id = Column(Integer, primary_key=True)
    nombre = Column(String(80), nullable=False)
    descripcion = Column(String(255))
    precio = Column(DECIMAL(10, 2), nullable=False, default=0)
    imagen_url = Column(String(500))
    estado = Column(Enum("activo", "inactivo", name="servicio_estado_enum"), nullable=False, default="activo")
    creado_en = Column(DateTime, server_default=func.now())


class Reserva(Base):
    __tablename__ = "reservas"

    id = Column(Integer, primary_key=True)
    usuario_id = Column(Integer, ForeignKey("usuarios.id"), nullable=False)
    tipo = Column(Enum("producto", "servicio", name="reserva_tipo_enum"), nullable=False)
    item_id = Column(Integer, nullable=False)
    nombre_item = Column(String(80), nullable=False)
    precio_item = Column(DECIMAL(10, 2), nullable=False)
    fecha_viaje = Column(Date, nullable=False)
    personas = Column(Integer, nullable=False, default=1)
    notas = Column(String(255))
    estado = Column(
        Enum("pendiente", "confirmada", "cancelada", name="reserva_estado_enum"),
        nullable=False,
        default="pendiente",
    )
    creado_en = Column(DateTime, server_default=func.now())

    usuario = relationship("Usuario")


class MensajeContacto(Base):
    __tablename__ = "mensajes_contacto"

    id = Column(Integer, primary_key=True)
    nombre = Column(String(30), nullable=False)
    correo = Column(String(50), nullable=False)
    mensaje = Column(String(300), nullable=False)
    leido = Column(Boolean, nullable=False, default=False)
    creado_en = Column(DateTime, server_default=func.now())


class Venta(Base):
    __tablename__ = "ventas"

    id = Column(Integer, primary_key=True)
    usuario_id = Column(Integer, ForeignKey("usuarios.id"), nullable=False)
    cliente_nombre = Column(String(60), nullable=False)
    cliente_documento = Column(String(10), nullable=False)
    cliente_correo = Column(String(50), nullable=False)
    cliente_telefono = Column(String(10), nullable=False)
    subtotal = Column(DECIMAL(10, 2), nullable=False, default=0)
    impuestos = Column(DECIMAL(10, 2), nullable=False, default=0)
    descuento = Column(DECIMAL(10, 2), nullable=False, default=0)
    total = Column(DECIMAL(10, 2), nullable=False, default=0)
    estado = Column(
        Enum("pendiente", "completada", "cancelada", name="venta_estado_enum"),
        nullable=False,
        default="pendiente",
    )
    notas = Column(String(255))
    creado_en = Column(DateTime, server_default=func.now())

    usuario = relationship("Usuario")
    detalles = relationship("DetalleVenta", back_populates="venta", cascade="all, delete-orphan")


class DetalleVenta(Base):
    __tablename__ = "detalle_ventas"

    id = Column(Integer, primary_key=True)
    venta_id = Column(Integer, ForeignKey("ventas.id"), nullable=False)
    tipo = Column(Enum("producto", "servicio", name="detalle_tipo_enum"), nullable=False)
    item_id = Column(Integer, nullable=False)
    nombre_item = Column(String(80), nullable=False)
    cantidad = Column(Integer, nullable=False, default=1)
    precio_unitario = Column(DECIMAL(10, 2), nullable=False)
    subtotal = Column(DECIMAL(10, 2), nullable=False)

    venta = relationship("Venta", back_populates="detalles")


class Factura(Base):
    __tablename__ = "facturas"

    id = Column(Integer, primary_key=True)
    venta_id = Column(Integer, ForeignKey("ventas.id"), nullable=False)
    numero_factura = Column(String(20), unique=True, nullable=False)
    cliente_nombre = Column(String(60), nullable=False)
    cliente_documento = Column(String(10), nullable=False)
    cliente_correo = Column(String(50), nullable=False)
    cliente_telefono = Column(String(10), nullable=False)
    subtotal = Column(DECIMAL(10, 2), nullable=False, default=0)
    impuestos = Column(DECIMAL(10, 2), nullable=False, default=0)
    descuento = Column(DECIMAL(10, 2), nullable=False, default=0)
    total = Column(DECIMAL(10, 2), nullable=False, default=0)
    estado = Column(
        Enum("pendiente", "pagada", "anulada", name="factura_estado_enum"),
        nullable=False,
        default="pendiente",
    )
    creado_en = Column(DateTime, server_default=func.now())

    venta = relationship("Venta")


class PQR(Base):
    __tablename__ = "pqr"

    id = Column(Integer, primary_key=True)
    usuario_id = Column(Integer, ForeignKey("usuarios.id"), nullable=False)
    tipo = Column(Enum("peticion", "queja", "reclamo", name="pqr_tipo_enum"), nullable=False)
    asunto = Column(String(100), nullable=False)
    descripcion = Column(String(500), nullable=False)
    estado = Column(
        Enum("pendiente", "en_proceso", "respondida", "cerrada", name="pqr_estado_enum"),
        nullable=False,
        default="pendiente",
    )
    respuesta = Column(String(500))
    creado_en = Column(DateTime, server_default=func.now())
    actualizado_en = Column(DateTime, server_default=func.now(), onupdate=func.now())

    usuario = relationship("Usuario")


class Conversacion(Base):
    __tablename__ = "conversaciones"

    id = Column(Integer, primary_key=True)
    usuario_id = Column(Integer, ForeignKey("usuarios.id"), nullable=False)
    titulo = Column(String(100), nullable=False, default="Nueva conversación")
    creado_en = Column(DateTime, server_default=func.now())

    usuario = relationship("Usuario")
    mensajes = relationship("MensajeChat", back_populates="conversacion", cascade="all, delete-orphan")


class MensajeChat(Base):
    __tablename__ = "mensajes_chat"

    id = Column(Integer, primary_key=True)
    conversacion_id = Column(Integer, ForeignKey("conversaciones.id"), nullable=False)
    rol = Column(Enum("usuario", "asistente", name="mensaje_rol_enum"), nullable=False)
    contenido = Column(String(2000), nullable=False)
    creado_en = Column(DateTime, server_default=func.now())

    conversacion = relationship("Conversacion", back_populates="mensajes")
