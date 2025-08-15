'use client';

import React, { useState } from 'react';
import Image from 'next/image';

const JuntaDirectivaPage = () => {
  const [viewMode, setViewMode] = useState('organigrama'); // 'organigrama' o 'tarjetas'

  const fundadores = [
    { nombre: "Alileny Perez Aleman", imagen: "alileny.avif" },
    { nombre: "Brigida Aguerrevere", imagen: "brigida.avif" },
    { nombre: "Christian Fajardo", imagen: "christian.avif" },
    { nombre: "Maria Veronica Contraras", imagen: "maria.avif" },
    { nombre: "Roy Rojas Zeledon", imagen: "roy.avif" },
    { nombre: "Alex Munoz", imagen: "alex.avif" },
    { nombre: "Mariana Piñango", imagen: "mariana.avif" },
    { nombre: "Rossana Yametti", imagen: "rossana.avif" },
    { nombre: "Ulises Bernal", imagen: "ulises.avif" },
    { nombre: "Eleazar Gonzalez", imagen: "eleazar.avif" },
    { nombre: "Flavia Alves", imagen: "flavia.avif" },
    { nombre: "Leila Ternera", imagen: "leila.avif" },
    { nombre: "Maria Beatriz Bravo", imagen: "beatriz.avif" }
  ];

  // Componentes para vista de organigrama (desktop)
  const OrganogramBox = ({ nombre, cargo, color = "bg-white", textColor = "text-black", isVacant = false }) => (
    <div className={`${color} ${textColor} px-4 py-2 lg:px-6 lg:py-3 rounded-full text-center border-2 border-gray-800 min-w-32 lg:min-w-48 text-xs lg:text-sm ${isVacant ? 'text-red-500 font-medium' : 'font-semibold'}`}>
      <div>{nombre}</div>
      {cargo && <div className="text-xs lg:text-xs italic mt-1">{cargo}</div>}
    </div>
  );

  const Arrow = ({ direction = "down" }) => (
    <div className="flex justify-center my-1 lg:my-2">
      {direction === "down" && (
        <svg width="16" height="16" className="lg:w-5 lg:h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 5v14M19 12l-7 7-7-7"/>
        </svg>
      )}
      {direction === "right" && (
        <svg width="16" height="16" className="lg:w-5 lg:h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M5 12h14M12 5l7 7-7 7"/>
        </svg>
      )}
      {direction === "left" && (
        <svg width="16" height="16" className="lg:w-5 lg:h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M19 12H5M12 19l-7-7 7-7"/>
        </svg>
      )}
    </div>
  );

  // Componentes para vista de tarjetas (mobile)
  const PersonCard = ({ nombre, cargo, vacante = false }) => (
    <div className={`p-4 rounded-lg border-2 transition-all hover:shadow-md ${
      vacante 
        ? 'bg-gray-50 border-gray-300 border-dashed' 
        : 'bg-white border-blue-200 hover:border-blue-400'
    }`}>
      <h3 className={`font-bold text-lg ${vacante ? 'text-gray-500' : 'text-gray-800'}`}>
        {nombre}
      </h3>
      <p className={`text-sm ${vacante ? 'text-gray-400 italic' : 'text-blue-600'}`}>
        {cargo}
      </p>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="bg-white rounded-lg shadow-lg p-4 lg:p-8">
        <h1 className="text-3xl lg:text-4xl font-bold text-center mb-8 lg:mb-12 text-gray-800">
          Junta Directiva
        </h1>

        {/* Toggle para cambiar vista en móvil */}
        <div className="lg:hidden flex justify-center mb-8">
          <div className="bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('organigrama')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                viewMode === 'organigrama' 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Organigrama
            </button>
            <button
              onClick={() => setViewMode('tarjetas')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                viewMode === 'tarjetas' 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Tarjetas
            </button>
          </div>
        </div>

        {/* Vista de Organigrama - Visible en desktop o cuando se selecciona en mobile */}
        <div className={`${viewMode === 'organigrama' ? 'block' : 'hidden lg:block'}`}>
          {/* Junta Directiva Actual - Organigrama */}
          <section className="mb-12 lg:mb-16">
            <h2 className="text-2xl lg:text-3xl font-bold text-center mb-8 lg:mb-12 italic">Junta Directiva Actual</h2>
            
            {/* Nivel superior - Presidente, Director, Enlaces Externos */}
            <div className="flex flex-col lg:flex-row justify-center items-center gap-4 lg:gap-8 mb-8">
              <OrganogramBox nombre="Alileny Perez A." cargo="Presidente" color="bg-blue-600" textColor="text-white" />
              <div className="hidden lg:block"><Arrow direction="right" /></div>
              <OrganogramBox nombre="Brigida Aguerrevere" cargo="Director" color="bg-blue-600" textColor="text-white" />
              <div className="hidden lg:block"><Arrow direction="left" /></div>
              <OrganogramBox nombre="Edward Delaney CCP" cargo="Enlaces Externos" color="bg-blue-600" textColor="text-white" />
            </div>

            {/* Flecha hacia abajo desde Director */}
            <div className="flex justify-center">
              <Arrow direction="down" />
            </div>

            {/* Sección Académica */}
            <div className="flex justify-center mb-6 lg:mb-8">
              <OrganogramBox nombre="Sección Academica" color="bg-orange-500" textColor="text-white" />
            </div>

            {/* Líneas hacia las 4 secciones - Solo desktop */}
            <div className="hidden lg:flex justify-center mb-4">
              <div className="w-full max-w-4xl">
                <div className="border-t-2 border-gray-800 mb-4"></div>
                <div className="flex justify-between">
                  <div className="border-l-2 border-gray-800 h-4"></div>
                  <div className="border-l-2 border-gray-800 h-4"></div>
                  <div className="border-l-2 border-gray-800 h-4"></div>
                  <div className="border-l-2 border-gray-800 h-4"></div>
                </div>
              </div>
            </div>

            {/* Las 4 secciones principales */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-8 mb-8">
              {/* Sección Certificación */}
              <div className="flex flex-col items-center space-y-2">
                <OrganogramBox nombre="Sección Certificación" color="bg-gray-500" textColor="text-white" />
                <Arrow direction="down" />
                <OrganogramBox nombre="Christian Fajardo" cargo="Coordinador" />
                <Arrow direction="down" />
                <OrganogramBox nombre="Maria Veronica Contraeras" cargo="Adjunto de Areas Teoricas" />
                <Arrow direction="down" />
                <OrganogramBox nombre="Vacante" cargo="Adjunto de Areas Practicas" isVacant />
              </div>

              {/* Sección Recertificación */}
              <div className="flex flex-col items-center space-y-2">
                <OrganogramBox nombre="Sección Recertificación" color="bg-green-600" textColor="text-white" />
                <Arrow direction="down" />
                <OrganogramBox nombre="Alex Muñoz" cargo="Coordinador" />
                <Arrow direction="down" />
                <OrganogramBox nombre="Mariana Piñango" cargo="Adjunto" />
                <Arrow direction="down" />
                <OrganogramBox nombre="Vacante" cargo="Adjunto" isVacant />
              </div>

              {/* Sección Calidad y Resultados */}
              <div className="flex flex-col items-center space-y-2">
                <OrganogramBox nombre="Sección Calidad y Resultados" color="bg-purple-600" textColor="text-white" />
                <Arrow direction="down" />
                <OrganogramBox nombre="Rossana Yametti" cargo="Coordinador" />
                <Arrow direction="down" />
                <OrganogramBox nombre="Leila Ternera" cargo="Adjunto" />
                <Arrow direction="down" />
                <OrganogramBox nombre="Vacante" cargo="Adjunto" isVacant />
              </div>

              {/* Enlaces Internos */}
              <div className="flex flex-col items-center space-y-2">
                <OrganogramBox nombre="Enlaces Internos" color="bg-orange-400" textColor="text-white" />
                <Arrow direction="down" />
                <OrganogramBox nombre="Vacante" cargo="Zona 1 Región Centro Caribe" isVacant />
                <Arrow direction="down" />
                <OrganogramBox nombre="Vacante" cargo="Zona 2 Región Cono Sur" isVacant />
                <Arrow direction="down" />
                <OrganogramBox nombre="Flavia Alves" cargo="Zona 3 Región Cono Sur" />
              </div>
            </div>
          </section>

          {/* Miembros Fundadores - Organigrama */}
          <section className="mb-12 lg:mb-16">
            <h2 className="text-2xl lg:text-3xl font-bold text-center mb-8 lg:mb-12 italic">Miembros Fundadores</h2>
            
            {/* Nivel superior - Presidente, Director, Enlaces Externos */}
            <div className="flex flex-col lg:flex-row justify-center items-center gap-4 lg:gap-8 mb-8">
              <OrganogramBox nombre="Alileny Perez A." cargo="Presidente" color="bg-blue-600" textColor="text-white" />
              <div className="hidden lg:block"><Arrow direction="right" /></div>
              <OrganogramBox nombre="Brigida Aguerrevere" cargo="Director" color="bg-blue-600" textColor="text-white" />
              <div className="hidden lg:block"><Arrow direction="left" /></div>
              <OrganogramBox nombre="Edward Delaney CCP" cargo="Enlaces Externos" color="bg-blue-600" textColor="text-white" />
            </div>

            {/* Flecha hacia abajo desde Director */}
            <div className="flex justify-center">
              <Arrow direction="down" />
            </div>

            {/* Sección Académica */}
            <div className="flex justify-center mb-6 lg:mb-8">
              <OrganogramBox nombre="Sección Academica" color="bg-orange-500" textColor="text-white" />
            </div>

            {/* Líneas hacia las 4 secciones - Solo desktop */}
            <div className="hidden lg:flex justify-center mb-4">
              <div className="w-full max-w-4xl">
                <div className="border-t-2 border-gray-800 mb-4"></div>
                <div className="flex justify-between">
                  <div className="border-l-2 border-gray-800 h-4"></div>
                  <div className="border-l-2 border-gray-800 h-4"></div>
                  <div className="border-l-2 border-gray-800 h-4"></div>
                  <div className="border-l-2 border-gray-800 h-4"></div>
                </div>
              </div>
            </div>

            {/* Las 4 secciones principales - Miembros Fundadores */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-8 mb-12 lg:mb-16">
              {/* Sección Certificación */}
              <div className="flex flex-col items-center space-y-2">
                <OrganogramBox nombre="Sección Certificación" color="bg-gray-500" textColor="text-white" />
                <Arrow direction="down" />
                <OrganogramBox nombre="Christian Fajardo" cargo="Coordinador" />
                <Arrow direction="down" />
                <OrganogramBox nombre="Maria Veronica Contraeras" cargo="Adjunto de Areas Teoricas" />
                <Arrow direction="down" />
                <OrganogramBox nombre="Roy Rojas" cargo="Adjunto de Areas Practicas" />
              </div>

              {/* Sección Recertificación */}
              <div className="flex flex-col items-center space-y-2">
                <OrganogramBox nombre="Sección Recertificación" color="bg-green-600" textColor="text-white" />
                <Arrow direction="down" />
                <OrganogramBox nombre="Alex Muñoz" cargo="Coordinador" />
                <Arrow direction="down" />
                <OrganogramBox nombre="Mariana Piñango" cargo="Adjunto" />
                <Arrow direction="down" />
                <OrganogramBox nombre="Eleazar Gonzalez" cargo="Adjunto" />
              </div>

              {/* Sección Calidad y Resultados */}
              <div className="flex flex-col items-center space-y-2">
                <OrganogramBox nombre="Sección Calidad y Resultados" color="bg-purple-600" textColor="text-white" />
                <Arrow direction="down" />
                <OrganogramBox nombre="Rossana Yametti" cargo="Coordinador" />
                <Arrow direction="down" />
                <OrganogramBox nombre="Leila Ternera" cargo="Adjunto" />
                <Arrow direction="down" />
                <OrganogramBox nombre="Ulises Bernal" cargo="Adjunto" />
              </div>

              {/* Enlaces Internos */}
              <div className="flex flex-col items-center space-y-2">
                <OrganogramBox nombre="Enlaces Internos" color="bg-orange-400" textColor="text-white" />
                <Arrow direction="down" />
                <OrganogramBox nombre="Silvia Orta" cargo="Zona 1 Región Centro Caribe" />
                <Arrow direction="down" />
                <OrganogramBox nombre="Maria Beatriz Bravo" cargo="Zona 2 Región Cono Sur" />
                <Arrow direction="down" />
                <OrganogramBox nombre="Flavia Alves" cargo="Zona 3 Región Cono Sur" />
              </div>
            </div>
          </section>
        </div>

        {/* Vista de Tarjetas - Solo visible cuando se selecciona en mobile */}
        <div className={`${viewMode === 'tarjetas' ? 'block lg:hidden' : 'hidden'}`}>
          {/* Junta Directiva Actual - Vista de tarjetas */}
          <section className="mb-12">
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg mb-6">
              <h2 className="text-2xl font-bold text-blue-800">Junta Directiva Actual</h2>
            </div>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Directivos Principales</h3>
                <div className="grid grid-cols-1 gap-3">
                  <PersonCard nombre="Alileny Perez A." cargo="Presidente" />
                  <PersonCard nombre="Brigida Aguerrevere" cargo="Director" />
                  <PersonCard nombre="Edward Delaney CCP" cargo="Enlaces Externos" />
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Sección Académica</h3>
                <div className="grid grid-cols-1 gap-3">
                  <PersonCard nombre="Christian Fajardo" cargo="Coordinador" />
                  <PersonCard nombre="Maria Veronica Contraeras" cargo="Adjunto de Areas Teoricas" />
                  <PersonCard nombre="Vacante" cargo="Adjunto de Areas Practicas" vacante />
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Sección Certificación</h3>
                <div className="grid grid-cols-1 gap-3">
                  <PersonCard nombre="Alex Muñoz" cargo="Coordinador" />
                  <PersonCard nombre="Mariana Piñango" cargo="Adjunto" />
                  <PersonCard nombre="Vacante" cargo="Adjunto" vacante />
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Sección Recertificación</h3>
                <div className="grid grid-cols-1 gap-3">
                  <PersonCard nombre="Rossana Yametti" cargo="Coordinador" />
                  <PersonCard nombre="Leila Ternera" cargo="Adjunto" />
                  <PersonCard nombre="Vacante" cargo="Adjunto" vacante />
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Enlaces Internos</h3>
                <div className="grid grid-cols-1 gap-3">
                  <PersonCard nombre="Vacante" cargo="Zona 1 Región Centro Caribe" vacante />
                  <PersonCard nombre="Vacante" cargo="Zona 2 Región Cono Sur" vacante />
                  <PersonCard nombre="Flavia Alves" cargo="Zona 3 Región Cono Sur" />
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Galería de Fotos de Miembros Fundadores */}
        <section className="mb-8">
          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-l-4 border-yellow-500 p-4 lg:p-6 rounded-r-lg mb-6 lg:mb-8">
            <h2 className="text-2xl lg:text-3xl font-bold text-yellow-800 mb-4 lg:mb-6 text-center">Galería de Miembros Fundadores</h2>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 lg:gap-8">
            {fundadores.map((fundador, index) => (
              <div key={index} className="flex flex-col items-center bg-white p-3 lg:p-4 rounded-lg shadow-md hover:shadow-lg transition-all border-2 border-yellow-200">
                <div className="w-16 h-16 lg:w-24 lg:h-24 mb-2 lg:mb-4 rounded-full overflow-hidden border-4 border-yellow-400 shadow-lg">
                  <Image
                    src={`/images/founders/${fundador.imagen}`}
                    alt={fundador.nombre}
                    width={96}
                    height={96}
                    className="w-full h-full object-cover"
                  />
                </div>
                <p className="text-xs lg:text-sm font-semibold text-gray-800 text-center leading-tight">{fundador.nombre}</p>
                <p className="text-xs text-yellow-600 italic mt-1">Miembro Fundador</p>
              </div>
            ))}
          </div>
        </section>

        {/* Nota sobre vacantes */}
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 lg:p-6 rounded-r-lg mt-8 lg:mt-12">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">
                Información sobre posiciones vacantes
              </h3>
              <p className="mt-1 text-sm text-blue-700">
                Las posiciones marcadas como "Vacante" están disponibles para nuevos miembros calificados. 
                Si estás interesado en participar en la junta directiva, contacta a la presidencia.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JuntaDirectivaPage;