"use client";

import { useRef, useState, type DragEvent } from "react";

type ImageDropzoneProps = {
  label: string;
  name: string;
  kind: "post-cover" | "novel-cover" | "chapter-hero";
  defaultValue?: string;
  placeholder?: string;
};

type UploadImageResult =
  | { ok: true; url: string }
  | { ok: false; message: string };

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
    setStatus("uploading");

    try {
      const formData = new FormData();
      formData.set("image", file);
      formData.set("kind", kind);
      formData.set("alt", label);

      const response = await fetch("/studio/upload/image", {
        method: "POST",
        body: formData,
      });
      const result = (await response.json()) as UploadImageResult;
      if (result.ok) {
        setUrl(result.url);
        setStatus("uploaded");
        return;
      }
      setStatus(result.message);
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
