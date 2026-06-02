import { NextResponse } from "next/server";
import { generateReceiptPdf } from "@/lib/receipts/generateReceiptPdf";
import { receiptEmailHtml } from "@/lib/receipts/sendReceipt";
import { getTransporter, emailFromAddress } from "@/lib/email/transport";
import { BRANDS } from "@/lib/receipts/brands";
import type { ReceiptData } from "@/lib/receipts/types";

// TEMPORAL — solo para una prueba de recibo. Destinatario FIJO (el dueño),
// protegido por una clave en código. Se elimina tras la prueba.
const TEST_TO = "enmanuelh03@gmail.com";

export async function GET(req: Request) {
  const TEST_KEY = "tmp-escuela-7f3a9c2e1d4b-borrar";
  const key = new URL(req.url).searchParams.get("key");
  if (key !== TEST_KEY) {
    return new NextResponse("forbidden", { status: 403 });
  }

  const brand = BRANDS.ESCUELA;
  const data: ReceiptData = {
    brandKey: "ESCUELA",
    receiptNumber: "ESC-2026-PRUEBA",
    dateISO: "2 de junio de 2026",
    payerName: "Enmanuel Henríquez (PRUEBA)",
    payerEmail: TEST_TO,
    items: [
      {
        description: "Pago II — Maestría en Perfusión y Circulación Extracorpórea",
        quantity: 1,
        amount: 1750,
      },
    ],
    currency: "USD",
    amountPaid: 1750,
    paymentMethod: "Visa •••• 8980",
  };

  try {
    const pdf = await generateReceiptPdf(data);
    const info = await getTransporter().sendMail({
      from: `"${brand.fromName} (PRUEBA)" <${emailFromAddress()}>`,
      to: TEST_TO,
      replyTo: brand.replyTo,
      subject: `[PRUEBA] Recibo ${data.receiptNumber} — ${brand.displayName}`,
      html: receiptEmailHtml(brand, data),
      attachments: [
        {
          filename: "Recibo-PRUEBA.pdf",
          content: Buffer.from(pdf),
          contentType: "application/pdf",
        },
      ],
    });
    return NextResponse.json({
      ok: true,
      to: TEST_TO,
      from: emailFromAddress(),
      messageId: info.messageId,
      response: info.response,
    });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || String(e) }, { status: 500 });
  }
}
