import os
from dotenv import load_dotenv

load_dotenv()

DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = os.getenv("DB_PORT", "3306")
DB_USER = os.getenv("DB_USER", "root")
DB_PASSWORD = os.getenv("DB_PASSWORD", "")
DB_NAME = os.getenv("DB_NAME", "horizonte_viajes")

JWT_SECRET = os.getenv("JWT_SECRET", "")
JWT_EXPIRES_IN = os.getenv("JWT_EXPIRES_IN", "8h")
JWT_ALGORITHM = "HS256"

PORT = int(os.getenv("PORT", "8000"))

_cors_raw = os.getenv("CORS_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173")
CORS_ORIGINS = [
    origin.strip()
    for origin in _cors_raw.split(",")
    if origin.strip()
]

FRONTEND_URL = os.getenv("FRONTEND_URL", "")

if FRONTEND_URL and FRONTEND_URL not in CORS_ORIGINS:
    CORS_ORIGINS.append(FRONTEND_URL)

if not JWT_SECRET:
    JWT_SECRET = "H7vQ9mX2pL8kR4zN6tW3yF5sJ1cD9aB7uE2xK8qP6"
