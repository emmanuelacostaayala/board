import type Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { getTransporter, emailFromAddress } from "@/lib/email/transport";
import { resolveBrand, type Brand } from "./brands";
import { generateReceiptPdf } from "./generateReceiptPdf";
import {
  buildReceiptNumber,
  cap,
  escapeHtml,
  formatDateEs,
  formatMoney,
} from "./format";
import type { ReceiptData, ReceiptLineItem } from "./types";

interface SendResult {
  sent: boolean;
  reason?: string;
  brand?: string;
  receiptNumber?: string;
}

/**
 * Emite y envía el recibo de un Checkout Session pagado.
 *
 * SOLO actúa sobre pagos de la Escuela (cuotas Pago II–V). Cualquier otro pago
 * (Board, los $10, etc.) se ignora — no tocamos nada del Board.
 *
 * Idempotente vía metadata del PaymentIntent (`receipt_sent`), de modo que los
 * reintentos del webhook de Stripe no generan correos duplicados.
 */
export async function sendReceiptForCheckoutSession(
  sessionId: string
): Promise<SendResult> {
  const session = (await stripe.checkout.sessions.retrieve(sessionId, {
    expand: ["line_items.data.price.product", "payment_intent.latest_charge"],
  })) as Stripe.Checkout.Session;

  if (session.payment_status !== "paid") return { sent: false, reason: "not_paid" };

  const pi = session.payment_intent as Stripe.PaymentIntent | null;
  if (pi && typeof pi === "object" && pi.metadata?.receipt_sent === "true") {
    return { sent: false, reason: "already_sent" };
  }

  const lineItems = (session.line_items?.data || []) as Stripe.LineItem[];
  const brand = resolveBrand({
    productIds: lineItems.map((li) => productIdOf(li.price)),
    priceIds: lineItems.map((li) => li.price?.id),
  });

  // Solo emitimos recibos de la Escuela; los pagos del Board no se tocan.
  if (brand.key !== "ESCUELA") return { sent: false, reason: "not_escuela" };

  const email = session.customer_details?.email || session.customer_email || "";
  if (!email) return { sent: false, reason: "no_email" };

  const items: ReceiptLineItem[] = lineItems.map((li) => ({
    description: li.description || productNameOf(li.price) || "Pago",
    quantity: li.quantity || 1,
    amount: (li.amount_total ?? 0) / 100,
  }));

  const charge =
    pi && typeof pi === "object" ? (pi.latest_charge as Stripe.Charge | null) : null;
  const createdUnix = charge?.created ?? session.created ?? nowSeconds();

  const data: ReceiptData = {
    brandKey: brand.key,
    receiptNumber: buildReceiptNumber(
      brand.receiptPrefix,
      pi && typeof pi === "object" ? pi.id : session.id,
      createdUnix
    ),
    dateISO: formatDateEs(createdUnix),
    payerName: session.customer_details?.name || "",
    payerEmail: email,
    items,
    currency: (session.currency || "usd").toUpperCase(),
    amountPaid: (session.amount_total ?? 0) / 100,
    paymentMethod: paymentMethodLabel(charge),
  };

  await deliverReceipt(brand, data, pi && typeof pi === "object" ? pi : null);
  return { sent: true, brand: brand.key, receiptNumber: data.receiptNumber };
}

// ---------- helpers ----------

async function deliverReceipt(
  brand: Brand,
  data: ReceiptData,
  pi: Stripe.PaymentIntent | null
): Promise<void> {
  const pdf = await generateReceiptPdf(data);
  const transporter = getTransporter();

  await transporter.sendMail({
    from: `"${brand.fromName}" <${emailFromAddress()}>`,
    to: data.payerEmail,
    replyTo: brand.replyTo,
    subject: `Recibo de pago ${data.receiptNumber} — ${brand.displayName}`,
    html: receiptEmailHtml(brand, data),
    attachments: [
      {
        filename: `Recibo-${data.receiptNumber}.pdf`,
        content: Buffer.from(pdf),
        contentType: "application/pdf",
      },
    ],
  });

  // Candado de idempotencia: marcar en el PaymentIntent que ya se envió.
  if (pi) {
    try {
      await stripe.paymentIntents.update(pi.id, {
        metadata: {
          ...(pi.metadata || {}),
          receipt_sent: "true",
          receipt_number: data.receiptNumber,
        },
      });
    } catch (e) {
      console.error("[receipt] no se pudo marcar receipt_sent:", (e as Error).message);
    }
  }
}

