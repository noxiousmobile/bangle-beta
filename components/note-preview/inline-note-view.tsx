"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { ArrowLeft, Share2, Heart, Trash2, Save, X, Tag, Link2 } from "lucide-react"
import { linkifyHtml } from "@/lib/linkify"
import { anchorifyHtml, extractAnchors } from "@/lib/anchors"
import { NoteAnchors } from "@/components/note-anchors"
import { type Note, findRelatedNotes, recentNotes } from "@/lib/data"
import { getRelatedNotesCount } from "@/lib/bangle-utils"
import Image from "next/image"
import { RichTextEditor } from "@/components/rich-text-editor"
import { TagInput } from "@/components/tag-input"

interface InlineNoteViewProps {
  note: Note
  onClose: () => void
  onDelete?: (noteId: number) => void
  onSave?: (noteId: number, updatedData: { title?: string; content?: string; tags?: string[] }) => void
  onShare?: () => void
  isFavourite?: boolean
  onToggleFavourite?: (noteId: number) => void
  collectionName?: string | null
  onCollectionClick?: () => void
  onSeeRelated?: () => void
  allNotes?: Note[]
}

export function InlineNoteView({
  note,
  onClose,
  onDelete,
  onSave,
  onShare,
  isFavourite = false,
  onToggleFavourite,
  collectionName,
  onCollectionClick,
  onSeeRelated,
  allNotes = [],
}: InlineNoteViewProps) {
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [isEditingContent, setIsEditingContent] = useState(false)
  const [editedTitle, setEditedTitle] = useState(note.title)
  const [editedContent, setEditedContent] = useState(note.content || "")
  const titleInputRef = useRef<HTMLInputElement>(null)
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const anchors = extractAnchors(isEditingContent ? editedContent : note.content || "")

  const tagSource = allNotes.length > 0 ? allNotes : recentNotes
  const tagFrequency = new Map<string, number>()
  for (const n of tagSource) {
    for (const tag of n.tags ?? []) tagFrequency.set(tag, (tagFrequency.get(tag) ?? 0) + 1)
  }
  const availableTags = Array.from(tagFrequency.keys())
  const recentTags = Array.from(tagFrequency.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([tag]) => tag)

  useEffect(() => {
    // Only reset editing state if we're not currently editing
    // This prevents the editor from closing during auto-save
    if (!isEditingTitle && !isEditingContent) {
      setEditedTitle(note.title)
      setEditedContent(note.content || "")
    }
  }, [note, isEditingTitle, isEditingContent])

  // Auto-save content when it changes
  useEffect(() => {
    // Clear existing timer
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current)
    }

    // Only auto-save if content has changed
    if (editedContent !== note.content) {
      // Set a new timer to save after 1 second of inactivity
      autoSaveTimerRef.current = setTimeout(() => {
        onSave?.(note.id, { content: editedContent })
      }, 1000)
    }

    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current)
      }
    }
  }, [editedContent, note.content, note.id, onSave])

  const handleEditTitle = () => {
    setIsEditingTitle(true)
    setTimeout(() => titleInputRef.current?.focus(), 50)
  }

  const handleSaveTitle = () => {
    if (editedTitle !== note.title) {
      onSave?.(note.id, { title: editedTitle })
    }
    setIsEditingTitle(false)
  }

  const handleCancelTitle = () => {
    setEditedTitle(note.title)
    setIsEditingTitle(false)
  }

  const handleEditContent = () => {
    setIsEditingContent(true)
  }

  const handleDelete = () => {
    onDelete?.(note.id)
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return "No date"
    return dateString
  }

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-border bg-card flex-shrink-0">
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <button
            onClick={onClose}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm font-medium">Back</span>
          </button>
          
          <div className="h-6 w-px bg-border" />
          
          {isEditingTitle ? (
            <div className="flex items-center gap-2 flex-1">
              <input
                ref={titleInputRef}
                type="text"
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSaveTitle()
                  if (e.key === "Escape") handleCancelTitle()
                }}
                className="flex-1 text-lg font-semibold bg-transparent border-b-2 border-primary outline-none px-1"
              />
              <button
                onClick={handleSaveTitle}
                className="p-1.5 text-green-600 hover:bg-green-50 rounded-md transition-colors"
              >
                <Save className="w-4 h-4" />
              </button>
              <button
                onClick={handleCancelTitle}
                className="p-1.5 text-muted-foreground hover:bg-muted rounded-md transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <h1
              onClick={handleEditTitle}
              className="text-lg font-semibold text-foreground truncate cursor-pointer hover:text-primary transition-colors"
            >
              {note.title}
            </h1>
          )}
        </div>

        <div className="flex items-center gap-1">
          {collectionName && (
            <button
              onClick={onCollectionClick}
              className="capitalize px-3 py-1.5 text-sm bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors font-medium mr-1"
            >
              {collectionName}
            </button>
          )}
          {onSeeRelated && allNotes.length > 1 && (
            <button
              onClick={onSeeRelated}
              className="flex items-center gap-2 px-3 py-1.5 text-sm text-primary bg-primary/10 hover:bg-primary/20 rounded-lg transition-colors"
              title="See related notes"
            >
              <Link2 className="w-4 h-4" />
              <span className="hidden sm:inline">Related</span>
              {getRelatedNotesCount(note, allNotes) > 0 && (
                <span className="text-xs bg-primary/20 px-1.5 py-0.5 rounded-full">
                  {getRelatedNotesCount(note, allNotes)}
                </span>
              )}
            </button>
          )}
          <button
            onClick={() => onToggleFavourite?.(note.id)}
            className={`p-2 rounded-lg transition-colors ${
              isFavourite ? "text-red-500 bg-red-50" : "text-muted-foreground hover:bg-muted"
            }`}
          >
            <Heart className={`w-5 h-5 ${isFavourite ? "fill-current" : ""}`} />
          </button>
          <button
            onClick={onShare}
            className="p-2 text-muted-foreground hover:bg-muted rounded-lg transition-colors"
          >
            <Share2 className="w-5 h-5" />
          </button>
          <button
            onClick={handleDelete}
            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        <div className="px-6 py-6">
          {/* Tags */}
          <div className="mb-6 flex flex-col gap-3">
            <TagInput
              tags={note.tags ?? []}
              onChange={(tags) => onSave?.(note.id, { tags })}
              availableTags={availableTags}
              recentTags={recentTags}
              placeholder="Search existing tags or add a new one..."
            />
            <NoteAnchors anchors={anchors} containerRef={contentRef} />
          </div>

          {/* Note content */}
          {note.type === "url" ? (
            <div className="bg-card rounded-xl border border-border overflow-hidden">
              {note.image && (
                <div className="aspect-video relative bg-muted">
                  <Image src={note.image || "/placeholder.svg"} alt={note.title} fill className="object-cover" />
                </div>
              )}
              <div className="p-6">
                <p className="text-muted-foreground mb-4">
                  {note.content || "No description available for this link."}
                </p>
                {note.url && (
                  <a
                    href={note.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                  >
                    Visit Link
                  </a>
                )}
              </div>
            </div>
          ) : note.type === "media" && note.image ? (
            <div className="bg-card rounded-xl border border-border overflow-hidden">
              <div className="aspect-video relative">
                <Image src={note.image || "/placeholder.svg"} alt={note.title} fill className="object-cover" />
              </div>
              {note.content && (
                <div className="p-6">
                  <p className="text-foreground">{note.content}</p>
                </div>
              )}
            </div>
          ) : (
            <div ref={contentRef} className="bg-card rounded-xl border border-border">
              {isEditingContent ? (
                <div className="p-6">
                  <RichTextEditor
                    initialContent={editedContent}
                    placeholder="Write your note content here..."
                    onChange={(html) => setEditedContent(html)}
                    autoFocus={true}
                    showTags={false}
                    footerStart={<span className="text-xs text-muted-foreground">{formatDate(note.date)}</span>}
                  />
                </div>
              ) : (
                <div
                  className="p-6 cursor-pointer hover:bg-muted/50 transition-colors min-h-[200px]"
                  onClick={(e) => {
                    if ((e.target as HTMLElement).closest("a")) return
                    handleEditContent()
                  }}
                >
                  {note.content ? (
                    <div
                      className="note-content prose prose-sm max-w-none text-foreground whitespace-pre-wrap"
                      style={{ fontSize: "14px" }}
                      dangerouslySetInnerHTML={{ __html: anchorifyHtml(linkifyHtml(note.content)) }}
                    />
                  ) : (
                    <p className="text-muted-foreground italic">Click to add content to this note...</p>
                  )}
                </div>
              )}
            </div>
          )}

          {!isEditingContent && <p className="mt-3 text-sm text-muted-foreground">{formatDate(note.date)}</p>}
        </div>
      </div>
    </div>
  )
}
