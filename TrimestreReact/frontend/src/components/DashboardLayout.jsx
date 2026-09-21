import React, { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import logo from '../assets/horizonte-logo.svg'
import { useAuth, API_URL } from '../context/AuthContext'

const MENUS = {
  administrador: [
    ['inicio', '⌂', 'Resumen'], ['usuarios', '♙', 'Usuarios'], ['paquetes', '✈', 'Paquetes'],
    ['servicios', '◈', 'Servicios'], ['reservas', '▣', 'Reservas'], ['ventas', '$', 'Ventas'],
    ['ventas-dashboard', '📊', 'Dash. Ventas'], ['facturas', '↗', 'Facturas'], ['pqr', '✉', 'PQR'], ['mensajes', '✉', 'Mensajes'],
    ['reportes', '📊', 'Reportes'],
  ],
  empleado: [
    ['inicio', '⌂', 'Resumen'], ['reservas', '▣', 'Reservas'], ['paquetes', '✈', 'Paquetes'],
    ['servicios', '◈', 'Servicios'], ['ventas', '$', 'Ventas'], ['ventas-dashboard', '📊', 'Dash. Ventas'],
    ['facturas', '↗', 'Facturas'], ['pqr', '✉', 'PQR'],
  ],
  cliente: [
    ['inicio', '⌂', 'Resumen'], ['reservas', '▣', 'Mis reservas'], ['pqr', '✉', 'Mis PQR'],
    ['perfil', '♙', 'Mi perfil'],
  ],
}

export const DashboardLayout = ({ children, titulo, descripcion, onNavigate }) => {
  const { usuario, token, cerrarSesion } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [movil, setMovil] = useState(false)
  const [menuUsuario, setMenuUsuario] = useState(false)
  const [pendientes, setPendientes] = useState({ mensajes: 0, reservas: 0, pqr: 0 })
  const rol = usuario?.rol || 'cliente'
  const base = rol === 'administrador' ? '/panel-admin' : rol === 'empleado' ? '/panel-empleado' : '/panel-cliente'

  useEffect(() => {
    if (!token || !['administrador', 'empleado'].includes(rol)) return
    fetch(`${API_URL}/dashboard/resumen`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.ok ? r.json() : null).then(d => d && setPendientes({ mensajes: d.mensajes_sin_leer || 0, reservas: d.reservas_pendientes || 0, pqr: d.pqr_pendientes || 0 })).catch(() => {})
  }, [token, rol, location.pathname])

  const salir = () => { cerrarSesion(); navigate('/') }
  const cambiar = (id) => { setMovil(false); setMenuUsuario(false); onNavigate?.(id) }
  const actual = new URLSearchParams(location.search).get('seccion') || 'inicio'

  return (
    <div className="dashboard-shell">
      <aside className={`dashboard-sidebar ${movil ? 'is-open' : ''}`}>
        <div className="sidebar-brand">
          <img src={logo} alt="Horizonte Viajes" />
        </div>
        <div className="sidebar-role">Panel {rol}</div>
        <nav className="sidebar-nav">
          {MENUS[rol].map(([id, icon, label]) => (
            <button key={id} className={`sidebar-link ${actual === id ? 'active' : ''}`} onClick={() => cambiar(id)}>
              <span className="sidebar-icon">{icon}</span><span>{label}</span>
              {id === 'mensajes' && pendientes.mensajes > 0 && <b>{pendientes.mensajes}</b>}
              {id === 'reservas' && pendientes.reservas > 0 && <b>{pendientes.reservas}</b>}
              {id === 'pqr' && pendientes.pqr > 0 && <b>{pendientes.pqr}</b>}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <Link to="/" className="sidebar-link" style={{ background: '#1a5c59', color: '#86efac', fontWeight: '800' }}>
            <span className="sidebar-icon">🏠</span><span>Volver al sitio</span>
          </Link>
          <button className="sidebar-link danger" onClick={salir}><span className="sidebar-icon">⇥</span><span>Cerrar sesión</span></button>
        </div>
      </aside>
      {movil && <button className="dashboard-overlay" aria-label="Cerrar menú" onClick={() => setMovil(false)} />}
      <section className="dashboard-main">
        <header className="dashboard-topbar">
          <button className="dashboard-menu-button" onClick={() => setMovil(true)}>☰</button>
          <div><p className="dashboard-kicker">Horizonte Viajes</p><h1>{titulo}</h1></div>
          <div className="topbar-user-wrap">
            <button className="topbar-user" onClick={() => setMenuUsuario(!menuUsuario)}>
              <span className="avatar">{usuario?.nombre?.charAt(0)?.toUpperCase() || 'H'}</span>
              <span className="topbar-user-text"><strong>{usuario?.nombre} {usuario?.apellido}</strong><small>{rol}</small></span><span>⌄</span>
            </button>
            {menuUsuario && (
              <div className="user-dropdown">
                <button onClick={() => cambiar(rol === 'cliente' ? 'perfil' : 'inicio')}>Mi panel</button>
                <Link to="/" style={{ display: 'block', width: '100%', padding: '10px 16px', border: 'none', background: 'none', color: '#073f3d', fontWeight: '600', fontSize: '14px', textAlign: 'left', cursor: 'pointer', textDecoration: 'none' }}>Volver al sitio</Link>
                <button onClick={salir}>Cerrar sesión</button>
              </div>
            )}
          </div>
        </header>
        <main className="dashboard-content">
          <div className="dashboard-heading">
            <div>
              <h2>{titulo}</h2>
              <p>{descripcion}</p>
            </div>
            {actual !== 'inicio' && (
              <button
                className="secondary-button"
                onClick={() => cambiar('inicio')}
                style={{ marginTop: '8px', fontSize: '0.85em' }}
              >
                ← Volver al resumen
              </button>
            )}
          </div>
          {children}
        </main>
      </section>
    </div>
  )
}
