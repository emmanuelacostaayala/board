"use client";

import Link from "next/link";
import Image from "next/image";
import { SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import NavItems from "@/components/NavItems";
import { useState, useEffect } from "react";

const Navbar = () => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // Cerrar menú cuando se redimensiona la pantalla
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 1024) {
                setIsMobileMenuOpen(false);
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Prevenir scroll del body cuando el menú está abierto
    useEffect(() => {
        if (isMobileMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }

        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isMobileMenuOpen]);

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    const closeMobileMenu = () => {
        setIsMobileMenuOpen(false);
    };

    return (
        <>
            <nav className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-50 shadow-sm">
                <div className="flex items-center justify-between mx-auto w-full px-4 py-3 lg:px-14 lg:py-4 max-w-[1400px]">
                    {/* Logo y Título */}
                    <Link href="/" onClick={closeMobileMenu}>
                        <div className="flex items-center gap-2 lg:gap-3 cursor-pointer">
                            <div className="flex-shrink-0">
                                <Image
                                    src="/images/board.png"
                                    alt="logo"
                                    width={50}
                                    height={47}
                                    className="w-12 h-11 sm:w-16 sm:h-15 lg:w-[70px] lg:h-[66px] object-contain"
                                />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-xs sm:text-sm lg:text-lg font-semibold leading-tight text-gray-800">
                                    Board Latinoamericano de
                                </span>
                                <span className="text-xs sm:text-sm lg:text-lg font-semibold leading-tight text-gray-800">
                                    Perfusión Cardiovascular
                                </span>
                            </div>
                        </div>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden lg:flex items-center gap-8">
                        <NavItems />
                        <SignedOut>
                            <SignInButton>
                                <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors duration-200 flex items-center gap-2">
                                    Sign In
                                </button>
                            </SignInButton>
                        </SignedOut>
                        <SignedIn>
                            <UserButton />
                        </SignedIn>
                    </div>

                    {/* Mobile Menu Button y User Button */}
                    <div className="flex items-center gap-3 lg:hidden">
                        <SignedIn>
                            <UserButton />
                        </SignedIn>
                        
                        <button
                            onClick={toggleMobileMenu}
                            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            aria-label="Toggle menu"
                        >
                            <div className={`w-6 h-6 relative flex flex-col justify-center transition-all duration-300 ${isMobileMenuOpen ? 'rotate-45' : ''}`}>
                                <span className={`block h-0.5 w-6 bg-current transform transition-all duration-300 ease-in-out ${isMobileMenuOpen ? 'rotate-45 translate-y-0' : '-translate-y-1.5'}`}></span>
                                <span className={`block h-0.5 w-6 bg-current transform transition-all duration-300 ease-in-out ${isMobileMenuOpen ? 'opacity-0' : 'opacity-100'}`}></span>
                                <span className={`block h-0.5 w-6 bg-current transform transition-all duration-300 ease-in-out ${isMobileMenuOpen ? '-rotate-45 translate-y-0' : 'translate-y-1.5'}`}></span>
                            </div>
                        </button>
                    </div>
                </div>
            </nav>

            {/* Spacer para el navbar fijo */}
            <div className="h-16 lg:h-20"></div>

            {/* Mobile Sidebar Overlay */}
            {isMobileMenuOpen && (
                <div 
                    className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" 
                    onClick={closeMobileMenu} 
                />
            )}

            {/* Mobile Sidebar Menu */}
            <div className={`fixed top-0 left-0 h-full w-80 max-w-[85vw] bg-white shadow-2xl z-50 lg:hidden transform transition-transform duration-300 ease-in-out ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
                    <div className="flex items-center gap-3">
                        <Image
                            src="/images/board.png"
                            alt="logo"
                            width={40}
                            height={38}
                            className="object-contain"
                        />
                        <div className="flex flex-col">
                            <span className="text-sm font-semibold leading-tight text-gray-800">Board Latinoamericano</span>
                            <span className="text-sm font-semibold leading-tight text-gray-800">de Perfusión Cardiovascular</span>
                        </div>
                    </div>
                    <button
                        onClick={closeMobileMenu}
                        className="p-2 text-gray-500 hover:text-gray-700 hover:bg-white rounded-lg transition-colors duration-200"
                        aria-label="Close menu"
                    >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M18 6L6 18M6 6l12 12"/>
                        </svg>
                    </button>
                </div>

                <div className="flex flex-col h-full pt-6 pb-6 overflow-y-auto">
                    <div onClick={closeMobileMenu}>
                        <NavItems />
                    </div>
                    
                    <SignedOut>
                        <div className="mt-auto px-6 pt-6 border-t border-gray-200">
                            <SignInButton>
                                <button 
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
                                    onClick={closeMobileMenu}
                                >
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M21 12H9"/>
                                    </svg>
                                    Sign In
                                </button>
                            </SignInButton>
                        </div>
                    </SignedOut>
                </div>
            </div>
        </>
    );
};

export default Navbar;