export function formatMoney(amount: number, currency: string): string {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency.toUpperCase(),
    }).format(amount);
  } catch {
    return `${amount.toFixed(2)} ${currency.toUpperCase()}`;
  }
}

export function formatDateEs(unixSeconds: number): string {
  const d = new Date(unixSeconds * 1000);
  return new Intl.DateTimeFormat("es", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(d);
}

export function buildReceiptNumber(
  prefix: string,
  id: string,
  unixSeconds: number
): string {
  const year = new Date(unixSeconds * 1000).getFullYear();
  const tail = id.replace(/[^a-zA-Z0-9]/g, "").slice(-6).toUpperCase();
  return `${prefix}-${year}-${tail}`;
}

export function cap(s?: string | null): string {
  if (!s) return "";
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/**
 * Las fuentes estándar de pdf-lib codifican en WinAnsi (CP1252) y lanzan error
 * con caracteres fuera de ese set. Esto deja pasar latín (incl. acentos, ñ, ü) y
 * puntuación común (– — • … " "), translitera lo demás y descarta lo no mapeable,
 * evitando que un nombre con un carácter exótico tumbe la generación del recibo.
 */
const CP1252_EXTRA = new Set<number>([
  0x20ac, 0x201a, 0x0192, 0x201e, 0x2026, 0x2020, 0x2021, 0x02c6, 0x2030,
  0x0160, 0x2039, 0x0152, 0x017d, 0x2018, 0x2019, 0x201c, 0x201d, 0x2022,
  0x2013, 0x2014, 0x02dc, 0x2122, 0x0161, 0x203a, 0x0153, 0x017e, 0x0178,
]);

function isWinAnsi(cp: number): boolean {
  return (
    (cp >= 0x20 && cp <= 0x7e) ||
    (cp >= 0xa0 && cp <= 0xff) ||
    CP1252_EXTRA.has(cp)
  );
}

export function winAnsiSafe(s: string): string {
  let out = "";
  for (const ch of s) {
    const cp = ch.codePointAt(0) ?? 0;
    if (isWinAnsi(cp)) {
      out += ch;
      continue;
    }
    const COMBINING_MARKS = /[̀-ͯ]/g;
    const stripped = ch.normalize("NFKD").replace(COMBINING_MARKS, "");
    out += [...stripped].every((c) => isWinAnsi(c.codePointAt(0) ?? 0))
      ? stripped
      : "";
  }
  return out;
}

export function escapeHtml(s: string): string {
  return s.replace(
    /[&<>"']/g,
    (ch) =>
      (({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      }) as Record<string, string>)[ch]
  );
}
