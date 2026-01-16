"use server";

import { clerkClient } from "@clerk/nextjs/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

/**
 * Checks if the current user has data from the "Old Development" system
 * and migrates it to their new "Production" ID.
 */
export async function migrateUserIfNeeded(userId: string, email: string) {
    try {
        // 1. Check Clerk Metadata first (Avoid DB calls if already migrated)
        const client = await clerkClient()
        const user = await client.users.getUser(userId);

        if (user.publicMetadata?.migrated) {
            return { migrated: true, status: "already_migrated" };
        }

        // 2. Check Migration Map in Supabase
        const { data: mapEntry, error } = await supabaseAdmin
            .from("migration_map")
            .select("*")
            .eq("email", email)
            .single();

        if (error || !mapEntry) {
            // User not in the old map = New User, no migration needed.
            // Mark as migrated so we don't check again.
            await client.users.updateUser(userId, {
                publicMetadata: { migrated: true }
            });
            return { migrated: false, status: "new_user" };
        }

        if (mapEntry.migrated) {
            // Database says migrated, but Clerk metadata didn't have it. Sync it.
            await client.users.updateUser(userId, {
                publicMetadata: { migrated: true }
            });
            return { migrated: true, status: "synced_metadata" };
        }

        // 3. PERFORM MIGRATION (The "Rescue" Operation)
        const oldId = mapEntry.old_user_id;
        console.log(`[MIGRATION] Migrating ${email} from ${oldId} to ${userId}`);

        // Update Tables (Execute sequentially to avoid race conditions)

        // A. Assign PCC
        await supabaseAdmin
            .from("pcc_assignment")
            .update({ user_id: userId })
            .eq("user_id", oldId);

        // B. Clinical Cases
        await supabaseAdmin
            .from("clinical_case")
            .update({ user_id: userId })
            .eq("user_id", oldId);

        // C. UCE Events
        await supabaseAdmin
            .from("uce_event")
            .update({ user_id: userId })
            .eq("user_id", oldId);

        // 4. Mark as Done
        // Update Map
        await supabaseAdmin
            .from("migration_map")
            .update({
                migrated: true,
                new_user_id: userId
            })
            .eq("email", email);

        // Update Clerk Metadata
        await client.users.updateUser(userId, {
            publicMetadata: { migrated: true }
        });

        return { migrated: true, status: "success" };

    } catch (err: any) {
        console.error("Migration Error:", err);
        return { error: err.message };
    }
}
