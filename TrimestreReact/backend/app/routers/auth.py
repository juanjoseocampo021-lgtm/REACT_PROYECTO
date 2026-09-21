from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import or_
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Usuario
from ..schemas import LoginInput, RegistroInput
from ..security import crear_token, hash_password, verify_password
from ..validators import validar_registro

router = APIRouter(prefix="/api/auth", tags=["Autenticación"])


@router.post("/registro", status_code=201)
def registrar(datos: RegistroInput, db: Session = Depends(get_db)):
    errores = validar_registro(datos.model_dump())
    if errores:
        raise HTTPException(status_code=400, detail={"mensaje": "Datos inválidos", "errores": errores})

    existente = (
        db.query(Usuario)
        .filter(or_(Usuario.correo == datos.correo, Usuario.numero_documento == datos.numeroDocumento))
        .first()
    )
    if existente:
        raise HTTPException(status_code=409, detail={"mensaje": "Ya existe un usuario con ese correo o número de documento"})

    usuario = Usuario(
        nombre=datos.nombre.strip(),
        apellido=datos.apellido.strip(),
        tipo_documento=datos.tipoDocumento,
        numero_documento=datos.numeroDocumento,
        direccion=datos.direccion.strip(),
        telefono=datos.telefono,
        correo=datos.correo.strip().lower(),
        contrasena_hash=hash_password(datos.contrasena),
        rol_id=3,
        estado="activo",
    )
    db.add(usuario)
    db.commit()
    db.refresh(usuario)

    return {"mensaje": "Usuario registrado correctamente", "usuarioId": usuario.id}


@router.post("/login")
def login(datos: LoginInput, db: Session = Depends(get_db)):
    correo = datos.correo.strip().lower()
    if not correo or not datos.contrasena:
        raise HTTPException(status_code=400, detail={"mensaje": "Correo y contraseña son obligatorios"})

    usuario = db.query(Usuario).filter(Usuario.correo == correo).first()
    if not usuario or not verify_password(datos.contrasena, usuario.contrasena_hash):
        raise HTTPException(status_code=401, detail={"mensaje": "Correo o contraseña incorrectos"})
    if usuario.estado == "inactivo":
        raise HTTPException(status_code=403, detail={"mensaje": "Tu cuenta se encuentra inactiva. Contacta al administrador."})

    token = crear_token(usuario.id)
    rol_nombre = usuario.rol.nombre if usuario.rol else "cliente"

    return {
        "mensaje": "Inicio de sesión exitoso",
        "token": token,
        "usuario": {
            "id": usuario.id,
            "nombre": usuario.nombre,
            "apellido": usuario.apellido,
            "correo": usuario.correo,
            "rol": rol_nombre,
        },
    }
