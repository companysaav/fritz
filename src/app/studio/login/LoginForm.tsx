"use client";

import { useState } from "react";

import { createClient } from "@/lib/supabase/client";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "signing" | "error">("idle");
  const [message, setMessage] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("signing");
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      setStatus("error");
      setMessage(error.message);
      return;
    }
    // Full navigation so the server picks up the new session cookie.
    window.location.href = "/studio";
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-3">
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@example.com"
        className="rounded-full border-2 border-line bg-paper px-5 py-3 text-ink placeholder:text-muted focus:border-ink focus:outline-none"
      />
      <input
        type="password"
        required
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="password"
        className="rounded-full border-2 border-line bg-paper px-5 py-3 text-ink placeholder:text-muted focus:border-ink focus:outline-none"
      />
      <button
        type="submit"
        disabled={status === "signing"}
        className="rounded-full bg-ink px-6 py-3 text-sm font-bold text-paper transition-colors hover:bg-ember disabled:opacity-60"
      >
        {status === "signing" ? "signing in…" : "sign in"}
      </button>
      {status === "error" && (
        <p className="text-sm font-semibold text-ember">{message}</p>
      )}
    </form>
  );
}
