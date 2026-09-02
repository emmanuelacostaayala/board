import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export const revalidate = 0; // Disable caching to always show latest

// Mismos estados y estilos que ve el perfusionista en /my-journey
const STATUS_STYLES: Record<string, string> = {
  Activo: 'bg-green-100 text-green-800',
  Verificada: 'bg-green-100 text-green-800',
  Revision: 'bg-yellow-100 text-yellow-800',
  'Inactivo 1': 'bg-red-100 text-red-800',
  'Inactivo 2': 'bg-orange-100 text-orange-800',
  Emeritus: 'bg-purple-100 text-purple-800',
};

const STATUS_LABELS: Record<string, string> = {
  Revision: 'En Revisión',
};

export default async function SupervisorDashboardPage() {
  const [{ data: profiles }, { data: assignments }, { data: cases }, { data: uces }] =
    await Promise.all([
      supabaseAdmin.from('profiles').select('*').order('full_name', { ascending: true }),
      supabaseAdmin.from('pcc_assignment').select('*'),
      supabaseAdmin.from('clinical_case').select('user_id, submission_period'),
      supabaseAdmin.from('uce_event').select('user_id'),
    ]);

  const assignmentsMap = new Map((assignments || []).map((a) => [a.user_id, a]));

  // Casos totales y casos efectivamente sometidos (submission_period no nulo),
  // que es el criterio con el que /my-journey considera Activo a un perfusionista.
  const caseCount = new Map<string, number>();
  const submittedUsers = new Set<string>();
  for (const c of cases || []) {
    caseCount.set(c.user_id, (caseCount.get(c.user_id) || 0) + 1);
    if (c.submission_period != null) submittedUsers.add(c.user_id);
  }

  const uceCount = new Map<string, number>();
  for (const u of uces || []) {
    uceCount.set(u.user_id, (uceCount.get(u.user_id) || 0) + 1);
  }

  const merged = (profiles || []).map((p) => {
    const a = assignmentsMap.get(p.id);

    // Misma derivación que /my-journey: sometió casos -> Activo,
    // si no, el status guardado en pcc_assignment, y por defecto Revision.
    const status = submittedUsers.has(p.id) ? 'Activo' : (a?.status as string) || 'Revision';

    return {
      ...p,
      pcc_code: a?.pcc_code || 'N/A',
      status,
      cases: caseCount.get(p.id) || 0,
      uces: uceCount.get(p.id) || 0,
    };
  });

  const activos = merged.filter((u) => u.status === 'Activo' || u.status === 'Verificada').length;

  return (
    <main className="max-w-7xl mx-auto p-4 md:p-8 pt-12">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Panel de Supervisión</h1>
          <p className="text-muted-foreground">Listado de todos los Perfusionistas y sus estados.</p>
        </div>
        <div className="text-right text-sm text-gray-500">
          <p>
            <span className="font-bold text-gray-900 text-lg">{merged.length}</span> perfusionistas
          </p>
          <p>
            <span className="font-bold text-green-700">{activos}</span> activos
          </p>
        </div>
      </div>

      <div className="rounded-md border bg-white shadow">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 font-medium text-gray-500 uppercase tracking-wider">Nombre Completo</th>
              <th className="px-6 py-3 font-medium text-gray-500 uppercase tracking-wider">Correo</th>
              <th className="px-6 py-3 font-medium text-gray-500 uppercase tracking-wider">Código PCC</th>
              <th className="px-6 py-3 font-medium text-gray-500 uppercase tracking-wider">Estado</th>
              <th className="px-6 py-3 font-medium text-gray-500 uppercase tracking-wider text-center">Casos</th>
              <th className="px-6 py-3 font-medium text-gray-500 uppercase tracking-wider text-center">UCEs</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {merged.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 font-medium text-gray-900">{user.full_name || 'Sin nombre'}</td>
                <td className="px-6 py-4 text-gray-500">{user.email || 'Sin correo'}</td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {user.pcc_code}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      STATUS_STYLES[user.status] || 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {STATUS_LABELS[user.status] || user.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-center tabular-nums text-gray-900">{user.cases}</td>
                <td className="px-6 py-4 text-center tabular-nums text-gray-900">{user.uces}</td>
              </tr>
            ))}
            {merged.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                  No hay usuarios registrados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}
