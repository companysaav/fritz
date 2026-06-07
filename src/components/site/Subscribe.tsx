"use client";

import { useActionState } from "react";

import { subscribe, type SubscribeState } from "@/app/actions";

const initial: SubscribeState = { ok: false, message: "" };

export function Subscribe() {
  const [state, action, pending] = useActionState(subscribe, initial);

  return (
    <div className="rounded-2xl border border-line bg-ink p-8 text-paper">
      <h2 className="font-display text-2xl lowercase">
        get the next chapter the moment it drops.
      </h2>
      <p className="mt-1 text-sm text-paper/70">
        No spam, ever. Just stories, the moment they&apos;re ready.
      </p>
      <form action={action} className="mt-5 flex flex-col gap-3 sm:flex-row">
        <input
          type="email"
          name="email"
          required
          placeholder="you@example.com"
          className="flex-1 rounded-full border-2 border-paper/20 bg-paper/5 px-5 py-3 text-paper placeholder:text-paper/40 focus:border-mustard focus:outline-none"
        />
        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-mustard px-6 py-3 text-sm font-bold text-ink transition-all hover:-rotate-1 active:scale-95 disabled:opacity-60"
        >
          {pending ? "..." : "subscribe"}
        </button>
      </form>
      {state.message && (
        <p
          className={`mt-3 text-sm font-semibold ${
            state.ok ? "text-mustard" : "text-ember"
          }`}
        >
          {state.message}
        </p>
      )}
    </div>
  );
}
