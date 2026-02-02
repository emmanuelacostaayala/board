
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

  console.log('Fetching data (this may take a moment due to pagination)...');

  try {
    // 2. Fetch all assignments
    const assignments = await fetchAll(supabase, 'pcc_assignment', '*');
    
    // 3. Fetch all cases
    const cases = await fetchAll(supabase, 'clinical_case', 'user_id, pcc_code');
    
    // 4. Fetch all UCEs
    const uces = await fetchAll(supabase, 'uce_event', 'user_id, pcc_code');

    // 5. Aggregate
    const lines: string[] = [];
    lines.push('Fetching data complete.');
    lines.push(`Total Clinical Cases Fetched: ${cases.length}`);
    lines.push(`Total UCE Events Fetched: ${uces.length}`);
    lines.push(`\n=== PCC REPORT ===\n`);
    lines.push(`Total PCC Assignments: ${assignments.length}`);

    // Aggregate counts by PCC Code (Source of truth: Clinical Cases & UCEs + Assignment list for names)
    const statsByPcc = new Map();
    
    // Initialize with assignments to ensure we list registered PCCs even if 0 activity
    assignments.forEach((p: any) => {
        if (!p.pcc_code) return;
        statsByPcc.set(p.pcc_code, { 
            name: `${p.first_name} ${p.last_name}`, 
            cases: 0, 
            uces: 0,
            hasActivity: false
        });
    });

    // Count Cases
    cases.forEach((c: any) => {
        if (!c.pcc_code) return;
        
        if (!statsByPcc.has(c.pcc_code)) {
             // Case exists but PCC not in assignment list??
             statsByPcc.set(c.pcc_code, { 
                name: "Unknown (Not in Assignment List)", 
                cases: 0, 
                uces: 0,
                hasActivity: true
            });
        }
        
        const entry = statsByPcc.get(c.pcc_code);
        entry.cases += 1;
        entry.hasActivity = true;
    });

    // Count UCEs
    uces.forEach((u: any) => {
        if (!u.pcc_code) return;
        
        if (!statsByPcc.has(u.pcc_code)) {
             if (!statsByPcc.has(u.pcc_code)) {
                statsByPcc.set(u.pcc_code, { 
                    name: "Unknown (Not in Assignment List)", 
                    cases: 0, 
                    uces: 0,
                    hasActivity: true
                });
             }
        }
        
        const entry = statsByPcc.get(u.pcc_code);
        entry.uces += 1;
        entry.hasActivity = true;
    });

    // Convert to array and sort
    const reportData = Array.from(statsByPcc.entries()).map(([code, data]: any) => ({
        code,
        ...data
    }));

    // Sort by cases (desc) then UCEs (desc)
    reportData.sort((a, b) => {
        if (b.cases !== a.cases) return b.cases - a.cases;
        return b.uces - a.uces;
    });

    const activePccs = reportData.filter((r: any) => r.hasActivity);
    
    lines.push(`PCCs with uploaded Cases or UCEs: ${activePccs.length}`);
    
    if (activePccs.length > 0) {
        lines.push(`\nList of active PCCs (Sorted by Activity):`);
        activePccs.forEach((r: any) => {
            lines.push(`- ${r.name} (${r.code}): ${r.cases} Cases, ${r.uces} UCEs`);
        });
    } else {
        lines.push('No PCCs have uploaded cases or UCEs yet.');
    }

    // Additional check: Show top 5 users with MOST cases to verify huge numbers
    if (reportData.length > 0) {
        const topUser = reportData[0];
        console.log(`Top user: ${topUser.name} with ${topUser.cases} cases.`);
    }

    const output = lines.join('\n');
    fs.writeFileSync('report.txt', output);
    console.log('Report written to report.txt');

  } catch (err: any) {
      fs.writeFileSync('report.txt', `Global Error: ${err.message}`);
      console.error(err);
  }
}    

run().catch((e) => {
    console.error(e);
});
