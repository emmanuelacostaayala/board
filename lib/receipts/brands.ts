import type { BrandKey } from "./types";

export interface Brand {
  key: BrandKey;
  /** Nombre mostrado en el encabezado del PDF y como nombre del remitente. */
  displayName: string;
  /** Nombre del remitente del email. */
  fromName: string;
  /** Reply-To del email. */
  replyTo: string;
  supportEmail: string;
  supportPhone?: string;
  website?: string;
  /** Color del encabezado (componentes 0–1). */
  color: { r: number; g: number; b: number };
  /** Ruta del logo dentro de /public (png o jpg). Opcional. */
  logoFile?: string;
  /** Prefijo del número de recibo, ej. "ESC", "BLP". */
  receiptPrefix: string;
  footerNote: string;
}

export const BRANDS: Record<BrandKey, Brand> = {
  ESCUELA: {
    key: "ESCUELA",
    displayName: "Escuela de Perfusión",
    fromName: "Escuela de Perfusión",
    replyTo: process.env.ESCUELA_REPLY_TO || "operaciones@alapescuela.com",
    supportEmail: "operaciones@alapescuela.com",
    supportPhone: process.env.ESCUELA_PHONE || undefined,
    website: "alapescuela.com",
    color: { r: 0.11, g: 0.31, b: 0.45 },
    logoFile: "images/alapescuela-logo.png", // si no existe, se usa encabezado de texto
    receiptPrefix: "ESC",
    footerNote:
      "Este documento es un comprobante de pago electrónico emitido por la Escuela de Perfusión (ALAP). Consérvelo para sus registros.",
  },
  BOARD: {
    key: "BOARD",
    displayName: "Board Latinoamericano de Perfusión",
    fromName: "Board Latinoamericano de Perfusión",
    replyTo:
      process.env.BOARD_REPLY_TO || "info@boardlatinoamericanodeperfusion.com",
    supportEmail: "info@boardlatinoamericanodeperfusion.com",
    website: "boardlatinoamericanodeperfusion.com",
    color: { r: 0.15, g: 0.22, b: 0.42 },
    logoFile: "images/board.png",
    receiptPrefix: "BLP",
    footerNote:
      "Este documento es un comprobante de pago electrónico emitido por el Board Latinoamericano de Perfusión. Consérvelo para sus registros.",
  },
};

/**
 * Ruteo: qué pagos pertenecen a la Escuela de Perfusión (subcategoría).
 *
 * Las cuotas Pago II–V (ambas variantes: $1,750 "Pago Parcial" y $2,500 fechado)
 * son de la Escuela. Los pagos de $10 (penalización, donación, etc.) son Board.
 *
 * Para agregar/quitar productos basta editar estos sets — IDs verificados en la
 * cuenta Stripe acct_1S3hSAE9XdtawVdw (Board Latinoamericano de Perfusión).
 */
export const ESCUELA_PRODUCT_IDS = new Set<string>([
  "prod_UKdrmlBy4GIuRZ", // Pago II – Pago Parcial
  "prod_UKdrBPwpNoNwiv", // Pago III – Pago Parcial
  "prod_UKdrw2DmNZpYxD", // Pago IV – Pago Parcial
  "prod_UKdrAXQLCaKcJR", // Pago V – Pago Parcial
  "prod_UJO7j7WQcNASYj", // Pago II – Abril 2026
  "prod_UJO7RoWhKksEsY", // Pago III – Septiembre 2026
  "prod_UJO7xNrbFeL2Uv", // Pago IV – Febrero 2027
  "prod_UJO7NoSxg9AoRP", // Pago V – Julio 2027
]);

export const ESCUELA_PRICE_IDS = new Set<string>([
  "price_1TLyZyE9XdtawVdwpKx6IAKl", // Pago II – Pago Parcial
  "price_1TLyZzE9XdtawVdwMn5FuieL", // Pago III – Pago Parcial
  "price_1TLya0E9XdtawVdwwY3dgS0n", // Pago IV – Pago Parcial
  "price_1TLya1E9XdtawVdwRh2CKGP0", // Pago V – Pago Parcial
  "price_1TKlL2E9XdtawVdwLAmfBBS8", // Pago II – Abril 2026
  "price_1TKlL3E9XdtawVdw3usKi4il", // Pago III – Septiembre 2026
  "price_1TKlL4E9XdtawVdw7THvMTwA", // Pago IV – Febrero 2027
  "price_1TKlL4E9XdtawVdwdJNKEEHR", // Pago V – Julio 2027
]);

export function resolveBrand(opts: {
  productIds?: (string | null | undefined)[];
  priceIds?: (string | null | undefined)[];
}): Brand {
  const prods = (opts.productIds || []).filter(Boolean) as string[];
  const prices = (opts.priceIds || []).filter(Boolean) as string[];
  const isEscuela =
    prods.some((p) => ESCUELA_PRODUCT_IDS.has(p)) ||
    prices.some((p) => ESCUELA_PRICE_IDS.has(p));
  return isEscuela ? BRANDS.ESCUELA : BRANDS.BOARD;
}
