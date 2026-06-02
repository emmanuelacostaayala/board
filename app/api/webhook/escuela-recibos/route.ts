import { stripe } from "@/lib/stripe";
import { NextResponse } from "next/server";
import { sendReceiptForCheckoutSession } from "@/lib/receipts/sendReceipt";

/**
 * Webhook DEDICADO a los recibos de la Escuela de Perfusión.
 *
 * Endpoint NUEVO e independiente del webhook del Board (app/api/webhook/stripe).
 * No toca nada del Board: solo escucha `checkout.session.completed` y, si el pago
 * corresponde a una cuota de la Escuela (Pago II–V), emite el recibo branded.
 * Cualquier otro pago se ignora dentro de sendReceiptForCheckoutSession.
 *
 * Usa su propia firma: STRIPE_ESCUELA_WEBHOOK_SECRET (endpoint aparte en Stripe).
 */
export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature") as string;

  const secret = process.env.STRIPE_ESCUELA_WEBHOOK_SECRET;
  if (!secret) {
    console.error("[Escuela Recibos] Falta STRIPE_ESCUELA_WEBHOOK_SECRET");
    return new NextResponse("Escuela webhook secret not configured", { status: 500 });
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, secret);
  } catch (err: any) {
    console.error(`[Escuela Recibos] Firma inválida: ${err.message}`);
    return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as any;
    if (session.payment_status === "paid") {
      try {
        const r = await sendReceiptForCheckoutSession(session.id);
        console.log("[Escuela Recibos]", JSON.stringify(r));
      } catch (e) {
        console.error("[Escuela Recibos] Error emitiendo recibo:", e);
      }
    }
  }

  return new NextResponse(null, { status: 200 });
}
