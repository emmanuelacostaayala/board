
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

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
        console.log('Missing Supabase credentials');
        return;
    }

    const supabase = createClient(url, key);

    console.log('Checking clinical_case columns...');
    const { data, error } = await supabase.from('clinical_case').select('*').limit(1);

    if (error) {
        console.error('Error fetching:', error);
    } else if (data && data.length > 0) {
        console.log('Columns:', Object.keys(data[0]));
    } else {
        console.log('Table seems empty, cannot infer columns, but connection works.');
    }

    // Try to add column if possible (hacky attempt if no SQL access)
    // Usually we cannot via JS client standard methods unless we use a stored procedure or just notify user.
    // We will just report columns for now.
}

run();
