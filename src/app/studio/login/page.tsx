import type { Metadata } from "next";

import { Mascot } from "@/components/site/Mascot";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = { title: "Studio · sign in" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ denied?: string; error?: string }>;
}) {
  const { denied, error } = await searchParams;

  return (
    <div className="mx-auto max-w-md px-5 py-20">
      <div className="mb-6 flex items-center gap-4">
        <Mascot size={64} className="text-ink" />
        <div>
          <h1 className="font-display text-3xl lowercase text-ink">the studio</h1>
          <p className="text-sm text-muted">where the writing happens.</p>
        </div>
      </div>

      {denied && (
        <p className="mb-4 rounded-xl border border-ember/40 bg-ember/10 p-3 text-sm text-ember">
          That account isn&apos;t an admin. Writing is locked to fritz.
        </p>
      )}
      {error && (
        <p className="mb-4 rounded-xl border border-ember/40 bg-ember/10 p-3 text-sm text-ember">
          Something went wrong signing in. Try again.
        </p>
      )}

      <LoginForm />
    </div>
  );
}
