import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Input } from '../components/Input'
import { Button } from '../components/Button'
import { useToast } from '../components/Toast'

export const RecoverPassword = () => {
  const [correo, setCorreo] = useState('')
  const [error, setError] = useState('')
  const [enviado, setEnviado] = useState(false)
  const { mostrarToast } = useToast()

  const validarCorreo = (valor) => {
    if (!valor) return 'El correo es obligatorio'

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor)) {
      return 'El correo no tiene un formato válido'
    }

    return ''
  }

  const manejarCambio = (e) => {
    setCorreo(e.target.value)
    setError(validarCorreo(e.target.value))
    setEnviado(false)
  }

  const manejarSubmit = (e) => {
    e.preventDefault()

    const errorActual = validarCorreo(correo)

    setError(errorActual)

    if (!errorActual) {
      setEnviado(true)

      console.log('Recuperando contraseña para:', correo)
      mostrarToast('Si el correo existe, te enviaremos instrucciones para recuperar tu contraseña.')
    }
  }

  return (
    <main className="w-full min-h-[calc(100vh-88px)] bg-gradient-to-br from-teal-800 via-teal-800 to-teal-900 flex items-center justify-center px-6 py-12">

      <div className="w-full max-w-md">

        {/* ==================== FORMULARIO ==================== */}

        <form
          onSubmit={manejarSubmit}
          className="
            bg-white
            rounded-3xl
            shadow-2xl
            p-7
            md:p-9
            border
            border-white/20
          "
        >

          {/* Logo y título */}
          <div className="text-center mb-7">

            <div
              className="
                w-16
                h-16
                rounded-2xl
                bg-teal-800
                flex
                items-center
                justify-center
                mx-auto
                mb-4
                shadow-md
              "
            >
              <span className="text-2xl font-bold text-amber-400">
                H
              </span>
            </div>

            <h1 className="text-2xl md:text-3xl font-bold text-teal-900">
              Recuperar contraseña
            </h1>

            <p className="text-sm text-gray-500 mt-2 leading-relaxed max-w-sm mx-auto">
              Ingresa tu correo electrónico y te enviaremos las instrucciones
              para restablecer tu contraseña.
            </p>

          </div>


          {/* Separador */}
          <div className="flex items-center gap-3 mb-6">

            <div className="h-px bg-gray-200 flex-1" />

            <span className="text-xs text-gray-400 uppercase tracking-wider">
              Recuperación
            </span>

            <div className="h-px bg-gray-200 flex-1" />

          </div>


          {/* Correo */}
          <Input
            label="Correo electrónico"
            type="email"
            name="correo"
            value={correo}
            onChange={manejarCambio}
            error={error}
            placeholder="tucorreo@ejemplo.com"
            maxLength={50}
          />


          {/* Mensaje de confirmación */}
          {enviado && (
            <div className="
              flex
              items-start
              gap-3
              text-teal-800
              bg-teal-50
              border
              border-teal-200
              rounded-xl
              text-sm
              mb-5
              p-4
            ">

              <span className="text-teal-600 text-lg">
                ✓
              </span>

              <p className="m-0 leading-relaxed">
                Si el correo existe, recibirás las instrucciones en breve.
              </p>

            </div>
          )}


          {/* Botón */}
          <Button type="submit">
            Recuperar contraseña
          </Button>


          {/* Volver al Login */}
          <div className="flex items-center gap-3 my-6">

            <div className="h-px bg-gray-200 flex-1" />

            <span className="text-xs text-gray-400">
              ¿Ya tienes acceso?
            </span>

            <div className="h-px bg-gray-200 flex-1" />

          </div>


          <p className="text-center text-sm text-gray-500 m-0">

            <Link
              to="/login"
              className="
                text-teal-700
                hover:text-amber-600
                font-semibold
                no-underline
                transition-colors
              "
            >
              Volver al inicio de sesión
            </Link>

          </p>

        </form>


        {/* Texto inferior */}
        <p className="text-center text-xs text-teal-200 mt-6">
          Horizonte Viajes · Tu próxima aventura comienza aquí
        </p>

      </div>

    </main>
  )
}