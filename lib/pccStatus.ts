// /lib/pccStatus.ts
//
// Modulo aparte a proposito: los archivos "use server" solo pueden exportar
// funciones async, asi que estas constantes no pueden vivir junto a la accion.
// Las usan tanto el panel de supervision (cliente) como la accion (servidor).

/** Estados que un supervisor puede asignar a un perfusionista. */
export const PCC_STATUSES = [
  "Activo",
  "Verificada",
  "Revision",
  "Inactivo 1",
  "Inactivo 2",
  "Emeritus",
] as const;

export type PccStatus = (typeof PCC_STATUSES)[number];
