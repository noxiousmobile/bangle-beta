export type ViewMode = "grid" | "table" | "split" | "collections" | "brain"

// Brain graph types
export interface GraphNode {
  id: string
  type: "note" | "tag" | "collection"
  label: string
  color: string
  size: number
  data: unknown // Original data reference (Note, Collection, or tag string)
  x?: number
  y?: number
  fx?: number | null
  fy?: number | null
}

export interface GraphLink {
  source: string
  target: string
  type: "note-tag" | "note-collection" | "tag-cooccurrence"
  strength: number
  color: string
}

export interface BrainGraphData {
  nodes: GraphNode[]
  links: GraphLink[]
}

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
