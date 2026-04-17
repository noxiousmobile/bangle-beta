export type ViewMode = "grid" | "table" | "split" | "collections"

// Bangle types - connected note flows
export interface Bangle {
  id: string
  title: string
  description?: string
  sourceNoteId: number          // The note that triggered creation
  atomIds: number[]             // IDs of all merged notes
  mergedTags: string[]          // Union of all tags from atoms
  createdAt: string
  updatedAt: string
}

export interface BangleAtom {
  noteId: number
  title: string
  content: string
  tags: string[]
  timestamp: string             // Original note date
  order: number                 // Position in timeline (most recent first)
}
