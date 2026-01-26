"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const supabase_js_1 = require("@supabase/supabase-js");
async function run() {
    // 1. Load env vars manually
    const envPath = path_1.default.resolve(process.cwd(), '.env');
    const envContent = fs_1.default.readFileSync(envPath, 'utf-8');
    const env = {};
    envContent.split('\n').forEach(line => {
        const [key, val] = line.split('=');
        if (key && val) {
            env[key.trim()] = val.trim().replace(/^["']|["']$/g, '');
        }
    });
    const url = env['NEXT_PUBLIC_SUPABASE_URL'];
    const key = env['SUPABASE_SERVICE_ROLE_KEY'];
    if (!url || !key) {
        fs_1.default.writeFileSync('report.txt', 'Missing Supabase credentials in .env');
        return;
    }
    const supabase = (0, supabase_js_1.createClient)(url, key, { auth: { persistSession: false } });
    console.log('Fetching data...');
    // 2. Fetch assignments
    const { data: assignments, error: errAssign } = await supabase
        .from('pcc_assignment')
        .select('*');
    if (errAssign) {
        fs_1.default.writeFileSync('report.txt', `Error fetching assignments: ${errAssign.message}`);
        return;
    }
    // 3. Fetch cases
    const { data: cases, error: errCases } = await supabase
        .from('clinical_case')
        .select('user_id, pcc_code');
    if (errCases) {
        fs_1.default.writeFileSync('report.txt', `Error fetching cases: ${errCases.message}`);
        return;
    }
    // 4. Fetch UCEs
    const { data: uces, error: errUces } = await supabase
        .from('uce_event')
        .select('user_id, pcc_code');
    if (errUces) {
        fs_1.default.writeFileSync('report.txt', `Error fetching UCEs: ${errUces.message}`);
        return;
    }
    // 5. Aggregate
    const lines = [];
    lines.push('Fetching data...');
    lines.push(`\n=== PCC REPORT ===\n`);
    lines.push(`Total PCC Assignments: ${(assignments === null || assignments === void 0 ? void 0 : assignments.length) || 0}`);
    const reportData = assignments.map((pcc) => {
        const userCases = (cases === null || cases === void 0 ? void 0 : cases.filter((c) => c.user_id === pcc.user_id)) || [];
        const userUces = (uces === null || uces === void 0 ? void 0 : uces.filter((u) => u.user_id === pcc.user_id)) || [];
        return {
            name: `${pcc.first_name} ${pcc.last_name}`,
            code: pcc.pcc_code,
            casesCount: userCases.length,
            ucesCount: userUces.length,
            hasActivity: userCases.length > 0 || userUces.length > 0
        };
    });
    const activePccs = reportData.filter((r) => r.hasActivity);
    lines.push(`PCCs with uploaded Cases or UCEs: ${activePccs.length}`);
    if (activePccs.length > 0) {
        lines.push(`\nList of active PCCs:`);
        activePccs.forEach((r) => {
            lines.push(`- ${r.name} (${r.code}): ${r.casesCount} Cases, ${r.ucesCount} UCEs`);
        });
    }
    else {
        lines.push('No PCCs have uploaded cases or UCEs yet.');
    }
    lines.push('\nAll Assigned PCCs (Count only):');
    lines.push(`${assignments.length}`);
    const output = lines.join('\n');
    fs_1.default.writeFileSync('report.txt', output);
    console.log('Report written to report.txt');
}
run().catch((e) => {
    fs_1.default.writeFileSync('report.txt', `Global Error: ${e.message}`);
    console.error(e);
});
