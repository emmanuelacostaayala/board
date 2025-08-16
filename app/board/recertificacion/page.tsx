'use client';

import React, { useState } from 'react';

const RecertificationPage = () => {
  const [activeTab, setActiveTab] = useState('categoria1');

  const handleEmailClick = () => {
    window.location.href = 'mailto:Director@boardlatinoamericanodeperfusion.com';
  };

  const categoriaData = {
    categoria1: [
      {
        activity: "Asistir a conferencia Internacional, nacional, simposio regional o seminario web aprobado por ALAP",
        credits: "Sin límites (Los UCE que otorga la conferencia)"
      },
      {
        activity: "Publicación de capítulo en libro, artículo en revista EnBomba o cualquier otra publicación relacionada con la perfusión.",
        credits: "10 UCE por publicación en revista\n25 UCE por publicación en capítulo de Libro."
      },
      {
        activity: "Presentación como conferencista internacional, nacional, regional en evento de perfusión o relacionado modalidad especial.",
        credits: "5 UCE por conferencia impartida"
      },
      {
        activity: "Publicación de poster u otra exhibición en evento internacional, regional, editor miembro del comité de revisión revista EnBomba u otra publicación científica.",
        credits: "5 UCE publicación de poster\n10 editor miembro del comité de revisión revista EnBomba u otra publicación científica"
      },
      {
        activity: "Participación en encuesta ALAP con UCE",
        credits: "2 UCE por participar en una encuesta"
      },
      {
        activity: "Instructor Clínico en Escuela ALAP o escuela avalada por el Board.",
        credits: "10 UCE por Año"
      },
      {
        activity: "Instructor Taller ALAP",
        credits: "6 UCE por Taller"
      },
      {
        activity: "Curso Online Instructor ALAP",
        credits: "10 UCE por curso"
      },
      {
        activity: "Curso online de Maestría relacionada a la perfusion con aval ALAP",
        credits: "Los créditos que otorgue el curso a través de aval ALAP",
        isItalic: true
      },
      {
        activity: "Conferencista de webinar o actividad online con aval ALAP",
        credits: "10 UCE, Máximo 30 UCE",
        isItalic: true
      }
    ],
    categoria2: [
      {
        activity: "Congreso de perfusión o Médico Internacional, Nacional o Regional SIN acreditación ALAP.",
        credits: "(Los créditos que otorgue la actividad, (Máximo 20 UCE para esta categoría.)"
      },
      {
        activity: "Simposio local de Perfusión sin Aval ALAP",
        credits: "(Los créditos que otorgue la actividad, (Máximo 20 UCE para esta categoría.) Si no otorga crédito, válido por 2 UCE."
      },
      {
        activity: "Conferencias médicas o de perfusión que no son accesibles para todos los perfusionistas. Eventos educativos privados de compañías médicas SIN aval ALAP.",
        credits: "(Los créditos que otorgue la actividad, (Máximo 20 UCE para esta categoría.) Si no otorga crédito, válido por 2 UCE."
      },
      {
        activity: "Conferencista de Webinar o actividad online SIN aval ALAP.",
        credits: "10 UCE máximo 30 UCE"
      },
      {
        activity: "Curso online relacionado con la perfusión SIN aval ALAP",
        credits: "(Los créditos que otorgue la actividad, (Máximo 20 UCE para esta categoría.) Si no otorga crédito, válido por 2 UCE."
      }
    ],
    categoria3: [
      {
        activity: "Curso de soporte vital básico o avanzados avalado la AHA (American Heart Association)",
        credits: "3 UCE por cada certificación (Realizado en el período de reporte UCE)"
      },
      {
        activity: "Curso de ECMO con o sin Aval ALAP",
        credits: "15 UCE : Por Curso con aval Universitario\n5 UCE : Por Curso sin aval universitario"
      },
      {
        activity: "Participación activa con más de tres intervenciones en los foros ALAP WEB o APP ALAP. (Período 6 Meses)",
        credits: "3 UCE por cada 6 meses."
      },
      {
        activity: "Miembro de alguna otra sociedad, asociación de perfusión nacional o internacional diferente a ALAP",
        credits: "3 UCE por cada asociación"
      }
    ]
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header moderno */}
      <div className="bg-white shadow-lg border-b-4 border-blue-600">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-5xl md:text-6xl font-bold text-gray-800 mb-2">
                Proceso de Recertificación
              </h1>
              <p className="text-xl text-gray-600">Board Latinoamericano de Perfusión</p>
            </div>
            <div className="w-24 h-24 bg-gradient-to-br from-blue-600 to-blue-800 rounded-full flex items-center justify-center shadow-xl">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center">
                <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-700 rounded-full flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-sm">BLP</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Tarjetas principales con diseño mejorado */}
        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          {/* Actividad Clínica */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden border-l-4 border-blue-500">
            <div className="p-8">
              <div className="flex items-center mb-6">
                <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                <h2 className="text-3xl font-bold text-gray-800">Actividad Clínica</h2>
              </div>
              <div className="bg-orange-50 border-l-4 border-orange-400 p-4 rounded-r-lg mb-8">
                <p className="text-orange-700 text-xl font-semibold">Casos requeridos: 40</p>
              </div>
              
              {/* Tabla de casos mejorada */}
              <div className="mb-8 overflow-hidden rounded-lg shadow-md">
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 grid grid-cols-2 gap-4 font-semibold">
                  <div className="text-lg">Casos</div>
                  <div className="text-lg">Función</div>
                </div>
                
                <div className="bg-blue-500 text-white p-4 grid grid-cols-2 gap-4 items-center">
                  <div className="text-2xl font-bold">5</div>
                  <div className="text-sm leading-relaxed">Asistente de Perfusión<br/>(Perfusionista 2)</div>
                </div>
                
                <div className="bg-blue-400 text-white p-4 grid grid-cols-2 gap-4 items-center">
                  <div className="text-2xl font-bold">2</div>
                  <div className="text-sm leading-relaxed">Manejo <span className="font-bold">únicamente</span><br/>de Autotranfusor</div>
                </div>
                
                <div className="bg-blue-500 text-white p-4 grid grid-cols-2 gap-4 items-center">
                  <div className="text-2xl font-bold">Sin Límites</div>
                  <div className="text-sm leading-relaxed">Perfusionista Principal<br/>ECMO o Asistencia<br/>(1 Caso = 24 Horas)</div>
                </div>
              </div>

              {/* Plataforma virtual */}
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 rounded-xl shadow-lg">
                <div className="flex items-center gap-6">
                  <div className="text-4xl font-bold">20</div>
                  <div className="flex-1">
                    <p className="text-sm leading-relaxed">Plataforma virtual de simulación de caso ALAP o plataforma aprobada por el Board.</p>
                  </div>
                </div>
              </div>
              
              <div className="text-right mt-4">
                <span className="text-sm font-semibold bg-blue-100 text-blue-800 px-3 py-2 rounded-full">Cada Año</span>
              </div>
            </div>
          </div>

          {/* Actividad Científica */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden border-l-4 border-orange-500">
            <div className="p-8">
              <div className="flex items-center mb-6">
                <div className="w-3 h-3 bg-orange-500 rounded-full mr-3"></div>
                <h2 className="text-3xl font-bold text-gray-800">Actividad Científica</h2>
              </div>
              
              <div className="bg-orange-50 border-l-4 border-orange-400 p-4 rounded-r-lg mb-8">
                <p className="text-gray-600 text-sm mb-1">Unidades Credito Educativo (UCE)</p>
                <p className="text-orange-700 text-xl font-semibold">UCE requeridos: 45</p>
              </div>
              
              {/* Tabla UCE mejorada */}
              <div className="mb-8 overflow-hidden rounded-lg shadow-md">
                <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-4 grid grid-cols-2 gap-4 font-semibold">
                  <div className="text-lg">UCE</div>
                  <div className="text-lg">Cantidad</div>
                </div>
                
                <div className="bg-orange-400 text-white p-4 grid grid-cols-2 gap-4 items-center">
                  <div>Categoría I</div>
                  <div className="text-2xl font-bold">45</div>
                </div>
                
                <div className="bg-orange-300 text-white p-4 grid grid-cols-2 gap-4 items-center">
                  <div>Categoría II</div>
                  <div className="text-2xl font-bold">45</div>
                </div>
                
                <div className="bg-orange-400 text-white p-4 grid grid-cols-2 gap-4 items-center">
                  <div>Categoría III</div>
                  <div className="text-2xl font-bold">45</div>
                </div>
              </div>

              <div className="text-right mb-6">
                <span className="text-sm font-semibold bg-orange-100 text-orange-800 px-3 py-2 rounded-full">Cada tres años</span>
              </div>

              <div className="bg-gray-50 border-l-4 border-gray-400 p-6 rounded-r-lg">
                <p className="text-sm text-gray-700 leading-relaxed">
                  Cada perfusionista deberá acumular un total de 45 Unidades Créditos Educativos en un periodo de 3 Años, <span className="font-bold italic">independientemente de la categoría.</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* UCE's Crédito por Categoría con Tabs */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-12">
          <div className="p-8">
            <h2 className="text-4xl font-bold text-gray-800 mb-8 pb-4 border-b-2 border-blue-600">
              UCE's Crédito por Categoría
            </h2>
            
            {/* Navegación por tabs */}
            <div className="flex mb-8 bg-gray-100 rounded-xl p-1">
              <button
                onClick={() => setActiveTab('categoria1')}
                className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-all duration-300 ${
                  activeTab === 'categoria1'
                    ? 'bg-red-600 text-white shadow-lg transform scale-105'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Categoría I
              </button>
              <button
                onClick={() => setActiveTab('categoria2')}
                className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-all duration-300 ${
                  activeTab === 'categoria2'
                    ? 'bg-red-600 text-white shadow-lg transform scale-105'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Categoría II
              </button>
              <button
                onClick={() => setActiveTab('categoria3')}
                className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-all duration-300 ${
                  activeTab === 'categoria3'
                    ? 'bg-red-600 text-white shadow-lg transform scale-105'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Categoría III
              </button>
            </div>

            {/* Contenido de las categorías */}
            <div className="space-y-4">
              {categoriaData[activeTab].map((item, index) => (
                <div key={index} className="grid lg:grid-cols-2 gap-4">
                  <div className={`bg-blue-500 text-white p-6 rounded-lg shadow-md ${
                    item.isItalic ? 'italic font-bold' : ''
                  }`}>
                    {item.activity}
                  </div>
                  <div className={`bg-red-500 text-white p-6 rounded-lg shadow-md ${
                    item.isItalic ? 'italic font-bold' : ''
                  }`}>
                    {item.credits.split('\n').map((line, lineIndex) => (
                      <div key={lineIndex}>
                        {line}
                        {lineIndex < item.credits.split('\n').length - 1 && <br />}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Botón de contacto mejorado */}
        <div className="text-center">
          <div className="bg-white rounded-2xl shadow-xl p-8 inline-block">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">¿Necesitas más información?</h3>
            <button
              onClick={handleEmailClick}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-4 px-10 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              Consultar sobre Recertificación
            </button>
            <p className="text-gray-600 mt-4 text-sm">
              Nuestro equipo está aquí para ayudarte con cualquier duda
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecertificationPage;