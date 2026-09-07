// /lib/actions/supervisor.actions.ts
"use server";

import crypto from "crypto";
import { currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { PCC_STATUSES, type PccStatus } from "@/lib/pccStatus";

/**
 * DONDE SE GUARDA EL ESTADO
 *
 * Lo natural seria pcc_assignment.status, pero esa columna no existe y crearla
 * necesita permisos de esquema que las llaves de Supabase (anon y service_role)
 * no otorgan: ambas entran por PostgREST, que no ejecuta DDL.
 *
 * Como alternativa se reutiliza pcc_records, que estaba vacia y ya trae una
 * columna status. La fila se identifica por `title` = codigo PCC.
 *
 * El precio: pcc_records.user_id es NOT NULL de tipo uuid y los IDs de Clerk son
 * texto, asi que se rellena con un UUID derivado del propio codigo PCC. Ese valor
 * NO referencia a ningun usuario; existe solo para satisfacer la restriccion.
 * Es deterministico a proposito, para que reintentos no generen filas sueltas y
 * para que la futura migracion a pcc_assignment.status sea reproducible.
 */
const RECORD_TABLE = "pcc_records";

function fillerUuid(pccCode: string): string {
  const h = crypto.createHash("sha1").update("pcc-status:" + pccCode).digest("hex");
  return [
    h.slice(0, 8),
    h.slice(8, 12),
    "5" + h.slice(13, 16),
    ((parseInt(h.slice(16, 17), 16) & 0x3) | 0x8).toString(16) + h.slice(17, 20),
    h.slice(20, 32),
  ].join("-");
}

type UpdateStatusResult = { ok: true } | { ok: false; message: string };

/** Estados fijados a mano, por codigo PCC. */
export async function getStatusOverrides(): Promise<Record<string, string>> {
  const { data, error } = await supabaseAdmin
    .from(RECORD_TABLE)
    .select("title, status")
    .not("status", "is", null);

  if (error) {
    console.error("Error leyendo estados:", error.message);
    return {};
  }

  const out: Record<string, string> = {};
  for (const r of data || []) if (r.title) out[r.title] = r.status;
  return out;
}

/** El estado fijado a mano para un solo perfusionista, o null. */
export async function getStatusOverride(pccCode: string): Promise<string | null> {
  if (!pccCode) return null;
  const { data, error } = await supabaseAdmin
    .from(RECORD_TABLE)
    .select("status")
    .eq("title", pccCode)
    .limit(1);

  if (error) {
    console.error("Error leyendo estado:", error.message);
    return null;
  }
  return data && data[0] ? data[0].status : null;
}

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

  // Solo perfusionistas con cuenta registrada.
  const { data: asg, error: ae } = await supabaseAdmin
    .from("pcc_assignment")
    .select("pcc_code")
    .eq("pcc_code", pccCode)
    .limit(1);

  if (ae) {
    console.error("Error verificando asignación:", ae);
    return { ok: false, message: "No se pudo verificar el perfusionista." };
  }
  if (!asg || asg.length === 0) {
    return {
      ok: false,
      message: `${pccCode} no tiene cuenta registrada, no se le puede asignar estado.`,
    };
  }

  const { data: existing, error: se } = await supabaseAdmin
    .from(RECORD_TABLE)
    .select("id")
    .eq("title", pccCode)
    .limit(1);

  if (se) {
    console.error("Error buscando el registro:", se);
    return { ok: false, message: "No se pudo guardar el estado." };
  }

  const now = new Date().toISOString();
  const error = existing && existing.length
    ? (
        await supabaseAdmin
          .from(RECORD_TABLE)
          .update({ status, updated_at: now })
          .eq("id", existing[0].id)
      ).error
    : (
        await supabaseAdmin.from(RECORD_TABLE).insert({
          user_id: fillerUuid(pccCode), // relleno, no referencia a nadie
          title: pccCode,
          description: "Estado asignado desde el panel de supervisión.",
          status,
          metadata: { source: "supervisor-panel", pcc_code: pccCode },
          updated_at: now,
        })
      ).error;

  if (error) {
    console.error("Error guardando estado:", error);
    return { ok: false, message: "No se pudo guardar el estado." };
  }

  // El supervisor y el propio perfusionista leen el mismo dato.
  revalidatePath("/board/supervisor");
  revalidatePath("/my-journey");

  return { ok: true };
}
