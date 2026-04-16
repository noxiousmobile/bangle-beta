"use client"

import { useState, useMemo } from "react"
import { X, Search, Calendar, Hash, Layers, Trash2, Edit2, Check } from "lucide-react"
import { BangleAtomCard } from "./bangle-atom-card"
import { getBangleAtoms, searchBangleContent, formatAtomCount } from "@/lib/bangle-utils"
import { getTagColor } from "@/components/note-card"
import type { Bangle } from "@/lib/types"
import type { Note } from "@/lib/data"

interface BangleViewerProps {
  bangle: Bangle
  notes: Note[]
  onClose: () => void
  onDelete?: (bangleId: string) => void
  onUpdate?: (bangle: Bangle) => void
  onViewNote?: (noteId: number) => void
}

export function BangleViewer({
  bangle,
  notes,
  onClose,
  onDelete,
  onUpdate,
  onViewNote,
}: BangleViewerProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [editedTitle, setEditedTitle] = useState(bangle.title)
  const [isEditingDescription, setIsEditingDescription] = useState(false)
  const [editedDescription, setEditedDescription] = useState(bangle.description || "")

  // Get atoms based on search query
  const atoms = useMemo(() => {
    if (searchQuery.trim()) {
      return searchBangleContent(bangle, notes, searchQuery)
    }
    return getBangleAtoms(bangle, notes)
  }, [bangle, notes, searchQuery])

  const handleSaveTitle = () => {
    if (editedTitle.trim() && onUpdate) {
      onUpdate({
        ...bangle,
        title: editedTitle.trim(),
        updatedAt: new Date().toISOString(),
      })
    }
    setIsEditingTitle(false)
  }

  const handleSaveDescription = () => {
    if (onUpdate) {
      onUpdate({
        ...bangle,
        description: editedDescription.trim() || undefined,
        updatedAt: new Date().toISOString(),
      })
    }
    setIsEditingDescription(false)
  }

  const handleDelete = () => {
    if (onDelete && confirm("Are you sure you want to delete this Bangle? The original notes will not be affected.")) {
      onDelete(bangle.id)
      onClose()
    }
  }

  const formatDate = (isoString: string) => {
    return new Date(isoString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="flex-shrink-0 border-b border-border">
        <div className="p-4">
          {/* Title row */}
          <div className="flex items-start justify-between gap-4 mb-3">
            <div className="flex-1 min-w-0">
              {isEditingTitle ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={editedTitle}
                    onChange={(e) => setEditedTitle(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleSaveTitle()
                      if (e.key === "Escape") {
                        setEditedTitle(bangle.title)
                        setIsEditingTitle(false)
                      }
                    }}
                    className="flex-1 text-xl font-semibold bg-transparent border-b-2 border-primary outline-none"
                    autoFocus
                  />
                  <button
                    onClick={handleSaveTitle}
                    className="p-1.5 text-primary hover:bg-primary/10 rounded transition-colors"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2 group">
                  <h2 className="text-xl font-semibold text-foreground truncate">
                    {bangle.title}
                  </h2>
                  <button
                    onClick={() => setIsEditingTitle(true)}
                    className="p-1 text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
            <div className="flex items-center gap-1">
              {onDelete && (
                <button
                  onClick={handleDelete}
                  className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                  title="Delete Bangle"
                >
                  <Trash2 className="w-4 h-4" />
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

          {/* Description */}
          <div className="mb-4">
            {isEditingDescription ? (
              <div className="flex items-start gap-2">
                <textarea
                  value={editedDescription}
                  onChange={(e) => setEditedDescription(e.target.value)}
                  placeholder="Add a description..."
                  className="flex-1 text-sm text-muted-foreground bg-muted/50 border border-border rounded-md p-2 outline-none focus:border-primary resize-none"
                  rows={2}
                  autoFocus
                />
                <button
                  onClick={handleSaveDescription}
                  className="p-1.5 text-primary hover:bg-primary/10 rounded transition-colors"
                >
                  <Check className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <p
                onClick={() => setIsEditingDescription(true)}
                className="text-sm text-muted-foreground cursor-pointer hover:text-foreground transition-colors"
              >
                {bangle.description || "Click to add a description..."}
              </p>
            )}
          </div>

          {/* Meta info */}
          <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground mb-4">
            <div className="flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5" />
              <span>{formatAtomCount(atoms.length)}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Hash className="w-3.5 h-3.5" />
              <span>{bangle.mergedTags.length} tags</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              <span>Created {formatDate(bangle.createdAt)}</span>
            </div>
          </div>

          {/* Merged tags */}
          <div className="flex flex-wrap gap-1.5 mb-4">
            {bangle.mergedTags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded-full bg-muted text-muted-foreground"
              >
                <span
                  className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: getTagColor(tag) }}
                />
                {tag}
              </span>
            ))}
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search within this Bangle..."
              className="w-full pl-9 pr-4 py-2 text-sm bg-muted/50 border border-border rounded-lg outline-none focus:border-primary transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Timeline content */}
      <div className="flex-1 overflow-y-auto p-4">
        {atoms.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
            <Layers className="w-12 h-12 mb-3 opacity-50" />
            <p className="text-sm">
              {searchQuery ? "No notes match your search" : "No notes in this Bangle"}
            </p>
          </div>
        ) : (
          <div className="max-w-2xl mx-auto">
            {atoms.map((atom, index) => (
              <BangleAtomCard
                key={atom.noteId}
                atom={atom}
                isLast={index === atoms.length - 1}
                onViewNote={onViewNote}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
