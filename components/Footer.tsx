import React from 'react';
import { Mail, Phone, Globe, Heart } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gradient-to-r from-slate-900 via-gray-900 to-slate-900 text-white">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Logo and Description */}
          <div className="space-y-4">
            <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Board Latinoamericano de Perfusión
            </h3>
            <p className="text-gray-300 leading-relaxed">
              Certificando profesionales en perfusión cardiovascular desde 2021, 
              promoviendo la excelencia y estándares de calidad en toda Latinoamérica.
            </p>
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <Heart className="w-4 h-4 text-red-400" />
              <span>274 Profesionales Certificados</span>
            </div>
          </div>
          
          {/* Contact Info */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-blue-400">Contacto</h4>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-gray-300">
                <Mail className="w-5 h-5 text-blue-400 flex-shrink-0" />
                <a href="mailto:Operaciones@asociacionalap.com" 
                   className="hover:text-white transition-colors duration-300 break-all">
                  director@boardlatinoamericanodeperfusion.com
                </a>
              </div>
              
              <div className="flex items-center gap-3 text-gray-300">
                <Phone className="w-5 h-5 text-green-400 flex-shrink-0" />
                <a href="tel:+19549017867" 
                   className="hover:text-white transition-colors duration-300">
                  +1 (954) 901-7867
                </a>
              </div>
              
              <div className="flex items-center gap-3 text-gray-300">
                <Globe className="w-5 h-5 text-purple-400 flex-shrink-0" />
                <a href="https://www.boardlatinoamericanodeperfusion.com" 
                   target="_blank" 
                   rel="noopener noreferrer"
                   className="hover:text-white transition-colors duration-300 break-all">
                  www.boardlatinoamericanodeperfusion.com
                </a>
              </div>
            </div>
          </div>
          
          {/* Address and Legal */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-blue-400">Oficina</h4>
            <div className="text-gray-300 space-y-2">
              <p>1431 Brigham Loop</p>
              <p>Geneva, FL 32732</p>
              <p>United States</p>
            </div>
          </div>
        </div>
        
        {/* Bottom Bar */}
        <div className="border-t border-gray-700 mt-8 pt-8 text-center">
          <p className="text-gray-400 text-sm">
            © 2025 Board Latinoamericano de Perfusión. All Rights Reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;