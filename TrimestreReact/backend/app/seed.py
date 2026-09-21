from sqlalchemy.orm import Session
from .models import Rol, Usuario, Producto, Servicio, Permiso
from .security import hash_password


def sembrar_datos(db: Session):
    if db.query(Rol).first():
        return

    # Roles
    roles = [
        Rol(id=1, nombre="administrador"),
        Rol(id=2, nombre="empleado"),
        Rol(id=3, nombre="cliente"),
    ]
    db.add_all(roles)
    db.flush()

    # Permisos
    permisos = [
        Permiso(rol_id=1, descripcion="Gestionar usuarios, productos, servicios y reservas"),
        Permiso(rol_id=2, descripcion="Gestionar productos, servicios y reservas"),
        Permiso(rol_id=3, descripcion="Consultar experiencias y gestionar sus reservas y perfil"),
    ]
    db.add_all(permisos)

    # Admin
    admin = Usuario(
        nombre="Admin",
        apellido="Horizonte",
        tipo_documento="CC",
        numero_documento="1000000000",
        direccion="Calle 10 #5-20, Medellin",
        telefono="3001234567",
        correo="admin@horizonteviajes.com",
        contrasena_hash=hash_password("admin123"),
        rol_id=1,
        estado="activo",
    )
    db.add(admin)

    # Empleado
    empleado = Usuario(
        nombre="Maria",
        apellido="Lopez",
        tipo_documento="CC",
        numero_documento="1000000001",
        direccion="Carrera 43 #15-10, Medellin",
        telefono="3009876543",
        correo="empleado@horizonteviajes.com",
        contrasena_hash=hash_password("empleado123"),
        rol_id=2,
        estado="activo",
    )
    db.add(empleado)

    # Cliente
    cliente = Usuario(
        nombre="Carlos",
        apellido="Perez",
        tipo_documento="CC",
        numero_documento="1000000002",
        direccion="Calle 80 #25-30, Bogota",
        telefono="3105551234",
        correo="carlos@correo.com",
        contrasena_hash=hash_password("cliente123"),
        rol_id=3,
        estado="activo",
    )
    db.add(cliente)

    # Productos
    productos = [
        Producto(
            nombre="Paquete Cascada de Otono",
            descripcion="Tour guiado de un dia a la cascada con almuerzo incluido",
            descripcion_detallada="Disfruta de un dia inolvidable visitando la cascada mas hermosa de la region. Incluye guia turistico, almuerzo tipico y transporte.",
            duracion="1 dia",
            tipo_experiencia="Aventura",
            que_puedes_esperar="Paisajes naturales impresionantes, agua cristalina, fauna diversa y almuerzo tipico colombiano.",
            precio=250000,
            imagen_url="https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?w=1200&q=85",
            region="Antioquia",
            estado="activo",
        ),
        Producto(
            nombre="Paquete Cabanas frente al Mar",
            descripcion="Estadia de 3 noches en cabana frente al mar",
            descripcion_detallada="Relajate en nuestras cabanas con vista al mar. Incluye desayuno, acceso a piscina y actividades acuaticas.",
            duracion="4 dias / 3 noches",
            tipo_experiencia="Relax",
            que_puedes_esperar="Vistas panoramicas al océano, atardeceres espectaculares, playa privada y gastronomia local.",
            precio=890000,
            imagen_url="https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=1200&q=85",
            region="Caribe",
            estado="activo",
        ),
        Producto(
            nombre="Aventura en el Cafetal",
            descripcion="Experiencia completa en zona cafetera con recorrido y degustacion",
            descripcion_detallada="Conoce el proceso del cafe de mano a mano con los agricultores. Recorrido por el cultivo, beneficio y degustacion.",
            duracion="1 dia",
            tipo_experiencia="Cultural",
            que_puedes_esperar="Aprender sobre el cultivo de cafe, probar cafe recien hecho y disfrutar del paisaje cafetero.",
            precio=180000,
            imagen_url="https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=1200&q=85",
            region="Eje Cafetero",
            estado="activo",
        ),
        Producto(
            nombre="Safari de Aves en el Llano",
            descripcion="Tour de observacion de aves en los llanos orientales",
            descripcion_detallada="Explora la biodiversidad unica de los Llanos Orientales. Observa garzas, tucanes, guacamayas y muchas mas especies.",
            duracion="2 dias / 1 noche",
            tipo_experiencia="Naturaleza",
            que_puedes_esperar="Avistamiento de mas de 100 especies de aves, atardecer en el llano y experiencecia rural.",
            precio=450000,
            imagen_url="https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?w=1200&q=85",
            region="Llanos Orientales",
            estado="activo",
        ),
        Producto(
            nombre="Tour Ciudad Perdida",
            descripcion="Trekking hacia la Ciudad Perdida, Tayrona",
            descripcion_detallada="Aventurate en el trekking mas icónico de Colombia. 4 dias caminando por la sierra nevada hasta la legendaria Ciudad Perdida.",
            duracion="4 dias / 3 noches",
            tipo_experiencia="Aventura",
            que_puedes_esperar="Paisajes de montaña, rios cristalinos, cultura indigena Kogui y la emocion de llegar a la Ciudad Perdida.",
            precio=1200000,
            imagen_url="https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=1200&q=85",
            region="Sierra Nevada",
            estado="activo",
        ),
    ]
    db.add_all(productos)

    # Servicios
    servicios = [
        Servicio(
            nombre="Guia turistico privado",
            descripcion="Acompanamiento personalizado durante todo el recorrido",
            precio=120000,
            imagen_url="https://images.unsplash.com/photo-1517824806704-9040b037703b?w=1200&q=85",
            estado="activo",
        ),
        Servicio(
            nombre="Transporte ida y vuelta",
            descripcion="Transporte comodo desde el punto de encuentro hasta el destino",
            precio=80000,
            imagen_url="https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=1200&q=85",
            estado="activo",
        ),
        Servicio(
            nombre="Seguro de viaje",
            descripcion="Cobertura medica y de equipaje durante tu viaje",
            precio=45000,
            imagen_url="https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=1200&q=85",
            estado="activo",
        ),
        Servicio(
            nombre="Almuerzo tipico",
            descripcion="Almuerzo tradicional colombiano en el destino",
            precio=35000,
            imagen_url="https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=1200&q=85",
            estado="activo",
        ),
    ]
    db.add_all(servicios)

    db.commit()
