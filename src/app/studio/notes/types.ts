export type NoteSubject = "novel" | "post" | "chapter";

export type Note = {
  id: string;
  subject_type: NoteSubject;
  subject_id: string;
  title: string | null;
  body: string;
  color: string | null;
  anchor_text: string | null;
  pinned: boolean;
  updated_at: string;
  created_at: string;
};

/** Columns to select for a note, in one place. */
export const NOTE_COLUMNS =
  "id, subject_type, subject_id, title, body, color, anchor_text, pinned, updated_at, created_at";
