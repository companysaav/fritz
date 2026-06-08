import { type ReactNode } from "react";

import { RichEditor } from "./RichEditor";

export function Editor({
  action,
  id,
  novelId,
  title = "",
  slug = "",
  status = "draft",
  body = "",
  dropcap = false,
  hideStatus = false,
  hideBody = false,
  anchors = false,
  children,
}: {
  action: (formData: FormData) => void | Promise<void>;
  id?: string;
  novelId?: string;
  title?: string;
  slug?: string;
  status?: string;
  body?: string;
  dropcap?: boolean;
  hideStatus?: boolean;
  hideBody?: boolean;
  /** enable passage-anchored notes (the chapter editor) */
  anchors?: boolean;
  children?: ReactNode;
}) {
  return (
    <form
      action={action}
      className="mx-auto grid max-w-5xl gap-8 px-5 py-8 lg:grid-cols-[1fr_300px]"
    >
      {id && <input type="hidden" name="id" value={id} />}
      {novelId && <input type="hidden" name="novel_id" value={novelId} />}

      {/* main column */}
      <div className="min-w-0">
        <input
          name="title"
          defaultValue={title}
          placeholder="Title…"
          className="w-full bg-transparent font-display text-4xl lowercase text-ink outline-none placeholder:text-muted"
        />
        {!hideBody && (
          <RichEditor initialHTML={body} dropcap={dropcap} anchors={anchors} />
        )}
      </div>

      {/* sidebar */}
      <aside className="space-y-5">
        <button
          type="submit"
          className="w-full rounded-full bg-ink px-6 py-3 text-sm font-bold text-paper transition-colors hover:bg-ember"
        >
          save
        </button>

        {!hideStatus && (
          <label className="block">
            <span className="mb-1 block text-xs font-bold uppercase tracking-wide text-muted">
              status
            </span>
            <select
              name="status"
              defaultValue={status}
              className="w-full rounded-xl border border-line bg-paper px-3 py-2 text-sm text-ink"
            >
              <option value="draft">draft</option>
              <option value="published">published</option>
            </select>
          </label>
        )}

        <label className="block">
          <span className="mb-1 block text-xs font-bold uppercase tracking-wide text-muted">
            slug{" "}
            <span className="font-normal normal-case text-muted/70">
              (auto from title if blank)
            </span>
          </span>
          <input
            name="slug"
            defaultValue={slug}
            placeholder="my-title"
            className="w-full rounded-xl border border-line bg-paper px-3 py-2 text-sm text-ink"
          />
        </label>

        {children}
      </aside>
    </form>
  );
}

/** Shared labelled input for the editor sidebar. */
export function Field({
  label,
  name,
  defaultValue = "",
  placeholder = "",
  type = "text",
}: {
  label: string;
  name: string;
  defaultValue?: string;
  placeholder?: string;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-bold uppercase tracking-wide text-muted">
        {label}
      </span>
      <input
        name={name}
        type={type}
        defaultValue={defaultValue}
        placeholder={placeholder}
        className="w-full rounded-xl border border-line bg-paper px-3 py-2 text-sm text-ink"
      />
    </label>
  );
}

export function TextArea({
  label,
  name,
  defaultValue = "",
}: {
  label: string;
  name: string;
  defaultValue?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-bold uppercase tracking-wide text-muted">
        {label}
      </span>
      <textarea
        name={name}
        defaultValue={defaultValue}
        rows={3}
        className="w-full resize-y rounded-xl border border-line bg-paper px-3 py-2 text-sm text-ink"
      />
    </label>
  );
}
