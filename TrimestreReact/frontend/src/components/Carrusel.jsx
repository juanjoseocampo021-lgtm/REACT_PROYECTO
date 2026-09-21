import React, { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import slide01 from '../assets/images/slide-01.jpg.png'
import slide02 from '../assets/images/slide-02.jpg.png'
import slide03 from '../assets/images/slide-03.jpg.png'
import slide04 from '../assets/images/slide-04.jpg.png'
import slide05 from '../assets/images/slide-05.jpg.png'
import slide06 from '../assets/images/slide-06.jpg.png'
import slide07 from '../assets/images/slide-07.jpg.png'
import slide08 from '../assets/images/slide-08.jpg.png'
import slide09 from '../assets/images/slide-09.jpg.png'
import slide10 from '../assets/images/slide-10.jpg.png'


const imagenes = [
  { src: slide01, titulo: 'Cascada de Otoño', descripcion: 'Un recorrido entre montaña, agua y naturaleza para desconectarte de la rutina.' },
  { src: slide02, titulo: 'Sendero hacia la Cascada', descripcion: 'Caminos rodeados de vegetación y paisajes pensados para los amantes de la aventura.' },
  { src: slide03, titulo: 'Peñasco junto al Lago', descripcion: 'Paisajes tranquilos donde la naturaleza se convierte en el destino.' },
  { src: slide04, titulo: 'Atardecer en el Lago', descripcion: 'Una experiencia para contemplar el paisaje y guardar el momento.' },
  { src: slide05, titulo: 'Cascada de Montaña', descripcion: 'Naturaleza, aire libre y una ruta para vivir algo diferente.' },
  { src: slide06, titulo: 'Cerezo Solitario', descripcion: 'Un rincón sereno para disfrutar de un viaje pausado y especial.' },
  { src: slide07, titulo: 'Campo de Flores', descripcion: 'Color, tranquilidad y espacios abiertos para una escapada memorable.' },
  { src: slide08, titulo: 'Palmeras Gigantes', descripcion: 'Descubre escenarios tropicales y experiencias llenas de vida.' },
  { src: slide09, titulo: 'Río entre Montañas', descripcion: 'Una invitación a explorar senderos, ríos y paisajes naturales.' },
  { src: slide10, titulo: 'Cabañas frente al Mar', descripcion: 'Descanso, mar y una experiencia pensada para disfrutar sin prisa.' },
]

export const Carrusel = ({ productos = [], onReservar }) => {
  const [indiceActual, setIndiceActual] = useState(0)
  const [pausado, setPausado] = useState(false)
  const actual = imagenes[indiceActual]

  const paqueteRelacionado = useMemo(() => {
    const titulo = actual.titulo.toLowerCase()
    return productos.find((producto) => {
      const nombre = producto.nombre.toLowerCase()
      return nombre.includes(titulo) || titulo.includes(nombre.replace('paquete ', ''))
    })
  }, [actual.titulo, productos])

  useEffect(() => {
    if (pausado) return undefined
    const intervalo = setInterval(() => {
      setIndiceActual((actual) => (actual + 1) % imagenes.length)
    }, 6500)
    return () => clearInterval(intervalo)
  }, [pausado])

  const anterior = () => setIndiceActual((indiceActual - 1 + imagenes.length) % imagenes.length)
  const siguiente = () => setIndiceActual((indiceActual + 1) % imagenes.length)

  return (
    <section className="relative w-full overflow-hidden bg-teal-950" onMouseEnter={() => setPausado(true)} onMouseLeave={() => setPausado(false)}>
      <div className="relative h-[68vh] min-h-[520px] max-h-[760px]">
        <img src={actual.src} alt={actual.titulo} className="absolute inset-0 h-full w-full object-cover transition-opacity duration-700" />
        <div className="absolute inset-0 bg-gradient-to-t from-teal-950/90 via-teal-950/35 to-black/10" />
        <div className="absolute inset-x-0 bottom-0 px-6 pb-16 md:px-14 lg:px-20">
          <div className="max-w-3xl text-white">
            <div className="mb-4 flex items-center gap-3 text-xs font-bold uppercase tracking-[0.22em] text-amber-300">
              <span className="h-px w-10 bg-amber-300" /> Destinos Horizonte
            </div>
            <p className="mb-2 text-sm font-medium text-teal-100">{String(indiceActual + 1).padStart(2, '0')} / {String(imagenes.length).padStart(2, '0')}</p>
            <h1 className="text-4xl font-bold leading-tight drop-shadow-lg md:text-6xl">{actual.titulo}</h1>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-teal-50 md:text-lg">{actual.descripcion}</p>
            <div className="mt-6 flex flex-wrap gap-3">
              {paqueteRelacionado && onReservar ? (
                <button type="button" onClick={() => onReservar(paqueteRelacionado)} className="rounded-full bg-amber-500 px-6 py-3 text-sm font-bold text-teal-950 shadow-lg transition-all hover:-translate-y-0.5 hover:bg-amber-400">
                  Reservar este viaje · ${Number(paqueteRelacionado.precio).toLocaleString('es-CO')}
                </button>
              ) : (
                <Link to="/servicios" className="rounded-full bg-amber-500 px-6 py-3 text-sm font-bold text-teal-950 no-underline shadow-lg transition-all hover:-translate-y-0.5 hover:bg-amber-400">
                  Ver experiencias
                </Link>
              )}
              {paqueteRelacionado && <Link to={`/destino/${paqueteRelacionado.id}`} className="rounded-full border border-white/60 bg-white/10 px-6 py-3 text-sm font-semibold text-white no-underline backdrop-blur-sm transition-colors hover:bg-white/20">Conocer el viaje</Link>}
            </div>
          </div>
        </div>

        <button type="button" onClick={anterior} aria-label="Imagen anterior" className="absolute left-4 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/25 text-2xl text-white backdrop-blur-sm transition-colors hover:bg-amber-500">‹</button>
        <button type="button" onClick={siguiente} aria-label="Imagen siguiente" className="absolute right-4 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/25 text-2xl text-white backdrop-blur-sm transition-colors hover:bg-amber-500">›</button>

        <div className="absolute bottom-5 left-1/2 flex -translate-x-1/2 gap-1.5 rounded-full bg-black/20 px-3 py-2 backdrop-blur-sm">
          {imagenes.map((imagen, i) => (
            <button key={imagen.titulo} type="button" onClick={() => setIndiceActual(i)} aria-label={`Ir a ${imagen.titulo}`} className={`h-1.5 rounded-full transition-all ${i === indiceActual ? 'w-8 bg-amber-400' : 'w-2 bg-white/50 hover:bg-white/80'}`} />
          ))}
        </div>
      </div>
    </section>
  )
}
