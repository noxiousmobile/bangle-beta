import { formatDistanceToNow } from "date-fns"
import { createClient } from "@/lib/supabase/client"
import type { Note } from "@/lib/data"
import type { Bangle } from "@/lib/types"

const NOTE_COLUMNS = "id, title, content, tags, category, type, url, image, created_at"
const BANGLE_COLUMNS = "id, title, description, source_note_id, atom_ids, merged_tags, created_at, updated_at"

type NoteRow = {
  id: number
  title: string
  content: string | null
  tags: string[]
  category: string
  type: "text" | "url" | "media"
  url: string | null
  image: string | null
  created_at: string
}

type BangleRow = {
  id: string
  title: string
  description: string | null
  source_note_id: number | null
  atom_ids: number[]
  merged_tags: string[]
  created_at: string
  updated_at: string
}

function rowToNote(row: NoteRow): Note {
  return {
    id: row.id,
    title: row.title,
    content: row.content ?? undefined,
    tags: row.tags ?? [],
    category: row.category,
    type: row.type,
    url: row.url ?? undefined,
    image: row.image ?? "/placeholder.svg",
    date: formatDistanceToNow(new Date(row.created_at), { addSuffix: true }),
  } as Note
}

function rowToBangle(row: BangleRow): Bangle {
  return {
    id: row.id,
    title: row.title,
    description: row.description ?? undefined,
    sourceNoteId: row.source_note_id ?? 0,
    atomIds: row.atom_ids ?? [],
    mergedTags: row.merged_tags ?? [],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

// Large inline data URLs (e.g. base64 images) aren't worth storing in a text column.
function persistableImage(image?: string) {
  if (!image || image === "/placeholder.svg") return null
  return image
}

function noteToRow(note: Partial<Note>) {
  return {
    title: note.title ?? "",
    content: note.content ?? null,
    tags: note.tags ?? [],
    category: note.category || "general",
    type: (note.type as NoteRow["type"]) ?? "text",
    url: note.url ?? null,
    image: persistableImage(note.image),
  }
}

export async function fetchNotes(): Promise<Note[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("notes")
    .select(NOTE_COLUMNS)
    .order("created_at", { ascending: false })
  if (error) throw error
  return (data as NoteRow[]).map(rowToNote)
}

export async function insertNote(note: Partial<Note>): Promise<Note> {
  const supabase = createClient()
  const { data, error } = await supabase.from("notes").insert(noteToRow(note)).select(NOTE_COLUMNS).single()
  if (error) throw error
  return rowToNote(data as NoteRow)
}

export async function updateNote(id: number, note: Partial<Note>): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase.from("notes").update(noteToRow(note)).eq("id", id)
  if (error) throw error
}

export async function deleteNotes(ids: number[]): Promise<void> {
  if (ids.length === 0) return
  const supabase = createClient()
  const { error } = await supabase.from("notes").delete().in("id", ids)
  if (error) throw error
}

export async function fetchBangles(): Promise<Bangle[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("bangles")
    .select(BANGLE_COLUMNS)
    .order("created_at", { ascending: false })
  if (error) throw error
  return (data as BangleRow[]).map(rowToBangle)
}

function bangleToRow(bangle: Bangle) {
  return {
    title: bangle.title,
    description: bangle.description ?? null,
    source_note_id: bangle.sourceNoteId > 0 ? bangle.sourceNoteId : null,
    atom_ids: bangle.atomIds.filter((id) => id > 0),
    merged_tags: bangle.mergedTags,
  }
}

export async function insertBangle(bangle: Bangle): Promise<Bangle> {
  const supabase = createClient()
  const { data, error } = await supabase.from("bangles").insert(bangleToRow(bangle)).select(BANGLE_COLUMNS).single()
  if (error) throw error
  return rowToBangle(data as BangleRow)
}

export async function updateBangle(bangle: Bangle): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase.from("bangles").update(bangleToRow(bangle)).eq("id", bangle.id)
  if (error) throw error
}

export async function deleteBangle(id: string): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase.from("bangles").delete().eq("id", id)
  if (error) throw error
}
