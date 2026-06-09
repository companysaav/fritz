"use client";

import { Color, TextStyle } from "@tiptap/extension-text-style";
import { Image } from "@tiptap/extension-image";
import { Youtube } from "@tiptap/extension-youtube";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useEffect, useRef, useState } from "react";

import { createClient } from "@/lib/supabase/client";
import { stripInlineFonts } from "@/lib/content/sanitizeHtml";
import { FritzInline } from "./FritzInline";
import { FontTag, FONTS } from "./FontTag";
import { EffectTag, EFFECTS } from "./EffectTag";

/** Bleed-through palette — applied as inline colour to the selection. */
const COLORS: { key: string; hex: string }[] = [
  { key: "gold", hex: "#9a7300" },
  { key: "ember", hex: "#bf3a1d" },
  { key: "frost", hex: "#1f6f8b" },
  { key: "void", hex: "#6b3fa0" },
  { key: "jade", hex: "#2f7d4f" },
  { key: "rose", hex: "#b0306a" },
  { key: "ash", hex: "#6b5d4f" },
];

export function RichEditor({
  initialHTML = "",
  dropcap = false,
  anchors = false,
}: {
  initialHTML?: string;
  dropcap?: boolean;
  /** wire the chapter editor to the notebook: pin notes to a passage + jump to one. */
  anchors?: boolean;
}) {
  const [html, setHtml] = useState(initialHTML);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    immediatelyRender: false, // required for Next SSR
    extensions: [
      StarterKit,
      TextStyle,
      Color,
      Image,
      Youtube.configure({ width: 640, height: 360, nocookie: true }),
      FritzInline,
      FontTag,
      EffectTag,
    ],
    content: initialHTML || "<p></p>",
    editorProps: {
      attributes: {
        class: `prose-fritz ${dropcap ? "dropcap" : ""} min-h-[55vh] rounded-2xl border border-line bg-paper p-6 outline-none`,
      },
      // Paste hygiene: strip the font-family / font-size that Docs/Word/web
      // drag in, so pasted text inherits the one prose face instead of a
      // patchwork. Colour (bleed-through) survives.
      transformPastedHTML: (html) => stripInlineFonts(html),
    },
    onUpdate: ({ editor }) => setHtml(editor.getHTML()),
  });

  // Notebook ↔ editor bridge: jump to (and flash-select) a note's anchored
  // passage when the reader clicks "jump ↑" on an anchored note.
  useEffect(() => {
    if (!editor || !anchors) return;
    const onJump = (e: Event) => {
      const raw = (e as CustomEvent<{ anchor?: string }>).detail?.anchor;
      const needle = (raw ?? "").trim().slice(0, 80);
      if (!needle) return;
      let from = -1;
      editor.state.doc.descendants((node, pos) => {
        if (from >= 0) return false;
        if (node.isText && node.text) {
          const idx = node.text.indexOf(needle);
          if (idx >= 0) from = pos + idx;
        }
        return true;
      });
      if (from < 0) {
        window.alert("fritz can't find that passage — it may have changed.");
        return;
      }
      editor
        .chain()
        .focus()
        .setTextSelection({ from, to: from + needle.length })
        .scrollIntoView()
        .run();
    };
    window.addEventListener("fritz:jump-note", onJump as EventListener);
    return () =>
      window.removeEventListener("fritz:jump-note", onJump as EventListener);
  }, [editor, anchors]);

  if (!editor) {
    return (
      <div className="mt-6 min-h-[55vh] rounded-2xl border border-line bg-paper p-6 text-muted">
        loading editor…
      </div>
    );
  }

  async function onFile(file: File) {
    setUploading(true);
    try {
      const supabase = createClient();
      const safe = file.name.replace(/[^a-zA-Z0-9.\-_]/g, "_");
      const path = `uploads/${Date.now()}-${safe}`;
      const { error } = await supabase.storage
        .from("media")
        .upload(path, file, { cacheControl: "3600", upsert: false });
      if (error) {
        alert(`Upload failed: ${error.message}`);
        return;
      }
      const { data } = supabase.storage.from("media").getPublicUrl(path);
      editor!.chain().focus().setImage({ src: data.publicUrl, alt: file.name }).run();
    } finally {
      setUploading(false);
    }
  }

  const btn = (active: boolean) =>
    `rounded-lg px-2.5 py-1 text-sm font-bold transition-colors ${
      active ? "bg-ink text-paper" : "text-ink-soft hover:bg-paper-2"
    }`;

  return (
    <div className="mt-6">
      <input type="hidden" name="body_html" value={html} />

      {/* toolbar */}
      <div className="sticky top-16 z-10 mb-3 flex flex-wrap items-center gap-1 rounded-xl border border-line bg-paper/95 p-2 backdrop-blur">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={btn(editor.isActive("bold"))}
        >
          B
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`${btn(editor.isActive("italic"))} italic`}
        >
          i
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={btn(editor.isActive("heading", { level: 2 }))}
        >
          H2
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={btn(editor.isActive("heading", { level: 3 }))}
        >
          H3
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={btn(editor.isActive("blockquote"))}
        >
          ❝
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={btn(editor.isActive("bulletList"))}
        >
          • list
        </button>
        <button
          type="button"
          title="scene / page break (or type --- )"
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          className={btn(false)}
        >
          ⁂ break
        </button>

        <span className="mx-1 h-5 w-px bg-line" />

        {/* the highlighter — select text, click a colour */}
        {COLORS.map((c) => (
          <button
            key={c.key}
            type="button"
            title={`bleed-through: ${c.key} (select text first)`}
            onClick={() => editor.chain().focus().setColor(c.hex).run()}
            className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-bold hover:bg-paper-2"
            style={{ color: c.hex }}
          >
            <span
              className="inline-block h-3.5 w-3.5 rounded-full"
              style={{ backgroundColor: c.hex, boxShadow: `0 0 8px ${c.hex}` }}
            />
            {c.key}
          </button>
        ))}
        <button
          type="button"
          title="remove colour"
          onClick={() => editor.chain().focus().unsetColor().run()}
          className={btn(false)}
        >
          ⌫ colour
        </button>

        <span className="mx-1 h-5 w-px bg-line" />

        {/* the font picker — select text, click a face (or type {key}…{/key}) */}
        {FONTS.map((f) => (
          <button
            key={f.key}
            type="button"
            title={`font: ${f.label} (select text first)`}
            onClick={() =>
              editor.chain().focus().setMark("fontTag", { font: f.key }).run()
            }
            className={`ff-${f.key} rounded-lg px-2 py-1 text-sm font-bold text-ink-soft hover:bg-paper-2 ${
              editor.isActive("fontTag", { font: f.key }) ? "bg-ink !text-paper" : ""
            }`}
          >
            {f.label}
          </button>
        ))}
        <button
          type="button"
          title="remove font"
          onClick={() => editor.chain().focus().unsetMark("fontTag").run()}
          className={btn(false)}
        >
          ⌫ font
        </button>

        <span className="mx-1 h-5 w-px bg-line" />

        {/* word effects — select text, click (or type {bounce}…{/bounce}) */}
        {EFFECTS.map((fx) => (
          <button
            key={fx.key}
            type="button"
            title={`effect: ${fx.label} (select text first)`}
            onClick={() =>
              editor.chain().focus().setMark("effectTag", { fx: fx.key }).run()
            }
            className={`${btn(editor.isActive("effectTag", { fx: fx.key }))} fx-${fx.key}`}
          >
            {fx.label}
          </button>
        ))}
        <button
          type="button"
          title="remove effect"
          onClick={() => editor.chain().focus().unsetMark("effectTag").run()}
          className={btn(false)}
        >
          ⌫ fx
        </button>

        <span className="mx-1 h-5 w-px bg-line" />

        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className={btn(false)}
        >
          {uploading ? "uploading…" : "🖼 image"}
        </button>
        <button
          type="button"
          title="insert fritz (or just type {fritz})"
          onClick={() => editor.chain().focus().insertContent({ type: "fritz" }).run()}
          className={btn(false)}
        >
          🐱 fritz
        </button>
        {anchors && (
          <button
            type="button"
            title="pin a note to the selected passage"
            onClick={() => {
              const { from, to } = editor.state.selection;
              const text = editor.state.doc.textBetween(from, to, " ").trim();
              if (!text) {
                window.alert("select a passage first, then pin a note to it.");
                return;
              }
              window.dispatchEvent(
                new CustomEvent("fritz:new-note", { detail: { anchor: text } }),
              );
            }}
            className={btn(false)}
          >
            📌 note
          </button>
        )}
        <button
          type="button"
          onClick={() => {
            const v = window.prompt("YouTube video id or URL");
            if (!v) return;
            const id = v.includes("http")
              ? v
              : `https://www.youtube.com/watch?v=${v.trim()}`;
            editor.chain().focus().setYoutubeVideo({ src: id }).run();
          }}
          className={btn(false)}
        >
          ▶ youtube
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          hidden
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) onFile(f);
            e.target.value = "";
          }}
        />
      </div>

      <EditorContent editor={editor} />

      {(() => {
        const text = html
          .replace(/<[^>]+>/g, " ")
          .replace(/&[a-z#0-9]+;/gi, " ")
          .replace(/\s+/g, " ")
          .trim();
        const words = text ? text.split(" ").length : 0;
        const mins = Math.max(1, Math.round(words / 220));
        return (
          <p className="mt-3 flex items-center justify-between gap-3 text-xs font-bold text-muted">
            <span className="font-normal leading-relaxed">
              Select any words and hit a colour to make a skill / class / system
              line bleed through. Plain text stays plain.
            </span>
            <span className="shrink-0 tabular-nums">
              {words.toLocaleString()} words · {mins} min
            </span>
          </p>
        );
      })()}
    </div>
  );
}
