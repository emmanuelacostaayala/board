// /lib/actions/pcc.actions.ts
"use server";

import { supabaseAdmin } from "@/lib/supabase/admin";
import { PCC_LIST } from "@/data/pccList";

/* Tipos */
export type AssignResult = { ok: true; pccCode: string } | { ok: false; message: string };

type AssignArgs = { userId: string; userFullName: string; pccCode: string };

export async function listTakenPccCodes(): Promise<Set<string>> {
  const { data, error } = await supabaseAdmin
    .from("pcc_assignment")
    .select("pcc_code");
  if (error) {
    console.error(error);
    return new Set();
  }
  return new Set((data || []).map((r: any) => r.pcc_code as string));
}

export async function getMyPcc(userId: string) {
  const { data, error } = await supabaseAdmin
    .from("pcc_assignment")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) {
    console.error(error);
    return null;
  }
  return data;
}

export async function assignPccToUser(args: AssignArgs): Promise<AssignResult> {
  const { userId, userFullName, pccCode } = args;

  // 1) ¿ya está tomado por alguien más?
  const { data: taken, error: errTaken } = await supabaseAdmin
    .from("pcc_assignment")
    .select("user_id, pcc_code")
    .eq("pcc_code", pccCode)
    .maybeSingle();
  if (errTaken) {
    console.error(errTaken);
    return { ok: false, message: "Error verificando PCC." };
  }
  if (taken && taken.user_id !== userId) {
    return { ok: false, message: "Este PCC ya fue tomado por otro usuario." };
  }

  // 2) datos oficiales para guardar (primero busco en la lista)
  const t = PCC_LIST.find((x) => x.code === pccCode);
  const [firstName, ...rest] = (t?.firstName || userFullName || "").split(" ");
  const lastName = t?.lastName || rest.join(" ");

  // 3) upsert por user_id (un usuario solo puede tener 1 PCC)
  const { error } = await supabaseAdmin
    .from("pcc_assignment")
    .upsert(
      {
        user_id: userId,
        pcc_code: pccCode,
        first_name: firstName ?? "",
        last_name: lastName ?? "",
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" }
    );

  if (error) {
    console.error(error);
    return { ok: false, message: "No se pudo asignar el PCC." };
  }

  return { ok: true, pccCode };
}

export async function releaseMyPcc(userId: string) {
  const { error } = await supabaseAdmin
    .from("pcc_assignment")
    .delete()
    .eq("user_id", userId);
  if (error) console.error(error);
}

/* Casos clínicos */
export async function createClinicalCase(args: {
  userId: string;
  pccCode: string;
  caseDate: string; // YYYY-MM-DD
  surgeonName: string;
  institution: string;
  surgeryType: string;
  caseRole?: string;
}) {
  const { error } = await supabaseAdmin.from("clinical_case").insert({
    user_id: args.userId,
    pcc_code: args.pccCode,
    case_date: args.caseDate,
    surgeon_name: args.surgeonName,
    institution: args.institution,
    surgery_type: args.surgeryType,
    case_role: args.caseRole, // Nuevo campo
  });
  if (error) {
    console.error(error);
    throw new Error("No se pudo registrar el caso clínico.");
  }
}

export async function listMyClinicalCases(userId: string) {
  const { data, error } = await supabaseAdmin
    .from("clinical_case")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) {
    console.error(error);
    return [];
  }
  return data || [];
}

export async function deleteClinicalCase(caseId: string, userId: string) {
  const { error } = await supabaseAdmin
    .from("clinical_case")
    .delete()
    .match({ id: caseId, user_id: userId });

  if (error) {
    console.error("Error deleting case:", error);
    throw new Error("No se pudo eliminar el caso clínico.");
  }
}

export async function updateClinicalCase(args: {
  caseId: string;
  userId: string;
  // Campos editables
  caseDate?: string;
  surgeonName?: string;
  institution?: string;
  surgeryType?: string;
  caseRole?: string;
}) {
  const { error } = await supabaseAdmin
    .from("clinical_case")
    .update({
      case_date: args.caseDate,
      surgeon_name: args.surgeonName,
      institution: args.institution,
      surgery_type: args.surgeryType,
      case_role: args.caseRole, // Nuevo campo
    })
    .match({ id: args.caseId, user_id: args.userId });

  if (error) {
    console.error("Error updating case:", error);
    throw new Error("No se pudo actualizar el caso clínico.");
  }
}

/* UCE */
export async function createUceEvent(args: {
  userId: string;
  pccCode: string;
  eventDate: string; // YYYY-MM-DD
  institution: string;
  approvedByALAP: boolean;
  eventName: string;
  country: string;
  ucesAcquired: number;
  eventTypes: string[]; // guardamos CSV
  initials?: string;
}) {
  const { error } = await supabaseAdmin.from("uce_event").insert({
    user_id: args.userId,
    pcc_code: args.pccCode,
    event_date: args.eventDate,
    institution: args.institution,
    approved_by_alap: args.approvedByALAP,
    event_name: args.eventName,
    country: args.country,
    uces_acquired: args.ucesAcquired,
    event_types: args.eventTypes.join(","),
    initials: args.initials ?? "",
  });
  if (error) {
    console.error(error);
    throw new Error("No se pudo registrar la UCE.");
  }
}

export async function listMyUceEvents(userId: string) {
  const { data, error } = await supabaseAdmin
    .from("uce_event")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) {
    console.error(error);
    return [];
  }
  return data || [];
}
