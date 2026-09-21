import React, { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { API_URL } from '../context/AuthContext'
import { ReservaModal } from '../components/ReservaModal'
import { formatearPrecio } from '../lib_api'

const MEDIA_BASE = API_URL.replace(/\/api\/?$/, '')

const mediaUrl = (url) => {
  if (!url) return ''
  return url.startsWith('/') ? `${MEDIA_BASE}${url}` : url
}

export const Destino = () => {
  const { id } = useParams()
  const [producto, setProducto] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [reservaAbierta, setReservaAbierta] = useState(false)

  useEffect(() => {
    fetch(`${API_URL}/productos/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error()
        return res.json()
      })
      .then(setProducto)
      .catch(() => setProducto(null))
      .finally(() => setCargando(false))
  }, [id])

  if (cargando) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-gray-400">
        Cargando destino...
      </div>
    )
  }

  if (!producto) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
        <h1 className="text-2xl font-bold text-teal-900">Destino no encontrado</h1>
        <Link
          to="/destinos"
          className="mt-5 rounded-full bg-amber-500 px-5 py-2.5 font-semibold text-teal-950 no-underline"
        >
          Volver a destinos
        </Link>
      </div>
    )
  }

  const puntos = (producto.que_puedes_esperar || '')
    .split('\n')
    .map((punto) => punto.trim())
    .filter(Boolean)

  const imagen = mediaUrl(producto.imagen_url)
  const descripcionDetallada = producto.descripcion_detallada?.trim() || producto.descripcion || 'Conoce todos los detalles de esta experiencia antes de reservar.'
  const duracion = producto.duracion?.trim() || 'Por definir'
  const tipoExperiencia = producto.tipo_experiencia?.trim() || 'Experiencia turística'

  return (
    <main className="bg-white">
      <section className="relative h-[55vh] min-h-[430px] overflow-hidden bg-teal-950">
        {imagen ? (
          <img
            src={imagen}
            alt={producto.nombre}
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-teal-800 to-teal-950">
            <span className="text-7xl text-white/20">✈</span>
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-teal-950/90 via-teal-950/25 to-transparent" />

        <div className="absolute inset-x-0 bottom-0 mx-auto max-w-6xl px-6 pb-12">
          <span className="rounded-full bg-amber-400 px-3 py-1 text-xs font-bold uppercase tracking-wider text-teal-950">
            {producto.region || 'Destino Horizonte'}
          </span>

          <h1 className="mt-4 max-w-3xl text-4xl font-bold text-white md:text-6xl">
            {producto.nombre.replace(/^Paquete\s*/i, '')}
          </h1>

          {producto.descripcion && (
            <p className="mt-3 max-w-2xl text-teal-100 md:text-lg">
              {producto.descripcion}
            </p>
          )}
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-10 px-6 py-14 md:grid-cols-[1.2fr_0.8fr] md:py-20">
        <div>
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-amber-500">
            La experiencia
          </span>

          <h2 className="mt-3 text-3xl font-bold text-teal-900">
            Conoce tu próximo viaje
          </h2>

          <p className="mt-5 text-base leading-8 text-gray-600">
            {descripcionDetallada}
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl bg-teal-50 p-5">
              <p className="text-xs uppercase tracking-wider text-teal-600">
                Duración
              </p>
              <p className="mt-2 font-bold text-teal-900">
                {duracion}
              </p>
            </div>

            <div className="rounded-2xl bg-teal-50 p-5">
              <p className="text-xs uppercase tracking-wider text-teal-600">
                Tipo
              </p>
              <p className="mt-2 font-bold text-teal-900">
                {tipoExperiencia}
              </p>
            </div>

            <div className="rounded-2xl bg-teal-50 p-5">
              <p className="text-xs uppercase tracking-wider text-teal-600">
                Estado
              </p>
              <p className="mt-2 font-bold text-teal-900">
                {producto.estado === 'activo' ? 'Disponible' : 'No disponible'}
              </p>
            </div>
          </div>

          {puntos.length > 0 && (
            <>
              <h3 className="mt-10 text-xl font-bold text-teal-900">
                ¿Qué puedes esperar?
              </h3>

              <ul className="mt-4 space-y-3 text-gray-600">
                {puntos.map((punto, indice) => (
                  <li key={`${punto}-${indice}`} className="flex gap-3">
                    <span className="font-bold text-amber-500">✓</span>
                    <span>{punto}</span>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>

        <aside className="h-fit rounded-3xl border border-teal-100 bg-white p-7 shadow-xl md:sticky md:top-28">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-500">
            Precio por persona
          </p>

          <p className="mt-2 text-3xl font-bold text-teal-900">
            {formatearPrecio(producto.precio)}
          </p>

          <div className="my-5 h-px bg-gray-100" />

          <p className="text-sm leading-6 text-gray-500">
            La reserva se registra como pendiente para que el equipo pueda revisar los detalles y confirmar tu viaje.
          </p>

          <button
            type="button"
            onClick={() => setReservaAbierta(true)}
            disabled={producto.estado !== 'activo'}
            className="mt-6 w-full rounded-full bg-amber-500 px-6 py-3 font-bold text-teal-950 transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {producto.estado === 'activo' ? 'Reservar este viaje' : 'Viaje no disponible'}
          </button>

          <Link
            to="/contacto"
            className="mt-3 block text-center text-sm font-semibold text-teal-700 no-underline hover:text-amber-600"
          >
            ¿Tienes preguntas? Contáctanos
          </Link>
        </aside>
      </section>

      <ReservaModal
        item={producto}
        tipo="producto"
        abierto={reservaAbierta}
        onClose={() => setReservaAbierta(false)}
      />
    </main>
  )
}
