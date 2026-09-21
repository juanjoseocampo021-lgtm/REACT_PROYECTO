import { API_URL } from './context/AuthContext'

export const obtenerJson = async (ruta, opciones = {}) => {
  const respuesta = await fetch(`${API_URL}${ruta}`, opciones)
  const datos = await respuesta.json().catch(() => ({}))
  if (!respuesta.ok) {
    throw new Error(datos.mensaje || 'No se pudo completar la solicitud')
  }
  return datos
}

export const formatearPrecio = (valor) =>
  Number(valor || 0).toLocaleString('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  })
