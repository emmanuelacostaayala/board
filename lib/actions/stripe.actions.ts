"use server";

import { stripe } from "@/lib/stripe";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export async function createLateFeeSession(userId: string, pccCode: string) {
    const origin = (await headers()).get("origin") || "http://localhost:3000";

    try {
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            line_items: [
                {
                    price_data: {
                        currency: "usd",
                        product_data: {
                            name: "Penalización por Presentación Tardía de Casos Clínicos (2025)",
                            description: `Pago requerido para usuarios con presentación tardía (después del 31 de Enero). PCC: ${pccCode}`,
                        },
                        unit_amount: 1000, // $10.00 USD
                    },
                    quantity: 1,
                },
            ],
            mode: "payment",
            success_url: `${origin}/board/casos?payment_success=true&session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${origin}/board/casos?payment_canceled=true`,
            metadata: {
                userId,
                pccCode,
                action: "late_fee_2025",
            },
        });

        if (!session.url) throw new Error("No session URL");
        return { ok: true, url: session.url };
    } catch (err: any) {
        console.error("Stripe Error:", err);
        return { ok: false, message: err.message };
    }
}

export async function verifyStripePayment(sessionId: string) {
    try {
        const session = await stripe.checkout.sessions.retrieve(sessionId);
        if (session.payment_status === 'paid') {
            return { ok: true, metadata: session.metadata };
        }
        return { ok: false, message: 'Pago no completado' };
    } catch (e: any) {
        return { ok: false, message: e.message };
    }
}
