import React, { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Input } from '../components/Input'
import { Button } from '../components/Button'
import { useToast } from '../components/Toast'
import { API_URL } from '../context/AuthContext'

export const Contacto = () => {
  const [searchParams] = useSearchParams()
  const [seccion, setSeccion] = useState('contacto')
  const [formulario, setFormulario] = useState({
    nombre: '',
    correo: '',
    mensaje: '',
  })
  const [errores, setErrores] = useState({})
  const [enviando, setEnviando] = useState(false)

  const [pqrForm, setPqrForm] = useState({
    tipo: 'peticion',
    asunto: '',
    descripcion: '',
  })
  const [pqrErrores, setPqrErrores] = useState({})
  const [enviandoPqr, setEnviandoPqr] = useState(false)

  const { mostrarToast } = useToast()

  useEffect(() => {
    const mensaje = searchParams.get('mensaje')
    if (mensaje) setFormulario((prev) => ({ ...prev, mensaje }))
  }, [searchParams])

  const validarCampo = (name, value) => {
    switch (name) {
      case 'nombre':
        if (!value.trim()) return 'El nombre es obligatorio'
        if (value.length < 2 || value.length > 30) return 'Debe tener entre 2 y 30 caracteres'
        return ''
      case 'correo':
        if (!value) return 'El correo es obligatorio'
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'El correo no tiene un formato válido'
        return ''
      case 'mensaje':
        if (!value.trim()) return 'El mensaje es obligatorio'
        if (value.length < 10) return 'Cuéntanos un poco más (mínimo 10 caracteres)'
        return ''
      default:
        return ''
    }
  }

  const manejarCambio = (e) => {
    const { name, value } = e.target
    setFormulario((prev) => ({ ...prev, [name]: value }))
    setErrores((prev) => ({ ...prev, [name]: validarCampo(name, value) }))
  }

  const manejarSubmit = async (e) => {
    e.preventDefault()

    const nuevosErrores = {
      nombre: validarCampo('nombre', formulario.nombre),
      correo: validarCampo('correo', formulario.correo),
      mensaje: validarCampo('mensaje', formulario.mensaje),
    }
    setErrores(nuevosErrores)

    if (Object.values(nuevosErrores).some((err) => err)) {
      mostrarToast('Por favor revisa los campos marcados', 'error')
      return
    }

    try {
      setEnviando(true)
      const respuesta = await fetch(`${API_URL}/contacto`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formulario),
      })
      const datos = await respuesta.json()

      if (!respuesta.ok) {
        if (datos.errores) setErrores((prev) => ({ ...prev, ...datos.errores }))
        mostrarToast(datos.mensaje || 'No se pudo enviar el mensaje', 'error')
        return
      }

      mostrarToast(datos.mensaje || '¡Gracias por escribirnos!')
      setFormulario({ nombre: '', correo: '', mensaje: '' })
      setErrores({})
    } catch (error) {
      console.error('Error al enviar mensaje de contacto:', error)
      mostrarToast('No se pudo conectar con el servidor', 'error')
    } finally {
      setEnviando(false)
    }
  }

  const validarPqr = (name, value) => {
    switch (name) {
      case 'asunto':
        if (!value.trim()) return 'El asunto es obligatorio'
        if (value.length < 3 || value.length > 100) return 'Debe tener entre 3 y 100 caracteres'
        return ''
      case 'descripcion':
        if (!value.trim()) return 'La descripción es obligatoria'
        if (value.length < 10 || value.length > 500) return 'Debe tener entre 10 y 500 caracteres'
        return ''
      default:
        return ''
    }
  }

  const manejarPqrCambio = (e) => {
    const { name, value } = e.target
    setPqrForm((prev) => ({ ...prev, [name]: value }))
    setPqrErrores((prev) => ({ ...prev, [name]: validarPqr(name, value) }))
  }

  const manejarPqrSubmit = async (e) => {
    e.preventDefault()

    const nuevosErrores = {
      asunto: validarPqr('asunto', pqrForm.asunto),
      descripcion: validarPqr('descripcion', pqrForm.descripcion),
    }
    setPqrErrores(nuevosErrores)

    if (Object.values(nuevosErrores).some((err) => err)) {
      mostrarToast('Por favor revisa los campos marcados', 'error')
      return
    }

    try {
      setEnviandoPqr(true)
      const respuesta = await fetch(`${API_URL}/pqr/publico`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tipo: pqrForm.tipo,
          asunto: pqrForm.asunto,
          descripcion: pqrForm.descripcion,
        }),
      })
      const datos = await respuesta.json()

      if (!respuesta.ok) {
        mostrarToast(datos.mensaje || 'No se pudo registrar tu petición', 'error')
        return
      }

      mostrarToast(datos.mensaje || '¡PQR registrada correctamente!')
      setPqrForm({ tipo: 'peticion', asunto: '', descripcion: '' })
      setPqrErrores({})
    } catch (error) {
      console.error('Error al enviar PQR:', error)
      mostrarToast('No se pudo conectar con el servidor', 'error')
    } finally {
      setEnviandoPqr(false)
    }
  }

  return (
    <main className="w-full bg-white">

      {/* ==================== ENCABEZADO ==================== */}
      <section className="bg-teal-800 text-white text-center py-16 md:py-20 px-6">

        <span className="inline-flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-[0.2em] mb-4">
          <span className="w-8 h-[2px] bg-amber-400" />
          Horizonte Viajes
          <span className="w-8 h-[2px] bg-amber-400" />
        </span>

        <h1 className="text-3xl md:text-5xl font-bold mb-4">
          Contáctanos
        </h1>

        <p className="text-teal-100 text-base md:text-lg max-w-xl mx-auto leading-relaxed">
          ¿Tienes preguntas sobre tu próximo viaje? Estamos aquí para
          escucharte.
        </p>

      </section>


      {/* ==================== CONTENIDO ==================== */}
      <section className="py-14 md:py-20 px-6">

        <div className="max-w-5xl mx-auto">

          {/* Tabs */}
          <div className="flex justify-center gap-4 mb-10">
            <button
              onClick={() => setSeccion('contacto')}
              className={`px-6 py-2.5 rounded-full font-semibold text-sm transition-all ${
                seccion === 'contacto'
                  ? 'bg-teal-800 text-white shadow-md'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Mensaje de contacto
            </button>
            <button
              onClick={() => setSeccion('pqr')}
              className={`px-6 py-2.5 rounded-full font-semibold text-sm transition-all ${
                seccion === 'pqr'
                  ? 'bg-teal-800 text-white shadow-md'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Petición / Queja / Reclamo
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-10 items-start">

          {/* ==================== INFORMACIÓN ==================== */}
          <div className="md:col-span-2 pt-2">

            <span className="text-amber-500 text-xs font-bold uppercase tracking-[0.2em]">
              {seccion === 'contacto' ? 'Hablemos' : 'PQR'}
            </span>

            <h2 className="text-2xl md:text-3xl font-bold text-teal-800 mt-2 mb-4">
              {seccion === 'contacto' ? 'Estamos para ayudarte' : 'Registra tu petición'}
            </h2>

            <p className="text-gray-600 leading-relaxed mb-8">
              {seccion === 'contacto'
                ? 'Si tienes alguna pregunta sobre nuestros destinos o quieres conocer más sobre Horizonte Viajes, puedes escribirnos a través del siguiente formulario.'
                : 'Registra tu petición, queja o reclamo y te responderemos lo antes posible. Todos los campos son obligatorios.'}
            </p>

            <div className="space-y-5">
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-full bg-teal-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-lg">✉</span>
                </div>
                <div>
                  <h3 className="font-semibold text-teal-800">Correo electrónico</h3>
                  <p className="text-sm text-gray-500 mt-1">contacto@horizonteviajes.com</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-lg">✈</span>
                </div>
                <div>
                  <h3 className="font-semibold text-teal-800">Tu próximo destino</h3>
                  <p className="text-sm text-gray-500 mt-1">Estamos listos para ayudarte a encontrarlo.</p>
                </div>
              </div>
            </div>
          </div>

          {/* ==================== FORMULARIOS ==================== */}
          <div className="md:col-span-3">

            {seccion === 'contacto' ? (
              <form
                onSubmit={manejarSubmit}
                className="bg-white p-6 md:p-8 rounded-2xl shadow-lg border border-teal-100"
              >
                <div className="mb-6">
                  <h2 className="text-xl font-bold text-teal-800">Envíanos un mensaje</h2>
                  <p className="text-sm text-gray-500 mt-1">Completa los siguientes campos y nos pondremos en contacto contigo.</p>
                </div>
                <Input label="Nombre" name="nombre" value={formulario.nombre} onChange={manejarCambio} error={errores.nombre} maxLength={30} />
                <Input label="Correo electrónico" type="email" name="correo" value={formulario.correo} onChange={manejarCambio} error={errores.correo} maxLength={50} />
                <div className="mb-5">
                  <label htmlFor="mensaje" className="block text-sm font-medium text-gray-700 mb-1">Mensaje</label>
                  <textarea
                    id="mensaje" name="mensaje" value={formulario.mensaje} onChange={manejarCambio}
                    maxLength={300} rows={5} placeholder="Cuéntanos cómo podemos ayudarte..."
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg outline-none resize-none text-gray-700 placeholder:text-gray-400 focus:border-teal-600 focus:ring-2 focus:ring-teal-100 transition-all"
                  />
                  <div className="flex items-center justify-between mt-1">
                    {errores.mensaje ? <p className="text-xs text-red-500">{errores.mensaje}</p> : <span />}
                    <p className="text-xs text-gray-400 text-right">{formulario.mensaje.length}/300</p>
                  </div>
                </div>
                <Button type="submit">{enviando ? 'Enviando...' : 'Enviar mensaje'}</Button>
              </form>
            ) : (
              <form
                onSubmit={manejarPqrSubmit}
                className="bg-white p-6 md:p-8 rounded-2xl shadow-lg border border-teal-100"
              >
                <div className="mb-6">
                  <h2 className="text-xl font-bold text-teal-800">Registrar Petición / Queja / Reclamo</h2>
                  <p className="text-sm text-gray-500 mt-1">Describe tu situación y la atenderemos lo antes posible.</p>
                </div>

                <div className="mb-5">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                  <select
                    name="tipo"
                    value={pqrForm.tipo}
                    onChange={manejarPqrCambio}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg outline-none text-gray-700 focus:border-teal-600 focus:ring-2 focus:ring-teal-100 transition-all"
                  >
                    <option value="peticion">Petición</option>
                    <option value="queja">Queja</option>
                    <option value="reclamo">Reclamo</option>
                  </select>
                </div>

                <Input label="Asunto" name="asunto" value={pqrForm.asunto} onChange={manejarPqrCambio} error={pqrErrores.asunto} maxLength={100} />

                <div className="mb-5">
                  <label htmlFor="pqr-desc" className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                  <textarea
                    id="pqr-desc" name="descripcion" value={pqrForm.descripcion} onChange={manejarPqrCambio}
                    maxLength={500} rows={5} placeholder="Describe detalladamente tu petición, queja o reclamo..."
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg outline-none resize-none text-gray-700 placeholder:text-gray-400 focus:border-teal-600 focus:ring-2 focus:ring-teal-100 transition-all"
                  />
                  <div className="flex items-center justify-between mt-1">
                    {pqrErrores.descripcion ? <p className="text-xs text-red-500">{pqrErrores.descripcion}</p> : <span />}
                    <p className="text-xs text-gray-400 text-right">{pqrForm.descripcion.length}/500</p>
                  </div>
                </div>

                <Button type="submit">{enviandoPqr ? 'Enviando...' : 'Registrar PQR'}</Button>
              </form>
            )}

          </div>

        </div>

        </div>

      </section>


      {/* ==================== CIERRE ==================== */}
      <section className="bg-teal-50 py-10 px-6 text-center">

        <div className="max-w-2xl mx-auto">

          <span className="text-amber-500 text-xl">
            ✦
          </span>

          <p className="text-teal-800 font-medium mt-2">
            Tu próxima aventura puede comenzar con un mensaje.
          </p>

        </div>

      </section>

    </main>
  )
}
