// Quick connection + RLS smoke test.
// Run: node --env-file=.env.local scripts/smoke-test.mjs
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!url || !key) {
  console.error("Missing env vars. Did you fill in .env.local?");
  process.exit(1);
}

const supabase = createClient(url, key);

console.log("→ Connecting to", url);

// 1. Public read of seeded brand settings (proves migration ran + RLS read works)
const { data: settings, error: settingsErr } = await supabase
  .from("site_settings")
  .select("key, value");

if (settingsErr) {
  console.error("✗ site_settings query failed:", settingsErr.message);
  process.exit(1);
}
console.log(`✓ site_settings readable (${settings.length} rows):`,
  settings.map((s) => s.key).join(", "));
const brand = settings.find((s) => s.key === "brand");
if (brand) console.log("  brand.name =", brand.value.name, "| accent =", brand.value.palette.accent);

// 2. Published-content read returns empty (no rows yet) but no error
const { data: posts, error: postsErr } = await supabase.from("posts").select("id");
if (postsErr) {
  console.error("✗ posts query failed:", postsErr.message);
  process.exit(1);
}
console.log(`✓ posts readable as public (${posts.length} published rows)`);

// 3. RLS write guard: anon insert into posts must be REJECTED
const { error: writeErr } = await supabase
  .from("posts")
  .insert({ slug: "smoke-test", title: "should fail" });
if (writeErr) {
  console.log("✓ RLS blocks anonymous writes (expected):", writeErr.message);
} else {
  console.error("✗ SECURITY PROBLEM: anonymous insert SUCCEEDED — check RLS!");
  process.exit(1);
}

console.log("\nAll good — Supabase wiring is live. 🐈");
