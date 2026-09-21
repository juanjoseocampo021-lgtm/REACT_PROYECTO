import React from 'react'
import { Link } from 'react-router-dom'
import logo from '../assets/horizonte-logo.svg'

export const Footer = () => {
  return (
    <footer className="bg-teal-900 text-teal-100 mt-auto">

      {/* Línea decorativa */}
      <div className="h-[2px] bg-amber-400/60" />

      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-14">

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr] gap-10 lg:gap-8">

          {/* MARCA + DESCRIPCION + REDES */}
          <div className="flex flex-col items-center sm:items-start text-center sm:text-left">

            <Link to="/" className="no-underline group">
              <img
                src={logo}
                alt="Horizonte Viajes"
                className="w-[190px] h-auto object-contain transition-transform duration-300 group-hover:scale-105"
              />
            </Link>

            <p className="text-sm text-teal-300 mt-4 mb-5 leading-relaxed max-w-xs">
              Descubre nuevos destinos, vive nuevas experiencias. Tu proxima
              aventura empieza aqui.
            </p>

            {/* Redes sociales */}
            <div className="flex items-center gap-3">

              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="w-9 h-9 flex items-center justify-center rounded-full bg-teal-800 text-teal-200 hover:bg-amber-400 hover:text-teal-900 transition-colors duration-300"
              >
                <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
                  <path d="M22 12a10 10 0 1 0-11.56 9.88v-6.99H7.9V12h2.54V9.8c0-2.5 1.49-3.89 3.77-3.89 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.78l-.44 2.89h-2.34v6.99A10 10 0 0 0 22 12Z" />
                </svg>
              </a>

              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="w-9 h-9 flex items-center justify-center rounded-full bg-teal-800 text-teal-200 hover:bg-amber-400 hover:text-teal-900 transition-colors duration-300"
              >
                <svg viewBox="0 0 24 24" className="w-4 h-4 fill-none stroke-current stroke-2">
                  <rect x="3" y="3" width="18" height="18" rx="5" />
                  <circle cx="12" cy="12" r="4" />
                  <circle cx="17.5" cy="6.5" r="1" />
                </svg>
              </a>

              <a
                href="https://x.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="X (Twitter)"
                className="w-9 h-9 flex items-center justify-center rounded-full bg-teal-800 text-teal-200 hover:bg-amber-400 hover:text-teal-900 transition-colors duration-300"
              >
                <svg viewBox="0 0 24 24" className="w-4 h-4 fill-none stroke-current stroke-2">
                  <path d="M4 4l16 16M20 4L4 20" />
                </svg>
              </a>

            </div>

          </div>

          {/* NAVEGACION */}
          <div className="flex flex-col items-center sm:items-start">
            <h3 className="text-amber-400 text-sm font-semibold tracking-wide uppercase mb-4">
              Navegacion
            </h3>
            <ul className="flex flex-col items-center sm:items-start gap-2.5 list-none p-0 m-0">
              <li>
                <Link to="/" className="text-sm text-teal-200 no-underline hover:text-amber-400 transition-colors duration-300">
                  Inicio
                </Link>
              </li>
              <li>
                <Link to="/quienes" className="text-sm text-teal-200 no-underline hover:text-amber-400 transition-colors duration-300">
                  Quienes Somos
                </Link>
              </li>
              <li>
                <Link to="/contacto" className="text-sm text-teal-200 no-underline hover:text-amber-400 transition-colors duration-300">
                  Contacto
                </Link>
              </li>
            </ul>
          </div>

          {/* DESTINOS */}
          <div className="flex flex-col items-center sm:items-start">
            <h3 className="text-amber-400 text-sm font-semibold tracking-wide uppercase mb-4">
              Destinos
            </h3>
            <ul className="flex flex-col items-center sm:items-start gap-2.5 list-none p-0 m-0">
              {['Europa','Asia','América','Caribe'].map((region) => (
                <li key={region}>
                  <Link to={`/destinos?region=${encodeURIComponent(region)}`} className="text-sm text-teal-200 no-underline hover:text-amber-400 transition-colors duration-300">
                    {region}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* CONTACTO */}
          <div className="flex flex-col items-center sm:items-start">
            <h3 className="text-amber-400 text-sm font-semibold tracking-wide uppercase mb-4">
              Contacto
            </h3>
            <ul className="flex flex-col items-center sm:items-start gap-3 list-none p-0 m-0 text-sm text-teal-200">
              <li className="flex items-center gap-2">
                <svg viewBox="0 0 24 24" className="w-4 h-4 fill-none stroke-current stroke-2 shrink-0">
                  <path d="M3 6.5 12 13l9-6.5M4 5h16a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Z" />
                </svg>
                <span>contacto@horizonteviajes.com</span>
              </li>
              <li className="flex items-center gap-2">
                <svg viewBox="0 0 24 24" className="w-4 h-4 fill-none stroke-current stroke-2 shrink-0">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13 1 .36 1.98.68 2.93a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.15-1.25a2 2 0 0 1 2.11-.45c.95.32 1.93.55 2.93.68A2 2 0 0 1 22 16.92Z" />
                </svg>
                <span>+57 300 000 0000</span>
              </li>
              <li className="flex items-center gap-2">
                <svg viewBox="0 0 24 24" className="w-4 h-4 fill-none stroke-current stroke-2 shrink-0">
                  <path d="M12 22s7-6.5 7-12a7 7 0 1 0-14 0c0 5.5 7 12 7 12Z" />
                  <circle cx="12" cy="10" r="2.5" />
                </svg>
                <span>Medellin, Colombia</span>
              </li>
            </ul>
          </div>

        </div>


        {/* SEPARADOR */}
        <div className="border-t border-teal-700/70 mt-12 pt-6">

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">

            <p className="text-xs text-teal-400 m-0 text-center sm:text-left">
              &copy; 2026 Horizonte Viajes. Todos los derechos reservados.
            </p>

            <div className="flex items-center gap-5">
              <span className="text-xs text-teal-400 hover:text-amber-400 transition-colors duration-300 cursor-pointer">
                Terminos y condiciones
              </span>
              <span className="text-xs text-teal-400 hover:text-amber-400 transition-colors duration-300 cursor-pointer">
                Politica de privacidad
              </span>
            </div>

            <p className="text-xs text-teal-500 m-0 tracking-wide">
              Descubre &middot; Viaja &middot; Vive
            </p>

          </div>

        </div>

      </div>

    </footer>
  )
}