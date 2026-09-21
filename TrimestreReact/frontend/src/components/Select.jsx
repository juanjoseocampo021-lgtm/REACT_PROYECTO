import React from 'react'

export const Select = ({ label, name, value, onChange, options, error }) => {
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <select
        name={name}
        value={value}
        onChange={onChange}
        className={`w-full px-3 py-2.5 border rounded-lg outline-none transition-colors ${
          error ? 'border-red-500' : 'border-gray-300 focus:border-teal-600'
        }`}
      >
        <option value="">Selecciona una opción</option>
        {options.map((op) => (
          <option key={op} value={op}>{op}</option>
        ))}
      </select>
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  )
}