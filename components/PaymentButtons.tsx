// components/PaymentButtons.tsx
"use client";

import React from "react";
import { Button } from "@/components/ui/button";

type Props = {
  payUrl?: string;
};

export default function PaymentButtons({
  payUrl = "https://pay.boardlatinoamericanodeperfusion.com/",
}: Props) {
  return (
    <div className="flex flex-wrap gap-3 items-center">
      {/* Simple open-in-new-tab primary */}
      <a href={payUrl} target="_blank" rel="noopener noreferrer">
        <Button className="px-4 py-2">
          Pagar ahora
        </Button>
      </a>

      {/* Example preset amount (optional) */}
      <a
        href={`${payUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-block"
      >
        <Button variant="secondary" className="px-3 py-2">
          Donar $10
        </Button>
      </a>

      {/* If later you restore API-based creation, replace the anchors with fetch -> redirect */}
    </div>
  );
}
