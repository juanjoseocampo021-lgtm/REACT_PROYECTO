import re

REGEX_NOMBRE = re.compile(r"^[a-zA-ZÁÉÍÓÚáéíóúñÑ\s]+$")
REGEX_DOCUMENTO = re.compile(r"^\d{6,10}$")
REGEX_TELEFONO = re.compile(r"^\d{7,10}$")
REGEX_CORREO = re.compile(r"^[^\s@]+@[^\s@]+\.[^\s@]+$")


def validar_registro(datos: dict) -> dict:
    """Replica exactamente las reglas de validación del registro de
    clientes que ya existían en el backend de Node, para que el
    Frontend siga mostrando los mismos mensajes de error."""
    errores = {}

    nombre = (datos.get("nombre") or "").strip()
    apellido = (datos.get("apellido") or "").strip()
    tipo_documento = datos.get("tipoDocumento") or ""
    numero_documento = datos.get("numeroDocumento") or ""
    direccion = (datos.get("direccion") or "").strip()
    telefono = datos.get("telefono") or ""
    correo = datos.get("correo") or ""
    contrasena = datos.get("contrasena") or ""
    confirmar = datos.get("confirmarContrasena") or ""

    if not nombre:
        errores["nombre"] = "El nombre es obligatorio"
    elif len(nombre) < 2 or len(nombre) > 30:
        errores["nombre"] = "Debe tener entre 2 y 30 caracteres"
    elif not REGEX_NOMBRE.match(nombre):
        errores["nombre"] = "Solo se permiten letras"

    if not apellido:
        errores["apellido"] = "El apellido es obligatorio"
    elif len(apellido) < 2 or len(apellido) > 30:
        errores["apellido"] = "Debe tener entre 2 y 30 caracteres"
    elif not REGEX_NOMBRE.match(apellido):
        errores["apellido"] = "Solo se permiten letras"

    if tipo_documento not in ("CC", "TI", "CE"):
        errores["tipoDocumento"] = "Selecciona un tipo de documento válido"

    if not numero_documento:
        errores["numeroDocumento"] = "El número de documento es obligatorio"
    elif not REGEX_DOCUMENTO.match(numero_documento):
        errores["numeroDocumento"] = "Debe tener entre 6 y 10 dígitos numéricos"

    if not direccion:
        errores["direccion"] = "La dirección es obligatoria"
    elif len(direccion) > 60:
        errores["direccion"] = "Máximo 60 caracteres"

    if not telefono:
        errores["telefono"] = "El teléfono es obligatorio"
    elif not REGEX_TELEFONO.match(telefono):
        errores["telefono"] = "Debe tener entre 7 y 10 dígitos"

    if not correo:
        errores["correo"] = "El correo es obligatorio"
    elif not REGEX_CORREO.match(correo):
        errores["correo"] = "Formato de correo inválido"
    elif len(correo) > 50:
        errores["correo"] = "Máximo 50 caracteres"

    if not contrasena:
        errores["contrasena"] = "La contraseña es obligatoria"
    elif len(contrasena) < 6 or len(contrasena) > 20:
        errores["contrasena"] = "Debe tener entre 6 y 20 caracteres"

    if confirmar != contrasena:
        errores["confirmarContrasena"] = "Las contraseñas no coinciden"

    return errores


def validar_numero_documento(valor: str) -> bool:
    return bool(REGEX_DOCUMENTO.match(valor or ""))


def validar_telefono(valor: str) -> bool:
    return bool(REGEX_TELEFONO.match(valor or ""))


def validar_correo(valor: str) -> bool:
    return bool(REGEX_CORREO.match(valor or ""))
