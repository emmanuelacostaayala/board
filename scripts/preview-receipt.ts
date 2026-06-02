/**
 * Genera PDFs de muestra SIN enviar correo, para revisar el diseño del recibo.
 *   bun run scripts/preview-receipt.ts
 * Salida: output/receipt-sample-escuela.pdf  y  output/receipt-sample-board.pdf
 */
import fs from "fs";
import path from "path";
import { generateReceiptPdf } from "@/lib/receipts/generateReceiptPdf";

async function main() {
  const outDir = path.join(process.cwd(), "output");
  fs.mkdirSync(outDir, { recursive: true });

  const escuela = await generateReceiptPdf({
    brandKey: "ESCUELA",
    receiptNumber: "ESC-2026-XE3Z",
    dateISO: "13 de mayo de 2026",
    payerName: "Víctor Vera H.",
    payerEmail: "alapescuelard.salazar@gmail.com",
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
  });
  fs.writeFileSync(path.join(outDir, "receipt-sample-escuela.pdf"), escuela);
  console.log("✓ output/receipt-sample-escuela.pdf");

  const board = await generateReceiptPdf({
    brandKey: "BOARD",
    receiptNumber: "BLP-2026-RQ7M",
    dateISO: "16 de mayo de 2026",
    payerName: "Brígida Aguerrevere",
    payerEmail: "baguerrevereb@gmail.com",
    items: [
      {
        description: "Penalización por presentación tardía de casos clínicos (2025)",
        quantity: 1,
        amount: 10,
      },
    ],
    currency: "USD",
    amountPaid: 10,
    paymentMethod: "Mastercard •••• 4242",
  });
  fs.writeFileSync(path.join(outDir, "receipt-sample-board.pdf"), board);
  console.log("✓ output/receipt-sample-board.pdf");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
