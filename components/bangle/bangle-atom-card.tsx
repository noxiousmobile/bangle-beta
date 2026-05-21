"use client"

import { useState } from "react"
import { ChevronDown, ChevronUp, Clock, ExternalLink, Edit2 } from "lucide-react"
import { getTagColor } from "@/components/note-card"
import type { BangleAtom } from "@/lib/types"

interface BangleAtomCardProps {
  atom: BangleAtom
  isLast?: boolean
  onViewNote?: (noteId: number) => void
  onUpdateContent?: (noteId: number, newContent: string) => void
  onUpdateTitle?: (noteId: number, newTitle: string) => void
  sharedTags?: string[]
}

export function BangleAtomCard({ atom, isLast = false, onViewNote, onUpdateContent, onUpdateTitle, sharedTags }: BangleAtomCardProps) {
  const [isExpanded, setIsExpanded] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [editedContent, setEditedContent] = useState(atom.content)
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [editedTitle, setEditedTitle] = useState(atom.title)

  // Parse content for display - handle HTML or plain text
  const getDisplayContent = () => {
    if (!atom.content) return "No content"
    // Strip HTML tags for preview if needed
    const plainText = atom.content.replace(/<[^>]*>/g, "").trim()
    return plainText || "No content"
  }

  const contentPreview = getDisplayContent()
  const isLongContent = contentPreview.length > 200

  const handleAutoSave = () => {
    if (onUpdateContent && editedContent.trim()) {
      onUpdateContent(atom.noteId, editedContent)
    }
    setIsEditing(false)
  }

  const handleEditBlur = () => {
    handleAutoSave()
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Save on Ctrl+Enter or Cmd+Enter
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      handleAutoSave()
    }
  }

  const handleAutoSaveTitle = () => {
    if (onUpdateTitle && editedTitle.trim()) {
      onUpdateTitle(atom.noteId, editedTitle)
    }
    setIsEditingTitle(false)
  }

  const handleTitleBlur = () => {
    handleAutoSaveTitle()
  }

  const handleTitleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Save on Enter or Escape to cancel
    if (e.key === "Enter") {
      handleAutoSaveTitle()
    } else if (e.key === "Escape") {
      setEditedTitle(atom.title)
      setIsEditingTitle(false)
    }
  }

  return (
    <div className="relative flex gap-4">
      {/* Timeline connector */}
      <div className="flex flex-col items-center">
        {/* Dot */}
        <div className="w-3 h-3 rounded-full bg-primary border-2 border-background shadow-sm z-10" />
        {/* Line */}
        {!isLast && (
          <div className="w-0.5 flex-1 bg-border mt-2" />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 pb-6">
        {/* Timestamp */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
          <Clock className="w-3 h-3" />
          <span>{atom.timestamp}</span>
        </div>

        {/* Card */}
        <div className="bg-card border border-border rounded-lg shadow-sm overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-3 border-b border-border bg-muted/30">
            {isEditingTitle ? (
              <input
                type="text"
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
                onBlur={handleTitleBlur}
                onKeyDown={handleTitleKeyDown}
                autoFocus
                className="flex-1 px-2 py-1 text-sm font-medium bg-background border border-border rounded focus:outline-none focus:ring-2 focus:ring-primary/50"
                placeholder="Edit title..."
              />
            ) : (
              <h4
                className="font-medium text-sm text-foreground truncate flex-1 cursor-pointer hover:text-primary transition-colors group"
                onClick={() => setIsEditingTitle(true)}
                title="Click to edit title"
              >
                {atom.title}
              </h4>
            )}
            <div className="flex items-center gap-1">
              {onViewNote && (
                <button
                  onClick={() => onViewNote(atom.noteId)}
                  className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded transition-colors"
                  title="View original note"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded transition-colors"
              >
                {isExpanded ? (
                  <ChevronUp className="w-3.5 h-3.5" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          </div>

          {/* Content */}
          {isExpanded && (
            <div className="p-3">
              {isEditing ? (
                <textarea
                  value={editedContent}
                  onChange={(e) => setEditedContent(e.target.value)}
                  onBlur={handleEditBlur}
                  onKeyDown={handleKeyDown}
                  autoFocus
                  className="w-full min-h-[120px] p-2 bg-background border border-border rounded text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                  placeholder="Edit note content..."
                />
              ) : (
                <div className="group">
                  <div 
                    className="text-sm text-foreground/80 whitespace-pre-wrap cursor-pointer hover:text-foreground transition-colors"
                    dangerouslySetInnerHTML={{ 
                      __html: isLongContent && !isExpanded 
                        ? atom.content.slice(0, 200) + "..." 
                        : atom.content 
                    }}
                    onClick={() => setIsEditing(true)}
                  />
                  <button
                    onClick={() => setIsEditing(true)}
                    className="mt-2 p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded opacity-0 group-hover:opacity-100 transition-all"
                    title="Edit note content"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Tags */}
          {atom.tags.length > 0 && (
            <div className="px-3 pb-3 flex flex-wrap gap-1.5">
              {atom.tags.map((tag) => {
                const isShared = sharedTags?.includes(tag)
                return (
                  <span
                    key={tag}
                    className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded-full ${
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
          )}
        </div>
      </div>
    </div>
  )
}
