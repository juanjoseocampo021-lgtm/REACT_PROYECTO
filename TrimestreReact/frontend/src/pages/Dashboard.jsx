import React, { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { DashboardLayout } from '../components/DashboardLayout'
import { useAuth, API_URL } from '../context/AuthContext'
import { useToast } from '../components/Toast'
import { formatearPrecio } from '../lib_api'

const MEDIA_BASE = API_URL.replace(/\/api\/?$/, '')

const REGIONES = [
  'Colombia',
  'Caribe',
  'América',
  'Europa',
  'Asia',
  'África',
  'Oceanía',
]

const ESTADOS = {
  pendiente: 'badge-warning',
  confirmada: 'badge-success',
  cancelada: 'badge-danger',
  activo: 'badge-success',
  inactivo: 'badge-neutral',
}

const emptyItem = {
  nombre: '',
  descripcion: '',
  descripcion_detallada: '',
  duracion: '',
  tipo_experiencia: '',
  que_puedes_esperar: '',
  precio: '',
  imagen_url: '',
  region: 'Colombia',
  estado: 'activo',
}


// ============================================================
// PETICIONES A LA API
// ============================================================

const api = async (path, token, options = {}) => {
  const respuesta = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      ...(options.headers || {}),
      Authorization: `Bearer ${token}`,
    },
  })

  const datos = await respuesta.json().catch(() => ({}))

  if (!respuesta.ok) {
    throw new Error(
      datos.mensaje ||
      datos.detail?.mensaje ||
      datos.detail ||
      'No se pudo completar la operación.'
    )
  }

  return datos
}


