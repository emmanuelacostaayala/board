import { PDFDocument, StandardFonts, rgb, type PDFFont } from "pdf-lib";
import fs from "fs";
import path from "path";
import { BRANDS } from "./brands";
import { formatMoney, winAnsiSafe } from "./format";
import type { ReceiptData } from "./types";

/** Genera el PDF del recibo (A4) y devuelve los bytes. */
export async function generateReceiptPdf(data: ReceiptData): Promise<Uint8Array> {
  const brand = BRANDS[data.brandKey];
  const doc = await PDFDocument.create();
  const page = doc.addPage([595.28, 841.89]); // A4 vertical
  const { width, height } = page.getSize();

  const font = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);

  const brandColor = rgb(brand.color.r, brand.color.g, brand.color.b);
  const dark = rgb(0.13, 0.15, 0.18);
  const gray = rgb(0.45, 0.48, 0.52);
  const line = rgb(0.85, 0.87, 0.9);
  const white = rgb(1, 1, 1);

  const M = 50;
  const right = (text: string, f: PDFFont, size: number) =>
    width - M - f.widthOfTextAtSize(text, size);

  // ---- Banda de encabezado ----
  const bandH = 120;
  page.drawRectangle({ x: 0, y: height - bandH, width, height: bandH, color: brandColor });

  let textX = M;
  if (brand.logoFile) {
    try {
      const logoPath = path.join(process.cwd(), "public", brand.logoFile);
      if (fs.existsSync(logoPath)) {
        const bytes = fs.readFileSync(logoPath);
        const img = brand.logoFile.toLowerCase().endsWith(".png")
          ? await doc.embedPng(bytes)
          : await doc.embedJpg(bytes);
        const maxH = 60;
        const scale = maxH / img.height;
        const w = img.width * scale;
        page.drawImage(img, {
          x: M,
          y: height - bandH / 2 - maxH / 2,
          width: w,
          height: maxH,
        });
        textX = M + w + 16;
      }
    } catch {
      /* logo opcional: si falla, seguimos con texto */
    }
  }

  // Título (derecha) primero, para conocer el ancho disponible del nombre.
  const title = "RECIBO DE PAGO";
  const titleSize = 15;
  const titleX = right(title, bold, titleSize);
  page.drawText(title, { x: titleX, y: height - 52, size: titleSize, font: bold, color: white });
  const subtitle = "PAYMENT RECEIPT";
  page.drawText(subtitle, { x: right(subtitle, font, 9), y: height - 68, size: 9, font, color: rgb(0.9, 0.93, 0.96) });

  // Nombre de la marca (izquierda) con auto-ajuste para no chocar con el título.
  const nameMaxW = titleX - 16 - textX;
  let nameSize = 17;
  while (nameSize > 10 && bold.widthOfTextAtSize(brand.displayName, nameSize) > nameMaxW) {
    nameSize -= 0.5;
  }
  page.drawText(brand.displayName, { x: textX, y: height - 52, size: nameSize, font: bold, color: white });
  if (brand.website) {
    page.drawText(brand.website, { x: textX, y: height - 72, size: 10, font, color: rgb(0.9, 0.93, 0.96) });
  }

  // ---- Meta: número y fecha ----
  let y = height - bandH - 40;
  page.drawText("RECIBO N°", { x: M, y, size: 9, font, color: gray });
  page.drawText(data.receiptNumber, { x: M, y: y - 14, size: 12, font: bold, color: dark });

  const dLabel = "FECHA DE PAGO";
  page.drawText(dLabel, { x: right(dLabel, font, 9), y, size: 9, font, color: gray });
  page.drawText(data.dateISO, { x: right(data.dateISO, bold, 12), y: y - 14, size: 12, font: bold, color: dark });

  // ---- Recibido de ----
  y -= 56;
  page.drawText("RECIBIDO DE", { x: M, y, size: 9, font, color: gray });
  page.drawText(winAnsiSafe(data.payerName) || "—", { x: M, y: y - 16, size: 13, font: bold, color: dark });
  if (data.payerEmail) {
    page.drawText(winAnsiSafe(data.payerEmail), { x: M, y: y - 32, size: 10, font, color: gray });
  }

  // ---- Tabla de conceptos ----
  y -= 66;
  const qtyX = width - M - 170;
  const amtRight = width - M - 6;
  page.drawRectangle({ x: M, y: y - 7, width: width - 2 * M, height: 24, color: rgb(0.96, 0.97, 0.98) });
  page.drawText("CONCEPTO", { x: M + 10, y, size: 9, font: bold, color: gray });
  page.drawText("CANT.", { x: qtyX, y, size: 9, font: bold, color: gray });
  const amtHdr = "IMPORTE";
  page.drawText(amtHdr, { x: amtRight - bold.widthOfTextAtSize(amtHdr, 9), y, size: 9, font: bold, color: gray });

  y -= 30;
  for (const it of data.items) {
    const safeDesc = winAnsiSafe(it.description);
    const desc = safeDesc.length > 58 ? safeDesc.slice(0, 55) + "…" : safeDesc;
    page.drawText(desc, { x: M + 10, y, size: 11, font, color: dark });
    page.drawText(String(it.quantity), { x: qtyX + 8, y, size: 11, font, color: dark });
    const amt = formatMoney(it.amount, data.currency);
    page.drawText(amt, { x: amtRight - font.widthOfTextAtSize(amt, 11), y, size: 11, font, color: dark });
    y -= 22;
    page.drawLine({ start: { x: M, y: y + 6 }, end: { x: width - M, y: y + 6 }, thickness: 0.5, color: line });
  }

  // ---- Total ----
  y -= 16;
  const totalLabel = "MONTO PAGADO";
  page.drawText(totalLabel, { x: qtyX - 30, y, size: 11, font: bold, color: dark });
  const totalTxt = `${formatMoney(data.amountPaid, data.currency)} ${data.currency.toUpperCase()}`;
  page.drawText(totalTxt, { x: amtRight - bold.widthOfTextAtSize(totalTxt, 14), y: y - 1, size: 14, font: bold, color: brandColor });

  if (data.fxNote) {
    y -= 18;
    page.drawText(data.fxNote, { x: amtRight - font.widthOfTextAtSize(data.fxNote, 8), y, size: 8, font, color: gray });
  }

  // ---- Método de pago + estado ----
  y -= 42;
  if (data.paymentMethod) {
    const lbl = "Método de pago: ";
    page.drawText(lbl, { x: M, y, size: 10, font, color: gray });
    page.drawText(data.paymentMethod, { x: M + font.widthOfTextAtSize(lbl, 10), y, size: 10, font: bold, color: dark });
  }
  const badge = "PAGADO";
  const bW = bold.widthOfTextAtSize(badge, 10);
  page.drawRectangle({ x: width - M - bW - 22, y: y - 6, width: bW + 22, height: 23, color: rgb(0.85, 0.95, 0.87) });
  page.drawText(badge, { x: width - M - bW - 11, y, size: 10, font: bold, color: rgb(0.1, 0.45, 0.2) });

  // ---- Pie ----
  const footY = 72;
  page.drawLine({ start: { x: M, y: footY + 26 }, end: { x: width - M, y: footY + 26 }, thickness: 0.5, color: line });
  const contact = [brand.supportEmail, brand.supportPhone, brand.website].filter(Boolean).join("   •   ");
  page.drawText(contact, { x: M, y: footY + 10, size: 9, font, color: gray });
  let ny = footY - 6;
  for (const ln of wrapText(brand.footerNote, font, 8, width - 2 * M)) {
    page.drawText(ln, { x: M, y: ny, size: 8, font, color: gray });
    ny -= 11;
  }

  return await doc.save();
}

function wrapText(text: string, font: PDFFont, size: number, maxWidth: number): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let cur = "";
  for (const w of words) {
    const test = cur ? `${cur} ${w}` : w;
    if (font.widthOfTextAtSize(test, size) > maxWidth && cur) {
      lines.push(cur);
      cur = w;
    } else {
      cur = test;
    }
  }
  if (cur) lines.push(cur);
  return lines;
}
