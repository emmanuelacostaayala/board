'use client';

import React, { useEffect, useState } from 'react';
import { X, Smartphone } from 'lucide-react';
import { isMobileApp } from '@/lib/utils';

const ANDROID_URL = 'https://play.google.com/store/apps/details?id=com.boardlatamdeperfusion';
const IOS_URL = 'https://testflight.apple.com/join/7EXSeyVF';

export default function MobileAppPopup() {
    const [showPopup, setShowPopup] = useState(false);
    const [platform, setPlatform] = useState<'android' | 'ios' | null>(null);

    useEffect(() => {
        // If we are inside the wrapper app, do not show any popup
        if (isMobileApp()) return;

        const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;

        // Simple detection logic
        if (/android/i.test(userAgent)) {
            setPlatform('android');
            // Check if we should suppress the popup (e.g. if user already closed it)
            const hasClosed = sessionStorage.getItem('mobile-popup-closed');
            if (!hasClosed) {
                setShowPopup(true);
            }
        } else if (/iPad|iPhone|iPod/.test(userAgent) && !(window as any).MSStream) {
            setPlatform('ios');
            const hasClosed = sessionStorage.getItem('mobile-popup-closed');
            if (!hasClosed) {
                setShowPopup(true);
            }
        }
    }, []);

    const handleClose = () => {
        setShowPopup(false);
        sessionStorage.setItem('mobile-popup-closed', 'true');
    };

    if (!showPopup || !platform) return null;

    const appUrl = platform === 'android' ? ANDROID_URL : IOS_URL;
    const storeName = platform === 'android' ? 'Google Play' : 'App Store';

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 relative shadow-2xl animate-in fade-in zoom-in duration-300">
                <button
                    onClick={handleClose}
                    className="absolute right-4 top-4 p-2 text-gray-500 hover:text-gray-700 bg-gray-100 rounded-full transition-colors"
                    aria-label="Cerrar"
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="text-center space-y-6 pt-4">
                    <div className="mx-auto w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
                        <Smartphone className="w-10 h-10 text-blue-600" />
                    </div>

                    <div className="space-y-2">
                        <h3 className="text-2xl font-bold text-gray-900">
                            ¡Descarga nuestra App Oficial!
                        </h3>
                        <p className="text-gray-600">
                            Para una mejor experiencia, utiliza nuestra aplicación oficial para {platform === 'android' ? 'Android' : 'iOS'}.
                        </p>
                    </div>

                    <a
                        href={appUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block w-full"
                        onClick={handleClose}
                    >
                        <div className={`p-4 rounded-xl flex items-center justify-center gap-3 text-white transition-transform hover:scale-105 ${platform === 'android'
                            ? 'bg-gradient-to-r from-green-600 to-green-500 shadow-green-200'
                            : 'bg-gradient-to-r from-blue-600 to-blue-500 shadow-blue-200'
                            } shadow-lg`}>
                            {/* Simple icons based on Lucide for now, can be replaced with official SVGs if needed */}
                            <span className="font-semibold text-lg">
                                Descargar en {storeName}
                            </span>
                        </div>
                    </a>

                    <button
                        onClick={handleClose}
                        className="text-sm text-gray-400 hover:text-gray-600 underline"
                    >
                        Continuar en el navegador
                    </button>
                </div>
            </div>
        </div>
    );
}
