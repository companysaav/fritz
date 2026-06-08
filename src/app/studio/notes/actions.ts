"use server";

import { requireAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { NOTE_COLUMNS, type Note, type NoteSubject } from "./types";

/**
 * The notebook's writes. Called programmatically from the (client) NotesPanel,
 * so they take plain objects and return the saved row — the panel mirrors it
 * into local state for a snappy, no-reload feel. Every one re-checks admin:
 * Server Actions are POST endpoints reachable on their own, not just via the UI.
 */

const clean = (s: string | null | undefined) => {
  const t = (s ?? "").trim();
  return t.length ? t : null;
};

export async function createNote(input: {
  subjectType: NoteSubject;
  subjectId: string;
  title?: string;
  body?: string;
  color?: string | null;
  anchorText?: string | null;
}): Promise<Note> {
  const user = await requireAdmin();
  const db = createAdminClient();

  const { data, error } = await db
    .from("notes")
    .insert({
      subject_type: input.subjectType,
      subject_id: input.subjectId,
      title: clean(input.title),
      body: (input.body ?? "").trim(),
      color: clean(input.color),
      anchor_text: clean(input.anchorText),
      author_id: user.id,
    })
    .select(NOTE_COLUMNS)
    .single();

  if (error) throw new Error(error.message);
  return data as Note;
}

export async function updateNote(input: {
  id: string;
  title?: string;
  body?: string;
  color?: string | null;
}): Promise<Note> {
  await requireAdmin();
  const db = createAdminClient();

  const { data, error } = await db
    .from("notes")
    .update({
      title: clean(input.title),
      body: (input.body ?? "").trim(),
      color: clean(input.color),
    })
    .eq("id", input.id)
    .select(NOTE_COLUMNS)
    .single();

  if (error) throw new Error(error.message);
  return data as Note;
}

export async function setNotePinned(id: string, pinned: boolean): Promise<Note> {
  await requireAdmin();
  const db = createAdminClient();

  const { data, error } = await db
    .from("notes")
    .update({ pinned })
    .eq("id", id)
    .select(NOTE_COLUMNS)
    .single();

  if (error) throw new Error(error.message);
  return data as Note;
}

export async function deleteNote(id: string): Promise<void> {
  await requireAdmin();
  const db = createAdminClient();
  const { error } = await db.from("notes").delete().eq("id", id);
  if (error) throw new Error(error.message);
}
