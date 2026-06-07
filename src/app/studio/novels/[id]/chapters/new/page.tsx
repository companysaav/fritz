import { requireAdmin } from "@/lib/auth";
import { Editor, Field, TextArea } from "@/app/studio/Editor";
import { saveChapter } from "@/app/studio/actions";

export default async function NewChapter({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  return (
    <Editor action={saveChapter} novelId={id} dropcap>
      <Field label="chapter number" name="number" placeholder="1" />
      <Field label="hero image url" name="hero_url" placeholder="https://…" />
      <Field
        label="ambience (youtube id)"
        name="soundtrack_youtube"
        placeholder="jfKfPfyJRdk"
      />
      <TextArea label="author note (from fritz)" name="author_note" />
      <Field
        label="schedule (optional)"
        name="publish_at"
        type="datetime-local"
      />
    </Editor>
  );
}
