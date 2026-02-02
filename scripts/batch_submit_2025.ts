
import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import nodemailer from 'nodemailer';

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
    const emailUser = env['EMAIL_USER'];
    const emailPass = env['EMAIL_PASS'];

    if (!url || !key || !emailUser || !emailPass) {
        console.error('Missing credentials in .env');
        return;
    }

    const supabase = createClient(url, key, { auth: { persistSession: false } });
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: { user: emailUser, pass: emailPass },
    });

    console.log('Fetching data...');

    try {
        const assignments = await fetchAll(supabase, 'pcc_assignment', '*');
        const cases = await fetchAll(supabase, 'clinical_case', '*');

        // Group active cases by User
        const casesByUser = new Map();
        cases.forEach((c: any) => {
            if (c.submission_period) return; // Skip already submitted
            const uid = c.user_id;
            if (!casesByUser.has(uid)) casesByUser.set(uid, []);
            casesByUser.get(uid).push(c);
        });

        const readyUsers = [];

        // Identify ready users
        for (const [userId, userCases] of casesByUser.entries()) {
            if (userCases.length >= 40) {
                // Find PCC info
                const assign = assignments.find((a: any) => a.user_id === userId);
                const pccCode = userCases[0]?.pcc_code || assign?.pcc_code || 'N/A';
                const name = assign ? `${assign.first_name} ${assign.last_name}` : 'Usuario Desconocido';

                readyUsers.push({
                    userId,
                    name,
                    pccCode,
                    cases: userCases
                });
            }
        }

        console.log(`Found ${readyUsers.length} ready users to submit.`);

        // Process each
        for (const user of readyUsers) {
            console.log(`Processing ${user.name} (${user.pccCode}) - ${user.cases.length} cases...`);

            // 1. Generate Email
            const casesRows = user.cases.map((c: any, i: number) => `
          <tr>
            <td style="padding: 5px; border: 1px solid #ccc;">${i + 1}</td>
            <td style="padding: 5px; border: 1px solid #ccc;">${c.case_date}</td>
            <td style="padding: 5px; border: 1px solid #ccc;">${c.surgeon_name}</td>
            <td style="padding: 5px; border: 1px solid #ccc;">${c.institution}</td>
            <td style="padding: 5px; border: 1px solid #ccc;">${c.surgery_type}</td>
            <td style="padding: 5px; border: 1px solid #ccc;">${c.case_role || '-'}</td>
          </tr>
        `).join('');

            const emailHtml = `
          <div style="font-family: Arial, sans-serif;">
            <h2 style="color: #2563eb;">Submission Automática de Casos Clínicos (2025)</h2>
            <p><strong>PCC:</strong> ${user.pccCode}</p>
            <p><strong>Nombre:</strong> ${user.name}</p>
            <p><strong>Total Casos:</strong> ${user.cases.length}</p>
            <p><em>Este envío fue generado automáticamente por administración para limpiar el expediente 2025.</em></p>
            
            <h3>Listado de Casos:</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <thead style="background-color: #f3f4f6;">
                <tr>
                  <th style="padding: 5px; border: 1px solid #ccc;">#</th>
                  <th style="padding: 5px; border: 1px solid #ccc;">Fecha</th>
                  <th style="padding: 5px; border: 1px solid #ccc;">Cirujano</th>
                  <th style="padding: 5px; border: 1px solid #ccc;">Institución</th>
                  <th style="padding: 5px; border: 1px solid #ccc;">Cirugía</th>
                  <th style="padding: 5px; border: 1px solid #ccc;">Rol</th>
                </tr>
              </thead>
              <tbody>
                ${casesRows}
              </tbody>
            </table>
          </div>
        `;

            try {
                // 2. Send Email
                await transporter.sendMail({
                    from: emailUser,
                    to: 'info@boardlatinoamericanodeperfusion.com',
                    cc: 'director@boardlatinoamericanodeperfusion.com',
                    subject: `Entrega Automática 2025 - PCC ${user.pccCode} - ${user.name}`,
                    html: emailHtml,
                });

                // 3. Update DB
                const ids = user.cases.map((c: any) => c.id);
                // Supabase 'in' filter is limited in URL length often, better batch or try all if < ~1000 IDs total (for one user it's fine)
                const { error: updateError } = await supabase
                    .from("clinical_case")
                    .update({ submission_period: '2025' })
                    .in('id', ids);

                if (updateError) {
                    console.error(`Error updating DB for ${user.name}:`, updateError);
                } else {
                    console.log(`> Success: ${user.name}`);
                }

            } catch (processErr) {
                console.error(`Failed to process ${user.name}:`, processErr);
            }

            // Small delay to be nice to SMTP
            await new Promise(r => setTimeout(r, 500));
        }

        console.log('Batch processing complete.');

    } catch (err: any) {
        console.error(err);
    }
}

run().catch((e) => {
    console.error(e);
});
