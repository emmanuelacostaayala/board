// components/PaymentButtons.tsx
"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

type Props = {
  payUrl?: string;
};

export default function PaymentButtons({
  payUrl = "https://pay.boardlatinoamericanodeperfusion.com/",
}: Props) {
  const handlePaymentClick = (e: React.MouseEvent) => {
    e.preventDefault();
    toast.warning("Por favor póngase en contacto con info@boardlatinoamericanodeperfusion.com para autorizarle el link de pago y validar su status.", {
      duration: 8000,
    });
  };

  return (
    <div className="flex flex-wrap gap-3 items-center">
      <Button className="px-4 py-2" onClick={handlePaymentClick}>
        Pagar ahora
      </Button>

      <Button variant="secondary" className="px-3 py-2" onClick={handlePaymentClick}>
        Donar $10
      </Button>
    </div>
  );
}
