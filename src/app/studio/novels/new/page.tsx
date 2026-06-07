import { requireAdmin } from "@/lib/auth";
import { Editor, Field, TextArea } from "@/app/studio/Editor";
import { saveNovel } from "@/app/studio/actions";

const STATUSES = ["ongoing", "hiatus", "completed", "draft"];

export default async function NewNovel() {
  await requireAdmin();
  return (
    <Editor action={saveNovel} hideStatus hideBody>
      <Field label="cover image url" name="cover_url" placeholder="https://…" />
      <Field label="tagline" name="tagline" />
      <TextArea label="synopsis" name="synopsis" />
      <Field label="accent colour" name="accent_color" placeholder="#E4572E" />
      <label className="block">
        <span className="mb-1 block text-xs font-bold uppercase tracking-wide text-muted">
          story status
        </span>
        <select
          name="status"
          className="w-full rounded-xl border border-line bg-paper px-3 py-2 text-sm text-ink"
        >
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </label>
      <label className="flex items-center gap-2 text-sm font-semibold text-ink-soft">
        <input type="checkbox" name="published" /> publish (list publicly)
      </label>
      <label className="flex items-center gap-2 text-sm font-semibold text-ink-soft">
        <input type="checkbox" name="featured" /> feature on homepage
      </label>
    </Editor>
  );
}
