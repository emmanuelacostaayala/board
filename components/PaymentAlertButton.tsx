"use client";

import React from "react";
import { toast } from "sonner"; // Assuming sonner is used for toast as seen in PCCDashboard

type Props = {
    className?: string; // Allow custom styling to match the original
    children: React.ReactNode;
};

export default function PaymentAlertButton({ className, children }: Props) {
    const handleClick = () => {
        toast.warning("Boton de Pago Desactivado", {
            description: "Este boton de pago solo estara activo para cargar los casos posterior al 31 de Enero, para los casos correspondientes al 2025",
            duration: 8000,
        });
    };

    return (
        <button onClick={handleClick} className={className}>
            {children}
        </button>
    );
}
