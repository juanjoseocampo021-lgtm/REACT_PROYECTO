import React from 'react'

export const Input = ({ label, type = 'text', name, value, onChange, error, placeholder, maxLength }) => {
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        maxLength={maxLength}
        className={`w-full px-3 py-2.5 border rounded-lg outline-none transition-colors ${
          error ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-teal-600'
        }`}
      />
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  )
}