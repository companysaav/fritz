import "server-only";

import { createClient } from "@supabase/supabase-js";

import type { Database } from "./types";

/**
 * Service-role client — BYPASSES RLS. Server-only.
 * Use exclusively for trusted, admin-gated operations: authoring/publishing
 * content, caching AI (fritz narrator) output, subscriber confirm/unsubscribe.
 * NEVER import this into a Client Component or expose the service-role key.
 */
export function createAdminClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: { autoRefreshToken: false, persistSession: false },
    },
  );
}
