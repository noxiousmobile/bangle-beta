"use client"

import { useState, useMemo } from "react"
import { X, Search, Link2, ChevronLeft, ChevronRight, Maximize2, Minimize2 } from "lucide-react"
import { BangleAtomCard } from "./bangle-atom-card"
import { findRelatedNotesForBangle } from "@/lib/bangle-utils"
import { getTagColor } from "@/components/note-card"
import type { Note } from "@/lib/data"
import type { BangleAtom } from "@/lib/types"

interface RelatedNotesPanelProps {
  sourceNote: Note
  allNotes: Note[]
  onClose: () => void
  onViewNote?: (noteId: number) => void
  position?: "right" | "bottom"
  onTogglePosition?: () => void
}

export function RelatedNotesPanel({
  sourceNote,
  allNotes,
  onClose,
  onViewNote,
  position = "right",
  onTogglePosition,
}: RelatedNotesPanelProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [isExpanded, setIsExpanded] = useState(false)

  // Find related notes
  const relatedNotes = useMemo(
    () => findRelatedNotesForBangle(sourceNote, allNotes),
    [sourceNote, allNotes]
  )

  // Convert related notes to atoms for the timeline display
  const atoms: BangleAtom[] = useMemo(() => {
    let notes = relatedNotes
    
    // Filter by search query if present
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      notes = relatedNotes.filter(
        (note) =>
          note.title.toLowerCase().includes(query) ||
          note.content?.toLowerCase().includes(query) ||
          note.tags.some((tag) => tag.toLowerCase().includes(query))
      )
    }

    return notes.map((note, index) => ({
      noteId: note.id,
      title: note.title,
      content: note.content || "",
      tags: note.tags,
      timestamp: note.date,
      order: index,
    }))
  }, [relatedNotes, searchQuery])

  // Get shared tags between source and a note
  const getSharedTags = (noteTags: string[]) => {
    const sourceTags = new Set(sourceNote.tags)
    return noteTags.filter((tag) => sourceTags.has(tag))
  }

  const panelClasses = position === "right"
    ? `fixed top-0 right-0 h-full ${isExpanded ? "w-[600px]" : "w-[400px]"} bg-background border-l border-border shadow-xl z-[100] flex flex-col transition-all duration-300`
    : `fixed bottom-0 left-0 right-0 ${isExpanded ? "h-[70vh]" : "h-[50vh]"} bg-background border-t border-border shadow-xl z-[100] flex flex-col transition-all duration-300`

  return (
      <div className={panelClasses}>
        {/* Header */}
        <div className="flex-shrink-0 border-b border-border">
          <div className="p-4">
            {/* Title row */}
            <div className="flex items-center justify-between gap-4 mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Link2 className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <h2 className="font-semibold text-foreground">Related Notes</h2>
                  <p className="text-xs text-muted-foreground">
                    {relatedNotes.length} notes connected to &quot;{sourceNote.title}&quot;
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {/* Toggle expand/collapse */}
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
                  title={isExpanded ? "Collapse" : "Expand"}
                >
                  {isExpanded ? (
                    <Minimize2 className="w-4 h-4" />
                  ) : (
                    <Maximize2 className="w-4 h-4" />
                  )}
                </button>
                {/* Toggle position */}
                {onTogglePosition && (
                  <button
                    onClick={onTogglePosition}
                    className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
                    title={position === "right" ? "Move to bottom" : "Move to right"}
                  >
                    {position === "right" ? (
                      <ChevronLeft className="w-4 h-4 rotate-90" />
                    ) : (
                      <ChevronRight className="w-4 h-4 rotate-90" />
                    )}
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Source note preview */}
            <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg mb-4">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-medium text-primary">S</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-sm text-foreground truncate">
                    {sourceNote.title}
                  </h4>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {sourceNote.tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1 px-1.5 py-0.5 text-xs rounded bg-primary/10 text-primary"
                      >
                        <span
                          className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                          style={{ backgroundColor: getTagColor(tag) }}
                        />
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search related notes..."
                className="w-full pl-9 pr-4 py-2 text-sm bg-muted/50 border border-border rounded-lg outline-none focus:border-primary transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Timeline content */}
        <div className="flex-1 overflow-y-auto p-4">
          {atoms.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
              <Link2 className="w-12 h-12 mb-3 opacity-50" />
              <p className="text-sm">
                {searchQuery ? "No notes match your search" : "No related notes found"}
              </p>
              {!searchQuery && (
                <p className="text-xs mt-1 text-center max-w-[200px]">
                  Notes are related when they share tags with the source note.
                </p>
              )}
            </div>
          ) : (
            <div>
              {atoms.map((atom, index) => (
                <BangleAtomCard
                  key={atom.noteId}
                  atom={atom}
                  isLast={index === atoms.length - 1}
                  onViewNote={onViewNote}
                  sharedTags={getSharedTags(atom.tags)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
  )
}
