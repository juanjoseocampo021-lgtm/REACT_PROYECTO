import React, { useState } from 'react'
import { Input } from './Input'
import { Select } from './Select'
import { Button } from './Button'
import logo from '../assets/horizonte-logo.svg'
import { API_URL } from '../context/AuthContext'
import { useToast } from './Toast'

export const RegisterModal = ({ abierto, onClose }) => {
  const [formulario, setFormulario] = useState({
    nombre: '',
    apellido: '',
    tipoDocumento: '',
    numeroDocumento: '',
    direccion: '',
    telefono: '',
    correo: '',
    contrasena: '',
    confirmarContrasena: '',
    aceptaTerminos: false,
  })

  const [errores, setErrores] = useState({})
  const [errorServidor, setErrorServidor] = useState('')
  const [exito, setExito] = useState('')
  const [enviando, setEnviando] = useState(false)
  const { mostrarToast } = useToast()

  const validarCampo = (name, value, formularioActual) => {
    switch (name) {
      case 'nombre':
      case 'apellido':
        if (!value.trim()) return 'Este campo es obligatorio'
        if (value.length < 2 || value.length > 30)
          return 'Debe tener entre 2 y 30 caracteres'
        if (!/^[a-zA-ZÁÉÍÓÚáéíóúñÑ\s]+$/.test(value))
          return 'Solo se permiten letras'
        return ''

      case 'tipoDocumento':
        if (!value) return 'Selecciona un tipo de documento'
        return ''

      case 'numeroDocumento':
        if (!value) return 'El número de documento es obligatorio'
        if (!/^\d{6,10}$/.test(value))
          return 'Debe tener entre 6 y 10 dígitos numéricos'
        return ''

      case 'direccion':
        if (!value.trim()) return 'La dirección es obligatoria'
        return ''

      case 'telefono':
        if (!value) return 'El teléfono es obligatorio'
        if (!/^\d{7,10}$/.test(value))
          return 'Debe tener entre 7 y 10 dígitos'
        return ''

      case 'correo':
        if (!value) return 'El correo es obligatorio'
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
          return 'Formato de correo inválido'
        return ''

      case 'contrasena':
        if (!value) return 'La contraseña es obligatoria'
        if (value.length < 6 || value.length > 20)
          return 'Debe tener entre 6 y 20 caracteres'
        return ''

      case 'confirmarContrasena':
        if (!value) return 'Confirma tu contraseña'
        if (value !== formularioActual.contrasena)
          return 'Las contraseñas no coinciden'
        return ''

      case 'aceptaTerminos':
        if (!value) return 'Debes aceptar los términos y condiciones'
        return ''

      default:
        return ''
    }
  }

  const manejarCambio = (e) => {
    const { name, value, type, checked } = e.target

    const valorFinal = type === 'checkbox' ? checked : value

    const nuevoFormulario = {
      ...formulario,
      [name]: valorFinal,
    }

    setFormulario(nuevoFormulario)

    setErrores({
      ...errores,
      [name]: validarCampo(name, valorFinal, nuevoFormulario),
    })
  }

  const validarTodo = () => {
    const nuevosErrores = {}

    Object.keys(formulario).forEach((campo) => {
      nuevosErrores[campo] = validarCampo(
        campo,
        formulario[campo],
        formulario
      )
    })

    setErrores(nuevosErrores)

    return Object.values(nuevosErrores).every((err) => !err)
  }

  const manejarSubmit = async (e) => {
    e.preventDefault()
    setErrorServidor('')
    setExito('')

    if (!validarTodo()) return

    try {
      setEnviando(true)

      const respuesta = await fetch(`${API_URL}/auth/registro`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formulario),
      })

      const datos = await respuesta.json()

      if (!respuesta.ok) {
        // Si el backend devuelve errores por campo, los mostramos igual que los del frontend
        if (datos.errores) {
          setErrores((prev) => ({ ...prev, ...datos.errores }))
        }
        setErrorServidor(datos.mensaje || 'No se pudo completar el registro')
        mostrarToast(datos.mensaje || 'No se pudo completar el registro', 'error')
        return
      }

      setExito('¡Registro exitoso! Ya puedes iniciar sesión con tu correo y contraseña.')
      mostrarToast('¡Registro exitoso! Ya puedes iniciar sesión.')

      // Cerramos el modal después de un momento para que el usuario alcance a leer el mensaje
      setTimeout(() => {
        onClose()
      }, 1800)
    } catch (error) {
      console.error('Error al registrar:', error)
      setErrorServidor('No se pudo conectar con el servidor. Verifica que el backend esté corriendo.')
      mostrarToast('No se pudo conectar con el servidor', 'error')
    } finally {
      setEnviando(false)
    }
  }

  if (!abierto) return null

  return (
    <div
      className="
        fixed
        inset-0
        z-50
        flex
        items-center
        justify-center
        bg-teal-950/75
        backdrop-blur-md
        p-4
        sm:p-6
      "
    >

      {/* ==================== MODAL ==================== */}
      <div
        className="
          relative
          w-full
          max-w-3xl
          max-h-[95vh]
          overflow-hidden
          rounded-3xl
          bg-white
          shadow-[0_25px_70px_rgba(0,0,0,0.30)]
        "
      >

        {/* ==================== BOTÓN CERRAR ==================== */}
        <button
          type="button"
          onClick={onClose}
          className="
            absolute
            right-5
            top-5
            z-20
            flex
            h-10
            w-10
            items-center
            justify-center
            rounded-full
            bg-white/10
            text-white
            text-2xl
            transition-all
            duration-200
            hover:bg-white/20
            hover:scale-105
          "
          aria-label="Cerrar modal"
        >
          &times;
        </button>


        {/* ==================== ENCABEZADO ==================== */}
        <div
          className="
            relative
            overflow-hidden
            bg-gradient-to-br
            from-teal-700
            via-teal-800
            to-teal-950
            px-6
            py-9
            sm:px-10
            sm:py-10
          "
        >

          {/* Decoración */}
          <div
            className="
              absolute
              -right-20
              -top-24
              h-60
              w-60
              rounded-full
              bg-teal-400/10
            "
          />

          <div
            className="
              absolute
              -bottom-28
              -left-20
              h-64
              w-64
              rounded-full
              bg-amber-400/5
            "
          />


          <div className="relative flex flex-col items-center text-center">

            {/* ==================== LOGO ==================== */}
            <div
              className="
                mb-5
                flex
                min-h-[76px]
                w-auto
                max-w-[280px]
                items-center
                justify-center
                rounded-2xl
                bg-white
                px-6
                py-3
                shadow-lg
                ring-1
                ring-white/20
              "
            >
              <img
                src={logo}
                alt="Horizonte Viajes"
                className="
                  block
                  h-14
                  w-auto
                  max-w-[245px]
                  object-contain
                  sm:h-16
                "
              />
            </div>


            {/* Título */}
            <h2
              className="
                text-2xl
                font-bold
                tracking-tight
                text-white
                sm:text-3xl
              "
            >
              Crea tu cuenta
            </h2>


            {/* Descripción */}
            <p
              className="
                mt-2
                max-w-md
                text-sm
                leading-relaxed
                text-teal-100
                sm:text-base
              "
            >
              Regístrate en Horizonte y comienza a planear
              tu próximo viaje.
            </p>

          </div>
        </div>


        {/* ==================== CONTENIDO ==================== */}
        <div className="max-h-[calc(95vh-235px)] overflow-y-auto">

          <form
            onSubmit={manejarSubmit}
            className="
              px-5
              py-7
              sm:px-8
              sm:py-8
              lg:px-10
            "
          >

            {/* ==================== DATOS PERSONALES ==================== */}
            <div className="mb-8">

              <div className="mb-5 flex items-center gap-3">

                <div
                  className="
                    flex
                    h-10
                    w-10
                    items-center
                    justify-center
                    rounded-xl
                    bg-teal-100
                    text-teal-700
                  "
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.8}
                    stroke="currentColor"
                    className="h-5 w-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.5 20.25a8.25 8.25 0 0115 0"
                    />
                  </svg>
                </div>

                <div>
                  <h3 className="text-base font-bold text-gray-800">
                    Datos personales
                  </h3>

                  <p className="text-xs text-gray-500">
                    Completa tus datos básicos
                  </p>
                </div>

              </div>


              {/* Nombre y apellido */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                <Input
                  label="Nombre"
                  name="nombre"
                  value={formulario.nombre}
                  onChange={manejarCambio}
                  error={errores.nombre}
                  maxLength={30}
                />

                <Input
                  label="Apellido"
                  name="apellido"
                  value={formulario.apellido}
                  onChange={manejarCambio}
                  error={errores.apellido}
                  maxLength={30}
                />

              </div>


              {/* Documento */}
              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">

                <Select
                  label="Tipo de documento"
                  name="tipoDocumento"
                  value={formulario.tipoDocumento}
                  onChange={manejarCambio}
                  options={['CC', 'TI', 'CE']}
                  error={errores.tipoDocumento}
                />

                <Input
                  label="Número de documento"
                  name="numeroDocumento"
                  value={formulario.numeroDocumento}
                  onChange={manejarCambio}
                  error={errores.numeroDocumento}
                  maxLength={10}
                />

              </div>


              {/* Dirección y teléfono */}
              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">

                <Input
                  label="Dirección"
                  name="direccion"
                  value={formulario.direccion}
                  onChange={manejarCambio}
                  error={errores.direccion}
                  maxLength={60}
                />

                <Input
                  label="Teléfono"
                  name="telefono"
                  value={formulario.telefono}
                  onChange={manejarCambio}
                  error={errores.telefono}
                  maxLength={10}
                />

              </div>

            </div>


            {/* Separador */}
            <div className="my-7 border-t border-gray-100" />


            {/* ==================== CUENTA ==================== */}
            <div className="mb-8">

              <div className="mb-5 flex items-center gap-3">

                <div
                  className="
                    flex
                    h-10
                    w-10
                    items-center
                    justify-center
                    rounded-xl
                    bg-teal-100
                    text-teal-700
                  "
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.8}
                    stroke="currentColor"
                    className="h-5 w-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M16.5 10.5V6.75a4.5 4.5 0 00-9 0v3.75m-.75 0h10.5A1.5 1.5 0 0118.75 12v7.5a1.5 1.5 0 01-1.5 1.5H6.75a1.5 1.5 0 01-1.5-1.5V12a1.5 1.5 0 011.5-1.5z"
                    />
                  </svg>
                </div>

                <div>
                  <h3 className="text-base font-bold text-gray-800">
                    Cuenta de acceso
                  </h3>

                  <p className="text-xs text-gray-500">
                    Estos datos te permitirán ingresar
                  </p>
                </div>

              </div>


              {/* Correo */}
              <Input
                label="Correo electrónico"
                type="email"
                name="correo"
                value={formulario.correo}
                onChange={manejarCambio}
                error={errores.correo}
                maxLength={50}
              />


              {/* Contraseñas */}
              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">

                <Input
                  label="Contraseña"
                  type="password"
                  name="contrasena"
                  value={formulario.contrasena}
                  onChange={manejarCambio}
                  error={errores.contrasena}
                  maxLength={20}
                />

                <Input
                  label="Confirmar contraseña"
                  type="password"
                  name="confirmarContrasena"
                  value={formulario.confirmarContrasena}
                  onChange={manejarCambio}
                  error={errores.confirmarContrasena}
                  maxLength={20}
                />

              </div>

            </div>


            {/* ==================== TÉRMINOS ==================== */}
            <div className="mb-2">

              <label className="flex items-start gap-2.5 cursor-pointer">

                <input
                  type="checkbox"
                  name="aceptaTerminos"
                  checked={formulario.aceptaTerminos}
                  onChange={manejarCambio}
                  className="
                    mt-0.5
                    h-4
                    w-4
                    rounded
                    accent-teal-700
                  "
                />

                <span className="text-sm text-gray-600 leading-snug">

                  He leído y acepto los{' '}

                  <a
                    href="#"
                    className="
                      text-teal-700
                      font-medium
                      hover:text-amber-600
                      hover:underline
                    "
                  >
                    términos y condiciones
                  </a>

                  {' '}y la{' '}

                  <a
                    href="#"
                    className="
                      text-teal-700
                      font-medium
                      hover:text-amber-600
                      hover:underline
                    "
                  >
                    política de privacidad
                  </a>

                  .

                </span>

              </label>


              {errores.aceptaTerminos && (
                <p className="text-red-500 text-xs mt-1.5 ml-6">
                  {errores.aceptaTerminos}
                </p>
              )}

            </div>


            {/* ==================== MENSAJES DEL SERVIDOR ==================== */}
            {errorServidor && (
              <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
                {errorServidor}
              </p>
            )}

            {exito && (
              <p className="mb-4 rounded-lg border border-teal-200 bg-teal-50 px-3 py-2 text-sm text-teal-700">
                {exito}
              </p>
            )}

            {/* ==================== BOTONES ==================== */}
            <div className="mt-8 border-t border-gray-100 pt-6">

              <Button
                type="submit"
                variant="accent"
              >
                {enviando ? 'Registrando...' : 'Crear cuenta'}
              </Button>


              <button
                type="button"
                onClick={onClose}
                className="
                  mt-4
                  w-full
                  rounded-xl
                  py-2.5
                  text-sm
                  font-medium
                  text-gray-500
                  transition-colors
                  hover:bg-gray-50
                  hover:text-teal-700
                "
              >
                Cancelar
              </button>

            </div>

          </form>

        </div>

      </div>

    </div>
  )
}