import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export const revalidate = 0; // Disable caching to always show latest

export default async function SupervisorDashboardPage() {
  const [{ data: profiles }, { data: assignments }] = await Promise.all([
    supabaseAdmin.from('profiles').select('*').order('full_name', { ascending: true }),
    supabaseAdmin.from('pcc_assignment').select('*')
  ]);

  const profilesMap = new Map((profiles || []).map(p => [p.id, p]));
  const assignmentsMap = new Map((assignments || []).map(a => [a.user_id, a]));

  const merged = (profiles || []).map(p => {
    const a = assignmentsMap.get(p.id);
    return {
      ...p,
      pcc_code: a?.pcc_code || 'N/A'
    };
  });

  return (
    <main className="max-w-7xl mx-auto p-4 md:p-8 pt-12">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Panel de Supervisión</h1>
          <p className="text-muted-foreground">Listado de todos los Perfusionistas y sus estados.</p>
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
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    {user.pcc_status || 'Sin estado'}
                  </span>
                </td>
              </tr>
            ))}
            {merged.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
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
