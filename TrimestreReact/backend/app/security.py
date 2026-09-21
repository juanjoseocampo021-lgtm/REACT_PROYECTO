from datetime import datetime, timedelta, timezone

import bcrypt
from jose import jwt

from .config import JWT_ALGORITHM, JWT_EXPIRES_IN, JWT_SECRET


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(password: str, password_hash: str) -> bool:
    try:
        return bcrypt.checkpw(password.encode("utf-8"), password_hash.encode("utf-8"))
    except (ValueError, TypeError):
        return False


def _parsear_expiracion(valor: str) -> timedelta:
    valor = (valor or "8h").strip().lower()
    try:
        if valor.endswith("d"):
            return timedelta(days=float(valor[:-1]))
        if valor.endswith("h"):
            return timedelta(hours=float(valor[:-1]))
        if valor.endswith("m"):
            return timedelta(minutes=float(valor[:-1]))
        if valor.endswith("s"):
            return timedelta(seconds=float(valor[:-1]))
        return timedelta(minutes=float(valor))
    except ValueError:
        return timedelta(hours=8)


def crear_token(usuario_id: int) -> str:
    ahora = datetime.now(timezone.utc)
    payload = {
        "sub": str(usuario_id),
        "iat": ahora,
        "exp": ahora + _parsear_expiracion(JWT_EXPIRES_IN),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


def decodificar_token(token: str) -> dict:
    return jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
