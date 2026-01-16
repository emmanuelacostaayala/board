
import { NextResponse } from 'next/server';
import { clerkClient } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function GET() {
    try {
        // 1. Fetch Users from Clerk (Dev Mode)
        // Note: Default limit is 10, we bump it to 500. If you have more, we need pagination.
        const client = await clerkClient()
        const response = await client.users.getUserList({ limit: 500 });
        const users = response.data;

        let count = 0;
        const errors = [];

        // 2. Insert into Supabase
        for (const user of users) {
            const email = user.emailAddresses.find(e => e.id === user.primaryEmailAddressId)?.emailAddress
                || user.emailAddresses[0]?.emailAddress;

            if (!email) {
                errors.push(`User ${user.id} has no email`);
                continue;
            }

            const { error } = await supabaseAdmin
                .from('migration_map')
                .upsert({
                    email: email,
                    old_user_id: user.id
                }, { onConflict: 'email' });

            if (error) {
                console.error(`Error saving ${email}:`, error);
                errors.push(`Error saving ${email}: ${error.message}`);
            } else {
                count++;
            }
        }

        return NextResponse.json({
            success: true,
            migrated_count: count,
            total_found: users.length,
            errors: errors
        });

    } catch (error: any) {
        console.error("Migration Script Error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
