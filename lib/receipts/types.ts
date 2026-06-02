export type BrandKey = "ESCUELA" | "BOARD";

export interface ReceiptLineItem {
  description: string;
  quantity: number;
  /** Total de la línea, en unidades mayores (ej. 1750.00). */
  amount: number;
}

export interface ReceiptData {
  brandKey: BrandKey;
  receiptNumber: string;
  /** Fecha ya formateada para mostrar, ej. "13 de mayo de 2026". */
  dateISO: string;
  payerName: string;
  payerEmail: string;
  items: ReceiptLineItem[];
  /** Código de moneda, ej. "USD". */
  currency: string;
  /** Monto total pagado, en unidades mayores. */
  amountPaid: number;
  /** Ej. "Visa •••• 8980". */
  paymentMethod?: string;
  /** Nota opcional de conversión, ej. "Cobrado PEN 6,232.47 (1 USD = 3.5614 PEN)". */
  fxNote?: string;
}
