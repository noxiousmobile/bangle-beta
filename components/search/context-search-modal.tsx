"use client"

import type React from "react"
import { useState, useEffect, useRef, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Search,
  X,
  Sparkles,
  FileText,
  Link2,
  Lightbulb,
  Loader2,
  Command,
} from "lucide-react"
import type { Note } from "@/lib/data"
import type { ContextSearchResult } from "@/app/api/context-search/route"
import { getTagColor } from "@/components/note-card"
import { InlineNoteView } from "@/components/note-preview/inline-note-view"

interface ContextSearchModalProps {
  isOpen: boolean
  onClose: () => void
  notes: Note[]
  onNoteDelete?: (noteId: number) => void
  onNoteSaved?: (note: Note) => void
}

interface SearchResultItem {
  noteId: number
  relevanceScore: number
  reason: string
}

export function ContextSearchModal({
  isOpen,
  onClose,
  notes,
  onNoteDelete,
  onNoteSaved,
}: ContextSearchModalProps) {
  const [query, setQuery] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const [results, setResults] = useState<ContextSearchResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [viewingNote, setViewingNote] = useState<Note | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [isOpen])

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (viewingNote) {
          setViewingNote(null)
        } else {
          onClose()
        }
      }
    }

    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown)
      return () => document.removeEventListener("keydown", handleKeyDown)
    }
  }, [isOpen, onClose, viewingNote])

  const handleSearch = useCallback(async () => {
    if (!query.trim()) return

    setIsSearching(true)
    setError(null)
    setResults(null)

    try {
      const response = await fetch("/api/context-search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: query.trim(),
          notes: notes.map((n) => ({
            id: n.id,
            title: n.title,
            content: n.content || "",
            tags: n.tags,
            category: n.category,
            date: n.date,
          })),
        }),
      })

      if (!response.ok) {
        throw new Error("Search failed")
      }

      const data = await response.json()
      setResults(data)
    } catch (err) {
      setError("Failed to perform search. Please try again.")
      console.error("Context search error:", err)
    } finally {
      setIsSearching(false)
    }
  }, [query, notes])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSearch()
    }
  }

  const getNoteById = (noteId: number): Note | undefined => {
    return notes.find((n) => n.id === noteId)
  }

  const handleNoteClick = (noteId: number) => {
    const note = getNoteById(noteId)
    if (note) {
      setViewingNote(note)
    }
  }

  const renderResultCard = (item: SearchResultItem, categoryColor: string) => {
    const note = getNoteById(item.noteId)
    if (!note) return null

    return (
      <motion.button
        key={item.noteId}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full text-left p-4 bg-white border border-gray-200 rounded-xl hover:border-gray-300 hover:shadow-md transition-all group"
        onClick={() => handleNoteClick(item.noteId)}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-gray-900 truncate group-hover:text-blue-600 transition-colors">
              {note.title}
            </h4>
            <p className="text-sm text-gray-500 mt-1 line-clamp-2">
              {note.content?.substring(0, 120)}...
            </p>
            <p
              className="text-xs mt-2 italic"
              style={{ color: categoryColor }}
            >
              {item.reason}
            </p>
          </div>
          <div className="flex flex-col items-end gap-1">
            <div
              className="text-xs font-medium px-2 py-0.5 rounded-full"
              style={{
                backgroundColor: `${categoryColor}15`,
                color: categoryColor,
              }}
            >
              {item.relevanceScore}%
            </div>
          </div>
        </div>
        {note.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {note.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="text-xs px-2 py-0.5 rounded-full"
                style={{
                  backgroundColor: `${getTagColor(tag)}20`,
                  color: getTagColor(tag),
                }}
              >
                {tag}
              </span>
            ))}
            {note.tags.length > 3 && (
              <span className="text-xs text-gray-400">
                +{note.tags.length - 3}
              </span>
            )}
          </div>
        )}
      </motion.button>
    )
  }

  const totalResults =
    (results?.directMatches?.length || 0) +
    (results?.relatedResources?.length || 0) +
    (results?.supportingInfo?.length || 0)

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh] bg-black/50 backdrop-blur-sm"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose()
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -20 }}
          transition={{ type: "spring", duration: 0.3 }}
          className="w-full max-w-3xl mx-4 bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[80vh] flex flex-col"
        >
          {/* Header / Search Input */}
          <div className="p-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask anything... e.g. 'Best startup ideas last year'"
                  className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-300"
                />
              </div>
              <button
                onClick={handleSearch}
                disabled={isSearching || !query.trim()}
                className="px-4 py-3 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-xl font-medium hover:from-purple-600 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {isSearching ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  "Search"
                )}
              </button>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex items-center gap-2 mt-2 ml-13">
              <span className="text-xs text-gray-400 flex items-center gap-1">
                <Command className="w-3 h-3" />K to open
              </span>
              <span className="text-xs text-gray-300">|</span>
              <span className="text-xs text-gray-400">
                Enter to search
              </span>
              <span className="text-xs text-gray-300">|</span>
              <span className="text-xs text-gray-400">
                Esc to close
              </span>
            </div>
          </div>

          {/* Results Area */}
          <div className="flex-1 overflow-y-auto p-4">
            {/* Initial State */}
            {!isSearching && !results && !error && (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-purple-100 to-indigo-100 flex items-center justify-center">
                  <Sparkles className="w-8 h-8 text-purple-500" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  AI-Powered Context Search
                </h3>
                <p className="text-gray-500 max-w-md mx-auto">
                  Search naturally. Bangle understands your intent and finds not
                  just what you asked for, but what you need.
                </p>
                <div className="mt-6 flex flex-wrap justify-center gap-2">
                  {[
                    "Best startup ideas",
                    "Meeting notes from Q1",
                    "Travel plans for summer",
                    "Learning resources",
                  ].map((suggestion) => (
                    <button
                      key={suggestion}
                      onClick={() => {
                        setQuery(suggestion)
                        setTimeout(() => handleSearch(), 100)
                      }}
                      className="px-3 py-1.5 text-sm text-purple-600 bg-purple-50 rounded-full hover:bg-purple-100 transition-colors"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Loading State */}
            {isSearching && (
              <div className="text-center py-12">
                <Loader2 className="w-10 h-10 mx-auto mb-4 text-purple-500 animate-spin" />
                <p className="text-gray-500">
                  Analyzing your notes with AI...
                </p>
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-red-100 flex items-center justify-center">
                  <X className="w-8 h-8 text-red-500" />
                </div>
                <p className="text-red-600">{error}</p>
                <button
                  onClick={handleSearch}
                  className="mt-4 px-4 py-2 text-sm text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                >
                  Try again
                </button>
              </div>
            )}

            {/* Results */}
            {results && !isSearching && (
              <div className="space-y-6">
                {/* Summary */}
                {results.searchSummary && (
                  <div className="p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl border border-purple-100">
                    <p className="text-sm text-purple-800">
                      {results.searchSummary}
                    </p>
                  </div>
                )}

                {totalResults === 0 && (
                  <div className="text-center py-8">
                    <p className="text-gray-500">
                      No relevant notes found. Try a different search query.
                    </p>
                  </div>
                )}

                {/* Direct Matches */}
                {results.directMatches && results.directMatches.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-6 h-6 rounded-lg bg-blue-100 flex items-center justify-center">
                        <FileText className="w-3.5 h-3.5 text-blue-600" />
                      </div>
                      <h3 className="font-medium text-gray-900">
                        Direct Matches
                      </h3>
                      <span className="text-xs text-gray-400">
                        ({results.directMatches.length})
                      </span>
                    </div>
                    <div className="grid gap-3">
                      {results.directMatches.map((item) =>
                        renderResultCard(item, "#3b82f6")
                      )}
                    </div>
                  </div>
                )}

                {/* Related Resources */}
                {results.relatedResources &&
                  results.relatedResources.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-6 h-6 rounded-lg bg-green-100 flex items-center justify-center">
                          <Link2 className="w-3.5 h-3.5 text-green-600" />
                        </div>
                        <h3 className="font-medium text-gray-900">
                          Related Resources
                        </h3>
                        <span className="text-xs text-gray-400">
                          ({results.relatedResources.length})
                        </span>
                      </div>
                      <div className="grid gap-3">
                        {results.relatedResources.map((item) =>
                          renderResultCard(item, "#22c55e")
                        )}
                      </div>
                    </div>
                  )}

                {/* Supporting Info */}
                {results.supportingInfo &&
                  results.supportingInfo.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-6 h-6 rounded-lg bg-amber-100 flex items-center justify-center">
                          <Lightbulb className="w-3.5 h-3.5 text-amber-600" />
                        </div>
                        <h3 className="font-medium text-gray-900">
                          Supporting Info
                        </h3>
                        <span className="text-xs text-gray-400">
                          ({results.supportingInfo.length})
                        </span>
                      </div>
                      <div className="grid gap-3">
                        {results.supportingInfo.map((item) =>
                          renderResultCard(item, "#f59e0b")
                        )}
                      </div>
                    </div>
                  )}
              </div>
            )}
          </div>
        </motion.div>

        {/* Note View Modal */}
        <AnimatePresence>
          {viewingNote && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50"
              onClick={(e) => {
                if (e.target === e.currentTarget) setViewingNote(null)
              }}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden mx-4"
              >
                <InlineNoteView
                  note={viewingNote}
                  onClose={() => setViewingNote(null)}
                  onDelete={(noteId) => {
                    onNoteDelete?.(noteId)
                    setViewingNote(null)
                  }}
                  onSave={(noteId, updatedData) => {
                    const updatedNote: Note = {
                      ...viewingNote,
                      ...updatedData,
                    }
                    onNoteSaved?.(updatedNote)
                    setViewingNote(updatedNote)
                  }}
                  allNotes={notes}
                />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  )
}
