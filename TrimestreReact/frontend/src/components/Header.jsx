import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import logo from '../assets/horizonte-logo.svg'
import { useAuth } from '../context/AuthContext'

export const Header = () => {
  const { usuario, cerrarSesion } = useAuth()
  const [menuAbierto, setMenuAbierto] = useState(false)
  const [menuUsuario, setMenuUsuario] = useState(false)

  const manejarCerrarSesion = () => {
    cerrarSesion()
    setMenuUsuario(false)
    setMenuAbierto(false)
  }

  const rutaPanel =
    usuario?.rol === 'administrador'
      ? '/panel-admin'
      : usuario?.rol === 'empleado'
        ? '/panel-empleado'
        : '/panel-cliente'

  const nombreCompleto = usuario
    ? `${usuario.nombre || ''} ${usuario.apellido || ''}`.trim()
    : ''

  const inicial = usuario?.nombre?.charAt(0)?.toUpperCase() || 'H'

  const nombreRol =
    usuario?.rol === 'administrador'
      ? 'Administrador'
      : usuario?.rol === 'empleado'
        ? 'Empleado'
        : 'Cliente'

  const cerrarMenus = () => {
    setMenuAbierto(false)
    setMenuUsuario(false)
  }

  return (
    <header className="sticky top-0 z-50 bg-teal-800 shadow-lg">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">

        <div className="flex min-h-20 items-center justify-between gap-5">

          {/* LOGO */}
          <Link
            to="/"
            onClick={cerrarMenus}
            className="shrink-0 no-underline"
          >
            <img
              src={logo}
              alt="Horizonte Viajes"
              className="h-[68px] w-auto object-contain drop-shadow-md transition-transform duration-300 hover:scale-105"
            />
          </Link>

          {/* NAVEGACIÓN */}
          <nav
            className={`
              ${menuAbierto
                ? 'absolute left-0 right-0 top-20 block border-t border-teal-700 bg-teal-800 px-5 pb-5 shadow-xl'
                : 'hidden'
              }
              md:static md:block md:border-0 md:bg-transparent md:p-0 md:shadow-none
            `}
          >
            <ul className="flex flex-col gap-1 md:flex-row md:items-center md:gap-7">

              {[
                ['/', 'Inicio'],
                ['/quienes', 'Quiénes Somos'],
                ['/servicios', 'Servicios'],
                ['/destinos', 'Destinos'],
                ['/contacto', 'Contacto'],
              ].map(([ruta, texto]) => (
                <li key={ruta}>
                  <Link
                    to={ruta}
                    onClick={cerrarMenus}
                    className="
                      block rounded-lg
                      px-3 py-2
                      text-sm font-medium
                      text-teal-50
                      no-underline
                      transition-colors
                      hover:bg-teal-700
                      hover:text-amber-400
                      md:px-0
                      md:hover:bg-transparent
                    "
                  >
                    {texto}
                  </Link>
                </li>
              ))}

            </ul>
          </nav>

          {/* USUARIO */}
          <div className="hidden items-center md:flex">

            {usuario ? (

              <div className="relative">

                {/* BOTÓN USUARIO */}
                <button
                  type="button"
                  onClick={() => setMenuUsuario(!menuUsuario)}
                  className="
                    flex items-center gap-3
                    rounded-full
                    px-2 py-1.5
                    text-left
                    transition-colors
                    hover:bg-teal-700
                  "
                  aria-expanded={menuUsuario}
                >

                  {/* AVATAR */}
                  <span
                    className="
                      flex h-11 w-11
                      items-center justify-center
                      rounded-full
                      bg-teal-100
                      text-base font-bold
                      text-teal-800
                    "
                  >
                    {inicial}
                  </span>

                  {/* NOMBRE */}
                  <span className="flex flex-col leading-tight">
                    <strong className="max-w-[160px] truncate text-sm font-semibold text-teal-50">
                      {nombreCompleto || usuario.nombre}
                    </strong>

                    <small className="mt-1 text-xs text-teal-200">
                      {nombreRol}
                    </small>
                  </span>

                  {/* FLECHA */}
                  <span
                    className={`
                      ml-1 text-lg text-teal-100
                      transition-transform duration-200
                      ${menuUsuario ? 'rotate-180' : ''}
                    `}
                  >
                    ⌄
                  </span>

                </button>

                {/* MENÚ DESPLEGABLE */}
                {menuUsuario && (
                  <div
                    className="
                      absolute right-0 top-[calc(100%+10px)]
                      w-[245px]
                      overflow-hidden
                      rounded-2xl
                      border border-teal-700
                      bg-teal-800
                      shadow-2xl
                    "
                  >

                    {/* CABECERA */}
                    <div className="border-b border-teal-700 px-5 py-4">

                      <div className="flex items-center gap-3">

                        <span
                          className="
                            flex h-11 w-11
                            shrink-0
                            items-center justify-center
                            rounded-full
                            bg-teal-100
                            font-bold
                            text-teal-800
                          "
                        >
                          {inicial}
                        </span>

                        <div className="min-w-0">

                          <p className="truncate text-sm font-bold text-teal-50">
                            {nombreCompleto || usuario.nombre}
                          </p>

                          <p className="mt-1 text-xs text-teal-200">
                            {nombreRol}
                          </p>

                        </div>

                      </div>

                    </div>

                    {/* OPCIONES */}
                    <div className="p-2">

                      {/* MI PANEL */}
                      <Link
                        to={rutaPanel}
                        onClick={() => setMenuUsuario(false)}
                        className="
                          flex items-center gap-3
                          rounded-xl
                          px-4 py-3
                          text-sm font-medium
                          text-teal-50
                          no-underline
                          transition-colors
                          hover:bg-teal-700
                          hover:text-amber-400
                        "
                      >

                        <span className="text-lg">
                          ⌂
                        </span>

                        <span>
                          Mi panel
                        </span>

                      </Link>

                      {/* CERRAR SESIÓN */}
                      <button
                        type="button"
                        onClick={manejarCerrarSesion}
                        className="
                          flex w-full items-center gap-3
                          rounded-xl
                          px-4 py-3
                          text-left
                          text-sm font-medium
                          text-teal-50
                          transition-colors
                          hover:bg-teal-700
                          hover:text-amber-400
                        "
                      >

                        <span className="text-lg">
                          ⇥
                        </span>

                        <span>
                          Cerrar sesión
                        </span>

                      </button>

                    </div>

                  </div>
                )}

              </div>

            ) : (

              /* NO AUTENTICADO */
              <Link
                to="/login"
                className="
                  rounded-full
                  bg-amber-500
                  px-5 py-2.5
                  text-sm font-semibold
                  text-teal-950
                  no-underline
                  shadow-md
                  transition-all
                  hover:-translate-y-0.5
                  hover:bg-amber-400
                "
              >
                Iniciar sesión
              </Link>

            )}

          </div>

          {/* MENÚ MÓVIL */}
          <button
            type="button"
            aria-label="Abrir menú"
            aria-expanded={menuAbierto}
            onClick={() => {
              setMenuAbierto(!menuAbierto)
              setMenuUsuario(false)
            }}
            className="
              rounded-lg
              border border-teal-600
              p-2
              text-teal-50
              md:hidden
            "
          >
            <span className="text-xl">
              {menuAbierto ? '✕' : '☰'}
            </span>
          </button>

        </div>

        {/* CONTENIDO MÓVIL */}
        {menuAbierto && (
          <div className="pb-4 md:hidden">

            {usuario ? (

              <div className="mt-3 border-t border-teal-700 pt-4">

                <div className="mb-3 flex items-center gap-3">

                  <span
                    className="
                      flex h-11 w-11
                      items-center justify-center
                      rounded-full
                      bg-teal-100
                      font-bold
                      text-teal-800
                    "
                  >
                    {inicial}
                  </span>

                  <div>

                    <p className="text-sm font-semibold text-teal-50">
                      {nombreCompleto || usuario.nombre}
                    </p>

                    <p className="text-xs text-teal-200">
                      {nombreRol}
                    </p>

                  </div>

                </div>

                {/* MI PANEL */}
                <Link
                  to={rutaPanel}
                  onClick={cerrarMenus}
                  className="
                    mb-2 block
                    rounded-xl
                    bg-teal-700
                    px-4 py-3
                    text-sm font-medium
                    text-teal-50
                    no-underline
                  "
                >
                  ⌂ &nbsp; Mi panel
                </Link>

                {/* CERRAR SESIÓN */}
                <button
                  type="button"
                  onClick={manejarCerrarSesion}
                  className="
                    w-full
                    rounded-xl
                    px-4 py-3
                    text-left
                    text-sm font-medium
                    text-teal-50
                    hover:bg-teal-700
                    hover:text-amber-400
                  "
                >
                  ⇥ &nbsp; Cerrar sesión
                </button>

              </div>

            ) : (

              <Link
                to="/login"
                onClick={cerrarMenus}
                className="
                  mt-2
                  block
                  rounded-full
                  bg-amber-500
                  px-5 py-2.5
                  text-center
                  text-sm font-semibold
                  text-teal-950
                  no-underline
                "
              >
                Iniciar sesión
              </Link>

            )}

          </div>
        )}

      </div>

      {/* LÍNEA AMARILLA DE LA MARCA */}
      <div className="h-[2px] bg-amber-400/60" />

    </header>
  )
}