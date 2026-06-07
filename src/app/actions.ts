"use server";

import { createAdminClient } from "@/lib/supabase/admin";

export type SubscribeState = { ok: boolean; message: string };

export async function subscribe(
  _prev: SubscribeState,
  formData: FormData,
): Promise<SubscribeState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!email || !email.includes("@")) {
    return { ok: false, message: "that doesn't look like an email." };
  }

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("subscribers")
    .insert({ email, source: "homepage" });

  if (error) {
    if (error.code === "23505") {
      return { ok: true, message: "you're already on the list. fritz remembers." };
    }
    return { ok: false, message: "something went sideways. try again?" };
  }
  return { ok: true, message: "you're in. the next chapter finds you first." };
}
