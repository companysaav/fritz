"use client";

import { useEffect, useState } from "react";

type CopyState = "idle" | "copying" | "copied" | "error";

type ExportActionsProps = {
  href: string;
  compact?: boolean;
};

async function copyToClipboard(text: string) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }

  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.readOnly = true;
  textarea.style.position = "fixed";
  textarea.style.left = "-9999px";
  textarea.style.top = "0";
  document.body.appendChild(textarea);
  textarea.select();

  try {
    if (!document.execCommand("copy")) {
      throw new Error("Copy command failed");
    }
  } finally {
    document.body.removeChild(textarea);
  }
}

export function ExportActions({ href, compact = false }: ExportActionsProps) {
  const [copyState, setCopyState] = useState<CopyState>("idle");

  useEffect(() => {
    if (copyState !== "copied" && copyState !== "error") return;
    const timeout = window.setTimeout(() => setCopyState("idle"), 1800);
    return () => window.clearTimeout(timeout);
  }, [copyState]);

  async function handleCopy() {
    setCopyState("copying");
    try {
      const response = await fetch(href, { cache: "no-store" });
      if (!response.ok || response.redirected) {
        throw new Error("Export request failed");
      }

      const text = await response.text();
      await copyToClipboard(text);
      setCopyState("copied");
    } catch {
      setCopyState("error");
    }
  }

  const copyLabel =
    copyState === "copying"
      ? "copying"
      : copyState === "copied"
        ? "copied"
        : copyState === "error"
          ? "copy failed"
          : compact
            ? "copy"
            : "copy text";

  if (compact) {
    return (
      <span className="inline-flex items-center gap-3">
        <a
          href={href}
          download
          className="text-xs font-bold text-muted hover:text-ember"
        >
          txt
        </a>
        <button
          type="button"
          onClick={handleCopy}
          disabled={copyState === "copying"}
          className="text-xs font-bold text-muted hover:text-ember disabled:cursor-wait disabled:text-muted/60"
        >
          {copyLabel}
        </button>
      </span>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-2">
      <a
        href={href}
        download
        className="rounded-full border border-line px-4 py-2 text-center text-sm font-bold text-ink-soft hover:border-ember hover:text-ember"
      >
        download .txt
      </a>
      <button
        type="button"
        onClick={handleCopy}
        disabled={copyState === "copying"}
        className="rounded-full border border-line px-4 py-2 text-center text-sm font-bold text-ink-soft hover:border-ember hover:text-ember disabled:cursor-wait disabled:text-muted/70"
      >
        {copyLabel}
      </button>
    </div>
  );
}
