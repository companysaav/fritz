"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useTransition,
} from "react";

import {
  createNote,
  deleteNote,
  setNotePinned,
  updateNote,
} from "./actions";
import type { Note, NoteSubject } from "./types";

/** Note labels reuse the bleed-through palette — ties the notebook to the
 *  same colour language as skills/system text in the prose. */
const LABELS: { key: string; hex: string }[] = [
  { key: "gold", hex: "#9a7300" },
  { key: "ember", hex: "#bf3a1d" },
  { key: "frost", hex: "#1f6f8b" },
  { key: "void", hex: "#6b3fa0" },
  { key: "jade", hex: "#2f7d4f" },
  { key: "rose", hex: "#b0306a" },
  { key: "ash", hex: "#6b5d4f" },
];
const hexFor = (key: string | null) =>
  LABELS.find((l) => l.key === key)?.hex ?? null;

function ago(iso: string): string {
  const s = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return "just now";
  const m = s / 60;
  if (m < 60) return `${Math.floor(m)}m ago`;
  const h = m / 60;
  if (h < 24) return `${Math.floor(h)}h ago`;
  const d = h / 24;
  if (d < 7) return `${Math.floor(d)}d ago`;
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

/** Textarea that grows with its content — for brain-dumps that run long. */
function AutoTextarea({
  value,
  onChange,
  placeholder,
  autoFocus,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);
  const grow = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "0px";
    el.style.height = `${Math.max(el.scrollHeight, 160)}px`;
  }, []);
  useEffect(() => {
    grow();
  }, [grow, value]);
  return (
    <textarea
      ref={ref}
      value={value}
      autoFocus={autoFocus}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full resize-none bg-transparent font-body text-[1.05rem] leading-relaxed text-ink outline-none placeholder:text-muted/70"
    />
  );
}

/** A colour-label picker (the bleed palette + "none"). */
function LabelPicker({
  value,
  onChange,
}: {
  value: string | null;
  onChange: (v: string | null) => void;
}) {
  return (
    <div className="flex items-center gap-1.5">
      <button
        type="button"
        title="no label"
        onClick={() => onChange(null)}
        className={`h-4 w-4 rounded-full border border-line transition ${
          value == null ? "ring-2 ring-ink ring-offset-1 ring-offset-paper" : ""
        }`}
        style={{ background: "var(--color-paper)" }}
      />
      {LABELS.map((l) => (
        <button
          key={l.key}
          type="button"
          title={l.key}
          onClick={() => onChange(l.key)}
          className={`h-4 w-4 rounded-full transition ${
            value === l.key
              ? "ring-2 ring-ink ring-offset-1 ring-offset-paper"
              : ""
          }`}
          style={{ background: l.hex, boxShadow: `0 0 8px ${l.hex}88` }}
        />
      ))}
    </div>
  );
}

type Draft = {
  id: string | null; // null = a brand-new note
  title: string;
  body: string;
  color: string | null;
  anchorText: string | null;
};

