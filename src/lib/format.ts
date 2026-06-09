export function formatDate(value: string | null | undefined): string {
  if (!value) return "";
  return new Date(value).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function readingTime(minutes: number | null | undefined): string {
  if (!minutes || minutes < 1) return "a quick read";
  return `${minutes} min read`;
}

/** Longer spans (whole novels): "48 min" or "3 hr 20 min". */
export function readingTimeLong(minutes: number | null | undefined): string {
  const m = Math.round(minutes ?? 0);
  if (m < 1) return "a quick read";
  if (m < 60) return `${m} min`;
  const h = Math.floor(m / 60);
  const rem = m % 60;
  return rem ? `${h} hr ${rem} min` : `${h} hr`;
}

/** Compact word total: "832 words" / "2.4k words" / "184k words". */
export function wordCount(words: number | null | undefined): string {
  const n = Math.round(words ?? 0);
  if (n < 1000) return `${n} word${n === 1 ? "" : "s"}`;
  if (n < 100_000) return `${(n / 1000).toFixed(1).replace(/\.0$/, "")}k words`;
  return `${Math.round(n / 1000)}k words`;
}
