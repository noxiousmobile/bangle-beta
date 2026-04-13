"use client"

import type React from "react"
import { Bold, Italic, Code, LinkIcon } from "lucide-react"
import { cn } from "@/lib/utils"

// Note: BubbleToolbar is not currently used in the editor
// Kept for potential future use

interface BubbleToolbarProps {
  onBold: () => void
  onItalic: () => void
  onCode: () => void
  onLink: () => void
  activeFormats: Record<string, boolean>
}

export function BubbleToolbar({ onBold, onItalic, onCode, onLink, activeFormats }: BubbleToolbarProps) {

  return (
    <div className="flex items-center gap-1 p-1">
      <BubbleButton onClick={onBold} isActive={activeFormats.bold} title="Bold">
        <Bold className="w-3.5 h-3.5" />
      </BubbleButton>
      <BubbleButton onClick={onItalic} isActive={activeFormats.italic} title="Italic">
        <Italic className="w-3.5 h-3.5" />
      </BubbleButton>
      <BubbleButton onClick={onCode} isActive={activeFormats.code} title="Code">
        <Code className="w-3.5 h-3.5" />
      </BubbleButton>
      <BubbleButton onClick={onLink} title="Link">
        <LinkIcon className="w-3.5 h-3.5" />
      </BubbleButton>
    </div>
  )
}

interface BubbleButtonProps {
  onClick: () => void
  isActive?: boolean
  title?: string
  children: React.ReactNode
}

function BubbleButton({ onClick, isActive, title, children }: BubbleButtonProps) {
  return (
    <button
      type="button"
      className={cn(
        "p-1 rounded text-gray-600 hover:bg-gray-100 transition-colors",
        isActive && "bg-gray-100 text-blue-600",
      )}
      onClick={onClick}
      title={title}
    >
      {children}
    </button>
  )
}
