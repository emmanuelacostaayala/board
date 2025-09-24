// lib/supabase/admin.ts
import { createClient } from '@supabase/supabase-js';

/**
 * Cliente ADMIN (service_role). Úsalo SOLO en Server Actions o rutas server.
 * NUNCA lo importes en componentes "use client".
 */
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!, // <-- agrega esta var a tu .env (no NEXT_PUBLIC)
  { auth: { persistSession: false } }
);
