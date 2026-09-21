import React, { createContext, useContext, useEffect, useState } from 'react'

const AuthContext = createContext(null)
export const API_URL = import.meta.env.VITE_API_URL || '/api'

export const AuthProvider = ({ children }) => {
  const [usuario, setUsuario] = useState(null)
  const [token, setToken] = useState(null)
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    const tokenGuardado = localStorage.getItem('hv_token')
    const usuarioGuardado = localStorage.getItem('hv_usuario')

    if (!tokenGuardado) {
      setCargando(false)
      return
    }

    const restaurarSesion = async () => {
      try {
        const respuesta = await fetch(`${API_URL}/perfil`, {
          headers: { Authorization: `Bearer ${tokenGuardado}` },
        })

        if (!respuesta.ok) throw new Error('Sesión inválida')
        const datos = await respuesta.json()
        const usuarioActual = datos.usuario

        localStorage.setItem('hv_token', tokenGuardado)
        localStorage.setItem('hv_usuario', JSON.stringify(usuarioActual))
        setToken(tokenGuardado)
        setUsuario(usuarioActual)
      } catch {
        localStorage.removeItem('hv_token')
        localStorage.removeItem('hv_usuario')
      } finally {
        setCargando(false)
      }
    }

    // Si existe información local, se usa como estado inicial mientras se valida
    // el token realmente contra FastAPI.
    if (usuarioGuardado) {
      try { setUsuario(JSON.parse(usuarioGuardado)) } catch { /* limpiar abajo */ }
    }
    setToken(tokenGuardado)
    restaurarSesion()
  }, [])

  const iniciarSesion = (nuevoToken, nuevoUsuario) => {
    localStorage.setItem('hv_token', nuevoToken)
    localStorage.setItem('hv_usuario', JSON.stringify(nuevoUsuario))
    setToken(nuevoToken)
    setUsuario(nuevoUsuario)
  }

  const cerrarSesion = () => {
    localStorage.removeItem('hv_token')
    localStorage.removeItem('hv_usuario')
    setToken(null)
    setUsuario(null)
  }

  return (
    <AuthContext.Provider value={{ usuario, token, cargando, iniciarSesion, cerrarSesion }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