function productIdOf(price?: Stripe.Price | null): string | undefined {
  const prod = price?.product;
  if (!prod) return undefined;
  return typeof prod === "string" ? prod : (prod as Stripe.Product).id;
}

function productNameOf(price?: Stripe.Price | null): string | undefined {
  const prod = price?.product;
  if (prod && typeof prod === "object" && "name" in prod) {
    return (prod as Stripe.Product).name;
  }
  return undefined;
}

function paymentMethodLabel(charge: Stripe.Charge | null): string | undefined {
  const card = charge?.payment_method_details?.card;
  if (card?.last4) return `${cap(card.brand)} •••• ${card.last4}`;
  return undefined;
}

function nowSeconds(): number {
  return Math.floor(Date.now() / 1000);
}

export function receiptEmailHtml(brand: Brand, data: ReceiptData): string {
  const c = `rgb(${Math.round(brand.color.r * 255)},${Math.round(
    brand.color.g * 255
  )},${Math.round(brand.color.b * 255)})`;

  const rows = data.items
    .map(
      (it) => `
      <tr>
        <td style="padding:8px 0;color:#374151;">${escapeHtml(it.description)}</td>
        <td style="padding:8px 0;color:#6b7280;text-align:center;">${it.quantity}</td>
        <td style="padding:8px 0;color:#374151;text-align:right;">${formatMoney(
          it.amount,
          data.currency
        )}</td>
      </tr>`
    )
    .join("");

  return `
  <div style="font-family:Arial,Helvetica,sans-serif;max-width:600px;margin:0 auto;color:#374151;">
    <div style="background:${c};padding:24px 28px;border-radius:10px 10px 0 0;">
      <h1 style="color:#fff;margin:0;font-size:20px;">${escapeHtml(brand.displayName)}</h1>
      <p style="color:rgba(255,255,255,.85);margin:4px 0 0;font-size:13px;">Recibo de pago</p>
    </div>
    <div style="border:1px solid #e5e7eb;border-top:none;border-radius:0 0 10px 10px;padding:28px;">
      <p style="margin:0 0 16px;">Hola ${escapeHtml(
        data.payerName || ""
      )}, gracias por tu pago. Adjuntamos tu recibo en PDF.</p>
      <table style="width:100%;font-size:14px;border-collapse:collapse;margin:8px 0;">
        <tr><td style="color:#6b7280;padding:4px 0;">Recibo N°</td><td style="text-align:right;font-weight:bold;">${
          data.receiptNumber
        }</td></tr>
        <tr><td style="color:#6b7280;padding:4px 0;">Fecha</td><td style="text-align:right;">${
          data.dateISO
        }</td></tr>
        ${
          data.paymentMethod
            ? `<tr><td style="color:#6b7280;padding:4px 0;">Método</td><td style="text-align:right;">${escapeHtml(
                data.paymentMethod
              )}</td></tr>`
            : ""
        }
      </table>
      <table style="width:100%;font-size:14px;border-collapse:collapse;margin:16px 0;border-top:1px solid #e5e7eb;border-bottom:1px solid #e5e7eb;">
        <thead><tr>
          <th style="text-align:left;padding:8px 0;color:#6b7280;font-size:12px;">CONCEPTO</th>
          <th style="text-align:center;padding:8px 0;color:#6b7280;font-size:12px;">CANT.</th>
          <th style="text-align:right;padding:8px 0;color:#6b7280;font-size:12px;">IMPORTE</th>
        </tr></thead>
        <tbody>${rows}</tbody>
      </table>
      <div style="text-align:right;font-size:16px;font-weight:bold;color:${c};">
        Total pagado: ${formatMoney(data.amountPaid, data.currency)} ${data.currency}
      </div>
      <p style="font-size:12px;color:#9ca3af;margin-top:24px;border-top:1px solid #e5e7eb;padding-top:12px;">
        ${escapeHtml(brand.footerNote)}<br/>
        ${[brand.supportEmail, brand.supportPhone, brand.website]
          .filter(Boolean)
          .map((x) => escapeHtml(String(x)))
          .join(" · ")}
      </p>
    </div>
  </div>`;
}
