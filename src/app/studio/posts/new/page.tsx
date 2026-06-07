import { requireAdmin } from "@/lib/auth";
import { Editor, Field } from "@/app/studio/Editor";
import { savePost } from "@/app/studio/actions";

export default async function NewPost() {
  await requireAdmin();
  return (
    <Editor action={savePost}>
      <Field label="cover image url" name="cover_url" placeholder="https://…" />
      <Field label="subtitle / dek" name="dek" />
      <label className="flex items-center gap-2 text-sm font-semibold text-ink-soft">
        <input type="checkbox" name="featured" /> feature on homepage
      </label>
      <Field
        label="schedule (optional)"
        name="publish_at"
        type="datetime-local"
      />
    </Editor>
  );
}