/** The add/edit form — one surface for both, full width so long notes breathe. */
function Composer({
  draft,
  busy,
  onSave,
  onCancel,
}: {
  draft: Draft;
  busy: boolean;
  onSave: (d: Draft) => void;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState(draft.title);
  const [body, setBody] = useState(draft.body);
  const [color, setColor] = useState<string | null>(draft.color);

  return (
    <div className="rounded-2xl border border-line bg-paper p-5 shadow-[4px_4px_0_0_var(--color-line)]">
      {draft.anchorText && (
        <div className="mb-3 border-l-2 border-mustard pl-3 font-body text-sm italic text-ink-soft">
          <span className="mr-1 text-xs not-italic font-bold uppercase tracking-wide text-muted">
            anchored to
          </span>
          “{draft.anchorText}”
        </div>
      )}
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="title (optional)…"
        className="mb-2 w-full bg-transparent font-sans text-lg font-bold text-ink outline-none placeholder:text-muted/70"
      />
      <AutoTextarea
        value={body}
        onChange={setBody}
        autoFocus
        placeholder="what's rattling around? dump it here — fritz won't tell a soul."
      />
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-3">
        <LabelPicker value={color} onChange={setColor} />
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={busy}
            className="rounded-full px-4 py-2 text-sm font-bold text-ink-soft transition-colors hover:bg-paper-2 disabled:opacity-50"
          >
            cancel
          </button>
          <button
            type="button"
            onClick={() =>
              onSave({ ...draft, title, body, color })
            }
            disabled={busy || (!body.trim() && !title.trim())}
            className="rounded-full bg-ink px-5 py-2 text-sm font-bold text-paper transition-colors hover:bg-ember disabled:opacity-50"
          >
            {busy ? "saving…" : draft.id ? "save" : "keep note"}
          </button>
        </div>
      </div>
    </div>
  );
}

function NoteCard({
  note,
  onEdit,
  onPin,
  onDelete,
  onJump,
}: {
  note: Note;
  onEdit: () => void;
  onPin: () => void;
  onDelete: () => void;
  onJump?: () => void;
}) {
  const spine = hexFor(note.color);
  return (
    <div
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-line bg-paper transition hover:-translate-y-0.5 hover:shadow-[5px_5px_0_0_var(--color-ink)]"
      style={
        spine ? { borderLeft: `4px solid ${spine}` } : undefined
      }
    >
      <button
        type="button"
        onClick={onEdit}
        className="flex-1 cursor-text px-4 pb-3 pt-3.5 text-left"
      >
        <div className="mb-1 flex items-start gap-2">
          <h3 className="min-w-0 flex-1 font-sans text-base font-bold leading-snug text-ink">
            {note.title || (
              <span className="text-muted">untitled note</span>
            )}
          </h3>
        </div>
        {note.anchor_text && (
          <p className="mb-1.5 line-clamp-1 border-l-2 border-mustard pl-2 font-body text-xs italic text-muted">
            “{note.anchor_text}”
          </p>
        )}
        {note.body && (
          <p className="line-clamp-5 whitespace-pre-wrap font-body text-[0.95rem] leading-relaxed text-ink-soft">
            {note.body}
          </p>
        )}
      </button>

      <div className="flex items-center justify-between gap-2 px-4 pb-3 pt-1 text-muted">
        <span className="text-xs">{ago(note.updated_at)}</span>
        <div className="flex items-center gap-1 opacity-60 transition group-hover:opacity-100">
          {note.anchor_text && onJump && (
            <button
              type="button"
              title="find this passage in the chapter"
              onClick={onJump}
              className="rounded-full px-2 py-1 text-xs font-bold text-ember hover:bg-paper-2"
            >
              jump ↑
            </button>
          )}
          <button
            type="button"
            title={note.pinned ? "unpin" : "pin to top"}
            onClick={onPin}
            className={`rounded-full px-2 py-1 text-sm hover:bg-paper-2 ${
              note.pinned ? "text-mustard" : ""
            }`}
          >
            {note.pinned ? "★" : "☆"}
          </button>
          <button
            type="button"
            title="delete"
            onClick={onDelete}
            className="rounded-full px-2 py-1 text-sm hover:bg-paper-2 hover:text-ember"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
}

export function NotesPanel({
  subjectType,
  subjectId,
  initialNotes,
  anchors = false,
}: {
  subjectType: NoteSubject;
  subjectId: string;
  initialNotes: Note[];
  /** chapter editor present → enable passage-anchored notes + jump-to. */
  anchors?: boolean;
}) {
  const [notes, setNotes] = useState<Note[]>(initialNotes);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [pending, startTransition] = useTransition();
  const panelRef = useRef<HTMLElement>(null);

  const sorted = [...notes].sort((a, b) => {
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
    return b.updated_at.localeCompare(a.updated_at);
  });

  const openNew = useCallback(
    (anchorText: string | null = null) => {
      setDraft({ id: null, title: "", body: "", color: null, anchorText });
      // bring the notebook into view when an anchor is captured from the editor
      requestAnimationFrame(() =>
        panelRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }),
      );
    },
    [],
  );

  // Capture "📌 note" clicks from the chapter editor toolbar (passage selected).
  useEffect(() => {
    if (!anchors) return;
    const onNew = (e: Event) => {
      const text = (e as CustomEvent<{ anchor?: string }>).detail?.anchor;
      openNew(text ?? null);
    };
    window.addEventListener("fritz:new-note", onNew as EventListener);
    return () =>
      window.removeEventListener("fritz:new-note", onNew as EventListener);
  }, [anchors, openNew]);

  const save = (d: Draft) => {
    startTransition(async () => {
      if (d.id) {
        const row = await updateNote({
          id: d.id,
          title: d.title,
          body: d.body,
          color: d.color,
        });
        setNotes((ns) => ns.map((n) => (n.id === row.id ? row : n)));
      } else {
        const row = await createNote({
          subjectType,
          subjectId,
          title: d.title,
          body: d.body,
          color: d.color,
          anchorText: d.anchorText,
        });
        setNotes((ns) => [row, ...ns]);
      }
      setDraft(null);
    });
  };

  const pin = (note: Note) =>
    startTransition(async () => {
      const row = await setNotePinned(note.id, !note.pinned);
      setNotes((ns) => ns.map((n) => (n.id === row.id ? row : n)));
    });

  const remove = (note: Note) => {
    if (!window.confirm("toss this note? fritz can't fish it back out.")) return;
    startTransition(async () => {
      await deleteNote(note.id);
      setNotes((ns) => ns.filter((n) => n.id !== note.id));
      setDraft((d) => (d?.id === note.id ? null : d));
    });
  };

  const jump = (note: Note) =>
    window.dispatchEvent(
      new CustomEvent("fritz:jump-note", { detail: { anchor: note.anchor_text } }),
    );

  return (
    <section ref={panelRef} className="mx-auto max-w-5xl px-5 pb-20">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 className="font-display text-2xl lowercase text-ink">
            the notebook
          </h2>
          <p className="text-sm text-muted">
            {anchors
              ? "private scratch space — select a passage and hit 📌 in the toolbar to pin a note to it."
              : "private scratch space — half-formed thoughts, only fritz reads these."}
          </p>
        </div>
        {!draft && (
          <button
            type="button"
            onClick={() => openNew()}
            className="rounded-full bg-ink px-4 py-2 text-sm font-bold text-paper transition-colors hover:bg-ember"
          >
            + note
          </button>
        )}
      </div>

      {draft && (
        <div className="mb-5">
          <Composer
            key={draft.id ?? "new"}
            draft={draft}
            busy={pending}
            onSave={save}
            onCancel={() => setDraft(null)}
          />
        </div>
      )}

      {sorted.length === 0 && !draft ? (
        <div className="rounded-2xl border border-dashed border-line bg-paper-2/40 px-5 py-10 text-center text-muted">
          the notebook&rsquo;s empty — fritz hasn&rsquo;t scribbled here yet.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {sorted
            .filter((n) => n.id !== draft?.id)
            .map((note) => (
              <NoteCard
                key={note.id}
                note={note}
                onEdit={() =>
                  setDraft({
                    id: note.id,
                    title: note.title ?? "",
                    body: note.body,
                    color: note.color,
                    anchorText: note.anchor_text,
                  })
                }
                onPin={() => pin(note)}
                onDelete={() => remove(note)}
                onJump={anchors ? () => jump(note) : undefined}
              />
            ))}
        </div>
      )}
    </section>
  );
}
