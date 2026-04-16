"use client"

import { useState, useMemo } from "react"
import { X, Check, Layers, Hash, Link2 } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { findRelatedNotesForBangle, createBangle, getMergedTags } from "@/lib/bangle-utils"
import { getTagColor } from "@/components/note-card"
import type { Note } from "@/lib/data"
import type { Bangle } from "@/lib/types"

interface CreateBangleModalProps {
  isOpen: boolean
  sourceNote: Note
  allNotes: Note[]
  onClose: () => void
  onCreate: (bangle: Bangle) => void
}

export function CreateBangleModal({
  isOpen,
  sourceNote,
  allNotes,
  onClose,
  onCreate,
}: CreateBangleModalProps) {
  const [title, setTitle] = useState(`Bangle: ${sourceNote.title}`)
  const [description, setDescription] = useState("")
  const [selectedNoteIds, setSelectedNoteIds] = useState<Set<number>>(new Set())

  // Find related notes
  const relatedNotes = useMemo(
    () => findRelatedNotesForBangle(sourceNote, allNotes),
    [sourceNote, allNotes]
  )

  // Calculate merged tags preview
  const selectedNotes = useMemo(
    () => relatedNotes.filter((note) => selectedNoteIds.has(note.id)),
    [relatedNotes, selectedNoteIds]
  )

  const mergedTagsPreview = useMemo(
    () => getMergedTags([sourceNote, ...selectedNotes]),
    [sourceNote, selectedNotes]
  )

  // Get shared tags between source and a note
  const getSharedTags = (note: Note) => {
    const sourceTags = new Set(sourceNote.tags)
    return note.tags.filter((tag) => sourceTags.has(tag))
  }

  const toggleNoteSelection = (noteId: number) => {
    const newSet = new Set(selectedNoteIds)
    if (newSet.has(noteId)) {
      newSet.delete(noteId)
    } else {
      newSet.add(noteId)
    }
    setSelectedNoteIds(newSet)
  }

  const selectAll = () => {
    setSelectedNoteIds(new Set(relatedNotes.map((n) => n.id)))
  }

  const deselectAll = () => {
    setSelectedNoteIds(new Set())
  }

  const handleCreate = () => {
    if (!title.trim()) return
    if (selectedNotes.length === 0) {
      alert("Please select at least one related note to create a Bangle.")
      return
    }

    const bangle = createBangle(title.trim(), sourceNote, selectedNotes, description.trim() || undefined)
    onCreate(bangle)
    onClose()
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="bg-background rounded-xl shadow-xl max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Layers className="w-4 h-4 text-primary" />
              </div>
              <div>
                <h2 className="font-semibold text-foreground">Create a Bangle</h2>
                <p className="text-xs text-muted-foreground">
                  Connect related notes into a unified flow
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Title input */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Bangle Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter a title for your Bangle..."
                className="w-full px-3 py-2 text-sm bg-muted/50 border border-border rounded-lg outline-none focus:border-primary transition-colors"
              />
            </div>

            {/* Description input */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Description <span className="text-muted-foreground font-normal">(optional)</span>
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add a description..."
                rows={2}
                className="w-full px-3 py-2 text-sm bg-muted/50 border border-border rounded-lg outline-none focus:border-primary transition-colors resize-none"
              />
            </div>

            {/* Source note */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Source Note
              </label>
              <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <Link2 className="w-3 h-3 text-primary" />
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
            </div>

            {/* Related notes selection */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm font-medium text-foreground">
                  Related Notes ({relatedNotes.length} found)
                </label>
                <div className="flex items-center gap-2">
                  <button
                    onClick={selectAll}
                    className="text-xs text-primary hover:underline"
                  >
                    Select all
                  </button>
                  <span className="text-muted-foreground">|</span>
                  <button
                    onClick={deselectAll}
                    className="text-xs text-muted-foreground hover:text-foreground hover:underline"
                  >
                    Clear
                  </button>
                </div>
              </div>

              {relatedNotes.length === 0 ? (
                <div className="p-4 bg-muted/50 border border-border rounded-lg text-center">
                  <p className="text-sm text-muted-foreground">
                    No related notes found. Notes are related when they share tags.
                  </p>
                </div>
              ) : (
                <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1">
                  {relatedNotes.map((note) => {
                    const isSelected = selectedNoteIds.has(note.id)
                    const sharedTags = getSharedTags(note)

                    return (
                      <div
                        key={note.id}
                        onClick={() => toggleNoteSelection(note.id)}
                        className={`p-3 rounded-lg border cursor-pointer transition-all ${
                          isSelected
                            ? "bg-primary/5 border-primary/30"
                            : "bg-muted/30 border-border hover:border-primary/30"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          {/* Checkbox */}
                          <div
                            className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                              isSelected
                                ? "bg-primary border-primary"
                                : "border-muted-foreground/30"
                            }`}
                          >
                            {isSelected && <Check className="w-3 h-3 text-primary-foreground" />}
                          </div>

                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-sm text-foreground truncate">
                              {note.title}
                            </h4>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs text-muted-foreground">
                                {note.date}
                              </span>
                              <span className="text-muted-foreground">·</span>
                              <span className="text-xs text-primary">
                                {sharedTags.length} shared tag{sharedTags.length !== 1 ? "s" : ""}
                              </span>
                            </div>
                            <div className="flex flex-wrap gap-1 mt-1.5">
                              {note.tags.map((tag) => {
                                const isShared = sharedTags.includes(tag)
                                return (
                                  <span
                                    key={tag}
                                    className={`inline-flex items-center gap-1 px-1.5 py-0.5 text-xs rounded ${
                                      isShared
                                        ? "bg-primary/10 text-primary"
                                        : "bg-muted text-muted-foreground"
                                    }`}
                                  >
                                    <span
                                      className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                                      style={{ backgroundColor: getTagColor(tag) }}
                                    />
                                    {tag}
                                  </span>
                                )
                              })}
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Preview merged tags */}
            {selectedNotes.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  <Hash className="w-3.5 h-3.5 inline mr-1" />
                  Merged Tags Preview ({mergedTagsPreview.length})
                </label>
                <div className="flex flex-wrap gap-1.5 p-3 bg-muted/30 border border-border rounded-lg">
                  {mergedTagsPreview.map((tag) => (
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
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-4 border-t border-border bg-muted/30">
            <div className="text-sm text-muted-foreground">
              {selectedNotes.length + 1} note{selectedNotes.length !== 0 ? "s" : ""} will be connected
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={!title.trim() || selectedNotes.length === 0}
                className="px-4 py-2 text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create Bangle
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
