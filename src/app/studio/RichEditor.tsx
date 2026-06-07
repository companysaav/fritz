"use client";

import { Color, TextStyle } from "@tiptap/extension-text-style";
import { Image } from "@tiptap/extension-image";
import { Youtube } from "@tiptap/extension-youtube";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useRef, useState } from "react";

import { createClient } from "@/lib/supabase/client";

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
}: {
  initialHTML?: string;
  dropcap?: boolean;
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
    ],
    content: initialHTML || "<p></p>",
    editorProps: {
      attributes: {
        class: `prose-fritz ${dropcap ? "dropcap" : ""} min-h-[55vh] rounded-2xl border border-line bg-paper p-6 outline-none`,
      },
    },
    onUpdate: ({ editor }) => setHtml(editor.getHTML()),
  });

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
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          className={btn(false)}
        >
          ―
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

      <p className="mt-3 text-xs leading-relaxed text-muted">
        Select any words and hit a colour to make a skill / class / system line
        bleed through. Plain text stays plain.
      </p>
    </div>
  );
}
