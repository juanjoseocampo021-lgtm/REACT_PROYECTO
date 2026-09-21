import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

// Envuelve una página y solo la muestra si:
// 1. Hay un usuario con sesión iniciada
// 2. (Opcional) el rol del usuario está dentro de "rolesPermitidos"
//
// Uso: <RutaProtegida rolesPermitidos={['administrador']}><PanelAdmin /></RutaProtegida>
export const RutaProtegida = ({ children, rolesPermitidos }) => {
  const { usuario, cargando } = useAuth()

  if (cargando) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center text-gray-400">
        Cargando...
      </div>
    )
  }

  if (!usuario) {
    return <Navigate to="/login" replace />
  }

  if (rolesPermitidos && !rolesPermitidos.includes(usuario.rol)) {
    return <Navigate to="/" replace />
  }

  return children
}
