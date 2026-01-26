
import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

async function run() {
    // 1. Load env vars manually
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
        fs.writeFileSync('report.txt', 'Missing Supabase credentials in .env');
        return;
    }

    const supabase = createClient(url, key, { auth: { persistSession: false } });

    console.log('Fetching data...');

    // 2. Fetch assignments
    const { data: assignments, error: errAssign } = await supabase
        .from('pcc_assignment')
        .select('*');

    if (errAssign) {
        fs.writeFileSync('report.txt', `Error fetching assignments: ${errAssign.message}`);
        return;
    }

    // 3. Fetch cases
    const { data: cases, error: errCases } = await supabase
        .from('clinical_case')
        .select('user_id, pcc_code');

    if (errCases) {
        fs.writeFileSync('report.txt', `Error fetching cases: ${errCases.message}`);
        return;
    }

    // 4. Fetch UCEs
    const { data: uces, error: errUces } = await supabase
        .from('uce_event')
        .select('user_id, pcc_code');

    if (errUces) {
        fs.writeFileSync('report.txt', `Error fetching UCEs: ${errUces.message}`);
        return;
    }

    // 5. Aggregate
    const lines: string[] = [];
    lines.push('Fetching data...');
    lines.push(`\n=== PCC REPORT ===\n`);
    lines.push(`Total PCC Assignments: ${assignments?.length || 0}`);

    const reportData = assignments.map((pcc: any) => {
        const userCases = cases?.filter((c: any) => c.user_id === pcc.user_id) || [];
        const userUces = uces?.filter((u: any) => u.user_id === pcc.user_id) || [];
        return {
            name: `${pcc.first_name} ${pcc.last_name}`,
            code: pcc.pcc_code,
            casesCount: userCases.length,
            ucesCount: userUces.length,
            hasActivity: userCases.length > 0 || userUces.length > 0
        };
    });

    const activePccs = reportData.filter((r: any) => r.hasActivity);

    lines.push(`PCCs with uploaded Cases or UCEs: ${activePccs.length}`);

    if (activePccs.length > 0) {
        lines.push(`\nList of active PCCs:`);
        activePccs.forEach((r: any) => {
            lines.push(`- ${r.name} (${r.code}): ${r.casesCount} Cases, ${r.ucesCount} UCEs`);
        });
    } else {
        lines.push('No PCCs have uploaded cases or UCEs yet.');
    }

    lines.push('\nAll Assigned PCCs (Count only):');
    lines.push(`${assignments.length}`);

    const output = lines.join('\n');
    fs.writeFileSync('report.txt', output);
    console.log('Report written to report.txt');
}

run().catch((e) => {
    fs.writeFileSync('report.txt', `Global Error: ${e.message}`);
    console.error(e);
});
