import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Input } from '../components/Input'
import { RegisterModal } from '../components/RegisterModal'
import { useAuth, API_URL } from '../context/AuthContext'
import { useToast } from '../components/Toast'
import logo from '../assets/horizonte-logo.svg'

export const Login = () => {
  const navigate = useNavigate()
  const { iniciarSesion } = useAuth()
  const { mostrarToast } = useToast()

  const [formulario, setFormulario] = useState({
    correo: '',
    contrasena: '',
    recordarme: false,
  })

  const [errores, setErrores] = useState({})
  const [errorServidor, setErrorServidor] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [modalAbierto, setModalAbierto] = useState(false)

  const validarCorreo = (valor) => {
    if (!valor) {
      return 'El correo es obligatorio'
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor)) {
      return 'El correo no tiene un formato válido'
    }

    return ''
  }

  const validarContrasena = (valor) => {
    if (!valor) {
      return 'La contraseña es obligatoria'
    }

    if (valor.length < 6) {
      return 'Debe tener al menos 6 caracteres'
    }

    return ''
  }

  const manejarCambio = (e) => {
    const { name, value, type, checked } = e.target

    const nuevoValor =
      type === 'checkbox'
        ? checked
        : value

    setFormulario((prev) => ({
      ...prev,
      [name]: nuevoValor,
    }))

    if (name === 'correo') {
      setErrores((prev) => ({
        ...prev,
        correo: validarCorreo(value),
      }))
    }

    if (name === 'contrasena') {
      setErrores((prev) => ({
        ...prev,
        contrasena: validarContrasena(value),
      }))
    }

    setErrorServidor('')
  }

  const manejarSubmit = async (e) => {
    e.preventDefault()

    const nuevosErrores = {
      correo: validarCorreo(formulario.correo),
      contrasena: validarContrasena(formulario.contrasena),
    }

    setErrores(nuevosErrores)
    setErrorServidor('')

    if (nuevosErrores.correo || nuevosErrores.contrasena) {
      return
    }

    try {
      setEnviando(true)

      const respuesta = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          correo: formulario.correo,
          contrasena: formulario.contrasena,
        }),
      })

      const datos = await respuesta.json()

      if (!respuesta.ok) {
        const mensaje =
          datos.mensaje ||
          datos.detail ||
          'No se pudo iniciar sesión'

        setErrorServidor(mensaje)
        mostrarToast(mensaje, 'error')

        return
      }

      iniciarSesion(
        datos.token,
        datos.usuario
      )

      mostrarToast(
        `¡Bienvenido, ${datos.usuario.nombre}!`
      )

      if (datos.usuario.rol === 'administrador') {
        navigate('/panel-admin')
      } else if (datos.usuario.rol === 'empleado') {
        navigate('/panel-empleado')
      } else {
        navigate('/panel-cliente')
      }

    } catch (error) {
      console.error(
        'Error al iniciar sesión:',
        error
      )

      const mensaje =
        'No se pudo conectar con el servidor. Verifica que el backend esté funcionando.'

      setErrorServidor(mensaje)

      mostrarToast(
        'No se pudo conectar con el servidor',
        'error'
      )

    } finally {
      setEnviando(false)
    }
  }

  return (
    <main
      className="
        min-h-[calc(100vh-82px)]
        bg-slate-50
        px-4
        py-10
        sm:px-6
        lg:px-8
      "
    >

      {/* CONTENEDOR PRINCIPAL */}
      <div className="mx-auto flex w-full max-w-md justify-center">

        {/* TARJETA */}
        <div
          className="
            w-full
            overflow-hidden
            rounded-3xl
            border
            border-gray-200
            bg-white
            shadow-xl
          "
        >

          {/* =========================
              CABECERA
          ========================== */}
          <div
            className="
              bg-teal-800
              px-7
              pb-7
              pt-8
              text-center
              sm:px-9
            "
          >

            {/* LOGO */}
            <div
              className="
                mx-auto
                mb-6
                flex
                h-[76px]
                w-[190px]
                items-center
                justify-center
                rounded-xl
                bg-white
                px-5
                py-3
                shadow-md
              "
            >
              <img
                src={logo}
                alt="Horizonte Viajes"
                className="
                  block
                  h-auto
                  max-h-[52px]
                  w-auto
                  max-w-full
                  object-contain
                "
              />
            </div>

            {/* TÍTULO */}
            <h1
              className="
                m-0
                text-3xl
                font-bold
                tracking-tight
                text-white
              "
            >
              Bienvenido de nuevo
            </h1>

            {/* DESCRIPCIÓN */}
            <p
              className="
                m-0
                mt-3
                text-sm
                leading-relaxed
                text-teal-100
              "
            >
              Inicia sesión para continuar
              con tu próxima aventura
            </p>

            {/* ACENTO DE MARCA */}
            <div
              className="
                mx-auto
                mt-5
                h-1
                w-12
                rounded-full
                bg-amber-400
              "
            />

          </div>

          {/* =========================
              FORMULARIO
          ========================== */}
          <form
            onSubmit={manejarSubmit}
            className="
              px-7
              py-8
              sm:px-9
            "
          >

            {/* ENCABEZADO DEL FORMULARIO */}
            <div className="mb-7 flex items-center gap-3">

              <div className="h-px flex-1 bg-gray-200" />

              <span
                className="
                  whitespace-nowrap
                  text-xs
                  font-bold
                  uppercase
                  tracking-[0.12em]
                  text-teal-700
                "
              >
                Iniciar sesión
              </span>

              <div className="h-px flex-1 bg-gray-200" />

            </div>

            {/* ERROR GENERAL */}
            {errorServidor && (
              <div
                className="
                  mb-5
                  rounded-xl
                  border
                  border-red-200
                  bg-red-50
                  px-4
                  py-3
                "
              >
                <p
                  className="
                    m-0
                    text-sm
                    leading-relaxed
                    text-red-600
                  "
                >
                  {errorServidor}
                </p>
              </div>
            )}

            {/* CORREO */}
            <Input
              label="Correo electrónico"
              type="email"
              name="correo"
              value={formulario.correo}
              onChange={manejarCambio}
              error={errores.correo}
              placeholder="tucorreo@ejemplo.com"
              maxLength={50}
            />

            {/* CONTRASEÑA */}
            <Input
              label="Contraseña"
              type="password"
              name="contrasena"
              value={formulario.contrasena}
              onChange={manejarCambio}
              error={errores.contrasena}
              placeholder="••••••••"
              maxLength={20}
            />

            {/* RECORDAR / RECUPERAR */}
            <div
              className="
                mb-7
                flex
                flex-col
                gap-3
                sm:flex-row
                sm:items-center
                sm:justify-between
              "
            >

              <label
                className="
                  flex
                  cursor-pointer
                  items-center
                  gap-2
                  text-sm
                  text-gray-600
                "
              >

                <input
                  type="checkbox"
                  name="recordarme"
                  checked={formulario.recordarme}
                  onChange={manejarCambio}
                  className="
                    h-4
                    w-4
                    cursor-pointer
                    accent-teal-700
                  "
                />

                <span>
                  Recordarme
                </span>

              </label>

              <Link
                to="/recuperar"
                className="
                  text-sm
                  font-semibold
                  text-teal-700
                  no-underline
                  transition-colors
                  hover:text-amber-600
                "
              >
                ¿Olvidaste tu contraseña?
              </Link>

            </div>

            {/* BOTÓN */}
            <button
              type="submit"
              disabled={enviando}
              className="
                w-full
                rounded-xl
                bg-amber-500
                px-6
                py-3.5
                text-sm
                font-bold
                text-teal-950
                shadow-sm
                transition-all
                duration-200
                hover:-translate-y-0.5
                hover:bg-amber-400
                hover:shadow-md
                disabled:cursor-not-allowed
                disabled:opacity-60
              "
            >
              {enviando
                ? 'Ingresando...'
                : 'Iniciar sesión'}
            </button>

            {/* SEPARADOR */}
            <div className="my-7 flex items-center gap-3">

              <div className="h-px flex-1 bg-gray-200" />

              <span
                className="
                  text-xs
                  font-medium
                  text-gray-400
                "
              >
                O
              </span>

              <div className="h-px flex-1 bg-gray-200" />

            </div>

            {/* REGISTRO */}
            <div className="text-center">

              <p
                className="
                  m-0
                  text-sm
                  text-gray-500
                "
              >
                ¿No tienes una cuenta?
              </p>

              <button
                type="button"
                onClick={() => setModalAbierto(true)}
                className="
                  mt-2
                  cursor-pointer
                  border-0
                  bg-transparent
                  p-0
                  text-sm
                  font-bold
                  text-teal-700
                  transition-colors
                  hover:text-amber-600
                "
              >
                Crear una cuenta
              </button>

            </div>

          </form>

          {/* PIE */}
          <div
            className="
              border-t
              border-gray-100
              bg-gray-50
              px-7
              py-4
              text-center
            "
          >
            <p
              className="
                m-0
                text-xs
                text-gray-500
              "
            >
              Tu próxima aventura comienza aquí
            </p>
          </div>

        </div>

      </div>

      {/* MODAL REGISTRO */}
      <RegisterModal
        abierto={modalAbierto}
        onClose={() => setModalAbierto(false)}
      />

    </main>
  )
}