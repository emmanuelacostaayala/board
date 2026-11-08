import crypto from "crypto";
import { NextResponse } from "next/server";
import { getTransporter, emailFromAddress } from "@/lib/email/transport";
import { BRANDS } from "@/lib/receipts/brands";

/**
 * Webhook de Calendly para las citas online del Board.
 *
 * Calendly es quien recibe la reserva (ver app/board/cita-online/page.tsx); la
 * app no se enteraba de nada. Este route escucha `invitee.created` /
 * `invitee.canceled` y avisa por correo a info@ y director@blperfusion.org.
 *
 * Alta de la suscripcion (una sola vez, con un token de la API de Calendly):
 *   POST https://api.calendly.com/webhook_subscriptions
 *   { "url": "https://blperfusion.org/api/calendly/webhook",
 *     "events": ["invitee.created", "invitee.canceled"],
 *     "organization": "<tu organization uri>",
 *     "scope": "user",
 *     "user": "<tu user uri>",
 *     "signing_key": "<secreto a guardar en CALENDLY_WEBHOOK_SIGNING_KEY>" }
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const AVISO_TO = "info@blperfusion.org";
const AVISO_CC = "director@blperfusion.org";

const SIGNING_KEY = process.env.CALENDLY_WEBHOOK_SIGNING_KEY;

/** Tolerancia del timestamp firmado, para que un replay viejo no pase. */
const MAX_SIGNATURE_AGE_MS = 5 * 60 * 1000;

type CalendlyLocation = {
  type?: string;
  location?: string;
  join_url?: string;
};

type CalendlyPayload = {
  event: string;
  payload: {
    name?: string;
    email?: string;
    timezone?: string;
    rescheduled?: boolean;
    cancel_url?: string;
    reschedule_url?: string;
    text_reminder_number?: string | null;
    questions_and_answers?: { question: string; answer: string }[];
    cancellation?: { canceled_by?: string; reason?: string };
    scheduled_event?: {
      name?: string;
      start_time?: string;
      end_time?: string;
      location?: CalendlyLocation;
      event_memberships?: { user_email?: string; user_name?: string }[];
    };
  };
};

function escapeHtml(value: unknown): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Verifica el header `Calendly-Webhook-Signature` (formato `t=<ts>,v1=<hmac>`).
 * El HMAC-SHA256 se calcula sobre `<ts>.<cuerpo crudo>`, asi que hay que firmar
 * el texto tal cual llego, antes de cualquier JSON.parse.
 */
