import React from 'react'

export const Quienes = () => {
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
          Quiénes Somos
        </h1>

        <p className="text-teal-100 text-base md:text-lg max-w-xl mx-auto leading-relaxed">
          Conoce la historia, la misión y los valores que hacen parte de
          Horizonte Viajes.
        </p>

      </section>


      {/* ==================== HISTORIA ==================== */}
      <section className="py-16 md:py-20 px-6">

        <div className="max-w-4xl mx-auto">

          <div className="text-center mb-10">

            <span className="text-amber-500 text-xs font-bold uppercase tracking-[0.2em]">
              Nuestra historia
            </span>

            <h2 className="text-2xl md:text-3xl font-bold text-teal-800 mt-2">
              Viajar es descubrir nuevos horizontes
            </h2>

          </div>


          <div className="space-y-5 text-center md:text-left">

            <p className="text-gray-600 leading-relaxed text-base md:text-lg">
              En <span className="font-semibold text-teal-700">
                Horizonte Viajes
              </span>{' '}
              creemos que cada paisaje cuenta una historia. Somos una agencia
              dedicada a conectar viajeros con los destinos naturales más
              impresionantes del planeta, desde cascadas escondidas entre
              montañas hasta playas al borde del mar.
            </p>

            <p className="text-gray-600 leading-relaxed text-base md:text-lg">
              Nuestro equipo está formado por guías y planificadores
              apasionados por la naturaleza, comprometidos en diseñar
              experiencias auténticas, seguras y memorables para cada viajero.
            </p>

          </div>

        </div>

      </section>


      {/* ==================== MISIÓN / VISIÓN / VALORES ==================== */}
      <section className="bg-teal-50 py-16 md:py-20 px-6">

        <div className="max-w-6xl mx-auto">

          <div className="text-center mb-12">

            <span className="text-amber-500 text-xs font-bold uppercase tracking-[0.2em]">
              Lo que nos representa
            </span>

            <h2 className="text-2xl md:text-3xl font-bold text-teal-800 mt-2 mb-3">
              Nuestra esencia
            </h2>

            <p className="text-gray-600 max-w-2xl mx-auto">
              Cada decisión que tomamos está guiada por nuestro compromiso
              con los viajeros y la naturaleza.
            </p>

          </div>


          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

            {/* MISIÓN */}
            <div className="
              bg-white
              border
              border-teal-100
              rounded-2xl
              p-7
              text-center
              shadow-sm
              hover:-translate-y-1
              hover:shadow-lg
              transition-all
              duration-300
            ">

              <div className="
                w-14
                h-14
                rounded-full
                bg-teal-100
                text-teal-800
                flex
                items-center
                justify-center
                mx-auto
                mb-5
                text-xl
                font-bold
              ">
                M
              </div>

              <h3 className="text-xl font-bold text-teal-800 mb-3">
                Misión
              </h3>

              <p className="text-sm md:text-base text-gray-600 leading-relaxed">
                Acercar los paisajes más bellos del mundo a cada persona que
                sueña con explorarlos.
              </p>

            </div>


            {/* VISIÓN */}
            <div className="
              bg-white
              border
              border-teal-100
              rounded-2xl
              p-7
              text-center
              shadow-sm
              hover:-translate-y-1
              hover:shadow-lg
              transition-all
              duration-300
            ">

              <div className="
                w-14
                h-14
                rounded-full
                bg-teal-100
                text-teal-800
                flex
                items-center
                justify-center
                mx-auto
                mb-5
                text-xl
                font-bold
              ">
                V
              </div>

              <h3 className="text-xl font-bold text-teal-800 mb-3">
                Visión
              </h3>

              <p className="text-sm md:text-base text-gray-600 leading-relaxed">
                Ser la agencia de viajes de naturaleza más confiable de la
                región.
              </p>

            </div>


            {/* VALORES */}
            <div className="
              bg-white
              border
              border-teal-100
              rounded-2xl
              p-7
              text-center
              shadow-sm
              hover:-translate-y-1
              hover:shadow-lg
              transition-all
              duration-300
            ">

              <div className="
                w-14
                h-14
                rounded-full
                bg-amber-100
                text-amber-600
                flex
                items-center
                justify-center
                mx-auto
                mb-5
                text-xl
                font-bold
              ">
                ✦
              </div>

              <h3 className="text-xl font-bold text-teal-800 mb-3">
                Valores
              </h3>

              <p className="text-sm md:text-base text-gray-600 leading-relaxed">
                Sostenibilidad, autenticidad y pasión por la naturaleza.
              </p>

            </div>

          </div>

        </div>

      </section>


      {/* ==================== CIERRE ==================== */}
      <section className="py-14 md:py-16 px-6 text-center">

        <div className="max-w-3xl mx-auto">

          <div className="text-2xl text-amber-500 mb-3">
            ✦
          </div>

          <h2 className="text-2xl md:text-3xl font-bold text-teal-800 mb-4">
            Más que un viaje, una experiencia
          </h2>

          <p className="text-gray-600 leading-relaxed">
            En Horizonte Viajes queremos que cada destino se convierta en
            un recuerdo especial y que cada nuevo horizonte sea una
            oportunidad para descubrir algo diferente.
          </p>

        </div>

      </section>

    </main>
  )
}