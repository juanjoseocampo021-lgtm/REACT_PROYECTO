from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import or_
from sqlalchemy.orm import Session, joinedload

from ..database import get_db
from ..models import Usuario
from ..schemas import CrearUsuarioInput, ActualizarUsuarioInput, CambiarEstadoUsuarioInput
from ..security import hash_password
from ..dependencies import requerir_roles
from ..validators import validar_registro, REGEX_NOMBRE

router = APIRouter(
    prefix="/api/usuarios",
    tags=["usuarios"],
    dependencies=[Depends(requerir_roles("administrador"))],
)


def _usuario_a_dict(u: Usuario, incluir_rol_id: bool = False) -> dict:
    datos = {
        "id": u.id,
        "nombre": u.nombre,
        "apellido": u.apellido,
        "tipo_documento": u.tipo_documento,
        "numero_documento": u.numero_documento,
        "direccion": u.direccion,
        "telefono": u.telefono,
        "correo": u.correo,
        "estado": u.estado,
        "creado_en": u.creado_en,
        "rol": u.rol.nombre if u.rol else None,
    }
    if incluir_rol_id:
        datos["rol_id"] = u.rol_id
    return datos


def _validar_nombre_apellido_direccion(datos) -> dict:
    """Reglas compartidas con el registro público (letras, longitudes)
    para los campos que ActualizarUsuarioInput sí trae, pero que
    validar_registro no puede usar directamente porque a ese schema
    le faltan tipoDocumento/numeroDocumento/confirmarContrasena."""
    errores = {}

    nombre = (datos.nombre or "").strip()
    apellido = (datos.apellido or "").strip()
    direccion = (datos.direccion or "").strip()

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

    if not direccion:
        errores["direccion"] = "La dirección es obligatoria"
    elif len(direccion) > 60:
        errores["direccion"] = "Máximo 60 caracteres"

    return errores


# ------------------------------------------------------------
# POST /api/usuarios  (el admin puede crear usuarios con cualquier rol)
# ------------------------------------------------------------
@router.post("", status_code=201)
def crear_usuario(datos: CrearUsuarioInput, db: Session = Depends(get_db)):
    if not datos.rolId:
        raise HTTPException(status_code=400, detail={"mensaje": "Selecciona un rol"})

    # Misma validación completa que usa /auth/registro: nombre, apellido,
    # tipo/número de documento, dirección, teléfono, correo y contraseña.
    # confirmarContrasena no existe en este formulario, así que la
    # igualamos a mano para que esa regla no dispare un error falso.
    datos_dict = datos.model_dump()
    datos_dict["confirmarContrasena"] = datos.contrasena

    errores = validar_registro(datos_dict)
    if errores:
        raise HTTPException(status_code=400, detail={"mensaje": "Datos inválidos", "errores": errores})

    existente = (
        db.query(Usuario)
        .filter(or_(Usuario.correo == datos.correo, Usuario.numero_documento == datos.numeroDocumento))
        .first()
    )
    if existente:
        raise HTTPException(
            status_code=409,
            detail={"mensaje": "Ya existe un usuario con ese correo o número de documento"},
        )

    nuevo = Usuario(
        nombre=datos.nombre.strip(),
        apellido=datos.apellido.strip(),
        tipo_documento=datos.tipoDocumento,
        numero_documento=datos.numeroDocumento,
        direccion=datos.direccion.strip(),
        telefono=datos.telefono,
        correo=datos.correo.strip().lower(),
        contrasena_hash=hash_password(datos.contrasena),
        rol_id=datos.rolId,
        estado="activo",
    )
    db.add(nuevo)
    db.commit()
    db.refresh(nuevo)

    return {"mensaje": "Usuario creado correctamente", "id": nuevo.id}


# ------------------------------------------------------------
# GET /api/usuarios
# ------------------------------------------------------------
@router.get("")
def listar_usuarios(db: Session = Depends(get_db)):
    usuarios = (
        db.query(Usuario)
        .options(joinedload(Usuario.rol))
        .order_by(Usuario.creado_en.desc())
        .all()
    )
    return [_usuario_a_dict(u) for u in usuarios]


# ------------------------------------------------------------
# GET /api/usuarios/{id}
# ------------------------------------------------------------
@router.get("/{id}")
def obtener_usuario(id: int, db: Session = Depends(get_db)):
    usuario = db.query(Usuario).options(joinedload(Usuario.rol)).filter(Usuario.id == id).first()
    if not usuario:
        raise HTTPException(status_code=404, detail={"mensaje": "Usuario no encontrado"})
    return _usuario_a_dict(usuario, incluir_rol_id=True)


# ------------------------------------------------------------
# PUT /api/usuarios/{id}
# ------------------------------------------------------------
@router.put("/{id}")
def actualizar_usuario(id: int, datos: ActualizarUsuarioInput, db: Session = Depends(get_db)):
    if not all([datos.nombre, datos.apellido, datos.direccion, datos.telefono, datos.correo]):
        raise HTTPException(
            status_code=400,
            detail={"mensaje": "Todos los campos son obligatorios, excepto la contraseña"},
        )

    # Mismas reglas de nombre/apellido/dirección que en la creación,
    # para que editar un usuario no permita colar valores inválidos.
    errores = _validar_nombre_apellido_direccion(datos)
    if errores:
        raise HTTPException(status_code=400, detail={"mensaje": "Datos inválidos", "errores": errores})

    usuario = db.query(Usuario).filter(Usuario.id == id).first()
    if not usuario:
        raise HTTPException(status_code=404, detail={"mensaje": "Usuario no encontrado"})

    usuario.nombre = datos.nombre.strip()
    usuario.apellido = datos.apellido.strip()
    usuario.direccion = datos.direccion.strip()
    usuario.telefono = datos.telefono
    usuario.correo = datos.correo.strip().lower()
    if datos.rolId:
        usuario.rol_id = datos.rolId

    if datos.contrasena:
        if len(datos.contrasena) < 6 or len(datos.contrasena) > 20:
            raise HTTPException(
                status_code=400,
                detail={"mensaje": "La contraseña debe tener entre 6 y 20 caracteres"},
            )
        usuario.contrasena_hash = hash_password(datos.contrasena)

    db.commit()
    return {"mensaje": "Usuario actualizado correctamente"}


# ------------------------------------------------------------
# PATCH /api/usuarios/{id}/estado
# ------------------------------------------------------------
@router.patch("/{id}/estado")
def cambiar_estado_usuario(id: int, datos: CambiarEstadoUsuarioInput, db: Session = Depends(get_db)):
    if datos.estado not in ("activo", "inactivo"):
        raise HTTPException(status_code=400, detail={"mensaje": "El estado debe ser 'activo' o 'inactivo'"})

    usuario = db.query(Usuario).filter(Usuario.id == id).first()
    if not usuario:
        raise HTTPException(status_code=404, detail={"mensaje": "Usuario no encontrado"})

    usuario.estado = datos.estado
    db.commit()
    return {"mensaje": f"Usuario marcado como {datos.estado}"}


# ------------------------------------------------------------
# DELETE /api/usuarios/{id}
# ------------------------------------------------------------
@router.delete("/{id}")
def eliminar_usuario(id: int, db: Session = Depends(get_db)):
    usuario = db.query(Usuario).filter(Usuario.id == id).first()
    if usuario:
        db.delete(usuario)
        db.commit()
    return {"mensaje": "Usuario eliminado correctamente"}