'use client';

import React, { useState, createContext, useContext } from 'react';
import { ShoppingCart, Download, BookOpen, Star, Plus, Minus, X, CreditCard } from 'lucide-react';

// Context para el carrito
const CartContext = createContext();

const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const addToCart = (guide) => {
    setCartItems(prev => {
      const exists = prev.find(item => item.id === guide.id);
      if (exists) return prev;
      return [...prev, { ...guide, quantity: 1 }];
    });
  };

  const removeFromCart = (id) => {
    setCartItems(prev => prev.filter(item => item.id !== id));
  };

  const updateQuantity = (id, quantity) => {
    if (quantity === 0) {
      removeFromCart(id);
      return;
    }
    setCartItems(prev => 
      prev.map(item => 
        item.id === id ? { ...item, quantity } : item
      )
    );
  };

  const getTotal = () => {
    return cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const getItemCount = () => {
    return cartItems.reduce((sum, item) => sum + item.quantity, 0);
  };

  return (
    <CartContext.Provider value={{
      cartItems,
      addToCart,
      removeFromCart,
      updateQuantity,
      getTotal,
      getItemCount,
      isCartOpen,
      setIsCartOpen
    }}>
      {children}
    </CartContext.Provider>
  );
};

const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
};

// Datos de ejemplo
const freeGuides = [
  {
    id: 'free_1',
    title: 'Guía Informativa',
    date: '21 de Febrero de 2021',
    description: 'Guía completa sobre fundamentos de perfusión',
    downloadUrl: '/api/download/guia-informativa.pdf'
  },
  {
    id: 'free_2',
    title: 'Enfermedad de Células Falciformes',
    date: '5 de Mayo, 2019',
    description: 'Manejo en perfusión de pacientes con células falciformes',
    downloadUrl: '/api/download/enfermedad-celulas-falciformes.pdf'
  },
  {
    id: 'free_3',
    title: 'Perfusión Aislada de Extremidad',
    date: '5 de Mayo, 2019',
    description: 'Técnicas avanzadas de perfusión regional',
    downloadUrl: '/api/download/perfusion-aislada-extremidad.pdf'
  },
  {
    id: 'free_4',
    title: 'Examen Practica I',
    date: '11 de Mayo de 2021',
    description: 'Primer examen de práctica para certificación',
    downloadUrl: '/api/download/examen-practica-1.pdf'
  },
  {
    id: 'free_5',
    title: 'Examen Practica II',
    date: '11 de Mayo de 2021',
    description: 'Segundo examen de práctica para certificación',
    downloadUrl: '/api/download/examen-practica-2.pdf'
  }
];

const premiumGuides = [
  {
    id: 'premium_1',
    title: 'Perfusión guiada por objetivos',
    price: 5.00,
    description: 'Estrategias avanzadas para optimizar la perfusión basada en objetivos clínicos específicos',
    rating: 4.8,
    reviews: 24
  },
  {
    id: 'premium_2',
    title: 'Recebado anterógrado hemático',
    price: 5.00,
    description: 'Técnicas especializadas para el manejo del recebado anterógrado en cirugía cardíaca',
    rating: 4.9,
    reviews: 18
  },
  {
    id: 'premium_3',
    title: 'Construyendo una cultura de seguridad en perfusión',
    price: 5.00,
    description: 'Desarrollo de protocolos y prácticas para mejorar la seguridad del paciente',
    rating: 4.7,
    reviews: 31
  },
  {
    id: 'premium_4',
    title: 'ECMO: Manejo avanzado y complicaciones',
    price: 7.00,
    description: 'Guía completa sobre el manejo de ECMO y resolución de complicaciones',
    rating: 4.9,
    reviews: 42
  }
];

