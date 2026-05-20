import type { Note } from "./data"
import type { Bangle, BangleAtom } from "./types"

/**
 * Find notes that share tags with a source note
 * Returns notes sorted by tag overlap (most shared tags first)
 */
export function findRelatedNotesForBangle(
  sourceNote: Note,
  allNotes: Note[]
): Note[] {
  const sourceTags = new Set(sourceNote.tags)

  return allNotes
    .filter((note) => {
      // Exclude the source note itself
      if (note.id === sourceNote.id) return false
      // Include if there's at least one shared tag
      return note.tags.some((tag) => sourceTags.has(tag))
    })
    .map((note) => ({
      note,
      sharedTagCount: note.tags.filter((tag) => sourceTags.has(tag)).length,
    }))
    .sort((a, b) => b.sharedTagCount - a.sharedTagCount)
    .map(({ note }) => note)
}

/**
 * Generate a unique ID for a Bangle
 */
function generateBangleId(): string {
  return `bangle_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
}

/**
 * Merge all unique tags from notes
 */
export function getMergedTags(notes: Note[]): string[] {
  const tagSet = new Set<string>()
  for (const note of notes) {
    for (const tag of note.tags) {
      tagSet.add(tag)
    }
  }
  return Array.from(tagSet).sort()
}

/**
 * Create a Bangle from selected notes
 */
export function createBangle(
  title: string,
  sourceNote: Note,
  selectedNotes: Note[],
  description?: string
): Bangle {
  const allNotes = [sourceNote, ...selectedNotes]
  const atomIds = allNotes.map((note) => note.id)
  const mergedTags = getMergedTags(allNotes)
  const now = new Date().toISOString()

  return {
    id: generateBangleId(),
    title,
    description,
    sourceNoteId: sourceNote.id,
    atomIds,
    mergedTags,
    createdAt: now,
    updatedAt: now,
  }
}

/**
 * Parse date string to sortable value
 * Handles formats like "2 hours ago", "Yesterday", "1 week ago", etc.
 */
function parseDateToSortable(dateStr: string): number {
  const now = Date.now()
  const lowerDate = dateStr.toLowerCase()

  if (lowerDate === "just now") return now
  if (lowerDate === "yesterday") return now - 24 * 60 * 60 * 1000

  const match = lowerDate.match(/(\d+)\s+(hour|day|week|month|minute)s?\s+ago/)
  if (match) {
    const value = parseInt(match[1], 10)
    const unit = match[2]
    const multipliers: Record<string, number> = {
      minute: 60 * 1000,
      hour: 60 * 60 * 1000,
      day: 24 * 60 * 60 * 1000,
      week: 7 * 24 * 60 * 60 * 1000,
      month: 30 * 24 * 60 * 60 * 1000,
    }
    return now - value * (multipliers[unit] || 0)
  }

  // Fallback: try parsing as ISO date or return 0
  const parsed = Date.parse(dateStr)
  return isNaN(parsed) ? 0 : parsed
}

/**
 * Get all atoms for a Bangle, sorted by date (newest first)
 */
export function getBangleAtoms(bangle: Bangle, allNotes: Note[]): BangleAtom[] {
  const noteMap = new Map(allNotes.map((note) => [note.id, note]))

  const atoms: BangleAtom[] = bangle.atomIds
    .map((noteId) => noteMap.get(noteId))
    .filter((note): note is Note => note !== undefined)
    .map((note) => ({
      noteId: note.id,
      title: note.title,
      content: note.content || "",
      tags: note.tags,
      timestamp: note.date,
      order: 0, // Will be set after sorting
    }))
    .sort((a, b) => parseDateToSortable(b.timestamp) - parseDateToSortable(a.timestamp))

  // Assign order after sorting
  return atoms.map((atom, index) => ({ ...atom, order: index }))
}

/**
 * Search within Bangle content
 */
export function searchBangleContent(
  bangle: Bangle,
  allNotes: Note[],
  query: string
): BangleAtom[] {
  if (!query.trim()) return getBangleAtoms(bangle, allNotes)

  const lowerQuery = query.toLowerCase()
  const atoms = getBangleAtoms(bangle, allNotes)

  return atoms.filter(
    (atom) =>
      atom.title.toLowerCase().includes(lowerQuery) ||
      atom.content.toLowerCase().includes(lowerQuery) ||
      atom.tags.some((tag) => tag.toLowerCase().includes(lowerQuery))
  )
}

/**
 * Add a note to an existing Bangle
 */
export function addNoteToBangle(
  bangle: Bangle,
  note: Note
): Bangle {
  if (bangle.atomIds.includes(note.id)) return bangle

  const newAtomIds = [...bangle.atomIds, note.id]
  const newMergedTags = [...new Set([...bangle.mergedTags, ...note.tags])].sort()

  return {
    ...bangle,
    atomIds: newAtomIds,
    mergedTags: newMergedTags,
    updatedAt: new Date().toISOString(),
  }
}

/**
 * Remove a note from an existing Bangle
 */
export function removeNoteFromBangle(
  bangle: Bangle,
  noteId: number,
  allNotes: Note[]
): Bangle | null {
  const newAtomIds = bangle.atomIds.filter((id) => id !== noteId)

  // Can't have a Bangle with less than 2 notes
  if (newAtomIds.length < 2) return null

  // Recalculate merged tags
  const remainingNotes = allNotes.filter((note) => newAtomIds.includes(note.id))
  const newMergedTags = getMergedTags(remainingNotes)

  return {
    ...bangle,
    atomIds: newAtomIds,
    mergedTags: newMergedTags,
    updatedAt: new Date().toISOString(),
  }
}

/**
 * Get count of related notes for a source note
 */
export function getRelatedNotesCount(sourceNote: Note, allNotes: Note[]): number {
  return findRelatedNotesForBangle(sourceNote, allNotes).length
}

/**
 * Format the Bangle's atom count for display
 */
export function formatAtomCount(count: number): string {
  return count === 1 ? "1 note" : `${count} notes`
}
