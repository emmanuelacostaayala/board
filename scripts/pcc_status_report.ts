
import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

// Helper to fetch all rows handling pagination
async function fetchAll(supabase: any, table: string, select = '*') {
    let allData: any[] = [];
    let page = 0;
    const pageSize = 1000;

    while (true) {
        const { data, error } = await supabase
            .from(table)
            .select(select)
            .range(page * pageSize, (page + 1) * pageSize - 1);

        if (error) throw error;
        if (!data || data.length === 0) break;

        allData = allData.concat(data);
        if (data.length < pageSize) break;
        page++;
    }
    return allData;
}

async function run() {
    const envPath = path.resolve(process.cwd(), '.env');
    const envContent = fs.readFileSync(envPath, 'utf-8');
    const env: Record<string, string> = {};

    envContent.split('\n').forEach(line => {
        const [key, val] = line.split('=');
        if (key && val) {
            env[key.trim()] = val.trim().replace(/^["']|["']$/g, '');
        }
    });

    const url = env['NEXT_PUBLIC_SUPABASE_URL'];
    const key = env['SUPABASE_SERVICE_ROLE_KEY'];

    if (!url || !key) {
        console.error('Missing Supabase credentials in .env');
        return;
    }

    const supabase = createClient(url, key, { auth: { persistSession: false } });

    console.log('Fetching data...');

    try {
        const assignments = await fetchAll(supabase, 'pcc_assignment', '*');
        const cases = await fetchAll(supabase, 'clinical_case', 'user_id, pcc_code, submission_period'); // Need submission_period

        // Map user_id/pcc -> info
        const pccMap = new Map();
        assignments.forEach((a: any) => {
            // Normalizar PCC codes si es necesario
            pccMap.set(a.user_id, {
                name: `${a.first_name} ${a.last_name}`,
                code: a.pcc_code,
                activeCount: 0,
                submittedCount: 0,
                hasSubmission2025: false
            });
            // Also map by code in case clinical_case has code but mismatched user_id (less likely but safe)
            if (a.pcc_code) pccMap.set(a.pcc_code, pccMap.get(a.user_id));
        });

        // Process Cases
        cases.forEach((c: any) => {
            let entry = pccMap.get(c.user_id);
            if (!entry && c.pcc_code) entry = pccMap.get(c.pcc_code);

            if (!entry) {
                // Case from unknown user/pcc
                return;
            }

            if (c.submission_period) {
                entry.submittedCount++;
                entry.hasSubmission2025 = true; // Assumes any submission is what we are looking for
            } else {
                entry.activeCount++;
            }
        });

        const uniquePccs = Array.from(new Set(assignments.map((a: any) => a.user_id)))
            .map((uid: any) => pccMap.get(uid))
            .filter(entry => entry !== undefined); // remove undefineds

        const readyToSubmit = uniquePccs.filter((p: any) => p.activeCount >= 40 && !p.hasSubmission2025).sort((a, b) => b.activeCount - a.activeCount);
        const submitted = uniquePccs.filter((p: any) => p.hasSubmission2025).sort((a, b) => b.submittedCount - a.submittedCount);
        // In progress: Not ready AND not submitted yet.
        const inProgress = uniquePccs.filter((p: any) => p.activeCount < 40 && p.activeCount > 0 && !p.hasSubmission2025).sort((a, b) => b.activeCount - a.activeCount);
        const noActivity = uniquePccs.filter((p: any) => p.activeCount === 0 && !p.hasSubmission2025);

        const lines: string[] = [];
        lines.push(`\n=== 🚀 REPORTE DE ESTADO DE PCCs ===\n`);

        lines.push(`\n✅ YA SOMETIERON (${submitted.length})`);
        lines.push(`(Usuarios que tienen registros con submission_period marcado)`);
        submitted.forEach((p: any) => lines.push(`- ${p.name} (${p.code}): ${p.submittedCount} casos sometidos (Active pending: ${p.activeCount})`));

        lines.push(`\n⚠️ LISTOS PARA SOMETER (>= 40 Casos Activos) (${readyToSubmit.length})`);
        lines.push(`(Deben presionar el botón "Someter Casos")`);
        readyToSubmit.forEach((p: any) => lines.push(`- ${p.name} (${p.code}): ${p.activeCount} casos`));

        lines.push(`\n⏳ EN PROGRESO (< 40 Casos) (${inProgress.length})`);
        inProgress.forEach((p: any) => lines.push(`- ${p.name} (${p.code}): ${p.activeCount} casos`));

        fs.writeFileSync('status_report_utf8.txt', lines.join('\n'), 'utf-8');
        console.log('Report written to status_report_utf8.txt');

    } catch (err: any) {
        console.error(err);
    }
}

run().catch((e) => {
    console.error(e);
});
