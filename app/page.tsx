'use client';

import React, { useEffect, useState } from 'react';
import {
  Clock,
  DollarSign,
  Users,
  Award,
  Globe,
  CheckCircle,
  AlertCircle,
  Megaphone,
  Bell,
  ClipboardList,
  BookOpen,
  ShieldCheck,
} from 'lucide-react';
import CompanionCard from "@/components/CompanionCard";
import CompanionsList from "@/components/CompanionsList";
import CTA from "@/components/CTA";
import { getAllCompanions, getRecentSessions } from "@/lib/actions/companion.actions";
import { getSubjectColor } from "@/lib/utils";

const CertificationPage = () => {
  const [companions, setCompanions] = useState([]);
  const [recentSessionsCompanions, setRecentSessionsCompanions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [companionsData, recentSessionsData] = await Promise.all([
          getAllCompanions({ limit: 3 }),
          getRecentSessions(10),
        ]);

        setCompanions(companionsData);
        setRecentSessionsCompanions(recentSessionsData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const countries = [
    { name: 'México', count: 60 },
    { name: 'Colombia', count: 42 },
    { name: 'Brazil', count: 30 },
    { name: 'Argentina', count: 27 },
    { name: 'Venezuela', count: 16 },
    { name: 'Perú', count: 14 },
    { name: 'Chile', count: 12 },
    { name: 'Ecuador', count: 12 },
    { name: 'Rep. Dominicana', count: 11 },
    { name: 'Uruguay', count: 11 },
    { name: 'Panamá', count: 10 },
    { name: 'Paraguay', count: 9 },
    { name: 'El Salvador', count: 5 },
    { name: 'Guatemala', count: 5 },
    { name: 'Cuba', count: 3 },
    { name: 'Bolivia', count: 2 },
    { name: 'Costa Rica', count: 2 },
    { name: 'Honduras', count: 2 },
    { name: 'Jamaica', count: 2 },
    { name: 'Puerto Rico', count: 1 },
    { name: 'Trinidad y Tobago', count: 1 },
  ];

  const timeZones = [
    { city: 'Caracas, Venezuela', time: '3:00 PM', flag: '🇻🇪' },
    { city: 'Bogotá, Colombia', time: '2:00 PM', flag: '🇨🇴' },
    { city: 'Lima, Perú', time: '2:00 PM', flag: '🇵🇪' },
    { city: 'Buenos Aires, Argentina', time: '4:00 PM', flag: '🇦🇷' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white py-20">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-6xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
            <Award className="w-5 h-5 text-yellow-300" />
            <span className="text-sm font-medium">Certificación Profesional</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
            Board Latinoamericano de Perfusión
          </h1>
          <p className="text-xl text-blue-100 max-w-3xl mx-auto leading-relaxed">
            Únete a los 274 profesionales certificados en perfusión cardiovascular en toda Latinoamérica
          </p>
        </div>
      </section>

      {/* Exam Info Cards */}
      <section className="max-w-7xl mx-auto px-6 -mt-12 relative z-10">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Período II - CLOSED */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden opacity-90">
            <div className="bg-gradient-to-r from-gray-600 to-slate-600 p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-2xl font-bold">Período II (Regular) 2025</h3>
                <div className="flex items-center gap-2 bg-red-500/20 backdrop-blur-sm rounded-full px-3 py-1">
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-sm font-medium">CERRADO</span>
                </div>
              </div>
              <div className="text-4xl font-bold text-center bg-white/10 rounded-xl py-4">
                04 OCT 2025
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-gray-50 rounded-xl">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Users className="w-6 h-6 text-gray-600" />
                  </div>
                  <div className="text-2xl font-bold text-gray-700">130-200</div>
                  <div className="text-sm text-gray-600">Preguntas</div>
                </div>

                <div className="text-center p-4 bg-gray-50 rounded-xl">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <DollarSign className="w-6 h-6 text-gray-600" />
                  </div>
                  <div className="text-2xl font-bold text-gray-700">$120</div>
                  <div className="text-sm text-gray-600">USD</div>
                </div>

                <div className="text-center p-4 bg-gray-50 rounded-xl">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Award className="w-6 h-6 text-gray-600" />
                  </div>
                  <div className="text-2xl font-bold text-gray-700">70%</div>
                  <div className="text-sm text-gray-600">Aprobación</div>
                </div>

                <div className="text-center p-4 bg-gray-50 rounded-xl">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Clock className="w-6 h-6 text-gray-600" />
                  </div>
                  <div className="text-2xl font-bold text-gray-700">3h</div>
                  <div className="text-sm text-gray-600">Duración</div>
                </div>
              </div>

              <div className="text-center">
                <p className="text-sm text-gray-500 mb-4">Convocatoria finalizada</p>
                <button
                  className="w-full bg-gray-300 text-gray-600 font-bold py-4 px-6 rounded-xl cursor-not-allowed"
                  disabled
                >
                  Período Cerrado
                </button>
              </div>
            </div>
          </div>

          {/* Período I - Closed (histórico) */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden opacity-75">
            <div className="bg-gradient-to-r from-gray-500 to-slate-500 p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-2xl font-bold">Período I (Inclusión) 2021-2022</h3>
                <div className="flex items-center gap-2 bg-red-500/20 backdrop-blur-sm rounded-full px-3 py-1">
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-sm font-medium">CERRADO</span>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-gray-50 rounded-xl">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Users className="w-6 h-6 text-gray-500" />
                  </div>
                  <div className="text-2xl font-bold text-gray-500">130</div>
                  <div className="text-sm text-gray-500">Preguntas</div>
                </div>

                <div className="text-center p-4 bg-gray-50 rounded-xl">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <DollarSign className="w-6 h-6 text-gray-500" />
                  </div>
                  <div className="text-2xl font-bold text-gray-500">$120</div>
                  <div className="text-sm text-gray-500">USD</div>
                </div>

                <div className="text-center p-4 bg-gray-50 rounded-xl">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Award className="w-6 h-6 text-gray-500" />
                  </div>
                  <div className="text-2xl font-bold text-gray-500">50%</div>
                  <div className="text-sm text-gray-500">Aprobación</div>
                </div>

                <div className="text-center p-4 bg-gray-50 rounded-xl">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Clock className="w-6 h-6 text-gray-500" />
                  </div>
                  <div className="text-2xl font-bold text-gray-500">2h</div>
                  <div className="text-sm text-gray-500">Duración</div>
                </div>
              </div>

              <div className="text-center">
                <p className="text-sm text-gray-500 mb-4">3 Oportunidades extra</p>
                <button className="w-full bg-gray-300 text-gray-500 font-bold py-4 px-6 rounded-xl cursor-not-allowed" disabled>
                  Período Cerrado
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Time Zones Section */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">Horarios por País</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            El examen es a la misma hora en todos los países. Ubica la hora correspondiente de tu país:
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {timeZones.map((zone, index) => (
            <div
              key={index}
              className="bg-white rounded-xl shadow-lg p-6 text-center hover:shadow-xl transition-shadow duration-300"
            >
              <div className="text-4xl mb-3">{zone.flag}</div>
              <div className="text-2xl font-bold text-blue-600 mb-2">{zone.time}</div>
              <div className="text-gray-600 text-sm">{zone.city}</div>
            </div>
          ))}
        </div>
      </section>

      {/* RECERTIFICACIÓN: contenido de las imágenes */}
      <section className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 py-16 border-y">
        <div className="max-w-7xl mx-auto px-6">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-blue-100 rounded-full px-4 py-2 mb-4">
              <Megaphone className="w-5 h-5 text-blue-700" />
              <span className="text-sm font-medium text-blue-700">Recertificación PCC</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800">Avisos y Requisitos</h2>
          </div>

          {/* Two-column info from images 1 & 2 */}
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {/* Anuncio Importante */}
            <div className="bg-white rounded-2xl shadow-xl border p-8">
              <div className="flex items-center gap-3 mb-4">
                <Bell className="w-6 h-6 text-amber-500" />
                <h3 className="text-2xl font-bold text-gray-800">Anuncio importante</h3>
              </div>
              <p className="text-blue-700 font-semibold mb-3">
                Estimado PCC: Carga tus casos clínicos <span className="text-red-600">SIN COSTO ALGUNO</span>,
                ANTES del <span className="font-bold">31-01-2024</span>.
              </p>
              <div className="space-y-2 text-gray-700">
                <p className="font-semibold">40 CASOS:</p>
                <ul className="list-disc ml-6 space-y-1">
                  <li>Son <span className="font-semibold">13 casos</span> como Perfusionista principal.</li>
                  <li>
                    El resto de los casos pueden ser como asistente, manejo de autotransfusión, ECMO.
                  </li>
                </ul>
              </div>
              <div className="mt-6 text-sm text-gray-500">
                Más información en{' '}
                <a
                  href="https://www.boardlatinoamericanodeperfusion.com"
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-600 underline"
                >
                  boardlatinoamericanodeperfusion.com
                </a>
              </div>
            </div>

            {/* Qué hacer si no completas los 40 casos */}
            <div className="bg-white rounded-2xl shadow-xl border p-8">
              <div className="flex items-center gap-3 mb-4">
                <ClipboardList className="w-6 h-6 text-indigo-600" />
                <h3 className="text-2xl font-bold text-gray-800">¿No completas los 40 casos en 1 año?</h3>
              </div>
              <ul className="space-y-3 text-gray-700">
                <li>
                  Debes cargar los casos que tengas (<span className="font-semibold">al menos 13</span>).
                </li>
                <li>
                  Puedes obtener crédito por casos asistiendo a las próximas <span className="font-semibold">salas de estudio </span>
                  en donde se discutirán casos clínicos.
                </li>
              </ul>
              <div className="mt-6">
                <a
                  href="/board/cita-online"
                  className="inline-flex items-center justify-center w-full bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-semibold py-3 px-6 rounded-xl hover:from-indigo-700 hover:to-blue-700 transition-all"
                >
                  Ver próximas salas de estudio
                </a>
                <p className="text-sm text-gray-500 text-center mt-3">
                  Contacto: <a href="mailto:info@boardlatinoamericanodeperfusion.com" className="underline text-blue-600">info@boardlatinoamericanodeperfusion.com</a>
                </p>
              </div>
            </div>
          </div>

          {/* Tipos de categorías (imagen 3) */}
          <div className="bg-white rounded-2xl shadow-xl border p-8">
            <div className="flex items-center gap-3 mb-6">
              <ShieldCheck className="w-6 h-6 text-green-600" />
              <h3 className="text-2xl font-bold text-gray-800">Tipos de categorías de PCC</h3>
            </div>

            <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-6">
              {/* ACTIVO */}
              <div className="rounded-xl p-6 border bg-gradient-to-b from-green-50 to-white">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-2 h-2 rounded-full bg-green-600" />
                  <h4 className="font-bold text-green-700">PCCa: ACTIVO</h4>
                </div>
                <p className="text-sm text-gray-700 leading-relaxed">
                  Declara actividad clínica <span className="font-semibold">40 casos anualmente</span> (de Enero a Enero)
                  y declara actividad académica mediante <span className="font-semibold">45 UCE</span> durante un periodo de 3 años.
                </p>
              </div>

              {/* INACTIVO */}
              <div className="rounded-xl p-6 border bg-gradient-to-b from-amber-50 to-white">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-2 h-2 rounded-full bg-amber-600" />
                  <h4 className="font-bold text-amber-700">PCCi: INACTIVO</h4>
                </div>
                <p className="text-sm text-gray-700 leading-relaxed">
                  Declara actividad académica mediante <span className="font-semibold">45 UCE</span> durante un periodo de 3 años,
                  <span className="font-semibold"> no declara actividad clínica</span> de 40 casos anualmente.
                </p>
              </div>

              {/* EMERITUS */}
              <div className="rounded-xl p-6 border bg-gradient-to-b from-indigo-50 to-white">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-2 h-2 rounded-full bg-indigo-600" />
                  <h4 className="font-bold text-indigo-700">PCCe: EMERITUS</h4>
                </div>
                <p className="text-sm text-gray-700 leading-relaxed">
                  Emeritus <span className="font-semibold">no declara actividad clínica</span>; puede declarar actividad académica.
                </p>
              </div>

              {/* EN REVISIÓN */}
              <div className="rounded-xl p-6 border bg-gradient-to-b from-rose-50 to-white">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-2 h-2 rounded-full bg-rose-600" />
                  <h4 className="font-bold text-rose-700">PPCr: EN REVISIÓN</h4>
                </div>
                <p className="text-sm text-gray-700 leading-relaxed">
                  PCC que no ha cumplido con su categoría con un periodo de retraso de igual o mayor a 6 meses.
                  Si al cabo de 1 año no ha declarado actividad, <span className="font-semibold">perderá la certificación</span>,
                  la cual para recuperarse debe certificarse nuevamente a través del examen.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PCCs Statistics */}
      <section className="bg-gradient-to-r from-indigo-50 via-blue-50 to-purple-50 py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-indigo-100 rounded-full px-4 py-2 mb-4">
              <Globe className="w-5 h-5 text-indigo-600" />
              <span className="text-sm font-medium text-indigo-600">Registro Oficial PCC</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">Profesionales Certificados</h2>
            <div className="text-6xl font-bold text-indigo-600 mb-2">274</div>
            <p className="text-xl text-gray-600">PCCs activos en Latinoamérica</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {countries.map((country, index) => (
              <div
                key={index}
                className="bg-white rounded-lg p-4 text-center shadow-sm hover:shadow-md transition-shadow duration-300"
              >
                <div className="text-2xl font-bold text-indigo-600 mb-1">{country.count}</div>
                <div className="text-sm text-gray-600">{country.name}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Companions Section */}
      <main className="max-w-7xl mx-auto px-6 py-16">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-8 text-center">Acompañantes Populares</h1>

        <section className="home-section mb-16">
          {companions.map((companion) => (
            <CompanionCard key={companion.id} {...companion} color={getSubjectColor(companion.subject)} />
          ))}
        </section>

        <section className="home-section">
          <CompanionsList
            title="Secciones recientementes completadas"
            companions={recentSessionsCompanions}
            classNames="w-2/3 max-lg:w-full"
          />
          <CTA />
        </section>
      </main>
    </div>
  );
};

export default CertificationPage;
