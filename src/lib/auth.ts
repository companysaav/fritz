import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

/** Current user + whether their email is on the admins allowlist. */
export async function getRole() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email) return { user: null, isAdmin: false };

  // RLS lets a signed-in user read only their own admins row.
  const { data } = await supabase
    .from("admins")
    .select("email")
    .eq("email", user.email)
    .maybeSingle();

  return { user, isAdmin: !!data };
}

/**
 * Gate for every Studio page AND server action. Server Actions are POST
 * endpoints reachable independently of the layout, so each write re-checks.
 */
export async function requireAdmin() {
  const { user, isAdmin } = await getRole();
  if (!user) redirect("/studio/login");
  if (!isAdmin) redirect("/studio/login?denied=1");
  return user;
}
