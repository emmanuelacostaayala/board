import { createClient } from '@supabase/supabase-js';
import { clerkClient } from '@clerk/nextjs/server';
import { PCC_LIST } from '@/data/pccList';
import SupervisorTable, { SupervisorRow } from './SupervisorTable';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export const revalidate = 0; // Disable caching to always show latest

// Supabase corta en 1000 filas por consulta y clinical_case ya pasa de 6000,
// asi que hay que pedir la tabla por paginas o los conteos salen truncados.
const PAGE = 1000;
async function fetchAll(table: string, columns: string): Promise<any[]> {
  const out: any[] = [];
  for (let from = 0; ; from += PAGE) {
    const { data, error } = await supabaseAdmin
      .from(table)
      .select(columns)
      .range(from, from + PAGE - 1);
    if (error) {
      console.error(`Error leyendo ${table}:`, error.message);
      break;
    }
    const rows = data || [];
    out.push(...rows);
    if (rows.length < PAGE) break;
  }
  return out;
}

// La columna 'status' se agrega con:
//   alter table pcc_assignment add column status text;
// Mientras no exista, la consulta con esa columna falla y se lee sin ella,
// para que el panel siga funcionando antes de la migracion.
async function fetchAssignments(): Promise<any[]> {
  const conStatus = await fetchAll(
    'pcc_assignment',
    'user_id, pcc_code, first_name, last_name, status'
  );
  if (conStatus.length > 0) return conStatus;
  return fetchAll('pcc_assignment', 'user_id, pcc_code, first_name, last_name');
}

// Correos por user_id de Clerk. Si Clerk falla, la tabla se muestra igual sin correos.
async function fetchEmails(): Promise<Map<string, string>> {
  const emails = new Map<string, string>();
  try {
    const client = await clerkClient();
    let offset = 0;
    for (;;) {
      const res: any = await client.users.getUserList({ limit: 500, offset });
      const list: any[] = res?.data ?? res ?? [];
      for (const u of list) {
        const addr = u.emailAddresses?.[0]?.emailAddress;
        if (addr) emails.set(u.id, addr);
      }
      if (list.length < 500) break;
      offset += 500;
    }
  } catch (err) {
    console.error('No se pudieron cargar los correos de Clerk:', err);
  }
  return emails;
}

export default async function SupervisorDashboardPage() {
  const [assignments, cases, uces, emails] = await Promise.all([
    fetchAssignments(),
    fetchAll('clinical_case', 'pcc_code, submission_period'),
    fetchAll('uce_event', 'pcc_code'),
    fetchEmails(),
  ]);

  const assignmentByCode = new Map((assignments || []).map((a) => [a.pcc_code, a]));

  // Casos totales y quiénes llegaron a someter (submission_period no nulo),
  // que es el criterio con el que /my-journey considera Activo a un perfusionista.
  const caseCount = new Map<string, number>();
  const submitted = new Set<string>();
  for (const c of cases || []) {
    if (!c.pcc_code) continue;
    caseCount.set(c.pcc_code, (caseCount.get(c.pcc_code) || 0) + 1);
    if (c.submission_period != null) submitted.add(c.pcc_code);
  }

  const uceCount = new Map<string, number>();
  for (const u of uces || []) {
    if (!u.pcc_code) continue;
    uceCount.set(u.pcc_code, (uceCount.get(u.pcc_code) || 0) + 1);
  }

  // Padrón oficial (data/pccList.ts) más cualquier código asignado que no esté en él.
  const officialByCode = new Map(PCC_LIST.map((p) => [p.code, p]));
  const allCodes = Array.from(
    new Set([...PCC_LIST.map((p) => p.code), ...(assignments || []).map((a) => a.pcc_code)])
  ).sort();

  const rows: SupervisorRow[] = allCodes.map((code) => {
    const official = officialByCode.get(code);
    const asg = assignmentByCode.get(code);

    const name =
      [asg?.first_name, asg?.last_name].filter(Boolean).join(' ').trim() ||
      [official?.firstName, official?.lastName].filter(Boolean).join(' ').trim() ||
      'Sin nombre';

    // Precedencia: lo que un supervisor fijo a mano manda sobre todo lo demas;
    // si no hay nada fijado, haber sometido casos gana al estado del padron.
    const status =
      asg?.status || (submitted.has(code) ? 'Activo' : official?.status || 'Revision');

    return {
      pccCode: code,
      name,
      email: (asg && emails.get(asg.user_id)) || null,
      status,
      registered: Boolean(asg),
      cases: caseCount.get(code) || 0,
      uces: uceCount.get(code) || 0,
    };
  });

  return (
    <main className="max-w-7xl mx-auto p-4 md:p-8 pt-12">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Panel de Supervisión</h1>
        <p className="text-muted-foreground">Listado de todos los Perfusionistas y sus estados.</p>
      </div>

      <SupervisorTable rows={rows} />
    </main>
  );
}
