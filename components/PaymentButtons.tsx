// components/PaymentButtons.tsx
"use client";

import React, { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { isMobileApp } from "@/lib/utils";
import { createDonationSession } from "@/lib/actions/stripe.actions";
import { useAuth } from "@clerk/nextjs";

type Props = {
  payUrl?: string; // Kept for capability but unused for now
  userEmail?: string;
};

export default function PaymentButtons({
  payUrl = "https://pay.boardlatinoamericanodeperfusion.com/",
  userEmail,
}: Props) {
  const [isPending, startTransition] = useTransition();
  const { userId } = useAuth();

  if (typeof window !== "undefined" && isMobileApp()) {
    return null;
  }

  const handleDonation = () => {
    if (!userId) {
      toast.error("Debes iniciar sesión para donar.");
      return;
    }

    startTransition(async () => {
      const res = await createDonationSession(userId, userEmail);
      if (res.ok && res.url) {
        window.location.href = res.url;
      } else {
        toast.error(res.message || "Error initiando donación.");
      }
    });
  };

  return (
    <div className="flex flex-col gap-2 items-start">
      <p className="text-muted-foreground text-sm font-medium">¿Quieres hacer una donación?</p>
      <Button
        variant="secondary"
        className="px-4 py-2 bg-green-100 hover:bg-green-200 text-green-800 border border-green-200"
        onClick={handleDonation}
        disabled={isPending}
      >
        {isPending ? "Procesando..." : "Donar $10 USD"}
      </Button>
    </div>
  );
}
