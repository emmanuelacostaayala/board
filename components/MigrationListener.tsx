"use client";

import { useUser } from "@clerk/nextjs";
import { useEffect, useRef } from "react";
import { migrateUserIfNeeded } from "@/lib/actions/migration.actions";
import { toast } from "sonner";

export default function MigrationListener() {
    const { user, isLoaded } = useUser();
    const hasRun = useRef(false);

    useEffect(() => {
        if (!isLoaded || !user || hasRun.current) return;

        // Check if we need to migrate based on metadata
        // (If user metadata says 'migrated: true', we skip completely)
        if (user.publicMetadata?.migrated) return;

        const email = user.primaryEmailAddress?.emailAddress;
        if (!email) return;

        const doMigration = async () => {
            hasRun.current = true; // Prevent double-fire
            console.log("Checking migration status...");

            try {
                const result = await migrateUserIfNeeded(user.id, email);

                if (result.status === "success" || result.status === "synced_metadata") {
                    // Optional: Show a toast only if actual work was done
                    if (result.status === "success") {
                        toast.success("¡Tus datos han sido recuperados exitosamente!");
                    }
                }
            } catch (error) {
                console.error("Migration check failed:", error);
            }
        };

        doMigration();

    }, [isLoaded, user]);

    return null; // Invisible component
}
