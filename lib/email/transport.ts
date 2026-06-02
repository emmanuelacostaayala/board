import nodemailer, { type Transporter } from "nodemailer";
import type SMTPTransport from "nodemailer/lib/smtp-transport";

/**
 * Transporte de email compartido.
 *
 * Por defecto usa el MISMO proveedor que ya tiene configurada la app del Board:
 * Gmail / Google Workspace vía EMAIL_USER + EMAIL_PASS (las mismas env vars que
 * usa lib/actions/submitCases.ts y que ya existen en el proyecto Vercel `board`).
 * Así los recibos funcionan sin agregar ninguna variable nueva.
 *
 * Si algún día se quiere un remitente propio (ej. Zoho operaciones@alapescuela.com),
 * basta definir SMTP_USER + SMTP_PASS (+ SMTP_HOST/PORT/SERVERNAME) y se usa eso.
 */
let cached: Transporter | null = null;

export function getTransporter(): Transporter {
  if (cached) return cached;

  // Override opcional por SMTP propio (ej. Zoho).
  if (process.env.SMTP_USER && process.env.SMTP_PASS) {
    const port = Number(process.env.SMTP_PORT || 465);
    const servername = process.env.SMTP_SERVERNAME;
    const options: SMTPTransport.Options = {
      host: process.env.SMTP_HOST || "smtp.zoho.com",
      port,
      secure: port === 465,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
      tls: servername ? { servername } : undefined,
    };
    cached = nodemailer.createTransport(options);
    return cached;
  }

  // Por defecto: Gmail / Workspace con las env vars que ya usa el Board.
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;
  if (!user || !pass) {
    throw new Error(
      "Email no configurado: faltan EMAIL_USER/EMAIL_PASS (o SMTP_USER/SMTP_PASS)."
    );
  }
  const options: SMTPTransport.Options = {
    service: "gmail",
    auth: { user, pass },
  };
  cached = nodemailer.createTransport(options);
  return cached;
}

/** Dirección remitente real (envelope from). El display name se setea por marca. */
export function emailFromAddress(): string {
  return process.env.SMTP_USER || process.env.EMAIL_USER || "";
}
