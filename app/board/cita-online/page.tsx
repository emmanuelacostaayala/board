'use client';

import React, { useEffect, useState } from 'react';
import { Calendar, Clock, Video, Phone, User, CheckCircle, Star, ArrowRight } from 'lucide-react';

const OnlineAppointmentPage = () => {
  const [isCalendlyLoaded, setIsCalendlyLoaded] = useState(false);

  useEffect(() => {
    // Cargar el script de Calendly
    const script = document.createElement('script');
    script.src = 'https://assets.calendly.com/assets/external/widget.js';
    script.async = true;
    script.onload = () => setIsCalendlyLoaded(true);
    document.body.appendChild(script);

    return () => {
      // Cleanup
      const existingScript = document.querySelector('script[src="https://assets.calendly.com/assets/external/widget.js"]');
      if (existingScript) {
        document.body.removeChild(existingScript);
      }
    };
  }, []);

  // Datos de los servicios disponibles
  const services = [
    {
      id: 'consultation',
      title: 'Consultoría Técnica',
      duration: '40 minutos',
      price: 'Gratuita',
      description: 'Asesoría personalizada sobre procedimientos de perfusión y mejores prácticas',
      features: ['Revisión de casos clínicos', 'Recomendaciones técnicas', 'Seguimiento posterior'],
      calendlyUrl: 'https://calendly.com/your-account/consultoria-tecnica'
    },
    {
      id: 'certification',
      title: 'Orientación para Certificación',
      duration: '40 minutos',
      price: 'Gratuita',
      description: 'Guía para el proceso de certificación del Board Latinoamericano de Perfusión',
      features: ['Revisión de requisitos', 'Plan de estudio', 'Tips para el examen'],
      calendlyUrl: 'https://calendly.com/your-account/orientacion-certificacion'
    },
    {
      id: 'training',
      title: 'Sesión de Entrenamiento',
      duration: '40 minutos',
      price: '$40 USD',
      description: 'Entrenamiento especializado en técnicas avanzadas de perfusión',
      features: ['Simulación de casos', 'Práctica dirigida', 'Plantea un tema de estudio'],
      calendlyUrl: 'https://calendly.com/your-account/sesion-entrenamiento'
    }
  ];

  const testimonials = [
    {
      name: 'Dr. María González',
      role: 'Perfusionista Cardiovascular',
      country: 'México',
      rating: 5,
      comment: 'La consultoría fue excepcional. Recibí orientación muy valiosa para mejorar mis técnicas de perfusión.'
    },
    {
      name: 'Carlos Rodríguez',
      role: 'Perfusionista Senior',
      country: 'Colombia',
      rating: 5,
      comment: 'El proceso de agendamiento fue muy fácil y la sesión superó mis expectativas. Muy recomendado.'
    },
    {
      name: 'Ana Pérez',
      role: 'Candidata a Certificación',
      country: 'Argentina',
      rating: 5,
      comment: 'La orientación para certificación me ayudó enormemente. Aprobé el Board en mi primer intento.'
    }
  ];

  const ServiceCard = ({ service }) => {
    const openCalendly = () => {
      if (window.Calendly) {
        window.Calendly.initPopupWidget({
          url: service.calendlyUrl
        });
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
                  <span className={`font-semibold ${service.price === 'Gratuita' ? 'text-green-600' : 'text-blue-600'}`}>
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
              {service.features.map((feature, index) => (
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
      {/* Header */}
      <div className="bg-white shadow-lg border-b-4 border-blue-600">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-800 mb-4">
              Citas Online
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Agenda una consulta personalizada con nuestros expertos en perfusión. 
              Recibe orientación profesional desde la comodidad de tu hogar.
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
        {/* Sección de servicios */}
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

        {/* Sección de proceso */}
        <section className="mb-16">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">¿Cómo funciona?</h2>
            
            <div className="grid md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white font-bold text-xl">1</span>
                </div>
                <h3 className="font-semibold text-gray-800 mb-2">Selecciona tu servicio</h3>
                <p className="text-gray-600 text-sm">Elige el tipo de consulta que necesitas</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white font-bold text-xl">2</span>
                </div>
                <h3 className="font-semibold text-gray-800 mb-2">Agenda tu cita</h3>
                <p className="text-gray-600 text-sm">Selecciona fecha y hora disponible</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white font-bold text-xl">3</span>
                </div>
                <h3 className="font-semibold text-gray-800 mb-2">Recibe confirmación</h3>
                <p className="text-gray-600 text-sm">Te enviaremos el enlace de la videollamada</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white font-bold text-xl">4</span>
                </div>
                <h3 className="font-semibold text-gray-800 mb-2">¡Conéctate!</h3>
                <p className="text-gray-600 text-sm">Únete a tu sesión a la hora programada</p>
              </div>
            </div>
          </div>
        </section>

        {/* Widget de Calendly integrado */}
        <section className="mb-16">
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="p-8 border-b">
              <h2 className="text-3xl font-bold text-gray-800 text-center mb-4">
                Agenda tu Cita Directamente
              </h2>
              <p className="text-gray-600 text-center">
                O usa nuestro calendario integrado para ver todas las disponibilidades
              </p>
            </div>
            
            <div className="p-8">
              {isCalendlyLoaded ? (
                <div 
                  className="calendly-inline-widget" 
                  data-url="https://calendly.com/your-account/consultation"
                  style={{ minWidth: '320px', height: '700px' }}
                ></div>
              ) : (
                <div className="flex items-center justify-center h-96">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Cargando calendario...</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Testimonios */}
        <section className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">Lo que dicen nuestros clientes</h2>
            <p className="text-xl text-gray-600">
              Experiencias reales de perfusionistas que han usado nuestros servicios
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 mb-4 italic">"{testimonial.comment}"</p>
                <div className="border-t pt-4">
                  <p className="font-semibold text-gray-800">{testimonial.name}</p>
                  <p className="text-sm text-gray-600">{testimonial.role}</p>
                  <p className="text-sm text-blue-600">{testimonial.country}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section className="mb-16">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">Preguntas Frecuentes</h2>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="font-semibold text-gray-800 mb-2">¿Qué necesito para la videollamada?</h3>
                <p className="text-gray-600 text-sm mb-4">
                  Solo necesitas una conexión a internet estable, una cámara y micrófono. 
                  Te enviaremos un enlace que funciona en cualquier navegador.
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-800 mb-2">¿Puedo cancelar o reprogramar?</h3>
                <p className="text-gray-600 text-sm mb-4">
                  Sí, puedes cancelar o reprogramar hasta 24 horas antes de tu cita 
                  sin ningún costo adicional.
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-800 mb-2">¿En qué idiomas ofrecen consultas?</h3>
                <p className="text-gray-600 text-sm mb-4">
                  Ofrecemos consultas en español e inglés. 
                  Especifica tu preferencia al agendar.
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-800 mb-2">¿Recibiré material adicional?</h3>
                <p className="text-gray-600 text-sm mb-4">
                  Sí, después de cada consulta recibirás un resumen por email 
                  con recomendaciones y recursos adicionales.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA final */}
        <div className="text-center bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl p-12 text-white">
          <h3 className="text-4xl font-bold mb-4">¿Listo para mejorar tu práctica?</h3>
          <p className="text-xl mb-8 opacity-90">
            No esperes más. Agenda tu consulta personalizada hoy mismo.
          </p>
          <button
            onClick={() => {
              document.querySelector('.calendly-inline-widget').scrollIntoView({ 
                behavior: 'smooth' 
              });
            }}
            className="bg-white text-blue-600 font-bold py-4 px-8 rounded-lg hover:bg-gray-100 transition-colors text-lg"
          >
            Agendar mi Cita Ahora
          </button>
        </div>
      </div>
    </div>
  );
};

export default OnlineAppointmentPage;