// /lib/pcc.helpers.ts
import { PCC_LIST } from "@/data/pccList";

export function normalizeForMatch(s: string) {
  return s
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function userLooksLikePccName(userFullName: string, pccCode: string) {
  const t = PCC_LIST.find((p) => p.code === pccCode);
  if (!t) return false;

  const userT = normalizeForMatch(userFullName).split(" ");
  const pccT = normalizeForMatch(`${t.firstName} ${t.lastName}`).split(" ");

  // si alguna palabra (>=3 letras) del usuario aparece en el registro oficial → OK
  return userT.some((x) => x.length >= 3 && pccT.includes(x));
}
