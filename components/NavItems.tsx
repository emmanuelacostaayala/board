'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";

const navItems = [
    { label: 'Inicio', href: '/' },
    { 
        label: 'Board', 
        href: '#',
        dropdown: [
            { label: 'Requisitos', href: '/board/requisitos' },
            { label: 'Aplicar', href: '/board/aplicar' },
            { label: 'Junta Directiva', href: '/board/junta-directiva' },
            { label: 'Recertificacion', href: '/board/recertificacion' },
            { label: 'Guias de estudio', href: '/board/guias-estudio' },
            { label: 'Cita Online', href: '/board/cita-online' },
        ]
    },
    { label: 'Acompañante IA', href: '/companions' },
    { label: 'Mis avances', href: '/my-journey' },
];

const NavItems = () => {
    const pathname = usePathname();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    // Detectar si estamos en móvil
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 1024);
        };
        
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const toggleDropdown = () => {
        setIsDropdownOpen(!isDropdownOpen);
    };

    const closeDropdown = () => {
        setIsDropdownOpen(false);
    };

    return (
        <div className="nav-items">
            {navItems.map(({ label, href, dropdown }) => (
                <div key={label} className="nav-item">
                    {dropdown ? (
                        <div className="nav-dropdown-container">
                            {/* Desktop: Hover behavior */}
                            {!isMobile ? (
                                <div
                                    className="relative"
                                    onMouseEnter={() => setIsDropdownOpen(true)}
                                    onMouseLeave={() => setIsDropdownOpen(false)}
                                >
                                    <button
                                        className={cn(
                                            "nav-link",
                                            pathname.startsWith('/board') && 'nav-link-active'
                                        )}
                                    >
                                        <span>{label}</span>
                                        <svg 
                                            className={cn(
                                                "ml-1 h-4 w-4 transition-transform duration-200",
                                                isDropdownOpen && "rotate-180"
                                            )}
                                            fill="none" 
                                            viewBox="0 0 24 24" 
                                            stroke="currentColor"
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </button>
                                    {isDropdownOpen && (
                                        <div className="dropdown-menu">
                                            {dropdown.map(({ label: dropdownLabel, href: dropdownHref }) => (
                                                <Link
                                                    key={dropdownLabel}
                                                    href={dropdownHref}
                                                    className={cn(
                                                        "dropdown-item",
                                                        pathname === dropdownHref && 'dropdown-item-active'
                                                    )}
                                                >
                                                    {dropdownLabel}
                                                </Link>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                /* Mobile: Click behavior */
                                <div className="mobile-dropdown">
                                    <button
                                        onClick={toggleDropdown}
                                        className={cn(
                                            "mobile-dropdown-button",
                                            pathname.startsWith('/board') && 'mobile-dropdown-button-active'
                                        )}
                                    >
                                        <span>{label}</span>
                                        <svg 
                                            className={cn(
                                                "dropdown-arrow",
                                                isDropdownOpen && "rotate-180"
                                            )}
                                            fill="none" 
                                            viewBox="0 0 24 24" 
                                            stroke="currentColor"
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </button>
                                    
                                    {/* Mobile Dropdown Content */}
                                    <div className={cn(
                                        "mobile-dropdown-content",
                                        isDropdownOpen ? "mobile-dropdown-open" : "mobile-dropdown-closed"
                                    )}>
                                        {dropdown.map(({ label: dropdownLabel, href: dropdownHref }) => (
                                            <Link
                                                key={dropdownLabel}
                                                href={dropdownHref}
                                                onClick={closeDropdown}
                                                className={cn(
                                                    "mobile-dropdown-item",
                                                    pathname === dropdownHref && 'mobile-dropdown-item-active'
                                                )}
                                            >
                                                <svg className="mobile-dropdown-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                </svg>
                                                {dropdownLabel}
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <Link
                            href={href}
                            className={cn(
                                isMobile ? "mobile-nav-link" : "nav-link",
                                pathname === href && (isMobile ? 'mobile-nav-link-active' : 'nav-link-active')
                            )}
                        >
                            {label}
                        </Link>
                    )}
                </div>
            ))}
        </div>
    );
};

export default NavItems;