'use client';

import React, { useState } from 'react';
import {
  CheckCircle,
  Users,
  DollarSign,
  Award,
  Clock,
  Globe,
} from 'lucide-react';

const AplicarPage = () => {
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    correo: '',
    telefono: '',
    modoExamen: '', // Nuevo campo
  });

  const [files, setFiles] = useState({
    titulo: null,
    perfusiones: null,
    notas: null,
    trabajo: null,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e, fileType) => {
    const file = e.target.files[0];
    if (file && file.size > 15 * 1024 * 1024) { // 15MB
      alert('El archivo no puede ser mayor a 15MB');
      return;
    }
    setFiles(prev => ({
      ...prev,
      [fileType]: file
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitMessage('');

    // Validación básica
    if (!formData.nombre || !formData.apellido || !formData.correo || !formData.telefono || !formData.modoExamen) {
      setSubmitMessage('Por favor, completa todos los campos obligatorios, incluyendo la modalidad del examen.');
      setIsSubmitting(false);
      return;
    }

    if (!files.titulo || !files.perfusiones || !files.notas || !files.trabajo) {
      setSubmitMessage('Por favor, sube todos los documentos requeridos.');
      setIsSubmitting(false);
      return;
    }

    try {
      // Crear FormData para enviar archivos
      const formDataToSend = new FormData();

      // Agregar datos del formulario
      Object.keys(formData).forEach(key => {
        formDataToSend.append(key, formData[key]);
      });

      // Agregar archivos
      Object.keys(files).forEach(key => {
        if (files[key]) {
          formDataToSend.append(key, files[key]);
        }
      });

      // Aquí harías la llamada a tu API endpoint
      const response = await fetch('/api/send-application', {
        method: 'POST',
        body: formDataToSend,
      });

      if (response.ok) {
        setSubmitMessage('¡Aplicación enviada exitosamente! Te llegará un correo con el link de pago en los próximos días.');
        // Limpiar formulario
        setFormData({
          nombre: '',
          apellido: '',
          correo: '',
          telefono: '',
          modoExamen: '',
        });
        setFiles({
          titulo: null,
          perfusiones: null,
          notas: null,
          trabajo: null,
        });
        // Limpiar inputs de archivo
        document.querySelectorAll('input[type="file"]').forEach(input => {
          input.value = '';
        });
      } else {
        throw new Error('Error al enviar la aplicación');
      }
    } catch (error) {
      console.error('Error:', error);
      setSubmitMessage('Hubo un error al enviar la aplicación. Por favor, intenta nuevamente.');
    }

    setIsSubmitting(false);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold text-center mb-2 text-gray-800">
          APLICACIÓN
        </h1>
        <p className="text-center text-gray-600 mb-8">
          Una vez envíes el formulario, te llegará un correo con el link de pago en los próximos días.
        </p>

        {/* Info del Examen: Dos columnas */}
        <div className="grid md:grid-cols-2 gap-6 mb-10">
          {/* Presencial */}
          <div className="bg-white rounded-2xl shadow-md border border-green-200 overflow-hidden">
            <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-4 text-white hover:bg-green-600 transition cursor-default">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-bold">El Salvador</h3>
                <div className="flex items-center gap-1 bg-white/20 backdrop-blur-sm rounded-full px-2 py-0.5">
                  <CheckCircle className="w-3 h-3" />
                  <span className="text-xs font-medium">Presencial</span>
                </div>
              </div>
              <div className="text-center bg-white/10 rounded-lg py-1.5 mb-2">
                <div className="text-xl font-bold">19 y 20 JUN 2026</div>
                <div className="text-xs mt-0.5 text-green-100 font-medium">Examen: Sáb 20 JUN</div>
              </div>
            </div>
            <div className="p-4 grid grid-cols-2 gap-2 text-center text-sm">
              <div className="bg-blue-50 p-2 rounded">
                <div className="font-bold text-blue-600">130-200</div>
                <div className="text-xs text-gray-500">Preguntas</div>
              </div>
              <div className="bg-green-50 p-2 rounded">
                <div className="font-bold text-green-600">$120</div>
                <div className="text-xs text-gray-500">USD</div>
              </div>
            </div>
          </div>

          {/* Online */}
          <div className="bg-white rounded-2xl shadow-md border border-blue-200 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-500 to-indigo-500 p-4 text-white hover:bg-blue-600 transition cursor-default">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-bold">Online</h3>
                <div className="flex items-center gap-1 bg-white/20 backdrop-blur-sm rounded-full px-2 py-0.5">
                  <Globe className="w-3 h-3" />
                  <span className="text-xs font-medium">Virtual</span>
                </div>
              </div>
              <div className="text-2xl font-bold text-center bg-white/10 rounded-lg py-2">31 OCT 2026</div>
              <p className="text-center text-blue-100 text-xs mt-1">3:00 PM Hora Caracas</p>
            </div>
            <div className="p-4 grid grid-cols-2 gap-2 text-center text-sm">
              <div className="bg-blue-50 p-2 rounded">
                <div className="font-bold text-blue-600">130-200</div>
                <div className="text-xs text-gray-500">Preguntas</div>
              </div>
              <div className="bg-green-50 p-2 rounded">
                <div className="font-bold text-green-600">$120</div>
                <div className="text-xs text-gray-500">USD</div>
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Selección de Modalidad */}
          <div className="bg-blue-50 p-6 rounded-lg border border-blue-100">
            <label className="block text-lg font-bold text-gray-800 mb-4">
              Selecciona la modalidad del examen *
            </label>
            <div className="grid md:grid-cols-2 gap-4">
              <label className={`relative flex items-center p-4 border rounded-xl cursor-pointer transition-all ${formData.modoExamen === 'presencial'
                  ? 'border-green-500 bg-green-50 ring-2 ring-green-500 ring-opacity-50'
                  : 'border-gray-200 bg-white hover:border-green-300'
                }`}>
                <input
                  type="radio"
                  name="modoExamen"
                  value="presencial"
                  checked={formData.modoExamen === 'presencial'}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300"
                  required
                />
                <div className="ml-3">
                  <span className="block text-sm font-bold text-gray-900">Presencial - El Salvador</span>
                  <span className="block text-xs text-gray-500">Simposio: 19 y 20 Jun. Examen: Sáb 20</span>
                </div>
              </label>

              <label className={`relative flex items-center p-4 border rounded-xl cursor-pointer transition-all ${formData.modoExamen === 'online'
                  ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-500 ring-opacity-50'
                  : 'border-gray-200 bg-white hover:border-blue-300'
                }`}>
                <input
                  type="radio"
                  name="modoExamen"
                  value="online"
                  checked={formData.modoExamen === 'online'}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  required
                />
                <div className="ml-3">
                  <span className="block text-sm font-bold text-gray-900">Online - Virtual</span>
                  <span className="block text-xs text-gray-500">31 de Octubre, 2026</span>
                </div>
              </label>
            </div>
          </div>

          {/* Información Personal */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="nombre" className="block text-sm font-semibold text-gray-700 mb-2">
                Nombre *
              </label>
              <input
                type="text"
                id="nombre"
                name="nombre"
                value={formData.nombre}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                required
              />
            </div>

            <div>
              <label htmlFor="apellido" className="block text-sm font-semibold text-gray-700 mb-2">
                Apellido *
              </label>
              <input
                type="text"
                id="apellido"
                name="apellido"
                value={formData.apellido}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="correo" className="block text-sm font-semibold text-gray-700 mb-2">
                Correo electrónico *
              </label>
              <input
                type="email"
                id="correo"
                name="correo"
                value={formData.correo}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                required
              />
            </div>

            <div>
              <label htmlFor="telefono" className="block text-sm font-semibold text-gray-700 mb-2">
                Teléfono / Celular *
              </label>
              <input
                type="tel"
                id="telefono"
                name="telefono"
                value={formData.telefono}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                required
              />
            </div>
          </div>

          {/* Documentos */}
          <div className="space-y-8 mt-10">
            <h2 className="text-xl font-bold text-gray-800 mb-6 border-b pb-2">
              Documentos Requeridos
            </h2>

            {/* Título de perfusionista */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Título de perfusionista *
              </label>
              <input
                type="file"
                onChange={(e) => handleFileChange(e, 'titulo')}
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              <p className="text-sm text-gray-500 mt-2">Subir documento (Max 15MB)</p>
              {files.titulo && (
                <p className="text-sm text-green-600 mt-1">
                  ✓ Archivo seleccionado: {files.titulo.name}
                </p>
              )}
            </div>

            {/* Constancia de perfusiones */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Constancia de # perfusiones *
              </label>
              <input
                type="file"
                onChange={(e) => handleFileChange(e, 'perfusiones')}
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              <p className="text-sm text-gray-500 mt-2">Subir documento (Max 15MB)</p>
              {files.perfusiones && (
                <p className="text-sm text-green-600 mt-1">
                  ✓ Archivo seleccionado: {files.perfusiones.name}
                </p>
              )}
            </div>

            {/* Record de notas */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Record de notas *
              </label>
              <input
                type="file"
                onChange={(e) => handleFileChange(e, 'notas')}
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              <p className="text-sm text-gray-500 mt-2">Subir documento (Max 15MB)</p>
              {files.notas && (
                <p className="text-sm text-green-600 mt-1">
                  ✓ Archivo seleccionado: {files.notas.name}
                </p>
              )}
            </div>

            {/* Constancia de trabajo */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Constancia de trabajo *
              </label>
              <input
                type="file"
                onChange={(e) => handleFileChange(e, 'trabajo')}
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              <p className="text-sm text-gray-500 mt-2">Subir documento (Max 15MB)</p>
              {files.trabajo && (
                <p className="text-sm text-green-600 mt-1">
                  ✓ Archivo seleccionado: {files.trabajo.name}
                </p>
              )}
            </div>
          </div>

          {/* Mensaje de estado */}
          {submitMessage && (
            <div className={`p-4 rounded-lg ${submitMessage.includes('exitosamente')
              ? 'bg-green-50 text-green-800 border border-green-200'
              : 'bg-red-50 text-red-800 border border-red-200'
              }`}>
              {submitMessage}
            </div>
          )}

          {/* Botón de envío */}
          <div className="text-center pt-6">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-8 py-4 font-semibold text-white rounded-lg transition-all transform hover:scale-105 ${isSubmitting
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-xl'
                }`}
            >
              {isSubmitting ? 'Enviando...' : 'Enviar Aplicación'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AplicarPage;