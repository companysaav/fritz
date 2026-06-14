import { getRole } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

const IMAGE_TYPES: Record<string, string> = {
  "image/gif": "gif",
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

const MAX_IMAGE_BYTES = 8 * 1024 * 1024;

function json(status: number, body: Record<string, unknown>) {
  return Response.json(body, { status });
}

function safeUploadName(name: string, fallbackExt: string) {
  const trimmed = name.trim() || `image.${fallbackExt}`;
  const cleaned = trimmed.replace(/[^a-zA-Z0-9.\-_]/g, "-").replace(/-+/g, "-");
  return cleaned.includes(".") ? cleaned : `${cleaned}.${fallbackExt}`;
}

function safePathSegment(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export async function POST(request: Request) {
  const { user, isAdmin } = await getRole();
  if (!user) return json(401, { ok: false, message: "Sign in again." });
  if (!isAdmin) return json(403, { ok: false, message: "Not allowed." });

  const formData = await request.formData();
  const file = formData.get("image");
  const kind =
    safePathSegment(String(formData.get("kind") ?? "image").trim()) || "image";
  const alt = String(formData.get("alt") ?? "").trim() || null;

  if (!(file instanceof File) || file.size === 0) {
    return json(400, { ok: false, message: "Choose an image first." });
  }
  if (!IMAGE_TYPES[file.type]) {
    return json(400, { ok: false, message: "Use a JPG, PNG, WEBP, or GIF image." });
  }
  if (file.size > MAX_IMAGE_BYTES) {
    return json(400, { ok: false, message: "Image must be 8 MB or smaller." });
  }

  const db = createAdminClient();
  const ext = IMAGE_TYPES[file.type];
  const safeName = safeUploadName(file.name, ext);
  const path = `studio/${kind}/${Date.now()}-${crypto.randomUUID()}-${safeName}`;
  const bytes = await file.arrayBuffer();

  const { error } = await db.storage.from("media").upload(path, bytes, {
    cacheControl: "31536000",
    contentType: file.type,
    upsert: false,
  });
  if (error) return json(500, { ok: false, message: error.message });

  const { data } = db.storage.from("media").getPublicUrl(path);
  const url = data.publicUrl;

  const { error: mediaError } = await db.from("media_assets").insert({
    type: "image",
    storage_path: path,
    url,
    mime_type: file.type,
    alt,
    metadata: { source: "studio-upload", kind },
  });
  if (mediaError) return json(500, { ok: false, message: mediaError.message });

  return json(200, { ok: true, url });
}
