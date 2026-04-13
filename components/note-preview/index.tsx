"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Share2, Heart, Calendar, Link2, Eye, ExternalLink, Trash2, Save, X, Loader2, Plus } from "lucide-react"
import { type Note, findRelatedNotes, recentNotes } from "@/lib/data"
import { getTagColor } from "@/components/note-card"
import { aiOrganizationEngine } from "@/lib/ai/organization-engine"
import Image from "next/image"
import { RichTextEditor } from "@/components/rich-text-editor"

interface NotePreviewProps {
  note: Note | null
  isOpen: boolean
  isFavourite?: boolean
  onToggleFavourite?: (noteId: number) => void
  onClose: () => void
  onEdit?: (note: Note) => void
  onDelete?: (noteId: number) => void
  onSave?: (noteId: number, updatedData: { title?: string; content?: string }) => void
  onNoteChange?: (note: Note) => void
  onShare?: (note: Note) => void
  onSaveTags?: (noteId: number, tags: string[]) => void
}

export function NotePreview({
  note,
  isOpen,
  isFavourite = false,
  onToggleFavourite,
  onClose,
  onEdit,
  onDelete,
  onSave,
  onNoteChange,
  onShare,
  onSaveTags,
}: NotePreviewProps) {
  const [aiInsights, setAiInsights] = useState<any[]>([])
  const [relatedNotes, setRelatedNotes] = useState<Note[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingInsights, setIsLoadingInsights] = useState(false)
  const [showAIInsights, setShowAIInsights] = useState(true)

  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [isEditingContent, setIsEditingContent] = useState(false)
  const [editedTitle, setEditedTitle] = useState("")
  const [editedContent, setEditedContent] = useState("")

  const [isEditingTags, setIsEditingTags] = useState(false)
  const [editedTags, setEditedTags] = useState<string[]>([])
  const [newTagInput, setNewTagInput] = useState("")
  const [tagSuggestions, setTagSuggestions] = useState<string[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)

  const titleInputRef = useRef<HTMLInputElement>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const headerTitleInputRef = useRef<HTMLInputElement>(null)
  const tagInputRef = useRef<HTMLInputElement>(null)

  const allAvailableTags = Array.from(new Set(recentNotes.flatMap((n) => n.tags))).sort()

  useEffect(() => {
    if (note && isOpen) {
      setIsLoading(true)
      loadAIInsights()
      loadRelatedNotes()
      setIsEditingTitle(false)
      setIsEditingContent(false)
      setIsEditingTags(false)
      setEditedTitle(note.title || "")
      setEditedContent(note.content || "Start writing your note here...")
      setEditedTags(note.tags || [])
      if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollTo({ top: 0, behavior: "smooth" })
      }
      setTimeout(() => {
        setIsLoading(false)
      }, 800)
    }
  }, [note, isOpen])

  const loadAIInsights = async () => {
    if (!note) return
    setIsLoadingInsights(true)
    try {
      const insights = await aiOrganizationEngine.generateNoteInsights(note, recentNotes)
      setAiInsights(insights)
    } catch (error) {
      console.error("Error loading AI insights:", error)
    } finally {
      setIsLoadingInsights(false)
    }
  }

  const loadRelatedNotes = () => {
    if (!note) return
    const relatedIds = findRelatedNotes(note.id)
    const related = recentNotes.filter((n) => relatedIds.includes(n.id)).slice(0, 6)
    setRelatedNotes(related)
  }

  const getCategoryGradient = (category: string) => {
    const gradients = {
      work: "from-blue-500/20 via-blue-400/10 to-transparent",
      personal: "from-purple-500/20 via-purple-400/10 to-transparent",
      tech: "from-indigo-500/20 via-indigo-400/10 to-transparent",
      travel: "from-teal-500/20 via-teal-400/10 to-transparent",
      health: "from-green-500/20 via-green-400/10 to-transparent",
      finance: "from-yellow-500/20 via-yellow-400/10 to-transparent",
      education: "from-orange-500/20 via-orange-400/10 to-transparent",
      cooking: "from-red-500/20 via-red-400/10 to-transparent",
      creative: "from-pink-500/20 via-pink-400/10 to-transparent",
      home: "from-gray-500/20 via-gray-400/10 to-transparent",
    }
    return gradients[category as keyof typeof gradients] || gradients.personal
  }

  const handleCopyLink = () => {
    navigator.clipboard.writeText(note?.url || note?.title || "")
  }

  const handleArchive = () => {
    console.log("Archive note:", note?.id)
  }

  const handleDelete = () => {
    if (note) {
      onDelete?.(note.id)
      onClose()
    }
  }

  const handleEditTitle = () => {
    if (!isEditingTitle && note) {
      setIsEditingTitle(true)
      setEditedTitle(note.title)
      setTimeout(() => {
        headerTitleInputRef.current?.focus()
      }, 100)
    }
  }

  const handleEditContent = () => {
    if (!isEditingContent && note) {
      setIsEditingContent(true)
      setEditedContent(note.content || "")
      setTimeout(() => {
        // scrollContainerRef.current?.focus() // Removed as RichTextEditor handles focus
      }, 100)
    }
  }

  const handleSaveTitleEdits = () => {
    if (note && editedTitle !== note.title) {
      onSave?.(note.id, {
        title: editedTitle,
      })
      if (onEdit) {
        const updatedNote = { ...note, title: editedTitle }
        onEdit(updatedNote)
      }
    }
    setIsEditingTitle(false)
  }

  const handleSaveContentEdits = () => {
    if (note && editedContent !== note.content) {
      onSave?.(note.id, {
        content: editedContent,
      })
    }
    setIsEditingContent(false)
  }

  const handleCancelTitleEdits = () => {
    if (note) {
      setEditedTitle(note.title)
    }
    setIsEditingTitle(false)
  }

  const handleCancelContentEdits = () => {
    if (note) {
      setEditedContent(note.content || "")
    }
    setIsEditingContent(false)
  }

  const formatDate = (dateString: string) => {
    if (!dateString) {
      return "No date"
    }
    if (dateString.includes("ago")) {
      return dateString
    }
    return dateString
  }

  const handleShare = () => {
    if (note && onShare) {
      onShare(note)
    }
  }

  const handleEditTags = () => {
    if (!isEditingTags && note) {
      setIsEditingTags(true)
      setEditedTags(note.tags || [])
      setNewTagInput("")
      setTimeout(() => {
        tagInputRef.current?.focus()
      }, 100)
    }
  }

  const handleSaveTagsEdits = () => {
    if (note && onSaveTags) {
      onSaveTags(note.id, editedTags)
      if (onEdit) {
        const updatedNote = { ...note, tags: editedTags }
        onEdit(updatedNote)
      }
    }
    setIsEditingTags(false)
    setNewTagInput("")
    setShowSuggestions(false)
  }

  const handleCancelTagsEdits = () => {
    if (note) {
      setEditedTags(note.tags || [])
    }
    setIsEditingTags(false)
    setNewTagInput("")
    setShowSuggestions(false)
  }

  const handleAddTag = (tag: string) => {
    const trimmedTag = tag.trim().toLowerCase()
    if (trimmedTag && !editedTags.includes(trimmedTag)) {
      setEditedTags([...editedTags, trimmedTag])
      setNewTagInput("")
      setShowSuggestions(false)
      tagInputRef.current?.focus()
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setEditedTags(editedTags.filter((tag) => tag !== tagToRemove))
  }

  const handleTagInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setNewTagInput(value)

    if (value.trim()) {
      const filtered = allAvailableTags.filter(
        (tag) => tag.toLowerCase().includes(value.toLowerCase()) && !editedTags.includes(tag),
      )
      setTagSuggestions(filtered)
      setShowSuggestions(filtered.length > 0)
    } else {
      setShowSuggestions(false)
    }
  }

  const handleTagInputKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault()
      if (newTagInput.trim()) {
        handleAddTag(newTagInput)
      }
    } else if (e.key === "Escape") {
      setShowSuggestions(false)
    }
  }

  if (!note || !isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/60" onClick={onClose}>
      <div
        className="absolute inset-4 md:inset-8 lg:inset-16 bg-white rounded-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className={`absolute inset-0 bg-gradient-to-br ${getCategoryGradient(note.category)} pointer-events-none`}
        />

        {/* Header */}
        <div className="relative z-10 flex items-center justify-between py-1.5 px-4 md:py-1.5 md:px-6 border-b border-gray-100 bg-white flex-shrink-0">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            {isEditingTitle ? (
              <input
                ref={headerTitleInputRef}
                type="text"
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
                className="flex-1 min-w-0 text-base md:text-lg font-semibold text-gray-900 bg-white border border-gray-300 rounded-lg px-3 py-1.5 focus:outline-none focus:border-gray-200 focus:shadow-sm transition-all"
                placeholder="Note title"
              />
            ) : (
              <h2
                className="text-base md:text-lg font-semibold text-gray-900 truncate cursor-pointer hover:text-gray-700 transition-colors"
                onClick={handleEditTitle}
              >
                {note.title}
              </h2>
            )}
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {isEditingTitle ? (
              <>
                <button
                  onClick={handleSaveTitleEdits}
                  className="p-2 hover:bg-green-100 rounded-full transition-colors text-green-600"
                >
                  <Save className="w-5 h-5" />
                </button>
                <button
                  onClick={handleCancelTitleEdits}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => note && onToggleFavourite?.(note.id)}
                  className={`p-2 rounded-full transition-all ${isFavourite ? "bg-red-50 text-red-500" : "hover:bg-gray-100 text-gray-600"}`}
                >
                  <Heart className={`w-5 h-5 ${isFavourite ? "fill-current" : ""}`} />
                </button>

                <button
                  onClick={handleShare}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-600"
                  title="Share this note"
                >
                  <Share2 className="w-5 h-5" />
                </button>

                <button
                  onClick={handleDelete}
                  className="p-2 hover:bg-red-100 rounded-full transition-colors text-red-500"
                >
                  <Trash2 className="w-5 h-5" />
                </button>

                <div className="w-px h-6 bg-gray-300 mx-1" />

                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </>
            )}
          </div>
        </div>

        <div ref={scrollContainerRef} className="relative z-10 flex-1 overflow-auto">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
                <p className="text-sm text-gray-500">Loading note...</p>
              </div>
            </div>
          ) : (
            <div className="p-4 md:p-8">
              <div className="mb-8">
                {note.type === "url" ? (
                  <div className="space-y-6">
                    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                      <div className="aspect-video relative bg-gray-100">
                        <Image src={note.image || "/placeholder.svg"} alt={note.title} fill className="object-cover" />
                      </div>
                      <div className="p-4 md:p-6">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 mb-2">{note.title}</h3>
                            <p className="text-gray-600 text-sm mb-3">
                              Preview of the linked content and any additional notes or thoughts about this resource.
                            </p>
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                              <ExternalLink className="w-4 h-4 flex-shrink-0" />
                              <span className="truncate">{note.url}</span>
                            </div>
                          </div>
                          <button
                            onClick={() => note.url && window.open(note.url, "_blank", "noopener,noreferrer")}
                            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors whitespace-nowrap"
                          >
                            Visit Link
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : note.type === "media" ? (
                  <div className="space-y-6">
                    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                      <div className="aspect-video relative">
                        <Image src={note.image || "/placeholder.svg"} alt={note.title} fill className="object-cover" />
                      </div>
                      <div className="p-4 md:p-6">
                        <p className="text-gray-700 leading-relaxed">
                          This media file contains important visual information related to {note.category}. You can add
                          notes, annotations, or descriptions here to provide context for this image.
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="prose prose-sm max-w-none">
                    {isEditingContent ? (
                      <div className="bg-white rounded-xl border border-gray-200 p-4 md:p-6">
                        <RichTextEditor
                          initialContent={editedContent}
                          placeholder="Write your note content here..."
                          onChange={(html) => setEditedContent(html)}
                          autoFocus={true}
                          showTags={false}
                        />
                        <div className="flex items-center gap-2 mt-4">
                          <button
                            onClick={handleSaveContentEdits}
                            className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm"
                          >
                            <Save className="w-4 h-4" />
                            Save
                          </button>
                          <button
                            onClick={handleCancelContentEdits}
                            className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm"
                          >
                            <X className="w-4 h-4" />
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div
                        className="bg-white rounded-xl border border-gray-200 p-4 md:p-8 cursor-pointer hover:bg-gray-50 transition-colors"
                        onClick={handleEditContent}
                      >
                        <div
                          className="prose prose-sm max-w-none text-gray-700 leading-relaxed whitespace-pre-wrap"
                          dangerouslySetInnerHTML={{
                            __html: note.content || "Click to add content to this note...",
                          }}
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Metadata */}
              <div className="mb-3 md:mb-4">
                <div className="flex flex-wrap items-center gap-2 md:gap-3 text-sm text-gray-600 mb-2 md:mb-3">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDate(note.date)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4" />
                    <span>Last viewed today</span>
                  </div>
                  {note.type === "url" && (
                    <div className="flex items-center gap-2">
                      <Link2 className="w-4 h-4" />
                      <span>Web link</span>
                    </div>
                  )}
                </div>

                {isEditingTags ? (
                  <div className="space-y-3">
                    <div className="relative">
                      <div className="flex flex-wrap gap-2 p-3 border-2 border-blue-500 rounded-lg bg-white min-h-[48px] focus-within:ring-2 focus-within:ring-blue-200">
                        {editedTags.map((tag) => (
                          <span
                            key={tag}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-white border-2 border-gray-300 hover:border-gray-400 transition-colors"
                          >
                            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: getTagColor(tag) }} />
                            {tag}
                            <button
                              onClick={() => handleRemoveTag(tag)}
                              className="ml-1 inline-flex items-center justify-center w-4 h-4 rounded-full hover:bg-gray-200 transition-colors"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        ))}
                        <input
                          ref={tagInputRef}
                          type="text"
                          value={newTagInput}
                          onChange={handleTagInputChange}
                          onKeyDown={handleTagInputKeyPress}
                          onFocus={() => {
                            if (newTagInput.trim()) {
                              const filtered = allAvailableTags.filter(
                                (tag) =>
                                  tag.toLowerCase().includes(newTagInput.toLowerCase()) && !editedTags.includes(tag),
                              )
                              setTagSuggestions(filtered)
                              setShowSuggestions(filtered.length > 0)
                            }
                          }}
                          placeholder={editedTags.length === 0 ? "Type to add tags..." : "Add more tags..."}
                          className="flex-1 min-w-[150px] outline-none bg-transparent text-sm py-1"
                        />
                      </div>

                      {/* Autocomplete suggestions */}
                      {showSuggestions && tagSuggestions.length > 0 && (
                        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-auto">
                          {tagSuggestions.map((tag) => (
                            <button
                              key={tag}
                              onClick={() => handleAddTag(tag)}
                              className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 transition-colors flex items-center gap-2"
                            >
                              <span
                                className="w-2.5 h-2.5 rounded-full"
                                style={{ backgroundColor: getTagColor(tag) }}
                              />
                              {tag}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleSaveTagsEdits}
                        className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm"
                      >
                        <Save className="w-4 h-4" />
                        Save Tags
                      </button>
                      <button
                        onClick={handleCancelTagsEdits}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm"
                      >
                        <X className="w-4 h-4" />
                        Cancel
                      </button>
                      <span className="text-xs text-gray-500 ml-2">Press Enter to add a tag</span>
                    </div>
                  </div>
                ) : (
                  <div
                    className="flex flex-wrap gap-2 cursor-pointer group"
                    onClick={handleEditTags}
                    title="Click to edit tags"
                  >
                    {note.tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium bg-white border border-gray-200 hover:border-gray-300 transition-colors"
                      >
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: getTagColor(tag) }} />
                        {tag}
                      </span>
                    ))}
                    <button className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-gray-100 text-gray-600 border border-gray-200 hover:border-gray-300 hover:bg-gray-200 transition-colors">
                      <Plus className="w-3.5 h-3.5" />
                      Edit tags
                    </button>
                  </div>
                )}
              </div>

              {relatedNotes.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Link2 className="w-5 h-5" />
                    Related Notes
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {relatedNotes.map((relatedNote, index) => (
                      <div
                        key={relatedNote.id}
                        className="bg-white rounded-lg border border-gray-200 p-4 hover:border-gray-300 transition-colors cursor-pointer"
                        onClick={() => onNoteChange?.(relatedNote)}
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                            <Image
                              src={relatedNote.image || "/placeholder.svg"}
                              alt={relatedNote.title}
                              width={48}
                              height={48}
                              className="object-cover w-full h-full"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-gray-900 truncate">{relatedNote.title}</h4>
                            <p className="text-sm text-gray-600 mt-1">{relatedNote.date}</p>
                            <div className="flex gap-1 mt-2">
                              {relatedNote.tags.slice(0, 2).map((tag) => (
                                <span
                                  key={tag}
                                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-600"
                                >
                                  <span
                                    className="w-1.5 h-1.5 rounded-full"
                                    style={{ backgroundColor: getTagColor(tag) }}
                                  />
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
