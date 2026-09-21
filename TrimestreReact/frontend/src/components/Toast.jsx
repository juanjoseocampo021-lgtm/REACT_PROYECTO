import React, { createContext, useCallback, useContext, useState } from 'react'

const ToastContext = createContext(null)

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([])

  const mostrarToast = useCallback((mensaje, tipo = 'exito') => {
    const id = Date.now() + Math.random()
    setToasts((prev) => [...prev, { id, mensaje, tipo }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 3200)
  }, [])

  return (
    <ToastContext.Provider value={{ mostrarToast }}>
      {children}

      <div className="fixed top-6 right-6 z-[200] flex flex-col gap-2 w-[calc(100%-3rem)] max-w-sm">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`flex items-start gap-2 rounded-xl px-4 py-3 text-sm font-medium text-white shadow-lg animate-[fadeIn_0.2s_ease-out] ${
              t.tipo === 'error' ? 'bg-red-600' : 'bg-teal-700'
            }`}
          >
            <span className="mt-0.5">{t.tipo === 'error' ? '⚠️' : '✅'}</span>
            <span>{t.mensaje}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

// Hook para lanzar notificaciones desde cualquier componente:
// const { mostrarToast } = useToast()
// mostrarToast('Operación exitosa') o mostrarToast('Algo falló', 'error')
export const useToast = () => useContext(ToastContext)