function signatureIsValid(rawBody: string, header: string | null): boolean {
  if (!header) return false;

  const parts = new Map(
    header.split(",").map((chunk) => {
      const [k, v] = chunk.split("=");
      return [k?.trim(), v?.trim()] as [string, string];
    })
  );

  const timestamp = parts.get("t");
  const received = parts.get("v1");
  if (!timestamp || !received) return false;

  const ageMs = Date.now() - Number(timestamp) * 1000;
  if (!Number.isFinite(ageMs) || Math.abs(ageMs) > MAX_SIGNATURE_AGE_MS) {
    return false;
  }

  const expected = crypto
    .createHmac("sha256", SIGNING_KEY as string)
    .update(`${timestamp}.${rawBody}`)
    .digest("hex");

  const a = Buffer.from(expected, "utf8");
  const b = Buffer.from(received, "utf8");
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

function formatFecha(iso: string | undefined, timezone: string): string {
  if (!iso) return "Sin fecha";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "Sin fecha";
  try {
    return new Intl.DateTimeFormat("es-DO", {
      dateStyle: "full",
      timeStyle: "short",
      timeZone: timezone,
    }).format(date);
  } catch {
    // Zona horaria invalida en el payload: caemos a UTC en vez de reventar.
    return new Intl.DateTimeFormat("es-DO", {
      dateStyle: "full",
      timeStyle: "short",
      timeZone: "UTC",
    }).format(date);
  }
}

function describeLocation(location: CalendlyLocation | undefined): string {
  if (!location) return "Por confirmar";
  if (location.join_url) {
    return `<a href="${escapeHtml(location.join_url)}">${escapeHtml(
      location.join_url
    )}</a>`;
  }
  return escapeHtml(location.location || location.type || "Por confirmar");
}

function row(label: string, value: string): string {
  return `
    <tr>
      <td style="padding: 8px 12px 8px 0; font-weight: bold; color: #4b5563; white-space: nowrap; vertical-align: top;">${label}:</td>
      <td style="padding: 8px 0; color: #374151;">${value}</td>
    </tr>`;
}

export async function POST(request: Request) {
  // El cuerpo crudo es obligatorio para validar la firma.
  const rawBody = await request.text();

  if (SIGNING_KEY) {
    const header =
      request.headers.get("calendly-webhook-signature") ||
      request.headers.get("Calendly-Webhook-Signature");
    if (!signatureIsValid(rawBody, header)) {
      console.warn("[calendly] firma invalida o vencida, evento descartado");
      return NextResponse.json({ error: "Firma invalida" }, { status: 401 });
    }
  } else {
    console.warn(
      "[calendly] CALENDLY_WEBHOOK_SIGNING_KEY sin definir: no se valida la firma"
    );
  }

  let body: CalendlyPayload;
  try {
    body = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "JSON invalido" }, { status: 400 });
  }

  const evento = body?.event;
  if (evento !== "invitee.created" && evento !== "invitee.canceled") {
    // Nada que avisar, pero respondemos 200 para que Calendly no reintente.
    return NextResponse.json({ ok: true, ignored: evento ?? null });
  }

  const p = body.payload ?? {};
  const cita = p.scheduled_event ?? {};
  const timezone = p.timezone || "America/Santo_Domingo";
  const cancelada = evento === "invitee.canceled";

  const perfusionista = p.name || "Sin nombre";
  const servicio = cita.name || "Cita online";
  const anfitrion =
    cita.event_memberships?.[0]?.user_name ||
    cita.event_memberships?.[0]?.user_email ||
    "Board Latinoamericano de Perfusión";

  const filas = [
    row("Perfusionista", escapeHtml(perfusionista)),
    row(
      "Correo",
      p.email
        ? `<a href="mailto:${escapeHtml(p.email)}">${escapeHtml(p.email)}</a>`
        : "No provisto"
    ),
    p.text_reminder_number
      ? row("Teléfono", escapeHtml(p.text_reminder_number))
      : "",
    row("Servicio", escapeHtml(servicio)),
    row("Fecha y hora", escapeHtml(formatFecha(cita.start_time, timezone))),
    row("Zona horaria", escapeHtml(timezone)),
    row("Modalidad", describeLocation(cita.location)),
    row("Atiende", escapeHtml(anfitrion)),
  ];

  if (p.rescheduled) {
    filas.push(row("Nota", "Esta cita es una reprogramación"));
  }

  if (cancelada && p.cancellation) {
    filas.push(
      row("Cancelada por", escapeHtml(p.cancellation.canceled_by || "—")),
      row("Motivo", escapeHtml(p.cancellation.reason || "No indicado"))
    );
  }

  const preguntas = (p.questions_and_answers ?? []).filter((qa) => qa?.answer);
  const bloquePreguntas = preguntas.length
    ? `
      <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="color: #374151; margin-top: 0;">Respuestas del formulario</h3>
        ${preguntas
          .map(
            (qa) => `
          <p style="margin: 0 0 12px;">
            <strong style="color: #4b5563;">${escapeHtml(qa.question)}</strong><br />
            <span style="color: #374151;">${escapeHtml(qa.answer)}</span>
          </p>`
          )
          .join("")}
      </div>`
    : "";

  const acciones = [
    cancelada ? "" : p.reschedule_url,
    cancelada ? "" : p.cancel_url,
  ].filter(Boolean) as string[];

  const bloqueAcciones = acciones.length
    ? `<p style="margin: 20px 0 0; font-size: 14px; color: #6b7280;">
         ${acciones
           .map(
             (url, i) =>
               `<a href="${escapeHtml(url)}" style="color: #2563eb;">${
                 i === 0 ? "Reprogramar" : "Cancelar"
               }</a>`
           )
           .join(" &nbsp;·&nbsp; ")}
       </p>`
    : "";

  const titulo = cancelada ? "Cita cancelada" : "Nueva cita agendada";
  const color = cancelada ? "#dc2626" : "#2563eb";

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: ${color}; border-bottom: 2px solid ${color}; padding-bottom: 10px;">
        ${titulo}
      </h2>

      <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="color: #374151; margin-top: 0;">Detalles de la cita</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <tbody>${filas.filter(Boolean).join("")}</tbody>
        </table>
      </div>

      ${bloquePreguntas}
      ${bloqueAcciones}

      <p style="margin-top: 28px; font-size: 12px; color: #9ca3af;">
        Aviso automático generado desde blperfusion.org al recibir la reserva en Calendly.
      </p>
    </div>`;

  try {
    const brand = BRANDS.BOARD;
    await getTransporter().sendMail({
      from: `"${brand.fromName}" <${emailFromAddress()}>`,
      to: AVISO_TO,
      cc: AVISO_CC,
      replyTo: p.email || brand.replyTo,
      subject: `${
        cancelada ? "Cita cancelada" : "Nueva cita online"
      } - ${perfusionista} (${formatFecha(cita.start_time, timezone)})`,
      html,
    });
  } catch (error) {
    console.error("[calendly] fallo el envio del aviso de cita:", error);
    // 500 a proposito: Calendly reintenta y no perdemos el aviso.
    return NextResponse.json(
      { error: "No se pudo enviar el aviso" },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true, event: evento });
}
