import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Input } from './Input'
import { Button } from './Button'
import { useAuth, API_URL } from '../context/AuthContext'
import { useToast } from './Toast'

// Modal genérico para reservar un producto o un servicio.
// Uso: <ReservaModal item={producto} tipo="producto" abierto={bool} onClose={fn} />
export const ReservaModal = ({ item, tipo, abierto, onClose }) => {
  const { usuario, token } = useAuth()
  const { mostrarToast } = useToast()
  const navigate = useNavigate()

  const manana = new Date()
  manana.setDate(manana.getDate() + 1)
  const fechaMinima = manana.toISOString().split('T')[0]

  const [fechaViaje, setFechaViaje] = useState('')
  const [personas, setPersonas] = useState(1)
  const [notas, setNotas] = useState('')
  const [error, setError] = useState('')
  const [enviando, setEnviando] = useState(false)

  if (!abierto || !item) return null

  const manejarSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!usuario) {
      mostrarToast('Debes iniciar sesión para reservar', 'error')
      onClose()
      navigate('/login')
      return
    }

    if (!fechaViaje) {
      setError('Selecciona una fecha para tu viaje')
      return
    }

    try {
      setEnviando(true)
      const respuesta = await fetch(`${API_URL}/reservas`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          tipo,
          itemId: item.id,
          fechaViaje,
          personas,
          notas,
        }),
      })

      const datos = await respuesta.json()

      if (!respuesta.ok) {
        setError(datos.mensaje || 'No se pudo crear la reserva')
        mostrarToast(datos.mensaje || 'No se pudo crear la reserva', 'error')
        return
      }

      mostrarToast('¡Reserva realizada con éxito! La revisaremos pronto.')
      setFechaViaje('')
      setPersonas(1)
      setNotas('')
      onClose()
    } catch (err) {
      console.error('Error al reservar:', err)
      mostrarToast('No se pudo conectar con el servidor', 'error')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-teal-950/70 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-amber-500">
              {tipo === 'producto' ? 'Paquete turístico' : 'Servicio'}
            </p>
            <h2 className="text-xl font-bold text-teal-900">{item.nombre}</h2>
            <p className="text-teal-700 font-semibold mt-1">
              ${Number(item.precio).toLocaleString('es-CO')}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-teal-700 text-2xl leading-none"
            aria-label="Cerrar"
          >
            &times;
          </button>
        </div>

        {!usuario && (
          <p className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-700">
            Debes iniciar sesión para poder reservar. Te llevaremos al login al confirmar.
          </p>
        )}

        {error && (
          <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
            {error}
          </p>
        )}

        <form onSubmit={manejarSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha del viaje</label>
            <input
              type="date"
              min={fechaMinima}
              value={fechaViaje}
              onChange={(e) => setFechaViaje(e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg outline-none focus:border-teal-600 transition-colors"
            />
          </div>

          <Input
            label="Número de personas"
            type="number"
            name="personas"
            value={personas}
            onChange={(e) => setPersonas(Number(e.target.value) || 1)}
          />

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Notas (opcional)</label>
            <textarea
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              maxLength={255}
              rows={3}
              placeholder="Ej: viajamos con niños, preferimos salida en la mañana..."
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg outline-none focus:border-teal-600 transition-colors resize-none"
            />
          </div>

          <Button type="submit" variant="accent">
            {enviando ? 'Reservando...' : 'Confirmar reserva'}
          </Button>
        </form>
      </div>
    </div>
  )
}
