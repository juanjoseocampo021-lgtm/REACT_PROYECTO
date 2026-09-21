import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Carrusel } from '../components/Carrusel'
import { ReservaModal } from '../components/ReservaModal'
import { API_URL } from '../context/AuthContext'
import { formatearPrecio } from '../lib_api'

const MEDIA_BASE = API_URL.replace(/\/api\/?$/, '')
const mediaUrl = (url) => url && url.startsWith('/') ? `${MEDIA_BASE}${url}` : url

const razones = [
  { icono: '✦', titulo: 'Destinos seleccionados', texto: 'Elegimos experiencias que combinan naturaleza, descanso y aventura.' },
  { icono: '⌁', titulo: 'Acompañamiento cercano', texto: 'Te ayudamos a resolver dudas antes de reservar y durante la planificación.' },
  { icono: '◈', titulo: 'Experiencias claras', texto: 'Conoce el destino, el precio y los detalles antes de tomar una decisión.' },
]

export const Index = () => {
  const [productos, setProductos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [productoSeleccionado, setProductoSeleccionado] = useState(null)

  useEffect(() => {
    fetch(`${API_URL}/productos`)
      .then((res) => res.json())
      .then((datos) => setProductos(datos.filter((p) => p.estado === 'activo')))
      .catch(() => setProductos([]))
      .finally(() => setCargando(false))
  }, [])

  return (
    <main className="bg-white">
      <Carrusel productos={productos} onReservar={setProductoSeleccionado} />

      <section className="px-6 py-16 md:py-20">
        <div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-[1.1fr_0.9fr] md:items-center">
          <div>
            <span className="inline-flex items-center gap-3 text-xs font-bold uppercase tracking-[0.2em] text-amber-500">
              <span className="h-px w-9 bg-amber-400" /> Horizonte Viajes
            </span>
            <h2 className="mt-4 text-3xl font-bold leading-tight text-teal-900 md:text-5xl">Viajes que comienzan mucho antes de llegar al destino.</h2>
            <p className="mt-5 max-w-2xl text-base leading-8 text-gray-600 md:text-lg">
              Descubre lugares, conoce sus paisajes y encuentra una experiencia que se adapte a lo que quieres vivir. Nuestra página está pensada para que puedas explorar primero y reservar después.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <a href="#paquetes" className="rounded-full bg-amber-500 px-6 py-3 text-sm font-bold text-teal-950 no-underline transition hover:bg-amber-400">Explorar paquetes</a>
              <Link to="/contacto" className="rounded-full border border-teal-200 px-6 py-3 text-sm font-semibold text-teal-800 no-underline transition hover:border-teal-500">Hablar con nosotros</Link>
            </div>
          </div>

          <div className="rounded-3xl bg-teal-50 p-7 md:p-9">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-500">Una forma sencilla de viajar</p>
            <div className="mt-6 space-y-5">
              {['Elige un destino', 'Conoce la experiencia', 'Reserva cuando estés listo'].map((paso, i) => (
                <div key={paso} className="flex items-center gap-4">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-teal-800 text-sm font-bold text-white">0{i + 1}</span>
                  <span className="font-semibold text-teal-900">{paso}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="paquetes" className="bg-gray-50 px-6 py-16 md:py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mb-10 flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-amber-500">Experiencias destacadas</span>
              <h2 className="mt-2 text-3xl font-bold text-teal-900">Elige tu próxima escapada</h2>
              <p className="mt-3 max-w-2xl text-gray-500">Cada paquete tiene su propia historia, paisaje y forma de disfrutarlo.</p>
            </div>
            <span className="text-sm font-medium text-teal-700">{productos.length} experiencias disponibles</span>
          </div>

          {cargando && <p className="text-center text-gray-400">Cargando experiencias...</p>}
          {!cargando && productos.length === 0 && <p className="rounded-2xl bg-white p-8 text-center text-gray-400">Todavía no hay paquetes publicados.</p>}

          <div className="grid gap-7 md:grid-cols-2">
            {productos.map((producto) => (
              <article key={producto.id} className="group overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
                <div className="relative h-64 overflow-hidden bg-teal-50">
                  {producto.imagen_url ? <img src={mediaUrl(producto.imagen_url)} alt={producto.nombre} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" /> : <div className="flex h-full items-center justify-center text-5xl text-teal-200">🏞</div>}
                  <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/60 to-transparent" />
                  <span className="absolute bottom-4 left-5 rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-teal-800">Experiencia Horizonte</span>
                </div>
                <div className="p-6 md:p-7">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-xl font-bold text-teal-900">{producto.nombre.replace(/^Paquete\s*/i, '')}</h3>
                      <p className="mt-2 text-sm leading-6 text-gray-500">{producto.descripcion}</p>
                    </div>
                    <span className="shrink-0 text-lg font-bold text-teal-700">{formatearPrecio(producto.precio)}</span>
                  </div>
                  <div className="mt-6 flex flex-wrap gap-3">
                    <Link to={`/destino/${producto.id}`} className="rounded-full bg-teal-800 px-5 py-2.5 text-sm font-semibold text-white no-underline transition hover:bg-teal-700">Conocer el viaje</Link>
                    <button type="button" onClick={() => setProductoSeleccionado(producto)} className="rounded-full bg-amber-500 px-5 py-2.5 text-sm font-bold text-teal-950 transition hover:bg-amber-400">Reservar</button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-16 md:py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mb-10 text-center">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-amber-500">Nuestra esencia</span>
            <h2 className="mt-2 text-3xl font-bold text-teal-900">¿Por qué viajar con Horizonte?</h2>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {razones.map((razon) => (
              <div key={razon.titulo} className="rounded-3xl border border-teal-100 bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-100 text-xl font-bold text-teal-800">{razon.icono}</div>
                <h3 className="mt-5 text-lg font-bold text-teal-900">{razon.titulo}</h3>
                <p className="mt-2 text-sm leading-6 text-gray-500">{razon.texto}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <ReservaModal item={productoSeleccionado} tipo="producto" abierto={!!productoSeleccionado} onClose={() => setProductoSeleccionado(null)} />
    </main>
  )
}
