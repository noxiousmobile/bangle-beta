"use client"

import type React from "react"
import { Bold, Italic, Underline, Strikethrough, List, ListOrdered, Heading1, Heading2, Code2, Quote, Undo, Redo, LinkIcon, ImageIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface EditorToolbarProps {
  activeFormats: Record<string, boolean>
  isMarkdownMode: boolean
  onBold: () => void
  onItalic: () => void
  onUnderline: () => void
  onStrike: () => void
  onHeading1: () => void
  onHeading2: () => void
  onBulletList: () => void
  onOrderedList: () => void
  onBlockquote: () => void
  onLink: () => void
  onImage: () => void
  onUndo: () => void
  onRedo: () => void
}

export function EditorToolbar({
  activeFormats,
  isMarkdownMode,
  onBold, onItalic, onUnderline, onStrike,
  onHeading1, onHeading2,
  onBulletList, onOrderedList, onBlockquote,
  onLink, onImage, onUndo, onRedo,
}: EditorToolbarProps) {
  if (isMarkdownMode) return null

  return (
    <div className="flex flex-wrap items-center gap-1 p-1 mb-2 border border-gray-200 rounded-md bg-gray-50 shadow-sm">
      <ToolbarButton onClick={onBold} isActive={activeFormats.bold} title="Bold">
        <Bold className="w-4 h-4" />
      </ToolbarButton>
      <ToolbarButton onClick={onItalic} isActive={activeFormats.italic} title="Italic">
        <Italic className="w-4 h-4" />
      </ToolbarButton>
      <ToolbarButton onClick={onUnderline} isActive={activeFormats.underline} title="Underline">
        <Underline className="w-4 h-4" />
      </ToolbarButton>
      <ToolbarButton onClick={onStrike} isActive={activeFormats.strikeThrough} title="Strikethrough">
        <Strikethrough className="w-4 h-4" />
      </ToolbarButton>

      <ToolbarDivider />

      <ToolbarButton onClick={onHeading1} title="Heading 1">
        <Heading1 className="w-4 h-4" />
      </ToolbarButton>
      <ToolbarButton onClick={onHeading2} title="Heading 2">
        <Heading2 className="w-4 h-4" />
      </ToolbarButton>

      <ToolbarDivider />

      <ToolbarButton onClick={onBulletList} isActive={activeFormats.insertUnorderedList} title="Bullet List">
        <List className="w-4 h-4" />
      </ToolbarButton>
      <ToolbarButton onClick={onOrderedList} isActive={activeFormats.insertOrderedList} title="Ordered List">
        <ListOrdered className="w-4 h-4" />
      </ToolbarButton>
      <ToolbarButton onClick={onBlockquote} title="Blockquote">
        <Quote className="w-4 h-4" />
      </ToolbarButton>

      <ToolbarDivider />

      <ToolbarButton onClick={onLink} title="Link">
        <LinkIcon className="w-4 h-4" />
      </ToolbarButton>
      <ToolbarButton onClick={onImage} title="Image">
        <ImageIcon className="w-4 h-4" />
      </ToolbarButton>

      <ToolbarDivider />

      <ToolbarButton onClick={onUndo} title="Undo">
        <Undo className="w-4 h-4" />
      </ToolbarButton>
      <ToolbarButton onClick={onRedo} title="Redo">
        <Redo className="w-4 h-4" />
      </ToolbarButton>
    </div>
  )
}

interface ToolbarButtonProps {
  onClick: () => void
  disabled?: boolean
  isActive?: boolean
  title?: string
  children: React.ReactNode
}

function ToolbarButton({ onClick, disabled, isActive, title, children }: ToolbarButtonProps) {
  return (
    <button
      type="button"
      className={cn(
        "p-1.5 rounded text-gray-600 hover:bg-gray-200 transition-colors",
        isActive && "bg-gray-200 text-blue-600",
        disabled && "opacity-50 cursor-not-allowed",
      )}
      onMouseDown={(e) => {
        e.preventDefault()
        if (!disabled) onClick()
      }}
      disabled={disabled}
      title={title}
    >
      {children}
    </button>
  )
}

function ToolbarDivider() {
  return <div className="w-px h-6 bg-gray-300 mx-1" />
}
