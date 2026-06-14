"use client";

import { useRef, useState, type DragEvent } from "react";

import { createClient } from "@/lib/supabase/client";

type ImageDropzoneProps = {
  label: string;
  name: string;
  kind: "post-cover" | "novel-cover" | "chapter-hero";
  defaultValue?: string;
  placeholder?: string;
};

const IMAGE_TYPES = ["image/gif", "image/jpeg", "image/png", "image/webp"];
const MAX_IMAGE_BYTES = 20 * 1024 * 1024;

function safeUploadName(name: string, fallbackExt: string) {
  const trimmed = name.trim() || `image.${fallbackExt}`;
  const cleaned = trimmed.replace(/[^a-zA-Z0-9.\-_]/g, "-").replace(/-+/g, "-");
  return cleaned.includes(".") ? cleaned : `${cleaned}.${fallbackExt}`;
}

function extensionFor(file: File) {
  if (file.type === "image/jpeg") return "jpg";
  if (file.type === "image/png") return "png";
  if (file.type === "image/webp") return "webp";
  if (file.type === "image/gif") return "gif";
  return "img";
}

export function ImageDropzone({
  label,
  name,
  kind,
  defaultValue = "",
  placeholder = "https://...",
}: ImageDropzoneProps) {
  const [url, setUrl] = useState(defaultValue);
  const [status, setStatus] = useState("");
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const previewAspect = kind === "novel-cover" ? "aspect-[3/4]" : "aspect-[16/10]";

  async function upload(file: File | null | undefined) {
    if (!file) return;
    if (!IMAGE_TYPES.includes(file.type)) {
      setStatus("Use a JPG, PNG, WEBP, or GIF image.");
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      setStatus("Image must be 20 MB or smaller.");
      return;
    }

    setStatus("uploading");

    try {
      const supabase = createClient();
      const safeName = safeUploadName(file.name, extensionFor(file));
      const path = `studio/${kind}/${Date.now()}-${crypto.randomUUID()}-${safeName}`;
      const { error } = await supabase.storage.from("media").upload(path, file, {
        cacheControl: "31536000",
        contentType: file.type,
        upsert: false,
      });

      if (error) {
        setStatus(error.message);
        return;
      }

      const { data } = supabase.storage.from("media").getPublicUrl(path);
      const publicUrl = data.publicUrl;

      await supabase.from("media_assets").insert({
        type: "image",
        storage_path: path,
        url: publicUrl,
        mime_type: file.type,
        alt: label,
        metadata: { source: "studio-upload", kind },
      });

      setUrl(publicUrl);
      setStatus("uploaded");
    } catch {
      setStatus("Upload failed.");
    }
  }

  function onDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDragging(false);
    void upload(event.dataTransfer.files[0]);
  }

  return (
    <div className="block">
      <label
        htmlFor={`${name}-url`}
        className="mb-1 block text-xs font-bold uppercase tracking-wide text-muted"
      >
        {label}
      </label>
      <div
        onDragEnter={() => setDragging(true)}
        onDragOver={(event) => event.preventDefault()}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={`block overflow-hidden rounded-xl border border-dashed bg-paper text-sm transition-colors ${
          dragging ? "border-ember" : "border-line"
        }`}
      >
        {url ? (
          <span
            className={`block ${previewAspect} bg-cover bg-center`}
            style={{ backgroundImage: `url(${url})` }}
          />
        ) : (
          <span
            className={`flex ${previewAspect} items-center justify-center bg-paper-2 px-4 text-center font-semibold text-muted`}
          >
            drop image
          </span>
        )}
        <span className="flex items-center justify-between gap-3 border-t border-line px-3 py-2">
          <span className="truncate text-xs text-muted">
            {status || (url ? "ready" : "no image")}
          </span>
          <button
            type="button"
            onClick={(event) => {
              event.preventDefault();
              inputRef.current?.click();
            }}
            className="shrink-0 rounded-full border border-line px-3 py-1 text-xs font-bold text-ink-soft hover:border-ember hover:text-ember"
          >
            choose
          </button>
        </span>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="sr-only"
        onChange={(event) => void upload(event.currentTarget.files?.[0])}
      />
      <input
        id={`${name}-url`}
        name={name}
        value={url}
        onChange={(event) => setUrl(event.currentTarget.value)}
        placeholder={placeholder}
        className="mt-2 w-full rounded-xl border border-line bg-paper px-3 py-2 text-sm text-ink"
      />
    </div>
  );
}
