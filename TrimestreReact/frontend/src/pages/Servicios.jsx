import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { API_URL } from '../context/AuthContext'

const MEDIA_BASE = API_URL.replace(/\/api\/?$/, '')

const obtenerImagen = (imagen) => {
  if (!imagen) return null

  if (
    imagen.startsWith('http://') ||
    imagen.startsWith('https://')
  ) {
    return imagen
  }

  if (imagen.startsWith('/')) {
    return `${MEDIA_BASE}${imagen}`
  }

  return `${MEDIA_BASE}/${imagen}`
}

export const Servicios = () => {
  const [servicios, setServicios] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const cargarServicios = async () => {
      try {
        setCargando(true)
        setError('')

        const respuesta = await fetch(
          `${API_URL}/servicios`
        )

        if (!respuesta.ok) {
          throw new Error(
            'No se pudieron cargar los servicios'
          )
        }

        const datos = await respuesta.json()

        setServicios(
          Array.isArray(datos)
            ? datos
            : datos.servicios || []
        )

      } catch (err) {
        console.error(
          'Error cargando servicios:',
          err
        )

        setError(
          'No fue posible cargar los servicios. Verifica que el servidor esté funcionando.'
        )

      } finally {
        setCargando(false)
      }
    }

    cargarServicios()
  }, [])

  return (
    <main className="min-h-screen bg-slate-50">

      {/* HERO */}
      <section
        className="
          bg-teal-800
          px-5
          py-14
          text-center
          sm:px-6
          lg:px-8
        "
      >
        <div className="mx-auto max-w-4xl">

          <span
            className="
              inline-block
              rounded-full
              bg-teal-700
              px-4
              py-1.5
              text-xs
              font-bold
              uppercase
              tracking-wider
              text-amber-300
            "
          >
            Horizonte Viajes
          </span>

          <h1
            className="
              mt-4
              text-3xl
              font-bold
              text-white
              sm:text-4xl
            "
          >
            Nuestros servicios
          </h1>

          <p
            className="
              mx-auto
              mt-4
              max-w-2xl
              text-sm
              leading-relaxed
              text-teal-100
              sm:text-base
            "
          >
            Todo lo que necesitas para disfrutar
            tu próxima aventura.
          </p>

        </div>
      </section>

      {/* CONTENIDO */}
      <section
        className="
          mx-auto
          max-w-7xl
          px-5
          py-12
          sm:px-6
          lg:px-8
        "
      >

        {/* CARGANDO */}
        {cargando && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">

            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="
                  overflow-hidden
                  rounded-2xl
                  border
                  border-gray-200
                  bg-white
                  shadow-sm
                "
              >
                <div
                  className="
                    h-48
                    animate-pulse
                    bg-gray-200
                  "
                />

                <div className="space-y-3 p-6">

                  <div
                    className="
                      h-6
                      w-2/3
                      animate-pulse
                      rounded
                      bg-gray-200
                    "
                  />

                  <div
                    className="
                      h-4
                      w-full
                      animate-pulse
                      rounded
                      bg-gray-200
                    "
                  />

                  <div
                    className="
                      h-4
                      w-4/5
                      animate-pulse
                      rounded
                      bg-gray-200
                    "
                  />

                </div>
              </div>
            ))}

          </div>
        )}

        {/* ERROR */}
        {!cargando && error && (
          <div
            className="
              mx-auto
              max-w-xl
              rounded-2xl
              border
              border-red-200
              bg-red-50
              px-6
              py-8
              text-center
            "
          >

            <div
              className="
                mx-auto
                mb-4
                flex
                h-12
                w-12
                items-center
                justify-center
                rounded-full
                bg-red-100
                text-xl
              "
            >
              !
            </div>

            <h2
              className="
                text-lg
                font-bold
                text-red-700
              "
            >
              No pudimos cargar los servicios
            </h2>

            <p
              className="
                mt-2
                text-sm
                text-red-600
              "
            >
              {error}
            </p>

          </div>
        )}

        {/* SIN SERVICIOS */}
        {!cargando &&
          !error &&
          servicios.length === 0 && (
            <div
              className="
                rounded-2xl
                border
                border-gray-200
                bg-white
                px-6
                py-12
                text-center
              "
            >

              <div className="text-4xl">
                ✈️
              </div>

              <h2
                className="
                  mt-4
                  text-xl
                  font-bold
                  text-teal-800
                "
              >
                Próximamente
              </h2>

              <p
                className="
                  mx-auto
                  mt-2
                  max-w-md
                  text-sm
                  text-gray-500
                "
              >
                Estamos preparando nuevos servicios
                para nuestros viajeros.
              </p>

            </div>
          )}

        {/* SERVICIOS */}
        {!cargando &&
          !error &&
          servicios.length > 0 && (
            <div
              className="
                grid
                gap-7
                sm:grid-cols-2
                lg:grid-cols-3
              "
            >

              {servicios.map((servicio) => {

                const imagen = obtenerImagen(
                  servicio.imagen
                )

                return (
                  <article
                    key={servicio.id}
                    className="
                      group
                      overflow-hidden
                      rounded-2xl
                      border
                      border-gray-200
                      bg-white
                      shadow-sm
                      transition-all
                      duration-300
                      hover:-translate-y-1
                      hover:shadow-xl
                    "
                  >

                    {/* IMAGEN */}
                    <div
                      className="
                        relative
                        h-52
                        overflow-hidden
                        bg-teal-100
                      "
                    >

                      {imagen ? (
                        <img
                          src={imagen}
                          alt={
                            servicio.nombre ||
                            'Servicio de Horizonte Viajes'
                          }
                          className="
                            h-full
                            w-full
                            object-cover
                            transition-transform
                            duration-500
                            group-hover:scale-105
                          "
                          onError={(e) => {
                            e.currentTarget.style.display =
                              'none'
                          }}
                        />
                      ) : (
                        <div
                          className="
                            flex
                            h-full
                            items-center
                            justify-center
                            bg-teal-700
                            text-5xl
                          "
                        >
                          ✈️
                        </div>
                      )}

                      {/* ETIQUETA */}
                      <div
                        className="
                          absolute
                          left-4
                          top-4
                          rounded-full
                          bg-white/95
                          px-3
                          py-1
                          text-xs
                          font-bold
                          text-teal-800
                          shadow-sm
                        "
                      >
                        Servicio
                      </div>

                    </div>

                    {/* INFORMACIÓN */}
                    <div className="p-6">

                      <h2
                        className="
                          text-xl
                          font-bold
                          text-teal-800
                        "
                      >
                        {servicio.nombre ||
                          'Servicio turístico'}
                      </h2>

                      <p
                        className="
                          mt-3
                          line-clamp-3
                          text-sm
                          leading-relaxed
                          text-gray-600
                        "
                      >
                        {servicio.descripcion ||
                          'Conoce nuestro servicio y descubre todo lo que Horizonte Viajes tiene para ofrecerte.'}
                      </p>

                      {/* PRECIO */}
                      {servicio.precio != null && (
                        <div
                          className="
                            mt-5
                            border-t
                            border-gray-100
                            pt-4
                          "
                        >

                          <span
                            className="
                              text-xs
                              font-medium
                              text-gray-500
                            "
                          >
                            Desde
                          </span>

                          <p
                            className="
                              mt-1
                              text-xl
                              font-bold
                              text-teal-800
                            "
                          >
                            $
                            {Number(
                              servicio.precio
                            ).toLocaleString(
                              'es-CO'
                            )}
                          </p>

                        </div>
                      )}

                    </div>

                  </article>
                )
              })}

            </div>
          )}

        {/* CONTACTO */}
        {!cargando && !error && (
          <div
            className="
              mt-12
              overflow-hidden
              rounded-2xl
              bg-teal-800
              px-6
              py-8
              text-center
              sm:px-10
            "
          >

            <h2
              className="
                text-2xl
                font-bold
                text-white
              "
            >
              ¿Necesitas algo especial?
            </h2>

            <p
              className="
                mx-auto
                mt-2
                max-w-xl
                text-sm
                text-teal-100
              "
            >
              Cuéntanos qué necesitas y te ayudaremos
              a encontrar la mejor opción.
            </p>

            <Link
              to="/contacto"
              className="
                mt-5
                inline-flex
                rounded-xl
                bg-amber-500
                px-6
                py-3
                text-sm
                font-bold
                text-teal-950
                no-underline
                transition-all
                hover:-translate-y-0.5
                hover:bg-amber-400
              "
            >
              Contáctanos
            </Link>

          </div>
        )}

      </section>

    </main>
  )
}