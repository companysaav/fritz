// Add an admin: creates (or updates the password of) an auth user, and adds
// their email to the admins allowlist.
// Run: node --env-file=.env.local scripts/create-admin.mjs you@example.com 'your-password'
//
// You can also do this by hand: Supabase Dashboard → Authentication → Add user,
// then insert the email into the `admins` table (Table editor).
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
const email = (process.argv[2] || "").toLowerCase();
const password = process.argv[3];

if (!url || !key) {
  console.error("Missing SUPABASE_SERVICE_ROLE_KEY / URL in .env.local");
  process.exit(1);
}
if (!email || !password) {
  console.error("Usage: node --env-file=.env.local scripts/create-admin.mjs <email> <password>");
  process.exit(1);
}

const db = createClient(url, key, {
  auth: { autoRefreshToken: false, persistSession: false },
});

let userId;
const { data: created, error } = await db.auth.admin.createUser({
  email,
  password,
  email_confirm: true,
});

if (error) {
  const { data: list } = await db.auth.admin.listUsers();
  const found = list.users.find((u) => u.email?.toLowerCase() === email);
  if (!found) {
    console.error("Could not create or find user:", error.message);
    process.exit(1);
  }
  userId = found.id;
  await db.auth.admin.updateUserById(userId, { password });
  console.log("→ user existed; password updated:", email);
} else {
  userId = created.user.id;
  console.log("→ created user:", email);
}

const { error: aErr } = await db
  .from("admins")
  .upsert({ email, note: "added via script" });
if (aErr) {
  console.error("Failed to add to admins allowlist:", aErr.message);
  console.error("(Did you run migration 0002_admins.sql yet?)");
  process.exit(1);
}

console.log(`✓ ${email} can now sign in at /studio/login. 🐈`);
