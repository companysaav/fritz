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
