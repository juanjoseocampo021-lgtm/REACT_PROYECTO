import React from 'react'

export const Button = ({ children, type = 'button', onClick, variant = 'primary' }) => {
  const estilos = {
    primary: 'bg-teal-700 text-white hover:bg-teal-800',
    accent: 'bg-amber-500 text-teal-900 hover:bg-amber-600',
    secondary: 'bg-gray-100 text-gray-700 hover:bg-gray-200',
  }

  return (
    <button
      type={type}
      onClick={onClick}
      className={`w-full py-2.5 rounded-lg font-semibold transition-colors ${estilos[variant]}`}
    >
      {children}
    </button>
  )
}