const descargarArchivo = async (path, token, nombreArchivo) => {
  const respuesta = await fetch(`${API_URL}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  })

  if (!respuesta.ok) {
    let mensaje = 'No se pudo descargar el archivo'
    try {
      const datos = await respuesta.json()
      mensaje = datos.mensaje || (typeof datos.detail === 'string' ? datos.detail : datos.detail?.mensaje) || mensaje
    } catch {}
    throw new Error(mensaje)
  }

  const blob = await respuesta.blob()
  const url = URL.createObjectURL(blob)
  const enlace = document.createElement('a')
  enlace.href = url
  enlace.download = nombreArchivo
  document.body.appendChild(enlace)
  enlace.click()
  document.body.removeChild(enlace)
  URL.revokeObjectURL(url)
}


// ============================================================
// COMPONENTES PEQUEÑOS
// ============================================================

const StatCard = ({ icon, label, value, detail }) => (
  <div className="stat-card">
    <div className="stat-icon">{icon}</div>

    <div>
      <p>{label}</p>
      <strong>{value}</strong>

      {detail && <small>{detail}</small>}
    </div>
  </div>
)


const Badge = ({ estado }) => (
  <span
    className={`status-badge ${ESTADOS[estado] || 'badge-neutral'
      }`}
  >
    {estado}
  </span>
)


const SkeletonRows = ({ cols = 4 }) => (
  <div className="skeleton-list">
    {[1, 2, 3, 4].map((i) => (
      <div key={i} className="skeleton-row">
        {Array.from({ length: cols }).map((_, j) => (
          <span key={j} />
        ))}
      </div>
    ))}
  </div>
)


const Empty = ({ text }) => (
  <div className="empty-state">
    <span>○</span>
    <p>{text}</p>
  </div>
)


// ============================================================
// DASHBOARD PRINCIPAL
// ============================================================

export const Dashboard = () => {
  const {
    usuario,
    token,
  } = useAuth()

  const {
    mostrarToast,
  } = useToast()

  const location = useLocation()
  const navigate = useNavigate()

  const rol = usuario?.rol || 'cliente'

  const seccion =
    new URLSearchParams(location.search).get('seccion') ||
    'inicio'

  const [resumen, setResumen] = useState({})
  const [reservas, setReservas] = useState([])
  const [usuarios, setUsuarios] = useState([])
  const [productos, setProductos] = useState([])
  const [servicios, setServicios] = useState([])
  const [mensajes, setMensajes] = useState([])
  const [ventas, setVentas] = useState([])
  const [facturas, setFacturas] = useState([])
  const [pqrList, setPqrList] = useState([])

  const [cargando, setCargando] = useState(true)

  const [busqueda, setBusqueda] = useState('')
  const [estadoFiltro, setEstadoFiltro] = useState('todos')

  const [modal, setModal] = useState(null)
  const [confirmar, setConfirmar] = useState(null)


  // ----------------------------------------------------------
  // Navegación interna del dashboard
  // ----------------------------------------------------------

  const ir = (s) => {
    const ruta =
      rol === 'administrador'
        ? '/panel-admin'
        : rol === 'empleado'
          ? '/panel-empleado'
          : '/panel-cliente'

    navigate(`${ruta}?seccion=${s}`)
  }


  // ----------------------------------------------------------
  // Cargar información
  // ----------------------------------------------------------

  const cargar = async () => {
    if (!token) return

    setCargando(true)

    try {
      const resumenData = await api(
        '/dashboard/resumen',
        token
      )

      setResumen(resumenData)

      const reservasData =
        rol === 'cliente'
          ? await api('/reservas/mias', token)
          : await api('/reservas', token)

      setReservas(reservasData)

      if (rol !== 'cliente') {
        const [productosData, serviciosData] =
          await Promise.all([
            api('/productos', token),
            api('/servicios', token),
          ])

        setProductos(productosData)
        setServicios(serviciosData)
      }

      if (rol === 'administrador') {
        const usuariosData =
          await api('/usuarios', token)

        const mensajesData =
          await api('/contacto', token)

        const ventasData =
          await api('/ventas/', token)

        const facturasData =
          await api('/facturas/', token)

        const pqrData =
          await api('/pqr/', token)

        setUsuarios(usuariosData)
        setMensajes(mensajesData)
        setVentas(ventasData)
        setFacturas(facturasData)
        setPqrList(pqrData)
      } else if (rol === 'empleado') {
        const ventasData =
          await api('/ventas/', token)

        const facturasData =
          await api('/facturas/', token)

        const pqrData =
          await api('/pqr/', token)

        setVentas(ventasData)
        setFacturas(facturasData)
        setPqrList(pqrData)
      } else {
        const pqrData =
          await api('/pqr/', token)

        setPqrList(pqrData)
      }
    } catch (error) {
      mostrarToast(
        error.message ||
        'No se pudo cargar el dashboard.',
        'error'
      )
    } finally {
      setCargando(false)
    }
  }


  useEffect(() => {
    if (token) {
      cargar()
    }
  }, [token, rol])


  // ----------------------------------------------------------
  // Cambiar estado de reserva
  // ----------------------------------------------------------

  const cambiarReserva = async (id, estado) => {
    try {
      await api(
        `/reservas/${id}/estado`,
        token,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            estado,
          }),
        }
      )

      mostrarToast(
        `Reserva marcada como ${estado}`
      )

      cargar()
    } catch (error) {
      mostrarToast(
        error.message,
        'error'
      )
    }
  }


  // ----------------------------------------------------------
  // Eliminar / cambiar estado
  // ----------------------------------------------------------

  const eliminar = async (tipo, id) => {
    try {
      if (tipo === 'cancelar-reserva') {
        await api(
          `/reservas/${id}/estado`,
          token,
          {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              estado: 'cancelada',
            }),
          }
        )
      } else if (tipo === 'usuarios-estado') {
        const usuarioEncontrado =
          usuarios.find(
            (usuarioItem) =>
              usuarioItem.id === id
          )

        const nuevoEstado =
          usuarioEncontrado?.estado === 'activo'
            ? 'inactivo'
            : 'activo'

        await api(
          `/usuarios/${id}/estado`,
          token,
          {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              estado: nuevoEstado,
            }),
          }
        )
      } else {
        await api(
          `/${tipo}/${id}`,
          token,
          {
            method: 'DELETE',
          }
        )
      }

      if (tipo === 'cancelar-reserva') {
        mostrarToast(
          'Reserva cancelada correctamente'
        )
      } else if (tipo === 'usuarios-estado') {
        mostrarToast(
          'Estado del usuario actualizado'
        )
      } else {
        mostrarToast(
          'Registro eliminado correctamente'
        )
      }

      setConfirmar(null)
      cargar()
    } catch (error) {
      mostrarToast(
        error.message,
        'error'
      )
    }
  }


  // ----------------------------------------------------------
  // Marcar mensaje como leído
  // ----------------------------------------------------------

  const marcarMensaje = async (id) => {
    try {
      await api(
        `/contacto/${id}/leido`,
        token,
        {
          method: 'PATCH',
        }
      )

      cargar()
    } catch (error) {
      mostrarToast(
        error.message,
        'error'
      )
    }
  }


  // ----------------------------------------------------------
  // Títulos
  // ----------------------------------------------------------

  const titulo =
    seccion === 'inicio'
      ? 'Resumen general'
      : seccion === 'paquetes'
        ? 'Paquetes turísticos'
        : seccion === 'servicios'
          ? 'Servicios'
          : seccion === 'reservas'
            ? rol === 'cliente'
              ? 'Mis reservas'
              : 'Reservas'
            : seccion === 'usuarios'
              ? 'Usuarios'
              : seccion === 'mensajes'
                ? 'Mensajes de contacto'
                : seccion === 'perfil'
                  ? 'Mi perfil'
                  : seccion === 'ventas'
                    ? 'Gestión de ventas'
                    : seccion === 'ventas-dashboard'
                      ? 'Dashboard de ventas'
                      : seccion === 'facturas'
                        ? 'Facturación'
                        : seccion === 'pqr'
                          ? 'PQR'
                          : seccion === 'chatbot'
                            ? 'Asistente virtual (IA)'
                            : seccion === 'reportes'
                              ? 'Centro de Reportes'
                              : 'Reportes'


  const descripcion =
    seccion === 'inicio'
      ? 'Consulta rápidamente el estado de tu operación y tus viajes.'
      : seccion === 'ventas'
        ? 'Registra y administra las ventas del sistema.'
        : seccion === 'ventas-dashboard'
          ? 'Análisis gráfico de ventas, ingresos y tendencias.'
            : seccion === 'facturas'
              ? 'Genera y consulta facturas de venta.'
              : seccion === 'reportes'
                ? 'Consulta, genera y descarga reportes financieros y operativos.'
                : seccion === 'pqr'
              ? 'Gestiona peticiones, quejas y reclamos.'
              : 'Administra la información de Horizonte Viajes desde un solo lugar.'


  return (
    <DashboardLayout
      titulo={titulo}
      descripcion={descripcion}
      onNavigate={ir}
    >

      {seccion === 'inicio' && (
        <Inicio
          rol={rol}
          resumen={resumen}
          reservas={reservas}
          productos={productos}
          mensajes={mensajes}
          ventas={ventas}
          facturas={facturas}
          ir={ir}
          cargando={cargando}
        />
      )}

      {seccion === 'reservas' && (
        <TablaReservas
          rol={rol}
          reservas={reservas}
          cargando={cargando}
          cambiarReserva={cambiarReserva}
          confirmar={setConfirmar}
        />
      )}

      {seccion === 'usuarios' && (
        <TablaUsuarios
          usuarios={usuarios}
          cargando={cargando}
          busqueda={busqueda}
          setBusqueda={setBusqueda}
          estadoFiltro={estadoFiltro}
          setEstadoFiltro={setEstadoFiltro}
          abrir={(item) =>
            setModal({
              tipo: 'usuarios',
              item,
            })
          }
          confirmar={setConfirmar}
        />
      )}

      {seccion === 'paquetes' && (
        <TablaItems
          tipo="productos"
          items={productos}
          cargando={cargando}
          busqueda={busqueda}
          setBusqueda={setBusqueda}
          estadoFiltro={estadoFiltro}
          setEstadoFiltro={setEstadoFiltro}
          abrir={(item) =>
            setModal({
              tipo: 'productos',
              item,
            })
          }
          confirmar={setConfirmar}
        />
      )}

      {seccion === 'servicios' && (
        <TablaItems
          tipo="servicios"
          items={servicios}
          cargando={cargando}
          busqueda={busqueda}
          setBusqueda={setBusqueda}
          estadoFiltro={estadoFiltro}
          setEstadoFiltro={setEstadoFiltro}
          abrir={(item) =>
            setModal({
              tipo: 'servicios',
              item,
            })
          }
          confirmar={setConfirmar}
        />
      )}

      {seccion === 'mensajes' && (
        <TablaMensajes
          mensajes={mensajes}
          cargando={cargando}
          marcarMensaje={marcarMensaje}
          confirmar={setConfirmar}
        />
      )}

      {seccion === 'perfil' && (
        <Perfil usuario={usuario} />
      )}

      {seccion === 'reportes' && (
        <Reportes reservas={reservas} ventas={ventas} facturas={facturas} token={token} />
      )}

      {seccion === 'ventas' && (
        <TablaVentas
          rol={rol}
          ventas={ventas}
          cargando={cargando}
          busqueda={busqueda}
          setBusqueda={setBusqueda}
          estadoFiltro={estadoFiltro}
          setEstadoFiltro={setEstadoFiltro}
          cargar={cargar}
          mostrarToast={mostrarToast}
          token={token}
        />
      )}

      {seccion === 'ventas-dashboard' && (
        <DashboardVentas
          token={token}
          ventas={ventas}
          facturas={facturas}
          cargando={cargando}
        />
      )}

      {seccion === 'facturas' && (
        <TablaFacturas
          rol={rol}
          facturas={facturas}
          ventas={ventas}
          cargando={cargando}
          busqueda={busqueda}
          setBusqueda={setBusqueda}
          cargar={cargar}
          mostrarToast={mostrarToast}
          token={token}
        />
      )}

      {seccion === 'pqr' && (
        <TablaPQR
          rol={rol}
          pqrList={pqrList}
          cargando={cargando}
          busqueda={busqueda}
          setBusqueda={setBusqueda}
          estadoFiltro={estadoFiltro}
          setEstadoFiltro={setEstadoFiltro}
          cargar={cargar}
          mostrarToast={mostrarToast}
          token={token}
        />
      )}

      {seccion === 'chatbot' && (
        <Chatbot
          token={token}
          mostrarToast={mostrarToast}
        />
      )}

      {modal?.tipo === 'usuarios' && (
        <UserModal
          item={modal.item}
          token={token}
          onClose={() => setModal(null)}
          onSaved={() => {
            setModal(null)
            cargar()
          }}
          mostrarToast={mostrarToast}
        />
      )}

      {modal?.tipo !== 'usuarios' && modal && (
        <ItemModal
          tipo={modal.tipo}
          item={modal.item}
          token={token}
          onClose={() => setModal(null)}
          onSaved={() => {
            setModal(null)
            cargar()
          }}
          mostrarToast={mostrarToast}
        />
      )}

      {confirmar && (
        <ConfirmModal
          titulo={confirmar.titulo}
          mensaje={confirmar.mensaje}
          onCancel={() => setConfirmar(null)}
          onConfirm={() =>
            eliminar(
              confirmar.tipo,
              confirmar.id
            )
          }
        />
      )}

    </DashboardLayout>
  )
}


// ============================================================
// GRÁFICOS
// ============================================================

const GraficoBarras = ({ datos }) => {
  if (!datos || datos.length === 0) return <Empty text="Sin datos para mostrar" />

  const maxValor = Math.max(...datos.map(d => d.valor), 1)
  const colores = ['#3182ce', '#48bb78', '#f6ad55', '#fc8181', '#9f7aea']

  return (
    <div style={{ padding: '20px', display: 'flex', alignItems: 'flex-end', gap: '20px', height: '200px' }}>
      {datos.map((d, i) => (
        <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
          <span style={{ fontSize: '0.85em', fontWeight: 'bold', marginBottom: '4px' }}>{d.valor}</span>
          <div
            style={{
              width: '100%',
              maxWidth: '60px',
              height: `${(d.valor / maxValor) * 140}px`,
              background: colores[i % colores.length],
              borderRadius: '6px 6px 0 0',
              transition: 'height 0.3s ease',
            }}
          />
          <span style={{ fontSize: '0.75em', marginTop: '6px', textAlign: 'center' }}>{d.label}</span>
        </div>
      ))}
    </div>
  )
}


const GraficoCircular = ({ datos }) => {
  if (!datos || datos.length === 0) return <Empty text="Sin datos para mostrar" />

  const total = datos.reduce((acc, d) => acc + d.valor, 0)
  if (total === 0) return <Empty text="Sin datos para mostrar" />

  let acumulado = 0
  const segmentos = datos.map((d) => {
    const inicio = acumulado
    acumulado += (d.valor / total) * 100
    return { ...d, inicio, fin: acumulado }
  })

  const conicGradient = segmentos
    .map((s) => `${s.color} ${s.inicio}% ${s.fin}%`)
    .join(', ')

  return (
    <div style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '24px' }}>
      <div
        style={{
          width: '150px',
          height: '150px',
          borderRadius: '50%',
          background: `conic-gradient(${conicGradient})`,
          position: 'relative',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            background: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 'bold',
            fontSize: '1.1em',
          }}
        >
          {total}
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {datos.map((d, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: d.color }} />
            <span style={{ fontSize: '0.85em' }}>{d.label}: {d.valor}</span>
          </div>
        ))}
      </div>
    </div>
  )
}


// ============================================================
// INICIO
// ============================================================

const Inicio = ({
  rol,
  resumen,
  reservas,
  mensajes,
  ventas,
  facturas,
  ir,
  cargando,
}) => {

  const cards =
    rol === 'administrador'
      ? [
        [
          '♙',
          'Usuarios activos',
          resumen.usuarios_activos || 0,
          'En el sistema',
        ],
        [
          '▣',
          'Reservas pendientes',
          resumen.reservas_pendientes || 0,
          'Por revisar',
        ],
        [
          '$',
          'Ventas del mes',
          formatearPrecio(
            resumen.ventas_mes
          ),
          `${resumen.total_ventas || 0} ventas totales`,
        ],
        [
          '↗',
          'Facturas',
          resumen.total_facturas || 0,
          `${resumen.facturas_pendientes || 0} pendientes`,
        ],
        [
          '✉',
          'PQR',
          resumen.pqr_total || 0,
          `${resumen.pqr_pendientes || 0} pendientes`,
        ],
        [
          '✉',
          'Mensajes sin leer',
          resumen.mensajes_sin_leer || 0,
          'Requieren atención',
        ],
      ]
      : rol === 'empleado'
        ? [
          [
            '▣',
            'Reservas pendientes',
            resumen.reservas_pendientes || 0,
            'Por revisar',
          ],
          [
            '$',
            'Ventas del mes',
            formatearPrecio(
              resumen.ventas_mes
            ),
            `${resumen.total_ventas || 0} ventas totales`,
          ],
          [
            '✉',
            'PQR pendientes',
            resumen.pqr_pendientes || 0,
            'Por atender',
          ],
          [
            '✈',
            'Paquetes activos',
            resumen.paquetes_activos || 0,
            'Publicados',
          ],
          [
            '◈',
            'Servicios activos',
            resumen.servicios_activos || 0,
            'Disponibles',
          ],
        ]
        : [
          [
            '▣',
            'Mis reservas',
            resumen.mis_reservas || 0,
            'Historial total',
          ],
          [
            '◷',
            'Pendientes',
            resumen.pendientes || 0,
            'En revisión',
          ],
          [
            '✓',
            'Confirmadas',
            resumen.confirmadas || 0,
            'Listas para viajar',
          ],
          [
            '✉',
            'Mis PQR',
            resumen.mis_pqr || 0,
            `${resumen.pqr_pendientes || 0} pendientes`,
          ],
        ]


  return (
    <>
      <div className="stats-grid">
        {cards.map((card) => (
          <StatCard
            key={card[1]}
            icon={card[0]}
            label={card[1]}
            value={card[2]}
            detail={card[3]}
          />
        ))}
      </div>

      {rol === 'administrador' && (
        <div className="dashboard-grid-2" style={{ marginBottom: '20px' }}>
          <section className="panel-card">
            <div className="panel-card-head">
              <div>
                <h3>Resumen de operaciones</h3>
                <p>Volumen por tipo de registro</p>
              </div>
            </div>
            <GraficoBarras
              datos={[
                { label: 'Reservas', valor: reservas.length },
                { label: 'Ventas', valor: ventas.length },
                { label: 'Facturas', valor: facturas.length },
                { label: 'PQR', valor: resumen.pqr_total || 0 },
              ]}
            />
          </section>

          <section className="panel-card">
            <div className="panel-card-head">
              <div>
                <h3>Distribución de estados</h3>
                <p>Reservas por estado</p>
              </div>
            </div>
            <GraficoCircular
              datos={[
                { label: 'Pendientes', valor: reservas.filter(r => r.estado === 'pendiente').length, color: '#f6ad55' },
                { label: 'Confirmadas', valor: reservas.filter(r => r.estado === 'confirmada').length, color: '#48bb78' },
                { label: 'Canceladas', valor: reservas.filter(r => r.estado === 'cancelada').length, color: '#fc8181' },
              ]}
            />
          </section>
        </div>
      )}

      <div className="dashboard-grid-2">

        <section className="panel-card">

          <div className="panel-card-head">
            <div>
              <h3>
                {rol === 'cliente'
                  ? 'Tus últimas reservas'
                  : 'Reservas recientes'}
              </h3>

              <p>
                Actividad más reciente
              </p>
            </div>

            <button
              onClick={() =>
                ir('reservas')
              }
            >
              Ver todas →
            </button>
          </div>

          {cargando ? (
            <SkeletonRows cols={2} />
          ) : (
            reservas
              .slice(0, 5)
              .map((reserva) => (
                <div
                  className="activity-row"
                  key={reserva.id}
                >
                  <div className="activity-dot">
                    {reserva.tipo === 'producto'
                      ? '✈'
                      : '◈'}
                  </div>

                  <div>
                    <strong>
                      {reserva.nombre_item}
                    </strong>

                    <small>
                      {reserva.fecha_viaje?.slice(
                        0,
                        10
                      )}{' '}
                      · {reserva.personas}{' '}
                      persona(s)
                    </small>
                  </div>

                  <Badge
                    estado={reserva.estado}
                  />
                </div>
              ))
          )}

          {!reservas.length && (
            <Empty
              text="Aún no hay reservas."
            />
          )}

        </section>


        {rol === 'administrador' ? (

          <section className="panel-card">

            <div className="panel-card-head">
              <div>
                <h3>
                  Mensajes recientes
                </h3>

                <p>
                  Solicitudes de contacto
                </p>
              </div>

              <button
                onClick={() =>
                  ir('mensajes')
                }
              >
                Ver todos →
              </button>
            </div>

            {mensajes
              .slice(0, 4)
              .map((mensaje) => (
                <div
                  className="activity-row"
                  key={mensaje.id}
                >
                  <div className="avatar small">
                    {mensaje.nombre
                      ?.charAt(0)
                      .toUpperCase()}
                  </div>

                  <div>
                    <strong>
                      {mensaje.nombre}
                    </strong>

                    <small>
                      {mensaje.mensaje}
                    </small>
                  </div>

                  {!mensaje.leido && (
                    <span className="unread-dot" />
                  )}
                </div>
              ))}

            {!mensajes.length && (
              <Empty
                text="No hay mensajes."
              />
            )}

          </section>

        ) : (

          <section className="panel-card">

            <div className="panel-card-head">
              <div>
                <h3>
                  Accesos rápidos
                </h3>

                <p>
                  Continúa donde lo necesitas
                </p>
              </div>
            </div>

            <div className="quick-grid">

              {rol === 'cliente' ? (
                <>
                  <button
                    onClick={() =>
                      ir('reservas')
                    }
                  >
                    ▣
                    <span>
                      Mis reservas
                    </span>
                  </button>

                  <a href="/destinos">
                    ✈
                    <span>
                      Explorar destinos
                    </span>
                  </a>

                  <button
                    onClick={() =>
                      ir('pqr')
                    }
                  >
                    ✉
                    <span>
                      Mis PQR
                    </span>
                  </button>

                  <button
                    onClick={() =>
                      ir('perfil')
                    }
                  >
                    ♙
                    <span>
                      Mi perfil
                    </span>
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() =>
                      ir('reservas')
                    }
                  >
                    ▣
                    <span>
                      Gestionar reservas
                    </span>
                  </button>

                  <button
                    onClick={() =>
                      ir('ventas')
                    }
                  >
                    $
                    <span>
                      Gestionar ventas
                    </span>
                  </button>

                  <button
                    onClick={() =>
                      ir('reportes')
                    }
                  >
                    ↗
                    <span>
                      Reportes
                    </span>
                  </button>

                  <button
                    onClick={() =>
                      ir('chatbot')
                    }
                  >
                    💬
                    <span>
                      Chatbot IA
                    </span>
                  </button>
                </>
              )}

            </div>

          </section>
        )}

      </div>
    </>
  )
}


// ============================================================
// DASHBOARD DE VENTAS
// ============================================================

const DashboardVentas = ({ token, ventas, facturas, cargando }) => {
  const [estadisticas, setEstadisticas] = useState(null)
  const [fechaInicio, setFechaInicio] = useState('')
  const [fechaFin, setFechaFin] = useState('')
  const [filtroEstado, setFiltroEstado] = useState('todos')
  const [filtroProducto, setFiltroProducto] = useState('todos')

  useEffect(() => {
    if (token) {
      api('/ventas/estadisticas', token)
        .then(setEstadisticas)
        .catch(() => {})
    }
  }, [token])

  const productosUnicos = [...new Set(
    ventas.flatMap(v => v.detalles?.map(d => d.nombre_item) || [])
  )]

  const ventasFiltradas = ventas.filter((v) => {
    if (fechaInicio || fechaFin) {
      const fecha = v.creado_en?.slice(0, 10)
      if (fechaInicio && fecha < fechaInicio) return false
      if (fechaFin && fecha > fechaFin) return false
    }
    if (filtroEstado !== 'todos' && v.estado !== filtroEstado) return false
    if (filtroProducto !== 'todos') {
      const tieneProducto = v.detalles?.some(d => d.nombre_item === filtroProducto)
      if (!tieneProducto) return false
    }
    return true
  })

  const totalVentasMes = ventasFiltradas
    .filter((v) => v.estado === 'completada')
    .reduce((acc, v) => acc + (v.total || 0), 0)

  const totalVentasPendientes = ventasFiltradas
    .filter((v) => v.estado === 'pendiente')
    .reduce((acc, v) => acc + (v.total || 0), 0)

  const totalFacturasPendientes = facturas
    .filter((f) => f.estado === 'pendiente')
    .reduce((acc, f) => acc + (f.total || 0), 0)

  const ventasPorEstado = [
    { label: 'Pendientes', valor: ventasFiltradas.filter((v) => v.estado === 'pendiente').length, color: '#f6ad55' },
    { label: 'Completadas', valor: ventasFiltradas.filter((v) => v.estado === 'completada').length, color: '#48bb78' },
    { label: 'Canceladas', valor: ventasFiltradas.filter((v) => v.estado === 'cancelada').length, color: '#fc8181' },
  ]

  const ventasPorDia = (() => {
    const mapa = {}
    ventasFiltradas.forEach((v) => {
      if (v.creado_en) {
        const dia = v.creado_en.slice(0, 10)
        mapa[dia] = (mapa[dia] || 0) + (v.total || 0)
      }
    })
    return Object.entries(mapa)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-7)
      .map(([fecha, total]) => ({
        label: fecha.slice(5),
        valor: Math.round(total),
      }))
  })()

  return (
    <>
      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
        <label style={{ margin: 0 }}>
          Desde
          <input
            type="date"
            value={fechaInicio}
            onChange={(e) => setFechaInicio(e.target.value)}
            style={{ marginLeft: '8px', padding: '6px 10px', borderRadius: '6px', border: '1px solid #e2e8f0' }}
          />
        </label>
        <label style={{ margin: 0 }}>
          Hasta
          <input
            type="date"
            value={fechaFin}
            onChange={(e) => setFechaFin(e.target.value)}
            style={{ marginLeft: '8px', padding: '6px 10px', borderRadius: '6px', border: '1px solid #e2e8f0' }}
          />
        </label>
        <label style={{ margin: 0 }}>
          Estado
          <select
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
            style={{ marginLeft: '8px', padding: '6px 10px', borderRadius: '6px', border: '1px solid #e2e8f0' }}
          >
            <option value="todos">Todos</option>
            <option value="completada">Completadas</option>
            <option value="pendiente">Pendientes</option>
            <option value="cancelada">Canceladas</option>
          </select>
        </label>
        {productosUnicos.length > 0 && (
          <label style={{ margin: 0 }}>
            Producto/Servicio
            <select
              value={filtroProducto}
              onChange={(e) => setFiltroProducto(e.target.value)}
              style={{ marginLeft: '8px', padding: '6px 10px', borderRadius: '6px', border: '1px solid #e2e8f0' }}
            >
              <option value="todos">Todos</option>
              {productosUnicos.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </label>
        )}
        {(fechaInicio || fechaFin || filtroEstado !== 'todos' || filtroProducto !== 'todos') && (
          <button className="secondary-button" onClick={() => { setFechaInicio(''); setFechaFin(''); setFiltroEstado('todos'); setFiltroProducto('todos') }}>
            Limpiar filtros
          </button>
        )}
      </div>

      <div className="stats-grid">
        <StatCard
          icon="$"
          label="Ventas del período"
          value={formatearPrecio(totalVentasMes)}
          detail={`${ventasFiltradas.filter((v) => v.estado === 'completada').length} completadas`}
        />
        <StatCard
          icon="◷"
          label="Pendientes"
          value={formatearPrecio(totalVentasPendientes)}
          detail={`${ventasFiltradas.filter((v) => v.estado === 'pendiente').length} por cobrar`}
        />
        <StatCard
          icon="↗"
          label="Facturas pendientes"
          value={formatearPrecio(totalFacturasPendientes)}
          detail={`${facturas.filter((f) => f.estado === 'pendiente').length} sin pagar`}
        />
        <StatCard
          icon="▣"
          label="Total ventas"
          value={ventasFiltradas.length}
          detail="en el período"
        />
      </div>

      <div className="dashboard-grid-2" style={{ marginBottom: '20px' }}>
        <section className="panel-card">
          <div className="panel-card-head">
            <div>
              <h3>Ingresos por día</h3>
              <p>Últimos 7 días con ventas</p>
            </div>
          </div>
          {cargando ? (
            <SkeletonRows cols={1} />
          ) : (
            <GraficoBarras datos={ventasPorDia} />
          )}
        </section>

        <section className="panel-card">
          <div className="panel-card-head">
            <div>
              <h3>Ventas por estado</h3>
              <p>Distribución actual</p>
            </div>
          </div>
          {cargando ? (
            <SkeletonRows cols={1} />
          ) : (
            <GraficoCircular datos={ventasPorEstado} />
          )}
        </section>
      </div>

      {estadisticas && estadisticas.ventas_por_dia && estadisticas.ventas_por_dia.length > 0 && (
        <section className="panel-card" style={{ marginBottom: '20px' }}>
          <div className="panel-card-head">
            <div>
              <h3>Tendencia de ingresos mensuales</h3>
              <p>Ingresos por día del mes actual</p>
            </div>
          </div>
          <GraficoLineal
            datos={estadisticas.ventas_por_dia.map((d) => ({
              label: d.fecha.slice(5),
              valor: Math.round(d.total),
            }))}
          />
        </section>
      )}
    </>
  )
}


// ============================================================
// GRÁFICO LINEAL
// ============================================================

const GraficoLineal = ({ datos }) => {
  if (!datos || datos.length === 0) return <Empty text="Sin datos para mostrar" />

  const maxValor = Math.max(...datos.map(d => d.valor), 1)
  const alto = 180
  const ancho = 100

  const puntos = datos.map((d, i) => {
    const x = (i / (datos.length - 1 || 1)) * ancho
    const y = alto - (d.valor / maxValor) * (alto - 20)
    return `${x},${y}`
  })

  const polyline = puntos.join(' ')

  const areaPoints = `0,${alto} ${polyline} ${ancho},${alto}`

  return (
    <div style={{ padding: '20px' }}>
      <svg viewBox={`0 0 ${ancho} ${alto}`} style={{ width: '100%', height: '200px' }} preserveAspectRatio="none">
        <defs>
          <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3182ce" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#3182ce" stopOpacity="0.02" />
          </linearGradient>
        </defs>
        <polygon points={areaPoints} fill="url(#areaGrad)" />
        <polyline points={polyline} fill="none" stroke="#3182ce" strokeWidth="1.5" strokeLinejoin="round" />
        {datos.map((d, i) => {
          const x = (i / (datos.length - 1 || 1)) * ancho
          const y = alto - (d.valor / maxValor) * (alto - 20)
          return (
            <g key={i}>
              <circle cx={x} cy={y} r="1.5" fill="#3182ce" />
              <text x={x} y={y - 4} textAnchor="middle" fontSize="3" fill="#4a5568">{d.valor > 0 ? `$${(d.valor / 1000).toFixed(0)}k` : ''}</text>
              <text x={x} y={alto - 2} textAnchor="middle" fontSize="3" fill="#718096">{d.label}</text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}


// ============================================================
// BARRA DE HERRAMIENTAS
// ============================================================

const Toolbar = ({
  busqueda,
  setBusqueda,
  estadoFiltro,
  setEstadoFiltro,
  children,
}) => (
  <div className="table-toolbar">

    <div className="search-box">
      ⌕

      <input
        value={busqueda}
        onChange={(e) =>
          setBusqueda(e.target.value)
        }
        placeholder="Buscar..."
      />
    </div>

    <select
      value={estadoFiltro}
      onChange={(e) =>
        setEstadoFiltro(e.target.value)
      }
    >
      <option value="todos">
        Todos los estados
      </option>

      <option value="activo">
        Activos
      </option>

      <option value="inactivo">
        Inactivos
      </option>

      <option value="pendiente">
        Pendientes
      </option>

      <option value="confirmada">
        Confirmadas
      </option>

      <option value="cancelada">
        Canceladas
      </option>
    </select>

    {children}

  </div>
)


// ============================================================
// TABLA DE RESERVAS
// ============================================================

const TablaReservas = ({
  rol,
  reservas,
  cargando,
  cambiarReserva,
  confirmar,
}) => (
  <section className="panel-card">

    <div className="panel-card-head">

      <div>
        <h3>
          {rol === 'cliente'
            ? 'Historial de reservas'
            : 'Gestión de reservas'}
        </h3>

        <p>
          {rol === 'cliente'
            ? 'Consulta y cancela tus reservas pendientes.'
            : 'Revisa y actualiza el estado de cada reserva.'}
        </p>
      </div>

    </div>

    {cargando ? (
      <SkeletonRows cols={5} />
    ) : (
      <div className="table-wrap">

        <table>

          <thead>
            <tr>
              <th>Cliente</th>
              <th>Reserva</th>
              <th>Viaje</th>
              <th>Personas</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>

          <tbody>

            {reservas.map((reserva) => (
              <tr key={reserva.id}>

                <td>
                  <strong>
                    {reserva.cliente_nombre ||
                      'Tú'}{' '}
                    {reserva.cliente_apellido ||
                      ''}
                  </strong>

                  <small>
                    {reserva.cliente_correo ||
                      ''}
                  </small>
                </td>

                <td>
                  {reserva.nombre_item}

                  <small className="capitalize">
                    {reserva.tipo}
                  </small>
                </td>

                <td>
                  {reserva.fecha_viaje?.slice(
                    0,
                    10
                  )}
                </td>

                <td>
                  {reserva.personas}
                </td>

                <td>
                  <Badge
                    estado={reserva.estado}
                  />
                </td>

                <td>

                  {reserva.estado ===
                    'pendiente' && (

                      rol === 'cliente' ? (

                        <button
                          className="action danger"
                          onClick={() =>
                            confirmar({
                              tipo:
                                'cancelar-reserva',
                              id: reserva.id,
                              titulo:
                                'Cancelar reserva',
                              mensaje:
                                '¿Deseas cancelar esta reserva? Esta acción no se puede deshacer.',
                            })
                          }
                        >
                          Cancelar
                        </button>

                      ) : (

                        <>
                          <button
                            className="action success"
                            onClick={() =>
                              cambiarReserva(
                                reserva.id,
                                'confirmada'
                              )
                            }
                          >
                            Confirmar
                          </button>

                          <button
                            className="action danger"
                            onClick={() =>
                              cambiarReserva(
                                reserva.id,
                                'cancelada'
                              )
                            }
                          >
                            Cancelar
                          </button>
                        </>

                      )
                    )}

                </td>

              </tr>
            ))}

          </tbody>

        </table>

        {!reservas.length && (
          <Empty
            text="No hay reservas para mostrar."
          />
        )}

      </div>
    )}

  </section>
)


// ============================================================
// TABLA DE USUARIOS
// ============================================================

const TablaUsuarios = ({
  usuarios,
  cargando,
  busqueda,
  setBusqueda,
  estadoFiltro,
  setEstadoFiltro,
  abrir,
  confirmar,
}) => {

  const rows = usuarios.filter(
    (usuarioItem) => {

      const texto =
        `${usuarioItem.nombre} ${usuarioItem.apellido} ${usuarioItem.correo}`
          .toLowerCase()

      const coincideBusqueda =
        texto.includes(
          busqueda.toLowerCase()
        )

      const coincideEstado =
        estadoFiltro === 'todos' ||
        usuarioItem.estado ===
        estadoFiltro

      return (
        coincideBusqueda &&
        coincideEstado
      )
    }
  )


  return (
    <section className="panel-card">

      <Toolbar
        busqueda={busqueda}
        setBusqueda={setBusqueda}
        estadoFiltro={estadoFiltro}
        setEstadoFiltro={setEstadoFiltro}
      >
        <button
          className="primary-button"
          onClick={() => abrir(null)}
        >
          + Agregar usuario
        </button>
      </Toolbar>


      <div className="table-wrap">

        {cargando ? (
          <SkeletonRows cols={5} />
        ) : (
          <table>

            <thead>
              <tr>
                <th>Usuario</th>
                <th>Correo</th>
                <th>Rol</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>

            <tbody>

              {rows.map((usuarioItem) => (
                <tr key={usuarioItem.id}>

                  <td>
                    <strong>
                      {usuarioItem.nombre}{' '}
                      {usuarioItem.apellido}
                    </strong>

                    <small>
                      {usuarioItem.telefono}
                    </small>
                  </td>

                  <td>
                    {usuarioItem.correo}
                  </td>

                  <td className="capitalize">
                    {usuarioItem.rol}
                  </td>

                  <td>
                    <Badge
                      estado={
                        usuarioItem.estado
                      }
                    />
                  </td>

                  <td>

                    <button
                      className="action"
                      onClick={() =>
                        abrir(usuarioItem)
                      }
                    >
                      Editar
                    </button>

                    <button
                      className="action"
                      onClick={() =>
                        confirmar({
                          tipo:
                            'usuarios-estado',
                          id: usuarioItem.id,
                          titulo:
                            usuarioItem.estado ===
                              'activo'
                              ? 'Desactivar usuario'
                              : 'Activar usuario',
                          mensaje:
                            `¿Deseas ${usuarioItem.estado ===
                              'activo'
                              ? 'desactivar'
                              : 'activar'
                            } a ${usuarioItem.nombre
                            } ${usuarioItem.apellido
                            }?`,
                        })
                      }
                    >
                      {usuarioItem.estado ===
                        'activo'
                        ? 'Desactivar'
                        : 'Activar'}
                    </button>

                    <button
                      className="action danger"
                      onClick={() =>
                        confirmar({
                          tipo: 'usuarios',
                          id: usuarioItem.id,
                          titulo:
                            'Eliminar usuario',
                          mensaje:
                            `¿Eliminar a ${usuarioItem.nombre
                            } ${usuarioItem.apellido
                            }?`,
                        })
                      }
                    >
                      Eliminar
                    </button>

                  </td>

                </tr>
              ))}

            </tbody>

          </table>
        )}

        {!cargando &&
          !rows.length && (
            <Empty
              text="No hay usuarios que coincidan."
            />
          )}

      </div>

    </section>
  )
}


// ============================================================
// TABLA DE PAQUETES / SERVICIOS
// ============================================================

const TablaItems = ({
  tipo,
  items,
  cargando,
  busqueda,
  setBusqueda,
  estadoFiltro,
  setEstadoFiltro,
  abrir,
  confirmar,
}) => {

  const rows = items.filter(
    (item) => {

      const texto =
        `${item.nombre} ${item.descripcion} ${item.region || ''
          }`.toLowerCase()

      const coincideBusqueda =
        texto.includes(
          busqueda.toLowerCase()
        )

      const coincideEstado =
        estadoFiltro === 'todos' ||
        item.estado === estadoFiltro

      return (
        coincideBusqueda &&
        coincideEstado
      )
    }
  )


  return (
    <section className="panel-card">

      <Toolbar
        busqueda={busqueda}
        setBusqueda={setBusqueda}
        estadoFiltro={estadoFiltro}
        setEstadoFiltro={setEstadoFiltro}
      >
        <button
          className="primary-button"
          onClick={() =>
            abrir(null)
          }
        >
          + Crear{' '}
          {tipo === 'productos'
            ? 'paquete'
            : 'servicio'}
        </button>
      </Toolbar>


      <div className="table-wrap">

        {cargando ? (
          <SkeletonRows cols={5} />
        ) : (
          <table>

            <thead>
              <tr>
                <th>Experiencia</th>
                <th>Región</th>
                <th>Precio</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>

            <tbody>

              {rows.map((item) => {

                const imagen =
                  item.imagen_url

                    ? item.imagen_url.startsWith(
                      '/'
                    )
                      ? `${MEDIA_BASE}${item.imagen_url}`
                      : item.imagen_url

                    : null

                return (
                  <tr key={item.id}>

                    <td>

                      <div className="item-cell">

                        {imagen ? (
                          <img
                            src={imagen}
                            alt=""
                          />
                        ) : (
                          <span className="item-placeholder">
                            ✈
                          </span>
                        )}

                        <div>

                          <strong>
                            {item.nombre}
                          </strong>

                          <small>
                            {item.descripcion}
                          </small>

                        </div>

                      </div>

                    </td>

                    <td>
                      {item.region || '—'}
                    </td>

                    <td>
                      {formatearPrecio(
                        item.precio
                      )}
                    </td>

                    <td>
                      <Badge
                        estado={item.estado}
                      />
                    </td>

                    <td>

                      <button
                        className="action"
                        onClick={() =>
                          abrir(item)
                        }
                      >
                        Editar
                      </button>

                      {item.estado ===
                        'activo' && (
                          <button
                            className="action danger"
                            onClick={() =>
                              confirmar({
                                tipo,
                                id: item.id,
                                titulo:
                                  'Eliminar registro',
                                mensaje:
                                  `¿Eliminar ${item.nombre
                                  }?`,
                              })
                            }
                          >
                            Eliminar
                          </button>
                        )}

                    </td>

                  </tr>
                )
              })}

            </tbody>

          </table>
        )}

        {!cargando &&
          !rows.length && (
            <Empty
              text="No hay registros que coincidan."
            />
          )}

      </div>

    </section>
  )
}


// ============================================================
// MENSAJES
// ============================================================

const TablaMensajes = ({
  mensajes,
  cargando,
  marcarMensaje,
  confirmar,
}) => (
  <section className="panel-card">

    <div className="table-wrap">

      {cargando ? (
        <SkeletonRows cols={4} />
      ) : (
        <table>

          <thead>
            <tr>
              <th>Contacto</th>
              <th>Mensaje</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>

          <tbody>

            {mensajes.map((mensaje) => (
              <tr key={mensaje.id}>

                <td>
                  <strong>
                    {mensaje.nombre}
                  </strong>

                  <small>
                    {mensaje.correo}
                  </small>
                </td>

                <td className="message-cell">
                  {mensaje.mensaje}
                </td>

                <td>
                  {mensaje.leido ? (
                    <Badge estado="activo" />
                  ) : (
                    <span className="status-badge badge-warning">
                      nuevo
                    </span>
                  )}
                </td>

                <td>

                  {!mensaje.leido && (
                    <button
                      className="action success"
                      onClick={() =>
                        marcarMensaje(
                          mensaje.id
                        )
                      }
                    >
                      Marcar leído
                    </button>
                  )}

                  <button
                    className="action danger"
                    onClick={() =>
                      confirmar({
                        tipo: 'contacto',
                        id: mensaje.id,
                        titulo:
                          'Eliminar mensaje',
                        mensaje:
                          '¿Deseas eliminar este mensaje?',
                      })
                    }
                  >
                    Eliminar
                  </button>

                </td>

              </tr>
            ))}

          </tbody>

        </table>
      )}

      {!cargando &&
        !mensajes.length && (
          <Empty
            text="No hay mensajes."
          />
        )}

    </div>

  </section>
)


// ============================================================
// PERFIL
// ============================================================

const Perfil = ({ usuario }) => (
  <section className="panel-card profile-card">

    <div className="profile-hero">

      <div className="profile-avatar">
        {usuario?.nombre?.charAt(0)}
      </div>

      <div>

        <span className="dashboard-kicker">
          Cuenta personal
        </span>

        <h3>
          {usuario?.nombre}{' '}
          {usuario?.apellido}
        </h3>

        <p>
          {usuario?.correo}
        </p>

      </div>

    </div>


    <div className="profile-grid">

      <div>
        <span>Correo</span>
        <strong>
          {usuario?.correo}
        </strong>
      </div>

      <div>
        <span>Teléfono</span>
        <strong>
          {usuario?.telefono}
        </strong>
      </div>

      <div>
        <span>Dirección</span>
        <strong>
          {usuario?.direccion}
        </strong>
      </div>

      <div>
        <span>Estado</span>
        <Badge
          estado={
            usuario?.estado || 'activo'
          }
        />
      </div>

    </div>

  </section>
)


// ============================================================
// REPORTES
// ============================================================

const Reportes = ({ reservas, ventas, facturas, token }) => {
  const [fechaInicio, setFechaInicio] = useState('')
  const [fechaFin, setFechaFin] = useState('')
  const [reporteDiario, setReporteDiario] = useState(null)
  const [descargando, setDescargando] = useState(null)
  const { mostrarToast } = useToast()

  const hoy = new Date().toISOString().slice(0, 10)

  const reservasConfirmadas = reservas.filter((r) => r.estado === 'confirmada')
  const totalReservas = reservasConfirmadas.reduce((acc, r) => acc + Number(r.precio_item || 0) * Number(r.personas || 1), 0)
  const totalVentas = ventas.reduce((acc, v) => acc + (v.total || 0), 0)
  const totalFacturas = facturas?.length || 0
  const ingresosFacturados = facturas?.reduce((acc, f) => acc + (f.total || 0), 0) || 0

  const cargarReporteDiario = async (fecha) => {
    try {
      const params = fecha ? `?fecha=${fecha}` : ''
      const data = await api(`/ventas/reporte-diario${params}`, token)
      setReporteDiario(data)
    } catch (error) {
      console.error(error)
    }
  }

  useEffect(() => {
    if (token) cargarReporteDiario(fechaInicio || undefined)
  }, [token, fechaInicio])

  const handleDescargar = async (path, nombreArchivo, tipo) => {
    setDescargando(tipo)
    try {
      await descargarArchivo(path, token, nombreArchivo)
      mostrarToast('Archivo descargado correctamente')
    } catch (error) {
      mostrarToast(error.message, 'error')
    } finally {
      setDescargando(null)
    }
  }

  const DownloadButton = ({ onClick, tipo, label, color, icon, disabled }) => {
    const isLoading = descargando === tipo
    return (
      <button
        onClick={onClick}
        disabled={descargando !== null}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '12px 20px',
          borderRadius: '10px',
          border: 'none',
          background: isLoading ? '#94a3b8' : color,
          color: 'white',
          fontWeight: '600',
          fontSize: '13px',
          cursor: isLoading ? 'wait' : 'pointer',
          opacity: descargando !== null && !isLoading ? 0.5 : 1,
          transition: 'all 0.2s',
          flex: '1',
          minWidth: '140px',
          justifyContent: 'center',
        }}
      >
        <span style={{ fontSize: '16px' }}>{isLoading ? '⟳' : icon}</span>
        {isLoading ? 'Descargando...' : label}
      </button>
    )
  }

  const statCardStyle = {
    padding: '16px 20px',
    borderRadius: '12px',
    background: 'white',
    border: '1px solid #e5e7eb',
    textAlign: 'center',
  }

  const statValueStyle = { fontSize: '24px', fontWeight: '700', color: '#1a5c59' }
  const statLabelStyle = { fontSize: '11px', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }

  return (
    <section className="panel-card" style={{ padding: 0, overflow: 'hidden' }}>

      {/* Header */}
      <div style={{ padding: '20px 24px', background: 'linear-gradient(135deg, #073f3d 0%, #1a5c59 100%)', color: 'white' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
          <span style={{ fontSize: '24px' }}>📊</span>
          <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '700' }}>Centro de Reportes</h2>
        </div>
        <p style={{ margin: '4px 0 0', fontSize: '13px', opacity: 0.85 }}>
          Consulta, genera y descarga reportes financieros y operativos de Horizonte Viajes
        </p>
      </div>

      {/* KPIs generales */}
      <div style={{ padding: '20px 24px', borderBottom: '1px solid #f1f5f9' }}>
        <h3 style={{ margin: '0 0 16px', fontSize: '14px', fontWeight: '700', color: '#374151', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Resumen General
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px' }}>
          <div style={statCardStyle}>
            <div style={statLabelStyle}>Reservas confirmadas</div>
            <div style={statValueStyle}>{reservasConfirmadas.length}</div>
          </div>
          <div style={statCardStyle}>
            <div style={statLabelStyle}>Valor reservas</div>
            <div style={{...statValueStyle, color: '#059669'}}>{formatearPrecio(totalReservas)}</div>
          </div>
          <div style={statCardStyle}>
            <div style={statLabelStyle}>Total ventas</div>
            <div style={statValueStyle}>{ventas.length}</div>
          </div>
          <div style={statCardStyle}>
            <div style={statLabelStyle}>Ingresos por ventas</div>
            <div style={{...statValueStyle, color: '#059669'}}>{formatearPrecio(totalVentas)}</div>
          </div>
          <div style={statCardStyle}>
            <div style={statLabelStyle}>Facturas emitidas</div>
            <div style={statValueStyle}>{totalFacturas}</div>
          </div>
          <div style={statCardStyle}>
            <div style={statLabelStyle}>Ingresos facturados</div>
            <div style={{...statValueStyle, color: '#059669'}}>{formatearPrecio(ingresosFacturados)}</div>
          </div>
        </div>
      </div>

      {/* Filtros y resumen diario */}
      <div style={{ padding: '20px 24px', borderBottom: '1px solid #f1f5f9' }}>
        <h3 style={{ margin: '0 0 16px', fontSize: '14px', fontWeight: '700', color: '#374151', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Consulta por Fecha
        </h3>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap', marginBottom: reporteDiario ? '16px' : '0' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ margin: 0, fontSize: '12px', fontWeight: '600', color: '#6b7280' }}>Desde</label>
            <input
              type="date"
              value={fechaInicio}
              onChange={(e) => setFechaInicio(e.target.value)}
              max={hoy}
              style={{
                padding: '10px 14px',
                borderRadius: '8px',
                border: '1px solid #e5e7eb',
                fontSize: '14px',
                outline: 'none',
              }}
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ margin: 0, fontSize: '12px', fontWeight: '600', color: '#6b7280' }}>Hasta</label>
            <input
              type="date"
              value={fechaFin}
              onChange={(e) => setFechaFin(e.target.value)}
              max={hoy}
              style={{
                padding: '10px 14px',
                borderRadius: '8px',
                border: '1px solid #e5e7eb',
                fontSize: '14px',
                outline: 'none',
              }}
            />
          </div>
          {(fechaInicio || fechaFin) && (
            <button
              onClick={() => { setFechaInicio(''); setFechaFin(''); setReporteDiario(null) }}
              style={{
                padding: '10px 16px',
                borderRadius: '8px',
                border: '1px solid #e5e7eb',
                background: 'white',
                color: '#374151',
                fontWeight: '600',
                fontSize: '13px',
                cursor: 'pointer',
                marginTop: '16px',
              }}
            >
              Limpiar filtros
            </button>
          )}
        </div>

        {reporteDiario && (
          <div style={{
            padding: '16px 20px',
            background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
            borderRadius: '12px',
            border: '1px solid #86efac',
          }}>
            <div style={{ fontSize: '13px', fontWeight: '600', color: '#166534', marginBottom: '12px' }}>
              Reporte del día: {reporteDiario.fecha}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '16px' }}>
              {[
                { label: 'Total ventas', value: reporteDiario.total_ventas },
                { label: 'Ingresos', value: formatearPrecio(reporteDiario.total_ingresos) },
                { label: 'Impuestos', value: formatearPrecio(reporteDiario.total_impuestos) },
                { label: 'Descuentos', value: `-${formatearPrecio(reporteDiario.total_descuentos)}` },
              ].map((item) => (
                <div key={item.label} style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '20px', fontWeight: '700', color: '#166534' }}>{item.value}</div>
                  <div style={{ fontSize: '11px', color: '#166534', opacity: 0.7, textTransform: 'uppercase' }}>{item.label}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Reportes de Ventas */}
      <div style={{ padding: '20px 24px', borderBottom: '1px solid #f1f5f9' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '18px', fontWeight: '700' }}>$</div>
          <div>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: '#1a5c59' }}>Reporte de Ventas</h3>
            <p style={{ margin: 0, fontSize: '12px', color: '#6b7280' }}>Resumen de todas las ventas realizadas en el sistema</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <DownloadButton
            onClick={() => {
              const params = fechaInicio ? `?fecha=${fechaInicio}` : ''
              const fecha = fechaInicio || hoy
              handleDescargar(`/reportes/ventas/pdf${params}`, `reporte_ventas_${fecha}.pdf`, 'pdf-ventas')
            }}
            tipo="pdf-ventas"
            label="Descargar PDF"
            color="#dc2626"
            icon="📄"
          />
          <DownloadButton
            onClick={() => {
              const params = fechaInicio ? `?fecha=${fechaInicio}` : ''
              const fecha = fechaInicio || hoy
              handleDescargar(`/reportes/ventas/excel${params}`, `reporte_ventas_${fecha}.xlsx`, 'excel-ventas')
            }}
            tipo="excel-ventas"
            label="Descargar Excel"
            color="#16a34a"
            icon="📊"
          />
        </div>
      </div>

      {/* Reportes de Facturas */}
      <div style={{ padding: '20px 24px', borderBottom: '1px solid #f1f5f9' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg, #073f3d 0%, #1a5c59 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '18px', fontWeight: '700' }}>↗</div>
          <div>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: '#1a5c59' }}>Reporte de Facturas</h3>
            <p style={{ margin: 0, fontSize: '12px', color: '#6b7280' }}>Todas las facturas emitidas con desglose de impuestos</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <DownloadButton
            onClick={() => handleDescargar('/reportes/facturas/pdf', 'reporte_facturas.pdf', 'pdf-facturas')}
            tipo="pdf-facturas"
            label="Descargar PDF"
            color="#dc2626"
            icon="📄"
          />
          <DownloadButton
            onClick={() => handleDescargar('/reportes/facturas/excel', 'reporte_facturas.xlsx', 'excel-facturas')}
            tipo="excel-facturas"
            label="Descargar Excel"
            color="#16a34a"
            icon="📊"
          />
        </div>
      </div>

      {/* Reporte de Flujo de Caja */}
      <div style={{ padding: '20px 24px', borderBottom: '1px solid #f1f5f9' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg, #d97706 0%, #f59e0b 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '18px', fontWeight: '700' }}>💰</div>
          <div>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: '#1a5c59' }}>Flujo de Caja</h3>
            <p style={{ margin: 0, fontSize: '12px', color: '#6b7280' }}>Ingresos, egresos y balance del período seleccionado</p>
          </div>
        </div>
        <div style={{
          padding: '16px 20px',
          background: '#fffbeb',
          borderRadius: '10px',
          border: '1px solid #fde68a',
          marginBottom: '12px',
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '18px', fontWeight: '700', color: '#059669' }}>{formatearPrecio(totalVentas)}</div>
              <div style={{ fontSize: '11px', color: '#92400e', textTransform: 'uppercase' }}>Ingresos totales</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '18px', fontWeight: '700', color: '#dc2626' }}>-{formatearPrecio(0)}</div>
              <div style={{ fontSize: '11px', color: '#92400e', textTransform: 'uppercase' }}>Egresos</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '18px', fontWeight: '700', color: '#1a5c59' }}>{formatearPrecio(totalVentas)}</div>
              <div style={{ fontSize: '11px', color: '#92400e', textTransform: 'uppercase' }}>Balance neto</div>
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <DownloadButton
            onClick={() => {
              const params = fechaInicio ? `?fecha=${fechaInicio}` : ''
              const fecha = fechaInicio || hoy
              handleDescargar(`/reportes/ventas/pdf${params}`, `flujo_caja_${fecha}.pdf`, 'pdf-flujo')
            }}
            tipo="pdf-flujo"
            label="Descargar PDF"
            color="#dc2626"
            icon="📄"
          />
          <DownloadButton
            onClick={() => {
              const params = fechaInicio ? `?fecha=${fechaInicio}` : ''
              const fecha = fechaInicio || hoy
              handleDescargar(`/reportes/ventas/excel${params}`, `flujo_caja_${fecha}.xlsx`, 'excel-flujo')
            }}
            tipo="excel-flujo"
            label="Descargar Excel"
            color="#16a34a"
            icon="📊"
          />
        </div>
      </div>

      {/* Footer info */}
      <div style={{ padding: '16px 24px', background: '#f8fafc', textAlign: 'center' }}>
        <p style={{ margin: 0, fontSize: '12px', color: '#94a3b8' }}>
          Los reportes se generan con los datos actuales del sistema. Para reportes por rango de fechas, utilice los filtros superiores.
        </p>
      </div>
    </section>
  )
}


// ============================================================
// MODAL DE USUARIOS (Con Validación en Tiempo Real)
// ============================================================

const UserModal = ({
  item,
  token,
  onClose,
  onSaved,
  mostrarToast,
}) => {

  const [form, setForm] =
    useState(
      item
        ? {
          nombre: item.nombre || '',
          apellido: item.apellido || '',
          tipoDocumento: item.tipo_documento || 'CC',
          numeroDocumento: item.numero_documento || '',
          direccion: item.direccion || '',
          telefono: item.telefono || '',
          correo: item.correo || '',
          contrasena: '',
          confirmarContrasena: '',
          rolId: item.rol === 'administrador' ? '1' : item.rol === 'empleado' ? '2' : '3',
        }
        : {
          nombre: '',
          apellido: '',
          tipoDocumento: 'CC',
          numeroDocumento: '',
          direccion: '',
          telefono: '',
          correo: '',
          contrasena: '',
          confirmarContrasena: '',
          rolId: '3',
        }
    )

  const [errores, setErrores] = useState({})
  const [guardando, setGuardando] = useState(false)

  // Validar en tiempo real cada campo
  const validarCampo = (campo, valor) => {
    let mensajeError = ''

    if (campo === 'nombre') {
      if (!valor.trim()) mensajeError = 'El nombre es obligatorio.'
      else if (valor.trim().length < 2 || valor.trim().length > 30) mensajeError = 'Debe tener entre 2 y 30 caracteres.'
      else if (!/^[a-zA-ZÁÉÍÓÚáéíóúñÑ\s]+$/.test(valor)) mensajeError = 'Solo se permiten letras.'
    }
    if (campo === 'apellido') {
      if (!valor.trim()) mensajeError = 'El apellido es obligatorio.'
      else if (valor.trim().length < 2 || valor.trim().length > 30) mensajeError = 'Debe tener entre 2 y 30 caracteres.'
      else if (!/^[a-zA-ZÁÉÍÓÚáéíóúñÑ\s]+$/.test(valor)) mensajeError = 'Solo se permiten letras.'
    }
    if (campo === 'numeroDocumento') {
      if (!valor.trim()) mensajeError = 'El documento es obligatorio.'
      else if (!/^\d{6,10}$/.test(valor)) mensajeError = 'Debe contener entre 6 y 10 dígitos numéricos.'
    }
    if (campo === 'telefono') {
      if (!valor.trim()) mensajeError = 'El teléfono es obligatorio.'
      else if (!/^\d{7,10}$/.test(valor)) mensajeError = 'Debe tener entre 7 y 10 dígitos numéricos.'
    }
    if (campo === 'correo') {
      if (!valor.trim()) mensajeError = 'El correo es obligatorio.'
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor)) mensajeError = 'Correo electrónico inválido.'
    }
    if (campo === 'contrasena') {
      if (!item && !valor) mensajeError = 'La contraseña es obligatoria.'
      else if (valor && valor.length < 6) mensajeError = 'La contraseña debe tener al menos 6 caracteres.'
      if (form.confirmarContrasena && valor !== form.confirmarContrasena) {
        setErrores((prev) => ({ ...prev, confirmarContrasena: 'Las contraseñas no coinciden' }))
      } else if (form.confirmarContrasena && valor === form.confirmarContrasena) {
        setErrores((prev) => ({ ...prev, confirmarContrasena: '' }))
      }
    }
    if (campo === 'confirmarContrasena') {
      if (valor && valor !== form.contrasena) mensajeError = 'Las contraseñas no coinciden'
    }
    if (campo === 'direccion') {
      if (!valor.trim()) mensajeError = 'La dirección es obligatoria.'
      else if (valor.trim().length > 60) mensajeError = 'Máximo 60 caracteres.'
    }

    setErrores((prev) => ({ ...prev, [campo]: mensajeError }))
  }

  const handleChange = (campo, valor) => {
    setForm((prev) => ({ ...prev, [campo]: valor }))
    validarCampo(campo, valor)
  }

  const formEsValido = () => {
    const nuevosErrores = {}
    if (!form.nombre.trim()) nuevosErrores.nombre = 'Obligatorio'
    if (!form.apellido.trim()) nuevosErrores.apellido = 'Obligatorio'
    if (!form.numeroDocumento.trim()) nuevosErrores.numeroDocumento = 'Obligatorio'
    if (!form.telefono.trim()) nuevosErrores.telefono = 'Obligatorio'
    if (!form.correo.trim()) nuevosErrores.correo = 'Obligatorio'
    if (!item && !form.contrasena) nuevosErrores.contrasena = 'Obligatorio'
    if (!item && form.contrasena !== form.confirmarContrasena) nuevosErrores.confirmarContrasena = 'Las contraseñas no coinciden'
    if (!form.direccion.trim()) nuevosErrores.direccion = 'Obligatorio'

    const hayErroresTexto = Object.values(errores).some((err) => err !== '')
    return Object.keys(nuevosErrores).length === 0 && !hayErroresTexto
  }

  const submit = async (e) => {
    e.preventDefault()
    if (!formEsValido()) {
      mostrarToast('Por favor, corrige los errores del formulario.', 'error')
      return
    }

    setGuardando(true)

    try {
      const body = {
        ...form,
        rolId: Number(form.rolId),
      }

      if (item && !body.contrasena) {
        delete body.contrasena
      }

      await api(
        item ? `/usuarios/${item.id}` : '/usuarios',
        token,
        {
          method: item ? 'PUT' : 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(body),
        }
      )

      mostrarToast(
        item ? 'Usuario actualizado correctamente' : 'Usuario creado correctamente'
      )
      onSaved()
    } catch (error) {
      mostrarToast(error.message, 'error')
    } finally {
      setGuardando(false)
    }
  }


  return (
    <div className="modal-backdrop">
      <form className="modal-card" onSubmit={submit}>
        <div className="modal-head">
          <div>
            <span className="dashboard-kicker">Gestión de usuarios</span>
            <h3>{item ? 'Editar usuario' : 'Agregar usuario'}</h3>
          </div>
          <button type="button" className="close-button" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="form-grid">
          <label>
            Nombre
            <input
              required
              maxLength="30"
              value={form.nombre}
              onChange={(e) => handleChange('nombre', e.target.value)}
              placeholder="Ej. Carlos"
            />
            {errores.nombre && <small className="error-text" style={{ color: '#e53e3e' }}>{errores.nombre}</small>}
          </label>

          <label>
            Apellido
            <input
              required
              maxLength="30"
              value={form.apellido}
              onChange={(e) => handleChange('apellido', e.target.value)}
              placeholder="Ej. Gómez"
            />
            {errores.apellido && <small className="error-text" style={{ color: '#e53e3e' }}>{errores.apellido}</small>}
          </label>

          <label>
            Tipo documento
            <select
              value={form.tipoDocumento}
              onChange={(e) => handleChange('tipoDocumento', e.target.value)}
            >
              <option value="CC">CC</option>
              <option value="TI">TI</option>
              <option value="CE">CE</option>
            </select>
          </label>

          <label>
            Número documento
            <input
              required
              maxLength="10"
              value={form.numeroDocumento}
              onChange={(e) => handleChange('numeroDocumento', e.target.value)}
              placeholder="Solo números"
            />
            {errores.numeroDocumento && <small className="error-text" style={{ color: '#e53e3e' }}>{errores.numeroDocumento}</small>}
          </label>

          <label>
            Dirección
            <input
              required
              maxLength="60"
              value={form.direccion}
              onChange={(e) => handleChange('direccion', e.target.value)}
              placeholder="Ej. Calle 123 # 45-67"
            />
            {errores.direccion && <small className="error-text" style={{ color: '#e53e3e' }}>{errores.direccion}</small>}
          </label>

          <label>
            Teléfono
            <input
              required
              maxLength="10"
              value={form.telefono}
              onChange={(e) => handleChange('telefono', e.target.value)}
              placeholder="Ej. 3001234567"
            />
            {errores.telefono && <small className="error-text" style={{ color: '#e53e3e' }}>{errores.telefono}</small>}
          </label>

          <label>
            Correo
            <input
              required
              type="email"
              maxLength="50"
              value={form.correo}
              onChange={(e) => handleChange('correo', e.target.value)}
              placeholder="correo@ejemplo.com"
            />
            {errores.correo && <small className="error-text" style={{ color: '#e53e3e' }}>{errores.correo}</small>}
          </label>

          <label>
            Rol
            <select
              value={form.rolId}
              onChange={(e) => handleChange('rolId', e.target.value)}
            >
              <option value="1">Administrador</option>
              <option value="2">Empleado</option>
              <option value="3">Cliente</option>
            </select>
          </label>

          <label className="full">
            Contraseña
            {item && <small> Déjala vacía para conservar la actual.</small>}
            <input
              type="password"
              required={!item}
              value={form.contrasena}
              onChange={(e) => handleChange('contrasena', e.target.value)}
              placeholder="Mínimo 6 caracteres"
            />
            {errores.contrasena && <small className="error-text" style={{ color: '#e53e3e' }}>{errores.contrasena}</small>}
          </label>

          <label className="full">
            Confirmar contraseña
            <input
              type="password"
              required={!item && !!form.contrasena}
              value={form.confirmarContrasena}
              onChange={(e) => handleChange('confirmarContrasena', e.target.value)}
              placeholder="Repite la contraseña"
            />
            {errores.confirmarContrasena && <small className="error-text" style={{ color: '#e53e3e' }}>{errores.confirmarContrasena}</small>}
          </label>
        </div>

        <div className="modal-actions">
          <button type="button" className="secondary-button" onClick={onClose}>
            Cancelar
          </button>
          <button className="primary-button" disabled={guardando}>
            {guardando ? 'Guardando...' : 'Guardar usuario'}
          </button>
        </div>
      </form>
    </div>
  )
}


// ============================================================
// MODAL DE PAQUETES Y SERVICIOS (Con Validación en Tiempo Real)
// ============================================================

const ItemModal = ({
  tipo,
  item,
  token,
  onClose,
  onSaved,
  mostrarToast,
}) => {

  const [form, setForm] = useState(item || emptyItem)
  const [archivo, setArchivo] = useState(null)
  const [preview, setPreview] = useState(item?.imagen_url || '')
  const [guardando, setGuardando] = useState(false)
  const [errores, setErrores] = useState({})

  const endpoint = tipo
  const esNuevo = !item

  // Validación reactiva en tiempo real para Paquetes y Servicios
  const validarCampo = (campo, valor) => {
    let mensajeError = ''

    if (campo === 'nombre') {
      if (!String(valor).trim()) mensajeError = 'El nombre es obligatorio.'
      else if (String(valor).length > 80) mensajeError = 'Máximo 80 caracteres.'
    }
    if (campo === 'precio') {
      if (valor === '' || valor === null) mensajeError = 'El precio es obligatorio.'
      else if (Number(valor) < 0) mensajeError = 'El precio no puede ser negativo.'
      else if (Number(valor) > 999999999) mensajeError = 'Precio demasiado alto.'
    }
    if (campo === 'descripcion') {
      if (String(valor).length > 255) mensajeError = 'Máximo 255 caracteres.'
    }
    if (campo === 'duracion' && tipo === 'productos') {
      if (String(valor).length > 60) mensajeError = 'Máximo 60 caracteres.'
    }
    if (campo === 'tipo_experiencia' && tipo === 'productos') {
      if (String(valor).length > 80) mensajeError = 'Máximo 80 caracteres.'
    }
    if (campo === 'descripcion_detallada' && tipo === 'productos') {
      if (String(valor).length > 1200) mensajeError = 'Máximo 1200 caracteres.'
    }
    if (campo === 'que_puedes_esperar' && tipo === 'productos') {
      if (String(valor).length > 1200) mensajeError = 'Máximo 1200 caracteres.'
    }

    setErrores((prev) => ({ ...prev, [campo]: mensajeError }))
  }

  const cambiar = (campo, valor) => {
    setForm((anterior) => ({
      ...anterior,
      [campo]: valor,
    }))
    validarCampo(campo, valor)
  }

  const subir = async (archivoImagen) => {
    if (!archivoImagen) {
      throw new Error('No se seleccionó ninguna imagen.')
    }

    const tiposPermitidos = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
    const extensionesPermitidas = ['.jpg', '.jpeg', '.png', '.webp', '.gif']
    const nombreArchivo = archivoImagen.name.toLowerCase()
    const extension = nombreArchivo.includes('.') ? nombreArchivo.substring(nombreArchivo.lastIndexOf('.')) : ''

    if (!tiposPermitidos.includes(archivoImagen.type) && !extensionesPermitidas.includes(extension)) {
      throw new Error('Formato no permitido. Usa JPG, JPEG, PNG, WEBP o GIF.')
    }

    if (archivoImagen.size > 5 * 1024 * 1024) {
      throw new Error('La imagen no puede superar los 5 MB.')
    }

    const data = new FormData()
    data.append('file', archivoImagen)

    const respuesta = await fetch(`${API_URL}/uploads/imagen`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: data,
    })

    const datos = await respuesta.json().catch(() => ({}))

    if (!respuesta.ok) {
      throw new Error(datos.mensaje || datos.detail || 'No se pudo subir la imagen.')
    }

    if (!datos.url) {
      throw new Error('El servidor no devolvió la URL de la imagen.')
    }

    return datos.url
  }

  const seleccionarImagen = (e) => {
    const archivoSeleccionado = e.target.files?.[0]
    if (!archivoSeleccionado) return

    if (archivoSeleccionado.size > 5 * 1024 * 1024) {
      mostrarToast('La imagen no puede superar los 5 MB.', 'error')
      e.target.value = ''
      return
    }

    setArchivo(archivoSeleccionado)
    setPreview(URL.createObjectURL(archivoSeleccionado))
  }

  const submit = async (e) => {
    e.preventDefault()

    if (!form.nombre || form.precio === '') {
      mostrarToast('Completa los campos obligatorios.', 'error')
      return
    }

    setGuardando(true)

    try {
      let imagen = form.imagen_url || ''

      if (archivo) {
        imagen = await subir(archivo)
      }

      const body = {
        ...form,
        precio: Number(form.precio),
        imagen_url: imagen,
        region: form.region || 'Colombia',
      }

      await api(
        esNuevo ? `/${endpoint}` : `/${endpoint}/${item.id}`,
        token,
        {
          method: esNuevo ? 'POST' : 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(body),
        }
      )

      mostrarToast(
        esNuevo ? 'Creado correctamente' : 'Actualizado correctamente'
      )
      onSaved()
    } catch (error) {
      mostrarToast(error.message || 'No se pudo guardar el registro.', 'error')
    } finally {
      setGuardando(false)
    }
  }


  return (
    <div className="modal-backdrop">
      <form className="modal-card" onSubmit={submit}>
        <div className="modal-head">
          <div>
            <span className="dashboard-kicker">
              {tipo === 'productos' ? 'Paquete turístico' : 'Servicio'}
            </span>
            <h3>
              {esNuevo ? 'Crear' : 'Editar'}{' '}
              {tipo === 'productos' ? 'paquete' : 'servicio'}
            </h3>
          </div>
          <button type="button" className="close-button" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="form-grid">
          {/* NOMBRE */}
          <label>
            Nombre
            <input
              required
              maxLength="80"
              value={form.nombre || ''}
              onChange={(e) => cambiar('nombre', e.target.value)}
              placeholder="Ej. Viaje a Cartagena"
            />
            {errores.nombre && <small className="error-text" style={{ color: '#e53e3e' }}>{errores.nombre}</small>}
          </label>

          {/* PRECIO */}
          <label>
            Precio por persona
            <input
              required
              type="number"
              min="0"
              step="0.01"
              value={form.precio ?? ''}
              onChange={(e) => cambiar('precio', e.target.value)}
              placeholder="0"
            />
            {errores.precio && <small className="error-text" style={{ color: '#e53e3e' }}>{errores.precio}</small>}
          </label>

          {/* DESCRIPCIÓN CORTA */}
          <label className="full">
            Descripción corta
            <textarea
              maxLength="255"
              rows="3"
              value={form.descripcion || ''}
              onChange={(e) => cambiar('descripcion', e.target.value)}
              placeholder="Texto que aparecerá en las tarjetas de paquetes..."
            />
            {errores.descripcion && <small className="error-text" style={{ color: '#e53e3e' }}>{errores.descripcion}</small>}
          </label>

          {/* CAMPOS EXCLUSIVOS DE PAQUETES */}
          {tipo === 'productos' && (
            <>
              {/* DURACIÓN */}
              <label>
                Duración
                <input
                  maxLength="60"
                  value={form.duracion || ''}
                  onChange={(e) => cambiar('duracion', e.target.value)}
                  placeholder="Ej. 3 noches · 4 días"
                />
                {errores.duracion && <small className="error-text" style={{ color: '#e53e3e' }}>{errores.duracion}</small>}
              </label>

              {/* TIPO DE EXPERIENCIA */}
              <label>
                Tipo de experiencia
                <input
                  maxLength="80"
                  value={form.tipo_experiencia || ''}
                  onChange={(e) => cambiar('tipo_experiencia', e.target.value)}
                  placeholder="Ej. Descanso frente al mar"
                />
                {errores.tipo_experiencia && <small className="error-text" style={{ color: '#e53e3e' }}>{errores.tipo_experiencia}</small>}
              </label>

              {/* DESCRIPCIÓN DETALLADA */}
              <label className="full">
                Descripción detallada
                <textarea
                  maxLength="1200"
                  rows="5"
                  value={form.descripcion_detallada || ''}
                  onChange={(e) => cambiar('descripcion_detallada', e.target.value)}
                  placeholder="Explica con más detalle qué vivirá el cliente..."
                />
                {errores.descripcion_detallada && <small className="error-text" style={{ color: '#e53e3e' }}>{errores.descripcion_detallada}</small>}
              </label>

              {/* QUÉ PUEDES ESPERAR */}
              <label className="full">
                ¿Qué puedes esperar?
                <textarea
                  maxLength="1200"
                  rows="5"
                  value={form.que_puedes_esperar || ''}
                  onChange={(e) => cambiar('que_puedes_esperar', e.target.value)}
                  placeholder="Escribe un punto por línea..."
                />
                {errores.que_puedes_esperar && <small className="error-text" style={{ color: '#e53e3e' }}>{errores.que_puedes_esperar}</small>}
              </label>

              {/* REGIÓN */}
              <label>
                Región
                <select
                  value={form.region || 'Colombia'}
                  onChange={(e) => cambiar('region', e.target.value)}
                >
                  {REGIONES.map((region) => (
                    <option key={region} value={region}>
                      {region}
                    </option>
                  ))}
                </select>
              </label>
            </>
          )}

          {/* ESTADO */}
          <label>
            Estado
            <select
              value={form.estado || 'activo'}
              onChange={(e) => cambiar('estado', e.target.value)}
            >
              <option value="activo">Activo</option>
              <option value="inactivo">Inactivo</option>
            </select>
          </label>

          {/* IMAGEN */}
          <div className="full upload-box">
            <div>
              <strong>
                Imagen del {tipo === 'productos' ? 'paquete' : 'servicio'}
              </strong>
              <small>
                Selecciona una imagen directamente desde tu PC. JPG, PNG, WEBP o GIF · máximo 5 MB.
              </small>
            </div>

            <input
              id={`imagen-file-${tipo}`}
              type="file"
              accept=".jpg,.jpeg,.png,.webp,.gif"
              onChange={seleccionarImagen}
            />

            <label htmlFor={`imagen-file-${tipo}`} className="upload-button">
              ＋ Elegir imagen desde mi PC
            </label>

            {preview && (
              <div className="upload-preview">
                <img
                  src={preview.startsWith('/') ? `${MEDIA_BASE}${preview}` : preview}
                  alt="Vista previa"
                />
                <span>Vista previa</span>
              </div>
            )}

            <label>
              URL alternativa
              <input
                value={form.imagen_url || ''}
                onChange={(e) => {
                  cambiar('imagen_url', e.target.value)
                  if (!archivo) setPreview(e.target.value)
                }}
                placeholder="Opcional si no quieres subir un archivo"
              />
            </label>
          </div>
        </div>

        <div className="modal-actions">
          <button
            type="button"
            className="secondary-button"
            onClick={onClose}
            disabled={guardando}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="primary-button"
            disabled={guardando}
          >
            {guardando ? 'Guardando...' : esNuevo ? 'Crear' : 'Guardar cambios'}
          </button>
        </div>
      </form>
    </div>
  )
}


// ============================================================
// TABLA DE VENTAS (solo lectura — se crean automáticamente al confirmar reservas)
// ============================================================

const TablaVentas = ({
  rol,
  ventas,
  cargando,
  busqueda,
  setBusqueda,
  estadoFiltro,
  setEstadoFiltro,
  cargar,
  mostrarToast,
  token,
}) => {
  const [ventaDetalle, setVentaDetalle] = useState(null)

  const rows = ventas.filter((venta) => {
    const texto = `${venta.cliente_nombre || ''} ${venta.cliente_documento || ''} ${venta.cliente_correo || ''}`.toLowerCase()
    const coincideBusqueda = texto.includes(busqueda.toLowerCase())
    const coincideEstado = estadoFiltro === 'todos' || venta.estado === estadoFiltro
    return coincideBusqueda && coincideEstado
  })

  return (
    <section className="panel-card">
      <div style={{ padding: '16px 20px', background: '#f0fdf4', borderRadius: '12px', marginBottom: '16px', border: '1px solid #86efac' }}>
        <p style={{ margin: 0, fontSize: '0.9em', color: '#166534' }}>
          <strong>Ventas generadas automáticamente.</strong> Cuando un cliente confirma una reserva, se crea la venta y el detalle aquí.
        </p>
      </div>

      <Toolbar
        busqueda={busqueda}
        setBusqueda={setBusqueda}
        estadoFiltro={estadoFiltro}
        setEstadoFiltro={setEstadoFiltro}
      />

      <div className="table-wrap">
        {cargando ? (
          <SkeletonRows cols={5} />
        ) : (
          <table>
            <thead>
              <tr>
                <th>N° Venta</th>
                <th>Cliente</th>
                <th>Detalle</th>
                <th>Total</th>
                <th>Estado</th>
                <th>Fecha</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((venta) => (
                <tr key={venta.id}>
                  <td><strong>#{venta.id}</strong></td>
                  <td>
                    <strong>{venta.cliente_nombre}</strong>
                    <small>{venta.cliente_documento}</small>
                  </td>
                  <td>
                    {venta.detalles?.map((d, i) => (
                      <div key={i}>
                        <small>{d.nombre_item} x{d.cantidad}</small>
                      </div>
                    ))}
                  </td>
                  <td>{formatearPrecio(venta.total)}</td>
                  <td><Badge estado={venta.estado} /></td>
                  <td>{venta.creado_en?.slice(0, 10)}</td>
                  <td>
                    <button className="action" onClick={() => setVentaDetalle(venta)}>
                      Ver
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {!cargando && !rows.length && <Empty text="No hay ventas registradas. Las ventas se crean automáticamente al confirmar reservas." />}
      </div>

      {ventaDetalle && (
        <div className="modal-backdrop" onClick={() => setVentaDetalle(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
            <div className="modal-head">
              <div>
                <span className="dashboard-kicker">Detalle de venta</span>
                <h3>Venta #{ventaDetalle.id}</h3>
              </div>
              <button className="close-button" onClick={() => setVentaDetalle(null)}>×</button>
            </div>
            <div style={{ padding: '20px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                <div><small style={{ color: '#718096' }}>Cliente</small><strong style={{ display: 'block' }}>{ventaDetalle.cliente_nombre}</strong></div>
                <div><small style={{ color: '#718096' }}>Documento</small><strong style={{ display: 'block' }}>{ventaDetalle.cliente_documento}</strong></div>
                <div><small style={{ color: '#718096' }}>Correo</small><strong style={{ display: 'block' }}>{ventaDetalle.cliente_correo}</strong></div>
                <div><small style={{ color: '#718096' }}>Estado</small><Badge estado={ventaDetalle.estado} /></div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <strong>Productos/Servicios</strong>
                {ventaDetalle.detalles?.map((d, i) => (
                  <div key={i} style={{ padding: '8px', background: '#f8f9fa', borderRadius: '6px', marginTop: '4px', display: 'flex', justifyContent: 'space-between' }}>
                    <span>{d.nombre_item} — {d.cantidad} x {formatearPrecio(d.precio_unitario)}</span>
                    <strong>{formatearPrecio(d.subtotal)}</strong>
                  </div>
                ))}
              </div>

              <div style={{ padding: '12px', background: '#f8f9fa', borderRadius: '8px', textAlign: 'right' }}>
                <p>Subtotal: <strong>{formatearPrecio(ventaDetalle.subtotal)}</strong></p>
                <p>Impuestos (19%): <strong>{formatearPrecio(ventaDetalle.impuestos)}</strong></p>
                <p>Descuento: <strong>-{formatearPrecio(ventaDetalle.descuento)}</strong></p>
                <p style={{ fontSize: '1.2em' }}>Total: <strong>{formatearPrecio(ventaDetalle.total)}</strong></p>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}





// ============================================================
// TABLA DE FACTURAS
// ============================================================

const TablaFacturas = ({
  rol,
  facturas,
  ventas,
  cargando,
  busqueda,
  setBusqueda,
  cargar,
  mostrarToast,
  token,
}) => {
  const [facturaDetalle, setFacturaDetalle] = useState(null)
  const [mostrarGenerar, setMostrarGenerar] = useState(false)
  const [descargandoId, setDescargandoId] = useState(null)

  const rows = facturas.filter((f) => {
    const texto = `${f.numero_factura || ''} ${f.cliente_nombre || ''} ${f.cliente_documento || ''}`.toLowerCase()
    return texto.includes(busqueda.toLowerCase())
  })

  const ventasSinFactura = ventas.filter((v) =>
    v.estado === 'completada' && !facturas.some((f) => f.venta_id === v.id)
  )

  const crearFactura = async (ventaId) => {
    try {
      await api('/facturas/', token, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ventaId }),
      })
      mostrarToast('Factura generada correctamente')
      setMostrarGenerar(false)
      cargar()
    } catch (error) {
      mostrarToast(error.message, 'error')
    }
  }

  const cambiarEstado = async (id, estado) => {
    try {
      await api(`/facturas/${id}/estado`, token, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado }),
      })
      mostrarToast(`Factura actualizada a ${estado}`)
      cargar()
    } catch (error) {
      mostrarToast(error.message, 'error')
    }
  }

  const verDetalle = async (id) => {
    try {
      const data = await api(`/facturas/${id}`, token)
      setFacturaDetalle(data)
    } catch (error) {
      mostrarToast(error.message, 'error')
    }
  }

  const descargarFacturaPDF = async (f) => {
    setDescargandoId(`pdf-${f.id}`)
    try {
      await descargarArchivo(`/reportes/facturas/pdf/${f.id}`, token, `factura_${f.numero_factura}.pdf`)
      mostrarToast('PDF descargado correctamente')
    } catch (error) {
      mostrarToast(error.message, 'error')
    } finally {
      setDescargandoId(null)
    }
  }

  const getBadgeColor = (estado) => {
    if (estado === 'pagada') return { background: '#dcfce7', color: '#166534', border: '#86efac' }
    if (estado === 'anulada') return { background: '#fef2f2', color: '#991b1b', border: '#fca5a5' }
    return { background: '#fefce8', color: '#854d0e', border: '#fde047' }
  }

  const getBadgeLabel = (estado) => {
    if (estado === 'pagada') return 'Pagada'
    if (estado === 'anulada') return 'Anulada'
    return 'Pendiente'
  }

  return (
    <section className="panel-card" style={{ padding: 0, overflow: 'hidden' }}>

      {/* Header de la sección */}
      <div style={{ padding: '20px 24px', background: 'linear-gradient(135deg, #073f3d 0%, #1a5c59 100%)', color: 'white' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
          <span style={{ fontSize: '24px' }}>↗</span>
          <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '700' }}>Facturación</h2>
        </div>
        <p style={{ margin: '4px 0 0', fontSize: '13px', opacity: 0.85 }}>
          Genera, consulta y administra las facturas de venta del sistema
        </p>
      </div>

      {/* Resumen rápido */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1px', background: '#e5e7eb', borderBottom: '1px solid #e5e7eb' }}>
        {[
          { label: 'Total facturas', value: facturas.length, icon: '↗', color: '#1a5c59' },
          { label: 'Pendientes', value: facturas.filter(f => f.estado === 'pendiente').length, icon: '◷', color: '#d97706' },
          { label: 'Pagadas', value: facturas.filter(f => f.estado === 'pagada').length, icon: '✓', color: '#16a34a' },
          { label: 'Anuladas', value: facturas.filter(f => f.estado === 'anulada').length, icon: '✕', color: '#dc2626' },
        ].map((item) => (
          <div key={item.label} style={{ background: 'white', padding: '16px', textAlign: 'center' }}>
            <span style={{ fontSize: '20px', color: item.color }}>{item.icon}</span>
            <div style={{ fontSize: '24px', fontWeight: '700', color: '#1a5c59', margin: '4px 0' }}>{item.value}</div>
            <div style={{ fontSize: '11px', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{item.label}</div>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div style={{ padding: '16px 24px', display: 'flex', gap: '12px', alignItems: 'center', borderBottom: '1px solid #f1f5f9', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '200px', position: 'relative' }}>
          <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }}>⌕</span>
          <input
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por número, cliente o documento..."
            style={{
              width: '100%',
              padding: '10px 12px 10px 36px',
              borderRadius: '8px',
              border: '1px solid #e5e7eb',
              fontSize: '14px',
              outline: 'none',
              transition: 'border-color 0.2s',
            }}
            onFocus={(e) => e.target.style.borderColor = '#1a5c59'}
            onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
          />
        </div>
        <button
          className="primary-button"
          onClick={() => setMostrarGenerar(!mostrarGenerar)}
          style={{
            background: mostrarGenerar ? '#e5e7eb' : '#1a5c59',
            color: mostrarGenerar ? '#374151' : 'white',
            padding: '10px 20px',
            borderRadius: '8px',
            border: 'none',
            fontWeight: '600',
            fontSize: '14px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.2s',
          }}
        >
          {mostrarGenerar ? '← Ver facturas' : `+ Generar factura`}
          {!mostrarGenerar && ventasSinFactura.length > 0 && (
            <span style={{ background: '#f59e0b', color: 'white', borderRadius: '12px', padding: '2px 8px', fontSize: '11px', fontWeight: '700' }}>
              {ventasSinFactura.length}
            </span>
          )}
        </button>
      </div>

      {/* Contenido principal */}
      <div style={{ padding: '0' }}>
        {mostrarGenerar ? (
          /* Panel de generación de facturas */
          <div>
            <div style={{ padding: '16px 24px', background: '#f0fdf4', borderBottom: '1px solid #bbf7d0' }}>
              <p style={{ margin: 0, fontSize: '13px', color: '#166534' }}>
                <strong>Ventas confirmadas sin factura.</strong> Selecciona una venta para generar su factura correspondiente.
              </p>
            </div>
            {ventasSinFactura.length === 0 ? (
              <div style={{ padding: '40px 24px', textAlign: 'center', color: '#6b7280' }}>
                <span style={{ fontSize: '40px', display: 'block', marginBottom: '12px' }}>✓</span>
                <p style={{ margin: 0, fontSize: '15px' }}>Todas las ventas confirmadas ya tienen factura generada.</p>
              </div>
            ) : (
              <div className="table-wrap" style={{ padding: '0' }}>
                <table>
                  <thead>
                    <tr>
                      <th>N° Venta</th>
                      <th>Cliente</th>
                      <th>Detalle</th>
                      <th>Total</th>
                      <th>Fecha</th>
                      <th style={{ textAlign: 'center' }}>Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ventasSinFactura.map((v) => (
                      <tr key={v.id}>
                        <td><strong style={{ color: '#1a5c59' }}>#{v.id}</strong></td>
                        <td>
                          <div style={{ fontWeight: '600' }}>{v.cliente_nombre}</div>
                          <small style={{ color: '#6b7280' }}>{v.cliente_documento}</small>
                        </td>
                        <td>
                          {v.detalles?.map((d, i) => (
                            <div key={i} style={{ fontSize: '13px' }}>
                              <span>{d.nombre_item}</span>
                              <span style={{ color: '#6b7280' }}> x{d.cantidad}</span>
                            </div>
                          ))}
                        </td>
                        <td><strong>{formatearPrecio(v.total)}</strong></td>
                        <td style={{ color: '#6b7280' }}>{v.creado_en?.slice(0, 10)}</td>
                        <td style={{ textAlign: 'center' }}>
                          <button
                            onClick={() => crearFactura(v.id)}
                            style={{
                              background: '#1a5c59',
                              color: 'white',
                              border: 'none',
                              padding: '8px 16px',
                              borderRadius: '6px',
                              fontWeight: '600',
                              fontSize: '13px',
                              cursor: 'pointer',
                              transition: 'background 0.2s',
                            }}
                            onMouseEnter={(e) => e.target.style.background = '#0f4f4c'}
                            onMouseLeave={(e) => e.target.style.background = '#1a5c59'}
                          >
                            Generar factura
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ) : (
          /* Lista de facturas */
          <div>
            {cargando ? (
              <SkeletonRows cols={6} />
            ) : rows.length === 0 ? (
              <div style={{ padding: '40px 24px', textAlign: 'center', color: '#6b7280' }}>
                <span style={{ fontSize: '40px', display: 'block', marginBottom: '12px' }}>↗</span>
                <p style={{ margin: 0, fontSize: '15px' }}>No hay facturas que coincidan con la búsqueda.</p>
              </div>
            ) : (
              <div className="table-wrap" style={{ padding: '0' }}>
                <table>
                  <thead>
                    <tr>
                      <th>N° Factura</th>
                      <th>Cliente</th>
                      <th>Total</th>
                      <th>Estado</th>
                      <th>Fecha</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((f) => {
                      const badgeStyle = getBadgeColor(f.estado)
                      return (
                        <tr key={f.id}>
                          <td>
                            <strong style={{ color: '#1a5c59', fontSize: '14px' }}>{f.numero_factura}</strong>
                          </td>
                          <td>
                            <div style={{ fontWeight: '600' }}>{f.cliente_nombre}</div>
                            <small style={{ color: '#6b7280' }}>{f.cliente_documento}</small>
                          </td>
                          <td>
                            <strong style={{ fontSize: '14px' }}>{formatearPrecio(f.total)}</strong>
                          </td>
                          <td>
                            <span style={{
                              display: 'inline-block',
                              padding: '4px 10px',
                              borderRadius: '12px',
                              fontSize: '12px',
                              fontWeight: '600',
                              background: badgeStyle.background,
                              color: badgeStyle.color,
                              border: `1px solid ${badgeStyle.border}`,
                            }}>
                              {getBadgeLabel(f.estado)}
                            </span>
                          </td>
                          <td style={{ color: '#6b7280', fontSize: '13px' }}>
                            {f.creado_en?.slice(0, 10)}
                          </td>
                          <td>
                            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                              <button
                                onClick={() => verDetalle(f.id)}
                                style={{
                                  background: '#f1f5f9',
                                  color: '#475569',
                                  border: '1px solid #e2e8f0',
                                  padding: '6px 12px',
                                  borderRadius: '6px',
                                  fontSize: '12px',
                                  fontWeight: '600',
                                  cursor: 'pointer',
                                  transition: 'all 0.2s',
                                }}
                                onMouseEnter={(e) => { e.target.style.background = '#e2e8f0'; e.target.style.borderColor = '#cbd5e1' }}
                                onMouseLeave={(e) => { e.target.style.background = '#f1f5f9'; e.target.style.borderColor = '#e2e8f0' }}
                              >
                                Ver
                              </button>
                              <button
                                onClick={() => descargarFacturaPDF(f)}
                                disabled={descargandoId === `pdf-${f.id}`}
                                style={{
                                  background: '#dc2626',
                                  color: 'white',
                                  border: 'none',
                                  padding: '6px 12px',
                                  borderRadius: '6px',
                                  fontSize: '12px',
                                  fontWeight: '600',
                                  cursor: descargandoId === `pdf-${f.id}` ? 'wait' : 'pointer',
                                  opacity: descargandoId === `pdf-${f.id}` ? 0.6 : 1,
                                  transition: 'all 0.2s',
                                }}
                                onMouseEnter={(e) => { if (descargandoId !== `pdf-${f.id}`) e.target.style.background = '#b91c1c' }}
                                onMouseLeave={(e) => { if (descargandoId !== `pdf-${f.id}`) e.target.style.background = '#dc2626' }}
                              >
                                {descargandoId === `pdf-${f.id}` ? 'Descargando...' : 'PDF'}
                              </button>
                              {f.estado === 'pendiente' && (
                                <button
                                  onClick={() => cambiarEstado(f.id, 'pagada')}
                                  style={{
                                    background: '#16a34a',
                                    color: 'white',
                                    border: 'none',
                                    padding: '6px 12px',
                                    borderRadius: '6px',
                                    fontSize: '12px',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    transition: 'background 0.2s',
                                  }}
                                  onMouseEnter={(e) => e.target.style.background = '#15803d'}
                                  onMouseLeave={(e) => e.target.style.background = '#16a34a'}
                                >
                                  Marcar pagada
                                </button>
                              )}
                              {f.estado !== 'anulada' && (
                                <button
                                  onClick={() => cambiarEstado(f.id, 'anulada')}
                                  style={{
                                    background: 'white',
                                    color: '#dc2626',
                                    border: '1px solid #fca5a5',
                                    padding: '6px 12px',
                                    borderRadius: '6px',
                                    fontSize: '12px',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                  }}
                                  onMouseEnter={(e) => { e.target.style.background = '#fef2f2'; e.target.style.borderColor = '#f87171' }}
                                  onMouseLeave={(e) => { e.target.style.background = 'white'; e.target.style.borderColor = '#fca5a5' }}
                                >
                                  Anular
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal de detalle de factura */}
      {facturaDetalle && (
        <div className="modal-backdrop" onClick={() => setFacturaDetalle(null)}>
          <div
            className="modal-card"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '640px', borderRadius: '16px', overflow: 'hidden' }}
          >
            {/* Header del modal */}
            <div style={{
              background: 'linear-gradient(135deg, #073f3d 0%, #1a5c59 100%)',
              color: 'white',
              padding: '20px 24px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
            }}>
              <div>
                <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.8, marginBottom: '4px' }}>
                  Detalle de Factura
                </div>
                <h3 style={{ margin: 0, fontSize: '20px', fontWeight: '700' }}>{facturaDetalle.numero_factura}</h3>
              </div>
              <button
                onClick={() => setFacturaDetalle(null)}
                style={{
                  background: 'rgba(255,255,255,0.15)',
                  border: 'none',
                  color: 'white',
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  fontSize: '18px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                ×
              </button>
            </div>

            {/* Info del cliente */}
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #f1f5f9' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <div style={{ fontSize: '11px', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>Cliente</div>
                  <div style={{ fontWeight: '600', fontSize: '14px' }}>{facturaDetalle.cliente_nombre}</div>
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>Documento</div>
                  <div style={{ fontWeight: '600', fontSize: '14px' }}>{facturaDetalle.cliente_documento}</div>
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>Correo</div>
                  <div style={{ fontWeight: '600', fontSize: '14px' }}>{facturaDetalle.cliente_correo}</div>
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>Estado</div>
                  <span style={{
                    display: 'inline-block',
                    padding: '4px 10px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: '600',
                    ...getBadgeColor(facturaDetalle.estado),
                  }}>
                    {getBadgeLabel(facturaDetalle.estado)}
                  </span>
                </div>
              </div>
            </div>

            {/* Detalles de la factura */}
            {facturaDetalle.detalles && facturaDetalle.detalles.length > 0 && (
              <div style={{ padding: '20px 24px', borderBottom: '1px solid #f1f5f9' }}>
                <div style={{ fontSize: '12px', fontWeight: '600', color: '#374151', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Productos/Servicios
                </div>
                {facturaDetalle.detalles.map((d, i) => (
                  <div key={i} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '10px 12px',
                    background: '#f8fafc',
                    borderRadius: '8px',
                    marginBottom: '6px',
                  }}>
                    <div>
                      <div style={{ fontWeight: '600', fontSize: '13px' }}>{d.nombre_item}</div>
                      <div style={{ fontSize: '12px', color: '#6b7280' }}>{d.cantidad} x {formatearPrecio(d.precio_unitario)}</div>
                    </div>
                    <strong style={{ fontSize: '14px', color: '#1a5c59' }}>{formatearPrecio(d.subtotal)}</strong>
                  </div>
                ))}
              </div>
            )}

            {/* Totales */}
            <div style={{ padding: '20px 24px', background: '#f8fafc' }}>
              <div style={{ maxWidth: '280px', marginLeft: 'auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: '13px' }}>
                  <span style={{ color: '#6b7280' }}>Subtotal</span>
                  <span>{formatearPrecio(facturaDetalle.subtotal)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: '13px' }}>
                  <span style={{ color: '#6b7280' }}>Impuestos (IVA 19%)</span>
                  <span>{formatearPrecio(facturaDetalle.impuestos)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: '13px' }}>
                  <span style={{ color: '#6b7280' }}>Descuento</span>
                  <span style={{ color: '#dc2626' }}>-{formatearPrecio(facturaDetalle.descuento)}</span>
                </div>
                <div style={{ borderTop: '2px solid #1a5c59', marginTop: '8px', paddingTop: '8px', display: 'flex', justifyContent: 'space-between' }}>
                  <strong style={{ fontSize: '16px', color: '#1a5c59' }}>Total</strong>
                  <strong style={{ fontSize: '16px', color: '#1a5c59' }}>{formatearPrecio(facturaDetalle.total)}</strong>
                </div>
              </div>
            </div>

            {/* Footer del modal */}
            <div style={{ padding: '16px 24px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button
                onClick={() => setFacturaDetalle(null)}
                style={{
                  padding: '10px 20px',
                  borderRadius: '8px',
                  border: '1px solid #e5e7eb',
                  background: 'white',
                  color: '#374151',
                  fontWeight: '600',
                  fontSize: '14px',
                  cursor: 'pointer',
                }}
              >
                Cerrar
              </button>
              <button
                onClick={() => descargarFacturaPDF(facturaDetalle)}
                disabled={descargandoId === `pdf-${facturaDetalle.id}`}
                style={{
                  padding: '10px 20px',
                  borderRadius: '8px',
                  border: 'none',
                  background: '#dc2626',
                  color: 'white',
                  fontWeight: '600',
                  fontSize: '14px',
                  cursor: descargandoId === `pdf-${facturaDetalle.id}` ? 'wait' : 'pointer',
                  opacity: descargandoId === `pdf-${facturaDetalle.id}` ? 0.6 : 1,
                }}
              >
                {descargandoId === `pdf-${facturaDetalle.id}` ? 'Descargando...' : 'Descargar PDF'}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}


// ============================================================
// TABLA DE PQR
// ============================================================

const TablaPQR = ({
  rol,
  pqrList,
  cargando,
  busqueda,
  setBusqueda,
  estadoFiltro,
  setEstadoFiltro,
  cargar,
  mostrarToast,
  token,
}) => {
  const [modalPQR, setModalPQR] = useState(null)
  const [responderPQR, setResponderPQR] = useState(null)

  const rows = pqrList.filter((p) => {
    const texto = `${p.asunto} ${p.descripcion} ${p.tipo}`.toLowerCase()
    const coincideBusqueda = texto.includes(busqueda.toLowerCase())
    const coincideEstado = estadoFiltro === 'todos' || p.estado === estadoFiltro
    return coincideBusqueda && coincideEstado
  })

  const cambiarEstado = async (id, estado) => {
    try {
      await api(`/pqr/${id}/estado`, token, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado }),
      })
      mostrarToast(`PQR actualizada a ${estado}`)
      cargar()
    } catch (error) {
      mostrarToast(error.message, 'error')
    }
  }

  const eliminar = async (id) => {
    try {
      await api(`/pqr/${id}`, token, { method: 'DELETE' })
      mostrarToast('PQR eliminada correctamente')
      cargar()
    } catch (error) {
      mostrarToast(error.message, 'error')
    }
  }

  const getTipoBadge = (tipo) => {
    if (tipo === 'peticion') return { bg: '#eff6ff', color: '#1e40af', border: '#93c5fd', label: 'Petición' }
    if (tipo === 'queja') return { bg: '#fefce8', color: '#854d0e', border: '#fde047', label: 'Queja' }
    return { bg: '#fef2f2', color: '#991b1b', border: '#fca5a5', label: 'Reclamo' }
  }

  const getEstadoBadge = (estado) => {
    if (estado === 'pendiente') return { bg: '#fefce8', color: '#854d0e', border: '#fde047', label: 'Pendiente' }
    if (estado === 'en_proceso') return { bg: '#eff6ff', color: '#1e40af', border: '#93c5fd', label: 'En proceso' }
    if (estado === 'respondida') return { bg: '#f0fdf4', color: '#166534', border: '#86efac', label: 'Respondida' }
    return { bg: '#f1f5f9', color: '#475569', border: '#cbd5e1', label: 'Cerrada' }
  }

  return (
    <section className="panel-card" style={{ padding: 0, overflow: 'hidden' }}>

      {/* Header */}
      <div style={{ padding: '20px 24px', background: 'linear-gradient(135deg, #073f3d 0%, #1a5c59 100%)', color: 'white' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
          <span style={{ fontSize: '24px' }}>✉</span>
          <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '700' }}>
            {rol === 'cliente' ? 'Mis PQR' : 'Gestión de PQR'}
          </h2>
        </div>
        <p style={{ margin: '4px 0 0', fontSize: '13px', opacity: 0.85 }}>
          {rol === 'cliente'
            ? 'Registra y consulta tus peticiones, quejas y reclamos'
            : 'Administra las peticiones, quejas y reclamos de los clientes'}
        </p>
      </div>

      {/* Toolbar */}
      <div style={{ padding: '16px 24px', borderBottom: '1px solid #f1f5f9' }}>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '200px', position: 'relative' }}>
            <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }}>⌕</span>
            <input
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar por asunto, descripción o tipo..."
              style={{
                width: '100%',
                padding: '10px 12px 10px 36px',
                borderRadius: '8px',
                border: '1px solid #e5e7eb',
                fontSize: '14px',
                outline: 'none',
              }}
              onFocus={(e) => e.target.style.borderColor = '#1a5c59'}
              onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
            />
          </div>
          <select
            value={estadoFiltro}
            onChange={(e) => setEstadoFiltro(e.target.value)}
            style={{
              padding: '10px 12px',
              borderRadius: '8px',
              border: '1px solid #e5e7eb',
              fontSize: '14px',
              outline: 'none',
              background: 'white',
              cursor: 'pointer',
            }}
          >
            <option value="todos">Todos los estados</option>
            <option value="pendiente">Pendientes</option>
            <option value="en_proceso">En proceso</option>
            <option value="respondida">Respondidas</option>
            <option value="cerrada">Cerradas</option>
          </select>
          <button
            onClick={() => setModalPQR({})}
            style={{
              background: '#1a5c59',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '8px',
              fontWeight: '600',
              fontSize: '14px',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            + Nueva PQR
          </button>
        </div>
      </div>

      {/* Tabla */}
      <div style={{ padding: '0' }}>
        {cargando ? (
          <SkeletonRows cols={6} />
        ) : rows.length === 0 ? (
          <div style={{ padding: '40px 24px', textAlign: 'center', color: '#6b7280' }}>
            <span style={{ fontSize: '40px', display: 'block', marginBottom: '12px' }}>✉</span>
            <p style={{ margin: 0, fontSize: '15px' }}>No hay PQR que coincidan con la búsqueda.</p>
          </div>
        ) : (
          <div className="table-wrap" style={{ padding: '0' }}>
            <table>
              <thead>
                <tr>
                  <th>Tipo</th>
                  <th>Asunto</th>
                  <th>Descripción</th>
                  <th>Estado</th>
                  <th>Respuesta</th>
                  <th>Fecha</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((p) => {
                  const tipoBadge = getTipoBadge(p.tipo)
                  const estadoBadge = getEstadoBadge(p.estado)
                  return (
                    <tr key={p.id}>
                      <td>
                        <span style={{
                          display: 'inline-block',
                          padding: '3px 10px',
                          borderRadius: '12px',
                          fontSize: '11px',
                          fontWeight: '600',
                          background: tipoBadge.bg,
                          color: tipoBadge.color,
                          border: `1px solid ${tipoBadge.border}`,
                          textTransform: 'capitalize',
                        }}>
                          {tipoBadge.label}
                        </span>
                      </td>
                      <td><strong style={{ fontSize: '13px' }}>{p.asunto}</strong></td>
                      <td style={{ maxWidth: '200px' }}>
                        <div style={{ fontSize: '13px', color: '#4b5563', lineHeight: '1.4', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {p.descripcion}
                        </div>
                      </td>
                      <td>
                        <span style={{
                          display: 'inline-block',
                          padding: '3px 10px',
                          borderRadius: '12px',
                          fontSize: '11px',
                          fontWeight: '600',
                          background: estadoBadge.bg,
                          color: estadoBadge.color,
                          border: `1px solid ${estadoBadge.border}`,
                        }}>
                          {estadoBadge.label}
                        </span>
                      </td>
                      <td style={{ maxWidth: '180px' }}>
                        {p.respuesta ? (
                          <div style={{ fontSize: '12px', color: '#166534', lineHeight: '1.4', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {p.respuesta}
                          </div>
                        ) : (
                          <span style={{ fontSize: '12px', color: '#9ca3af', fontStyle: 'italic' }}>Sin respuesta</span>
                        )}
                      </td>
                      <td style={{ fontSize: '13px', color: '#6b7280' }}>
                        {p.creado_en?.slice(0, 10)}
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                          {rol !== 'cliente' && (p.estado === 'pendiente' || p.estado === 'en_proceso') && (
                            <button
                              onClick={() => setResponderPQR(p)}
                              style={{
                                background: '#1a5c59',
                                color: 'white',
                                border: 'none',
                                padding: '5px 10px',
                                borderRadius: '5px',
                                fontSize: '11px',
                                fontWeight: '600',
                                cursor: 'pointer',
                              }}
                            >
                              Responder
                            </button>
                          )}
                          {rol !== 'cliente' && p.estado === 'pendiente' && (
                            <button
                              onClick={() => cambiarEstado(p.id, 'en_proceso')}
                              style={{
                                background: '#eff6ff',
                                color: '#1e40af',
                                border: '1px solid #93c5fd',
                                padding: '5px 10px',
                                borderRadius: '5px',
                                fontSize: '11px',
                                fontWeight: '600',
                                cursor: 'pointer',
                              }}
                            >
                              En proceso
                            </button>
                          )}
                          {p.estado === 'respondida' && (
                            <button
                              onClick={() => cambiarEstado(p.id, 'cerrada')}
                              style={{
                                background: '#f1f5f9',
                                color: '#475569',
                                border: '1px solid #e2e8f0',
                                padding: '5px 10px',
                                borderRadius: '5px',
                                fontSize: '11px',
                                fontWeight: '600',
                                cursor: 'pointer',
                              }}
                            >
                              Cerrar
                            </button>
                          )}
                          {rol === 'administrador' && (
                            <button
                              onClick={() => eliminar(p.id)}
                              style={{
                                background: 'white',
                                color: '#dc2626',
                                border: '1px solid #fca5a5',
                                padding: '5px 10px',
                                borderRadius: '5px',
                                fontSize: '11px',
                                fontWeight: '600',
                                cursor: 'pointer',
                              }}
                            >
                              Eliminar
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modalPQR && (
        <PQRModal
          token={token}
          onClose={() => setModalPQR(null)}
          onSaved={() => { setModalPQR(null); cargar() }}
          mostrarToast={mostrarToast}
        />
      )}

      {responderPQR && (
        <ResponderPQRModal
          pqr={responderPQR}
          token={token}
          onClose={() => setResponderPQR(null)}
          onSaved={() => { setResponderPQR(null); cargar() }}
          mostrarToast={mostrarToast}
        />
      )}
    </section>
  )
}


// ============================================================
// MODAL DE PQR
// ============================================================

const PQRModal = ({ token, onClose, onSaved, mostrarToast }) => {
  const [form, setForm] = useState({ tipo: 'peticion', asunto: '', descripcion: '' })
  const [guardando, setGuardando] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    if (!form.asunto || !form.descripcion) {
      mostrarToast('Completa todos los campos.', 'error')
      return
    }
    setGuardando(true)
    try {
      await api('/pqr/', token, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      mostrarToast('PQR registrada correctamente')
      onSaved()
    } catch (error) {
      mostrarToast(error.message, 'error')
    } finally {
      setGuardando(false)
    }
  }

  const getTipoInfo = (tipo) => {
    if (tipo === 'peticion') return { label: 'Petición', color: '#1e40af', bg: '#eff6ff' }
    if (tipo === 'queja') return { label: 'Queja', color: '#854d0e', bg: '#fefce8' }
    return { label: 'Reclamo', color: '#991b1b', bg: '#fef2f2' }
  }

  return (
    <div className="modal-backdrop">
      <form className="modal-card" onSubmit={submit} style={{ borderRadius: '16px', overflow: 'hidden', maxWidth: '500px' }}>
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #073f3d 0%, #1a5c59 100%)',
          color: 'white',
          padding: '20px 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
        }}>
          <div>
            <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.8, marginBottom: '4px' }}>
              Nueva PQR
            </div>
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700' }}>Registrar PQR</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'rgba(255,255,255,0.15)',
              border: 'none',
              color: 'white',
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              fontSize: '18px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            ×
          </button>
        </div>

        <div style={{ padding: '24px' }}>
          {/* Tipo selector */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
              Tipo de solicitud
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
              {['peticion', 'queja', 'reclamo'].map((tipo) => {
                const info = getTipoInfo(tipo)
                const isSelected = form.tipo === tipo
                return (
                  <button
                    key={tipo}
                    type="button"
                    onClick={() => setForm({ ...form, tipo })}
                    style={{
                      padding: '10px',
                      borderRadius: '8px',
                      border: isSelected ? `2px solid ${info.color}` : '2px solid #e5e7eb',
                      background: isSelected ? info.bg : 'white',
                      color: info.color,
                      fontWeight: '600',
                      fontSize: '13px',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                  >
                    {info.label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Asunto */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>
              Asunto *
            </label>
            <input
              required
              value={form.asunto}
              onChange={(e) => setForm({ ...form, asunto: e.target.value })}
              placeholder="Escribe el asunto de tu solicitud"
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '8px',
                border: '1px solid #e5e7eb',
                fontSize: '14px',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {/* Descripción */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>
              Descripción *
            </label>
            <textarea
              required
              rows="4"
              value={form.descripcion}
              onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
              placeholder="Describe detalladamente tu petición, queja o reclamo..."
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '8px',
                border: '1px solid #e5e7eb',
                fontSize: '14px',
                outline: 'none',
                resize: 'vertical',
                boxSizing: 'border-box',
                fontFamily: 'inherit',
              }}
            />
          </div>

          {/* Botones */}
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={onClose}
              disabled={guardando}
              style={{
                padding: '10px 20px',
                borderRadius: '8px',
                border: '1px solid #e5e7eb',
                background: 'white',
                color: '#374151',
                fontWeight: '600',
                fontSize: '14px',
                cursor: 'pointer',
              }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={guardando}
              style={{
                padding: '10px 24px',
                borderRadius: '8px',
                border: 'none',
                background: '#1a5c59',
                color: 'white',
                fontWeight: '600',
                fontSize: '14px',
                cursor: guardando ? 'wait' : 'pointer',
                opacity: guardando ? 0.6 : 1,
              }}
            >
              {guardando ? 'Enviando...' : 'Enviar PQR'}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}


// ============================================================
// MODAL DE RESPUESTA PQR
// ============================================================

const ResponderPQRModal = ({ pqr, token, onClose, onSaved, mostrarToast }) => {
  const [respuesta, setRespuesta] = useState('')
  const [guardando, setGuardando] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    if (!respuesta.trim()) {
      mostrarToast('Escribe una respuesta.', 'error')
      return
    }
    setGuardando(true)
    try {
      await api(`/pqr/${pqr.id}/responder`, token, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ respuesta: respuesta.trim(), estado: 'respondida' }),
      })
      mostrarToast('PQR respondida correctamente')
      onSaved()
    } catch (error) {
      mostrarToast(error.message, 'error')
    } finally {
      setGuardando(false)
    }
  }

  const getTipoBadge = (tipo) => {
    if (tipo === 'peticion') return { label: 'Petición', color: '#1e40af', bg: '#eff6ff' }
    if (tipo === 'queja') return { label: 'Queja', color: '#854d0e', bg: '#fefce8' }
    return { label: 'Reclamo', color: '#991b1b', bg: '#fef2f2' }
  }

  const tipoInfo = getTipoBadge(pqr.tipo)

  return (
    <div className="modal-backdrop">
      <form className="modal-card" onSubmit={submit} style={{ borderRadius: '16px', overflow: 'hidden', maxWidth: '560px' }}>
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #073f3d 0%, #1a5c59 100%)',
          color: 'white',
          padding: '20px 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
        }}>
          <div>
            <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.8, marginBottom: '4px' }}>
              Responder PQR
            </div>
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700' }}>{pqr.asunto}</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'rgba(255,255,255,0.15)',
              border: 'none',
              color: 'white',
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              fontSize: '18px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            ×
          </button>
        </div>

        <div style={{ padding: '24px' }}>
          {/* Info de la PQR */}
          <div style={{
            padding: '16px',
            background: '#f8fafc',
            borderRadius: '10px',
            border: '1px solid #e2e8f0',
            marginBottom: '20px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
              <span style={{
                display: 'inline-block',
                padding: '3px 10px',
                borderRadius: '12px',
                fontSize: '11px',
                fontWeight: '600',
                background: tipoInfo.bg,
                color: tipoInfo.color,
              }}>
                {tipoInfo.label}
              </span>
              <span style={{ fontSize: '12px', color: '#6b7280' }}>
                {pqr.creado_en?.slice(0, 10)}
              </span>
            </div>
            <p style={{ margin: 0, fontSize: '14px', color: '#374151', lineHeight: '1.5' }}>
              {pqr.descripcion}
            </p>
          </div>

          {/* Respuesta */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>
              Tu respuesta *
            </label>
            <textarea
              required
              rows="4"
              value={respuesta}
              onChange={(e) => setRespuesta(e.target.value)}
              placeholder="Escribe una respuesta clara y profesional..."
              style={{
                width: '100%',
                padding: '12px 14px',
                borderRadius: '8px',
                border: '1px solid #e5e7eb',
                fontSize: '14px',
                outline: 'none',
                resize: 'vertical',
                boxSizing: 'border-box',
                fontFamily: 'inherit',
                lineHeight: '1.5',
              }}
            />
          </div>

          {/* Botones */}
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={onClose}
              disabled={guardando}
              style={{
                padding: '10px 20px',
                borderRadius: '8px',
                border: '1px solid #e5e7eb',
                background: 'white',
                color: '#374151',
                fontWeight: '600',
                fontSize: '14px',
                cursor: 'pointer',
              }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={guardando}
              style={{
                padding: '10px 24px',
                borderRadius: '8px',
                border: 'none',
                background: '#1a5c59',
                color: 'white',
                fontWeight: '600',
                fontSize: '14px',
                cursor: guardando ? 'wait' : 'pointer',
                opacity: guardando ? 0.6 : 1,
              }}
            >
              {guardando ? 'Enviando...' : 'Enviar respuesta'}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}


// ============================================================
// CHATBOT
// ============================================================

const Chatbot = ({ token, mostrarToast }) => {
  const [conversaciones, setConversaciones] = useState([])
  const [conversacionActual, setConversacionActual] = useState(null)
  const [mensajes, setMensajes] = useState([])
  const [nuevoMensaje, setNuevoMensaje] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [cargandoConversaciones, setCargandoConversaciones] = useState(true)

  useEffect(() => {
    cargarConversaciones()
  }, [])

  const cargarConversaciones = async () => {
    try {
      const data = await api('/chatbot/conversaciones', token)
      setConversaciones(data)
    } catch (error) {
      console.error(error)
    } finally {
      setCargandoConversaciones(false)
    }
  }

  const crearConversacion = async () => {
    try {
      const data = await api('/chatbot/conversaciones', token, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ titulo: 'Nueva conversación' }),
      })
      await cargarConversaciones()
      seleccionarConversacion(data.conversacionId)
    } catch (error) {
      mostrarToast(error.message, 'error')
    }
  }

  const seleccionarConversacion = async (id) => {
    setConversacionActual(id)
    try {
      const data = await api(`/chatbot/conversaciones/${id}`, token)
      setMensajes(data.mensajes || [])
    } catch (error) {
      console.error(error)
    }
  }

  const enviarMensaje = async (e) => {
    e.preventDefault()
    if (!nuevoMensaje.trim() || !conversacionActual) return

    const mensaje = nuevoMensaje.trim()
    setNuevoMensaje('')
    setMensajes((prev) => [...prev, { rol: 'usuario', contenido: mensaje }])
    setEnviando(true)

    try {
      const data = await api(`/chatbot/conversaciones/${conversacionActual}/mensajes`, token, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mensaje }),
      })
      setMensajes((prev) => [...prev, data.respuesta])
    } catch (error) {
      mostrarToast(error.message, 'error')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <section className="panel-card" style={{ display: 'flex', gap: '20px', minHeight: '500px' }}>
      <div style={{ width: '250px', borderRight: '1px solid #e2e8f0', paddingRight: '16px' }}>
        <button className="primary-button" onClick={crearConversacion} style={{ width: '100%', marginBottom: '12px' }}>
          + Nueva conversación
        </button>
        {cargandoConversaciones ? (
          <SkeletonRows cols={1} />
        ) : (
          conversaciones.map((c) => (
            <button
              key={c.id}
              onClick={() => seleccionarConversacion(c.id)}
              style={{
                display: 'block',
                width: '100%',
                padding: '10px',
                marginBottom: '6px',
                borderRadius: '8px',
                border: conversacionActual === c.id ? '2px solid #3182ce' : '1px solid #e2e8f0',
                background: conversacionActual === c.id ? '#ebf8ff' : 'white',
                textAlign: 'left',
                cursor: 'pointer',
              }}
            >
              <strong style={{ fontSize: '0.85em' }}>{c.titulo}</strong>
              <small style={{ display: 'block', color: '#718096' }}>{c.total_mensajes} mensajes</small>
            </button>
          ))
        )}
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {conversacionActual ? (
          <>
            <div style={{ flex: 1, overflowY: 'auto', padding: '16px', background: '#f7fafc', borderRadius: '8px', marginBottom: '12px' }}>
              {mensajes.map((m, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    justifyContent: m.rol === 'usuario' ? 'flex-end' : 'flex-start',
                    marginBottom: '10px',
                  }}
                >
                  <div
                    style={{
                      maxWidth: '70%',
                      padding: '10px 14px',
                      borderRadius: '12px',
                      background: m.rol === 'usuario' ? '#3182ce' : '#e2e8f0',
                      color: m.rol === 'usuario' ? 'white' : '#2d3748',
                    }}
                  >
                    {m.contenido}
                  </div>
                </div>
              ))}
              {enviando && (
                <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: '10px' }}>
                  <div style={{ padding: '10px 14px', borderRadius: '12px', background: '#e2e8f0', color: '#718096' }}>
                    Escribiendo...
                  </div>
                </div>
              )}
            </div>

            <form onSubmit={enviarMensaje} style={{ display: 'flex', gap: '8px' }}>
              <input
                value={nuevoMensaje}
                onChange={(e) => setNuevoMensaje(e.target.value)}
                placeholder="Escribe tu mensaje..."
                disabled={enviando}
                style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}
              />
              <button type="submit" className="primary-button" disabled={enviando || !nuevoMensaje.trim()}>
                Enviar
              </button>
            </form>
          </>
        ) : (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#718096' }}>
            <div style={{ textAlign: 'center' }}>
              <span style={{ fontSize: '3em' }}>💬</span>
              <p>Selecciona una conversación o crea una nueva</p>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}


// ============================================================
// MODAL DE CONFIRMACIÓN
// ============================================================

const ConfirmModal = ({
  titulo,
  mensaje,
  onCancel,
  onConfirm,
}) => (
  <div className="modal-backdrop">
    <div className="confirm-card">
      <div className="confirm-icon">!</div>
      <h3>{titulo}</h3>
      <p>{mensaje}</p>
      <div className="modal-actions">
        <button className="secondary-button" onClick={onCancel}>
          No, volver
        </button>
        <button className="danger-button" onClick={onConfirm}>
          Sí, continuar
        </button>
      </div>
    </div>
  </div>
)