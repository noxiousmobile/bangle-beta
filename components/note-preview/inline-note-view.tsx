"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { ArrowLeft, Share2, Heart, Trash2, Save, X, Tag } from "lucide-react"
import { type Note, findRelatedNotes, recentNotes } from "@/lib/data"
import { getTagColor } from "@/components/note-card"
import Image from "next/image"
import { RichTextEditor } from "@/components/rich-text-editor"

interface InlineNoteViewProps {
  note: Note
  onClose: () => void
  onDelete?: (noteId: number) => void
  onSave?: (noteId: number, updatedData: { title?: string; content?: string }) => void
  onShare?: () => void
  isFavourite?: boolean
  onToggleFavourite?: (noteId: number) => void
  collectionName?: string | null
  onCollectionClick?: () => void
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
}: InlineNoteViewProps) {
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [isEditingContent, setIsEditingContent] = useState(false)
  const [editedTitle, setEditedTitle] = useState(note.title)
  const [editedContent, setEditedContent] = useState(note.content || "")
  const titleInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setEditedTitle(note.title)
    setEditedContent(note.content || "")
    setIsEditingTitle(false)
    setIsEditingContent(false)
  }, [note])

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

  const handleSaveContent = () => {
    if (editedContent !== note.content) {
      onSave?.(note.id, { content: editedContent })
    }
    setIsEditingContent(false)
  }

  const handleCancelContent = () => {
    setEditedContent(note.content || "")
    setIsEditingContent(false)
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
          {/* Meta info */}
          <div className="flex flex-wrap items-center gap-4 mb-6 text-sm text-muted-foreground">
            <span>{formatDate(note.date)}</span>
            {collectionName && (
              <button
                onClick={onCollectionClick}
                className="capitalize px-3 py-1 bg-primary/10 text-primary rounded-md hover:bg-primary/20 transition-colors font-medium"
              >
                {collectionName}
              </button>
            )}
          </div>

          {/* Tags */}
          {note.tags && note.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {note.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm bg-muted"
                >
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: getTagColor(tag) }}
                  />
                  {tag}
                </span>
              ))}
            </div>
          )}

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
            <div className="bg-card rounded-xl border border-border">
              {isEditingContent ? (
                <div className="p-6">
                  <RichTextEditor
                    initialContent={editedContent}
                    placeholder="Write your note content here..."
                    onChange={(html) => setEditedContent(html)}
                    autoFocus={true}
                    showTags={false}
                  />
                  <div className="flex items-center gap-2 mt-4 pt-4 border-t border-border">
                    <button
                      onClick={handleSaveContent}
                      className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm"
                    >
                      <Save className="w-4 h-4" />
                      Save
                    </button>
                    <button
                      onClick={handleCancelContent}
                      className="flex items-center gap-2 px-4 py-2 bg-muted text-foreground rounded-lg hover:bg-muted/80 transition-colors text-sm"
                    >
                      <X className="w-4 h-4" />
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  className="p-6 cursor-pointer hover:bg-muted/50 transition-colors min-h-[200px]"
                  onClick={handleEditContent}
                >
                  {note.content ? (
                    <div
                      className="prose prose-sm max-w-none text-foreground whitespace-pre-wrap"
                      dangerouslySetInnerHTML={{ __html: note.content }}
                    />
                  ) : (
                    <p className="text-muted-foreground italic">Click to add content to this note...</p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
