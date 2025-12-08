"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useState, useEffect, useRef } from "react";

const navItems = [
  { label: "Inicio", href: "/" },
  {
    label: "Board",
    href: "#",
    dropdown: [
      { label: "Requisitos", href: "/board/requisitos" },
      { label: "Aplicar", href: "/board/aplicar" },
      { label: "Junta Directiva", href: "/board/junta-directiva" },
      { label: "Recertificacion", href: "/board/recertificacion" },
      { label: "Guias de estudio", href: "/board/guias-estudio" },
      { label: "Cita Online", href: "/board/cita-online" },
    ],
  },
  { label: "Acompañante IA", href: "/companions" },
  { label: "Mi Perfil PCC", href: "/my-journey" },
];

const NavItems = ({ onNavigate }: { onNavigate?: () => void }) => {
  const pathname = usePathname();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // timeout ref para cerrar con delay
  const closeTimeoutRef = useRef<number | null>(null);
  const closeDelayMs = 250; // tiempo en ms antes de cerrar (ajustable)

  // Detectar si estamos en móvil
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // helpers para abrir/cerrar con debounce
  const openDropdownImmediate = () => {
    if (closeTimeoutRef.current) {
      window.clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    setIsDropdownOpen(true);
  };

  const scheduleCloseDropdown = () => {
    if (closeTimeoutRef.current) window.clearTimeout(closeTimeoutRef.current);
    // usar window.setTimeout para obtener un id numérico compatible con clearTimeout
    closeTimeoutRef.current = window.setTimeout(() => {
      setIsDropdownOpen(false);
      closeTimeoutRef.current = null;
    }, closeDelayMs);
  };

  const cancelScheduledClose = () => {
    if (closeTimeoutRef.current) {
      window.clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
  };

  const toggleDropdown = (e: React.MouseEvent) => {
    e.stopPropagation(); // Evitar que el click se propague si eso fuera el problema
    // toggle manual para móvil
    setIsDropdownOpen((prev) => !prev);
  };

  const closeDropdown = () => {
    setIsDropdownOpen(false);
    if (onNavigate) onNavigate(); // Cerrar menú al navegar
  };

  return (
    <div className="nav-items">
      {navItems.map(({ label, href, dropdown }) => (
        <div key={label} className="nav-item">
          {dropdown ? (
            <div className="nav-dropdown-container">
              {/* Desktop: Hover behavior with delayed close */}
              {!isMobile ? (
                <div
                  className="relative"
                  // manejar en el contenedor para cubrir botón + menú
                  onMouseEnter={() => {
                    openDropdownImmediate();
                  }}
                  onMouseLeave={() => {
                    scheduleCloseDropdown();
                  }}
                >
                  <button
                    className={cn(
                      "nav-link",
                      pathname.startsWith("/board") && "nav-link-active"
                    )}
                    // focus/blur para accesibilidad con teclado
                    onFocus={() => openDropdownImmediate()}
                    onBlur={() => scheduleCloseDropdown()}
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
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>

                  {/* El dropdown se renderiza dentro del mismo contenedor.
                      Añadimos handlers aquí también para evitar que se cierre
                      cuando el cursor pasa entre botón y panel. */}
                  {isDropdownOpen && (
                    <div
                      className="dropdown-menu"
                      onMouseEnter={() => {
                        // si entra en el menu cancelamos cualquier cierre programado
                        cancelScheduledClose();
                        setIsDropdownOpen(true);
                      }}
                      onMouseLeave={() => {
                        // al salir del menu programamos el cierre
                        scheduleCloseDropdown();
                      }}
                    >
                      {dropdown.map(({ label: dropdownLabel, href: dropdownHref }) => (
                        <Link
                          key={dropdownLabel}
                          href={dropdownHref}
                          className={cn(
                            "dropdown-item",
                            pathname === dropdownHref && "dropdown-item-active"
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
                      pathname.startsWith("/board") && "mobile-dropdown-button-active"
                    )}
                  >
                    <span>{label}</span>
                    <svg
                      className={cn("dropdown-arrow", isDropdownOpen && "rotate-180")}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7 7" />
                    </svg>
                  </button>

                  {/* Mobile Dropdown Content */}
                  <div
                    className={cn(
                      "mobile-dropdown-content",
                      isDropdownOpen ? "mobile-dropdown-open" : "mobile-dropdown-closed"
                    )}
                  >
                    {dropdown.map(({ label: dropdownLabel, href: dropdownHref }) => (
                      <Link
                        key={dropdownLabel}
                        href={dropdownHref}
                        onClick={closeDropdown}
                        className={cn(
                          "mobile-dropdown-item",
                          pathname === dropdownHref && "mobile-dropdown-item-active"
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
              onClick={onNavigate} // Cerrar al navegar en items normales
              className={cn(
                isMobile ? "mobile-nav-link" : "nav-link",
                pathname === href && (isMobile ? "mobile-nav-link-active" : "nav-link-active")
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
