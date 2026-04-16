"use client"

import { useState } from "react"
import { ChevronDown, ChevronUp, Clock, ExternalLink } from "lucide-react"
import { getTagColor } from "@/components/note-card"
import type { BangleAtom } from "@/lib/types"

interface BangleAtomCardProps {
  atom: BangleAtom
  isLast?: boolean
  onViewNote?: (noteId: number) => void
}

export function BangleAtomCard({ atom, isLast = false, onViewNote }: BangleAtomCardProps) {
  const [isExpanded, setIsExpanded] = useState(true)

  // Parse content for display - handle HTML or plain text
  const getDisplayContent = () => {
    if (!atom.content) return "No content"
    // Strip HTML tags for preview if needed
    const plainText = atom.content.replace(/<[^>]*>/g, "").trim()
    return plainText || "No content"
  }

  const contentPreview = getDisplayContent()
  const isLongContent = contentPreview.length > 200

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
            <h4 className="font-medium text-sm text-foreground truncate flex-1">
              {atom.title}
            </h4>
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
              <div 
                className="text-sm text-foreground/80 whitespace-pre-wrap"
                dangerouslySetInnerHTML={{ 
                  __html: isLongContent && !isExpanded 
                    ? atom.content.slice(0, 200) + "..." 
                    : atom.content 
                }}
              />
            </div>
          )}

          {/* Tags */}
          {atom.tags.length > 0 && (
            <div className="px-3 pb-3 flex flex-wrap gap-1.5">
              {atom.tags.map((tag) => (
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
          )}
        </div>
      </div>
    </div>
  )
}
