
import { createClient } from "@supabase/supabase-js";

// Bun automatically loads .env
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log("--- Supabase Verification Script ---");
console.log("URL:", supabaseUrl);
console.log("Service Role Key Exists:", !!serviceRoleKey);
console.log("Service Role Key Preview:", serviceRoleKey?.substring(0, 10) + "...");

if (!supabaseUrl || !serviceRoleKey) {
    console.error("❌ MISSING KEYS in .env");
    process.exit(1);
}

const admin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
});

async function main() {
    console.log("Attempting to fetch data from 'pcc_assignment'...");
    const { data, error } = await admin.from("pcc_assignment").select("count").limit(1);

    if (error) {
        console.error("❌ FAILED. Database Error:", error.message);
        console.error("Details:", error);
    } else {
        console.log("✅ SUCCESS! Connection established.");
        console.log("Data sample:", data);
    }
}

main();
