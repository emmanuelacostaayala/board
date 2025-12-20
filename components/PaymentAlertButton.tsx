"use client";

import React from "react";
import { toast } from "sonner"; // Assuming sonner is used for toast as seen in PCCDashboard

type Props = {
    className?: string; // Allow custom styling to match the original
    children: React.ReactNode;
};

export default function PaymentAlertButton({ className, children }: Props) {
    const handleClick = () => {
        toast.warning("Por favor póngase en contacto con info@boardlatinoamericanodeperfusion.com para autorizarle el link de pago y validar su status.", {
            duration: 8000,
        });
    };

    return (
        <button onClick={handleClick} className={className}>
            {children}
        </button>
    );
}
