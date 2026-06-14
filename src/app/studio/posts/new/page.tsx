import { requireAdmin } from "@/lib/auth";
import { Editor, Field } from "@/app/studio/Editor";
import { ImageDropzone } from "@/app/studio/ImageDropzone";
import { savePost } from "@/app/studio/actions";

export default async function NewPost() {
  await requireAdmin();
  return (
    <Editor action={savePost}>
      <ImageDropzone label="cover image" name="cover_url" kind="post-cover" />
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
