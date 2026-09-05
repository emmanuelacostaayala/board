// /lib/actions/supervisor.actions.ts
"use server";

import { currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { PCC_STATUSES, type PccStatus } from "@/lib/pccStatus";

type UpdateStatusResult = { ok: true } | { ok: false; message: string };

/**
 * Cambia el estado de un perfusionista. Solo admin y supervisor.
 *
 * El candado de verdad esta aqui, no en la UI: la pagina puede ocultar el
 * control, pero cualquiera puede invocar una server action, asi que el rol
 * se vuelve a verificar contra Clerk en cada llamada.
 */
export async function updatePccStatus(
  pccCode: string,
  status: string
): Promise<UpdateStatusResult> {
  const user = await currentUser();
  if (!user) return { ok: false, message: "Debes iniciar sesión." };

  const role = user.publicMetadata?.role;
  if (role !== "admin" && role !== "supervisor") {
    return { ok: false, message: "No tienes permiso para cambiar estados." };
  }

  if (!PCC_STATUSES.includes(status as PccStatus)) {
    return { ok: false, message: `Estado no válido: ${status}` };
  }

  const { data, error } = await supabaseAdmin
    .from("pcc_assignment")
    .update({ status })
    .eq("pcc_code", pccCode)
    .select("pcc_code");

  if (error) {
    console.error("Error actualizando estado:", error);
    // La columna se agrega con:
    //   alter table pcc_assignment add column status text;
    if (/column .*status.* does not exist/i.test(error.message)) {
      return {
        ok: false,
        message:
          "Falta la columna 'status' en la tabla pcc_assignment. Hay que crearla en Supabase.",
      };
    }
    return { ok: false, message: "No se pudo guardar el estado." };
  }

  if (!data || data.length === 0) {
    return {
      ok: false,
      message: `${pccCode} no tiene cuenta registrada, no se le puede asignar estado.`,
    };
  }

  // El supervisor y el propio perfusionista leen el mismo dato.
  revalidatePath("/board/supervisor");
  revalidatePath("/my-journey");

  return { ok: true };
}