// Componente del carrito
const CartSidebar = () => {
  const { cartItems, isCartOpen, setIsCartOpen, removeFromCart, updateQuantity, getTotal } = useCart();

  const handleCheckout = async () => {
    try {
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: cartItems.map(item => ({
            id: item.id,
            title: item.title,
            price: item.price,
            quantity: item.quantity
          }))
        }),
      });

      const { url } = await response.json();
      window.location.href = url;
    } catch (error) {
      console.error('Error:', error);
      alert('Error al procesar el pago. Inténtalo de nuevo.');
    }
  };

  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setIsCartOpen(false)} />
      <div className="absolute right-0 top-0 h-full w-96 bg-white shadow-2xl">
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between border-b p-4">
            <h3 className="text-lg font-semibold">Carrito de Compras</h3>
            <button 
              onClick={() => setIsCartOpen(false)}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {cartItems.length === 0 ? (
              <div className="text-center text-gray-500 mt-8">
                <ShoppingCart className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p>Tu carrito está vacío</p>
              </div>
            ) : (
              <div className="space-y-4">
                {cartItems.map((item) => (
                  <div key={item.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold text-sm">{item.title}</h4>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="p-1 hover:bg-gray-100 rounded"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="mx-2 min-w-8 text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="p-1 hover:bg-gray-100 rounded"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                      <span className="font-semibold">${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {cartItems.length > 0 && (
            <div className="border-t p-4 space-y-4">
              <div className="flex justify-between items-center text-lg font-semibold">
                <span>Total:</span>
                <span>${getTotal().toFixed(2)}</span>
              </div>
              <button
                onClick={handleCheckout}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
              >
                <CreditCard className="h-5 w-5" />
                <span>Proceder al Pago</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Componente para guías gratuitas
const FreeGuideCard = ({ guide }) => {
  const handleDownload = () => {
    // Simular descarga
    const link = document.createElement('a');
    link.href = guide.downloadUrl;
    link.download = `${guide.title}.pdf`;
    link.click();
  };

  return (
    <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border-l-4 border-green-500">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-800 mb-2">{guide.title}</h3>
            <p className="text-sm text-gray-500 mb-2">{guide.date}</p>
            <p className="text-gray-600 text-sm">{guide.description}</p>
          </div>
          <div className="ml-4">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <BookOpen className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>
        
        <button
          onClick={handleDownload}
          className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg font-semibold transition-colors flex items-center justify-center space-x-2"
        >
          <Download className="h-5 w-5" />
          <span>Descarga Gratuita</span>
        </button>
      </div>
    </div>
  );
};

// Componente para guías premium
const PremiumGuideCard = ({ guide }) => {
  const { addToCart } = useCart();

  const handleAddToCart = () => {
    addToCart(guide);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border-l-4 border-blue-500">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-1 rounded">PREMIUM</span>
              <div className="flex items-center space-x-1">
                <Star className="h-4 w-4 text-yellow-400 fill-current" />
                <span className="text-sm text-gray-600">{guide.rating} ({guide.reviews})</span>
              </div>
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">{guide.title}</h3>
            <p className="text-gray-600 text-sm mb-4">{guide.description}</p>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="text-2xl font-bold text-blue-600">${guide.price.toFixed(2)}</div>
          <button
            onClick={handleAddToCart}
            className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded-lg font-semibold transition-colors flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Agregar</span>
          </button>
        </div>
      </div>
    </div>
  );
};

const StudyGuidesPage = () => {
  const { getItemCount, setIsCartOpen } = useCart();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header */}
      <div className="bg-white shadow-lg border-b-4 border-blue-600">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-5xl md:text-6xl font-bold text-gray-800 mb-2">
                Guías de Estudios
              </h1>
              <p className="text-xl text-gray-600">Recursos educativos para perfusionistas</p>
            </div>
            
            {/* Botón del carrito */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg transition-all duration-300 hover:scale-110"
            >
              <ShoppingCart className="h-6 w-6" />
              {getItemCount() > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center">
                  {getItemCount()}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Guías Gratuitas */}
        <section className="mb-16">
          <div className="flex items-center mb-8">
            <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
            <h2 className="text-4xl font-bold text-gray-800">Guías Gratuitas</h2>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {freeGuides.map((guide) => (
              <FreeGuideCard key={guide.id} guide={guide} />
            ))}
          </div>
        </section>

        {/* Guías Premium */}
        <section>
          <div className="flex items-center mb-8">
            <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
            <h2 className="text-4xl font-bold text-gray-800">Guías Premium Plus</h2>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {premiumGuides.map((guide) => (
              <PremiumGuideCard key={guide.id} guide={guide} />
            ))}
          </div>
        </section>

        {/* Banner de suscripción */}
        <div className="mt-16 bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl p-8 text-white text-center">
          <h3 className="text-3xl font-bold mb-4">¿Quieres acceso ilimitado?</h3>
          <p className="text-xl mb-6 opacity-90">
            Suscríbete y obtén acceso a todas nuestras guías premium, simuladores y contenido exclusivo
          </p>
          <button className="bg-white text-blue-600 font-bold py-3 px-8 rounded-lg hover:bg-gray-100 transition-colors">
            Ver Planes de Suscripción
          </button>
        </div>
      </div>

      <CartSidebar />
    </div>
  );
};

// Componente principal con el provider
const StudyGuidesWithCart = () => {
  return (
    <CartProvider>
      <StudyGuidesPage />
    </CartProvider>
  );
};

export default StudyGuidesWithCart;