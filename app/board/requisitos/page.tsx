'use client';

import React from 'react';

const RequisitosPage = () => {
  const handleEmailClick = () => {
    window.location.href = 'mailto:info@boardlatinoamericanodeperfusion.com';
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
          Requisitos para el Board Latinoamericano de Perfusión
        </h1>

        {/* Periodo Regular */}
        <section className="mb-12">
          <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-r-lg">
            <h2 className="text-2xl font-bold text-blue-800 mb-4">PERIODO REGULAR</h2>
            <div className="mb-6">
              <p className="text-gray-700 mb-4">
                <span className="font-semibold">Enviar correo al </span>
                <button
                  onClick={handleEmailClick}
                  className="text-blue-600 hover:text-blue-800 underline font-semibold transition-colors"
                >
                  info@boardlatinoamericanodeperfusion.com
                </button>
                <span className="font-semibold"> con las siguientes informaciones:</span>
              </p>
            </div>

            {/* Requisitos numerados */}
            <div className="space-y-8">
              {/* Requisito 1 */}
              <div className="bg-white p-6 rounded-lg border-l-4 border-gray-300">
                <h3 className="text-xl font-bold text-gray-700 mb-3">
                  1) Título de Perfusionista
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  Por una escuela con aval universitario o aval ALAP; Si no aplica ninguna de los anteriores, 
                  la solicitud se procesará como <span className="font-semibold text-orange-600">&quot;casos especiales&quot;</span>
                  <span className="italic"> (ver casos especiales)</span>. 
                  <span className="font-semibold text-red-600"> Para presentar el Board el Aplicante debe tener 1 año de graduado.</span>
                </p>
              </div>

              {/* Requisito 2 - OPCIONAL */}
              <div className="bg-white p-6 rounded-lg border-l-4 border-gray-300">
                <h3 className="text-xl font-bold text-gray-700 mb-3">
                  2) Constancia de número de perfusiones realizadas durante la formación
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  Cada postulante deberá presentar una planilla, certificando la cantidad de perfusiones 
                  realizadas durante su formación.
                </p>
              </div>

              {/* Requisito 3 - OPCIONAL */}
              <div className="bg-white p-6 rounded-lg border-l-4 border-gray-300">
                <h3 className="text-xl font-bold text-gray-700 mb-3">3) Récord de notas</h3>
                <p className="text-gray-700 leading-relaxed">
                  Emitido por escuela de perfusión Universitaria o Avalada por ALAP.
                </p>
              </div>

              {/* Requisito 4 - OPCIONAL */}
              <div className="bg-white p-6 rounded-lg border-l-4 border-gray-300">
                <h3 className="text-xl font-bold text-gray-700 mb-3">4) Constancia</h3>
                <p className="text-gray-700 leading-relaxed">
                  Constancia emitida por la Sociedad Científica de Perfusión del país en donde trabaja. 
                  Si no existe sociedad local, una carta de ALAP como miembro de una sociedad de perfusión.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Casos Especiales */}
        <section className="mb-8">
          <div className="bg-orange-50 border-l-4 border-orange-500 p-6 rounded-r-lg">
            <h2 className="text-2xl font-bold text-orange-800 mb-4">Casos Especiales</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Son aquellos en los cuales los solicitantes calificaban para el período (1) Inclusión pero no 
              presentaron en la fecha. Para estos casos especiales pasaran a la modalidad de evaluación del 
              período II- Regular.
            </p>
            <div className="mt-4 bg-white/50 p-4 rounded-lg">
              <h3 className="text-lg font-bold text-orange-800 mb-3">Para aplicar como caso especial, los requisitos son los siguientes:</h3>
              <ul className="list-decimal pl-5 space-y-3 text-gray-700">
                <li>
                  <span className="font-semibold">Carta laboral</span> emitida por la institución en donde labora (con firma y sello por dirección médica o recursos humanos).
                </li>
                <li>
                  <span className="font-semibold">Carta de no objeción</span> para presentar el Board Latinoamericano de Perfusión de la sociedad de perfusionistas del país donde labora dirigida al Board Latinoamericano de Perfusión. Si no hay sociedad de perfusionistas enviar una carta o constancia de la Asociación Latinoamericana de Perfusión como miembro activo.
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Botón de contacto */}
        <div className="text-center mt-12">
          <button
            onClick={handleEmailClick}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors shadow-md hover:shadow-lg"
          >
            Enviar Correo de Aplicación
          </button>
        </div>
      </div>
    </div>
  );
};

export default RequisitosPage;