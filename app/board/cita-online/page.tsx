'use client';

import React, { useEffect, useState } from 'react';
import Script from 'next/script';
import { Calendar, Clock, Video, Phone, User, CheckCircle, Star, ArrowRight } from 'lucide-react';

const calendlyUrl =
  'https://calendly.com/e-henriquezmars/board-latinoamericano-de-perfusion?month=2025-10';

export default function OnlineAppointmentPage() {
  // Spinner overlay mientras aparece el iframe
  const [inlineReady, setInlineReady] = useState(false);

  // CSS del widget (recomendado por Calendly)
  useEffect(() => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://assets.calendly.com/assets/external/widget.css';
    document.head.appendChild(link);
    return () => {
      if (document.head.contains(link)) document.head.removeChild(link);
    };
  }, []);

  // Detectar cuando Calendly inyectó el iframe
  useEffect(() => {
    const iv = setInterval(() => {
      const hasIframe = document.querySelector<HTMLIFrameElement>('#calendly-inline iframe');
      if (hasIframe) {
        setInlineReady(true);
        clearInterval(iv);
      }
    }, 300);
    return () => clearInterval(iv);
  }, []);

  const services = [
    {
      id: 'consultation',
      title: 'Consultoría Técnica',
      duration: '40 minutos',
      price: 'Gratuita',
      description:
        'Asesoría personalizada sobre procedimientos de perfusión y mejores prácticas',
      features: ['Revisión de casos clínicos', 'Recomendaciones técnicas', 'Seguimiento posterior'],
    },
    {
      id: 'certification',
      title: 'Orientación para Certificación',
      duration: '40 minutos',
      price: 'Gratuita',
      description:
        'Guía para el proceso de certificación del Board Latinoamericano de Perfusión',
      features: ['Revisión de requisitos', 'Plan de estudio', 'Tips para el examen'],
    },
    {
      id: 'training',
      title: 'Sesión de Entrenamiento',
      duration: '40 minutos',
      price: '$40 USD',
      description: 'Entrenamiento especializado en técnicas avanzadas de perfusión',
      features: ['Simulación de casos', 'Práctica dirigida', 'Plantea un tema de estudio'],
    },
  ];

  const testimonials = [
    {
      name: 'Dr. María González',
      role: 'Perfusionista Cardiovascular',
      country: 'México',
      rating: 5,
      comment:
        'La consultoría fue excepcional. Recibí orientación muy valiosa para mejorar mis técnicas de perfusión.',
    },
    {
      name: 'Carlos Rodríguez',
      role: 'Perfusionista Senior',
      country: 'Colombia',
      rating: 5,
      comment:
        'El proceso de agendamiento fue muy fácil y la sesión superó mis expectativas. Muy recomendado.',
    },
    {
      name: 'Ana Pérez',
      role: 'Candidata a Certificación',
      country: 'Argentina',
      rating: 5,
      comment:
        'La orientación para certificación me ayudó enormemente. Aprobé el Board en mi primer intento.',
    },
  ];

  const ServiceCard = ({ service }: { service: any }) => {
    const openCalendly = () => {
      const w = window as any;
      if (w?.Calendly) {
        w.Calendly.initPopupWidget({
          url: calendlyUrl + '&hide_event_type_details=1&hide_gdpr_banner=1',
        });
      } else {
        document.getElementById('calendly-inline')?.scrollIntoView({ behavior: 'smooth' });
      }
    };

    return (
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden border-l-4 border-blue-500 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
        <div className="p-8">
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-gray-800 mb-2">{service.title}</h3>
              <div className="flex items-center space-x-4 text-sm text-gray-600 mb-4">
                <div className="flex items-center space-x-1">
                  <Clock className="h-4 w-4" />
                  <span>{service.duration}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <span
                    className={`font-semibold ${
                      service.price === 'Gratuita' ? 'text-green-600' : 'text-blue-600'
                    }`}
                  >
                    {service.price}
                  </span>
                </div>
              </div>
              <p className="text-gray-600 mb-6 leading-relaxed">{service.description}</p>
            </div>
          </div>

          <div className="mb-6">
            <h4 className="font-semibold text-gray-800 mb-3">Lo que incluye:</h4>
            <ul className="space-y-2">
              {service.features.map((feature: string, index: number) => (
                <li key={index} className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-gray-600 text-sm">{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          <button
            onClick={openCalendly}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center space-x-2 group"
          >
            <Calendar className="h-5 w-5" />
            <span>Agendar Cita</span>
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Script oficial de Calendly: cargar ASAP después de hidratar */}
      <Script
        src="https://assets.calendly.com/assets/external/widget.js"
        strategy="afterInteractive"
      />

      {/* Header */}
      <div className="bg-white shadow-lg border-b-4 border-blue-600">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-800 mb-4">Citas Online</h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Agenda una consulta personalizada con nuestros expertos en perfusión. Recibe
              orientación profesional desde la comodidad de tu hogar.
            </p>

            {/* Badges informativos */}
            <div className="flex flex-wrap justify-center gap-4 text-sm">
              <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full flex items-center space-x-2">
                <Video className="h-4 w-4" />
                <span>Videollamada HD</span>
              </div>
              <div className="bg-green-100 text-green-800 px-4 py-2 rounded-full flex items-center space-x-2">
                <Phone className="h-4 w-4" />
                <span>También por teléfono</span>
              </div>
              <div className="bg-purple-100 text-purple-800 px-4 py-2 rounded-full flex items-center space-x-2">
                <User className="h-4 w-4" />
                <span>Sesiones 1:1</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Servicios */}
        <section className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">Nuestros Servicios</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Elige el tipo de consulta que mejor se adapte a tus necesidades profesionales
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {services.map((service) => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </div>
        </section>

        {/* ¿Cómo funciona? */}
        <section className="mb-16">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">¿Cómo funciona?</h2>

            <div className="grid md:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((step) => (
                <div key={step} className="text-center">
                  <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-white font-bold text-xl">{step}</span>
                  </div>
                  <h3 className="font-semibold text-gray-800 mb-2">
                    {step === 1 && 'Selecciona tu servicio'}
                    {step === 2 && 'Agenda tu cita'}
                    {step === 3 && 'Recibe confirmación'}
                    {step === 4 && '¡Conéctate!'}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    {step === 1 && 'Elige el tipo de consulta que necesitas'}
                    {step === 2 && 'Selecciona fecha y hora disponible'}
                    {step === 3 && 'Te enviaremos el enlace de la videollamada'}
                    {step === 4 && 'Únete a tu sesión a la hora programada'}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Calendly Inline (sin botón) */}
        <section className="mb-2">
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="relative p-0">
              {/* Spinner overlay hasta que aparezca el iframe */}
              {!inlineReady && (
                <div className="absolute inset-0 flex items-center justify-center z-10 bg-white/60">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto mb-3" />
                    <p className="text-gray-600">Cargando calendario...</p>
                  </div>
                </div>
              )}

              {/* El contenedor inline SIEMPRE está presente */}
              <div
                id="calendly-inline"
                className="calendly-inline-widget"
                data-url={`${calendlyUrl}&hide_event_type_details=1&hide_gdpr_banner=1`}
                style={{ minWidth: '320px', height: '680px' }}
              />
            </div>
          </div>
        </section>

        {/* Testimonios */}
        <section className="mt-4">
          <div className="text-center mb-8">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">Lo que dicen nuestros clientes</h2>
            <p className="text-xl text-gray-600">
              Experiencias reales de perfusionistas que han usado nuestros servicios
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((t, i) => (
              <div key={i} className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center mb-4">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <Star key={j} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 mb-4 italic">"{t.comment}"</p>
                <div className="border-t pt-4">
                  <p className="font-semibold text-gray-800">{t.name}</p>
                  <p className="text-sm text-gray-600">{t.role}</p>
                  <p className="text-sm text-blue-600">{t.country}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA final */}
        <div className="text-center bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl p-12 text-white mt-10">
          <h3 className="text-4xl font-bold mb-4">¿Listo para mejorar tu práctica?</h3>
          <p className="text-xl mb-8 opacity-90">
            No esperes más. Agenda tu consulta personalizada hoy mismo.
          </p>
          <button
            onClick={() =>
              document.getElementById('calendly-inline')?.scrollIntoView({ behavior: 'smooth' })
            }
            className="bg-white text-blue-600 font-bold py-4 px-8 rounded-lg hover:bg-gray-100 transition-colors text-lg"
          >
            Agendar mi Cita Ahora
          </button>
        </div>
      </div>
    </div>
  );
}
