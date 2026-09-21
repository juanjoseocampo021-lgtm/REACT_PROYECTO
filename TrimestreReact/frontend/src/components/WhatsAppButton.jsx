import React from 'react'

// Cambia este número por el número real de contacto de la empresa,
// en formato internacional sin signos ni espacios, ej: 573001234567
const NUMERO_WHATSAPP = '573001234567'
const MENSAJE_PREDETERMINADO = 'Hola, quisiera más información sobre los viajes de Horizonte Viajes.'

export const WhatsAppButton = () => {
  const enlace = `https://wa.me/${NUMERO_WHATSAPP}?text=${encodeURIComponent(MENSAJE_PREDETERMINADO)}`

  return (
    <a
      href={enlace}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Escríbenos por WhatsApp"
      className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition-transform duration-300 hover:scale-110 hover:shadow-xl"
    >
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" className="h-7 w-7" fill="currentColor">
        <path d="M16.001 3C9.373 3 4 8.373 4 15c0 2.386.706 4.607 1.919 6.464L4 29l7.72-1.879A11.94 11.94 0 0 0 16.001 27C22.628 27 28 21.627 28 15S22.628 3 16.001 3Zm0 21.75a9.71 9.71 0 0 1-4.95-1.354l-.355-.21-4.583 1.115 1.137-4.47-.232-.366A9.716 9.716 0 0 1 6.25 15c0-5.376 4.375-9.75 9.751-9.75 5.375 0 9.75 4.374 9.75 9.75 0 5.375-4.375 9.75-9.75 9.75Zm5.34-7.297c-.293-.147-1.734-.856-2.003-.954-.269-.098-.465-.147-.66.147-.196.293-.758.954-.929 1.15-.171.196-.342.22-.635.073-.293-.147-1.235-.455-2.353-1.451-.87-.776-1.457-1.735-1.628-2.028-.171-.293-.018-.452.129-.598.132-.132.293-.343.44-.514.146-.171.195-.293.293-.489.098-.196.049-.367-.024-.514-.073-.147-.66-1.591-.904-2.18-.238-.572-.481-.494-.66-.503l-.562-.01c-.196 0-.514.073-.783.367-.269.293-1.026 1.003-1.026 2.444 0 1.44 1.05 2.833 1.196 3.028.146.196 2.067 3.157 5.008 4.428.7.302 1.246.482 1.672.617.702.223 1.34.192 1.845.117.563-.084 1.734-.709 1.978-1.394.244-.685.244-1.272.171-1.394-.073-.122-.269-.196-.562-.343Z" />
      </svg>
    </a>
  )
}
