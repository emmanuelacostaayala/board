import nodemailer, { type Transporter } from "nodemailer";
import type SMTPTransport from "nodemailer/lib/smtp-transport";

/**
 * Transporte de email para los recibos de la Escuela.
 *
 * Usa la cuenta Zoho `operaciones@alapescuela.com` — la MISMA que el Board ya
 * usa (y que funciona) en app/api/send-application. Esas credenciales ya viven
 * en el repo; aquí solo se reutilizan. Se pueden sobreescribir por env SMTP_*
 * (recomendado tras rotar la contraseña de Zoho).
 */
const SMTP_USER = process.env.SMTP_USER || "operaciones@alapescuela.com";
const SMTP_PASS = process.env.SMTP_PASS || "eyzV6ykSnAGZ";
const SMTP_HOST = process.env.SMTP_HOST || "204.141.32.56"; // IP directa (evita DNS en Vercel)
const SMTP_PORT = Number(process.env.SMTP_PORT || 465);
const SMTP_SERVERNAME = process.env.SMTP_SERVERNAME || "smtp.zoho.com";

let cached: Transporter | null = null;

export function getTransporter(): Transporter {
  if (cached) return cached;
  const options: SMTPTransport.Options = {
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_PORT === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
    tls: { servername: SMTP_SERVERNAME },
    connectionTimeout: 15000,
    greetingTimeout: 10000,
    socketTimeout: 20000,
  };
  cached = nodemailer.createTransport(options);
  return cached;
}

/** Remitente real (envelope from). El display name se setea por marca. */
export function emailFromAddress(): string {
  return SMTP_USER;
}
