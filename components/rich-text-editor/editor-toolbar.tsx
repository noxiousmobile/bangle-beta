"use client"

import type React from "react"
import { useEffect, useRef, useState } from "react"
import { ChevronDown, Bold, Italic, Underline, Strikethrough, List, ListOrdered, Heading1, Heading2, Code2, Quote, Undo, Redo, LinkIcon, ImageIcon, RemoveFormatting } from "lucide-react"
import { cn } from "@/lib/utils"

interface EditorToolbarProps {
  activeFormats: Record<string, boolean>
  isMarkdownMode: boolean
  onBold: () => void
  onItalic: () => void
  onUnderline: () => void
  onStrike: () => void
  onClearFormatting: () => void
  currentFontSize: number
  onFontSize: (px: number) => void
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
  onBold, onItalic, onUnderline, onStrike, onClearFormatting,
  currentFontSize, onFontSize,
  onHeading1, onHeading2,
  onBulletList, onOrderedList, onBlockquote,
  onLink, onImage, onUndo, onRedo,
}: EditorToolbarProps) {
  if (isMarkdownMode) return null

  return (
    <div className="flex flex-wrap items-center gap-1 p-1 mb-2 border border-gray-200 rounded-md bg-gray-50 shadow-sm">
      <FontSizeMenu currentFontSize={currentFontSize} onSelect={onFontSize} />

      <ToolbarDivider />

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

      <ToolbarButton onClick={onClearFormatting} title="No Style">
        <span className="flex items-center gap-1">
          <RemoveFormatting className="w-4 h-4" />
          <span className="text-xs font-medium">No Style</span>
        </span>
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

const FONT_SIZES = [12, 14, 16, 18, 20]

function FontSizeMenu({ currentFontSize, onSelect }: { currentFontSize: number; onSelect: (px: number) => void }) {
  const [open, setOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const handleOutside = (e: MouseEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", handleOutside)
    return () => document.removeEventListener("mousedown", handleOutside)
  }, [open])

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        title="Text size"
        aria-haspopup="listbox"
        aria-expanded={open}
        className="flex items-center gap-1 h-8 px-2 rounded hover:bg-gray-200 text-gray-700 text-xs font-medium tabular-nums"
        onMouseDown={(e) => {
          // Keep the editor selection alive while the menu is used
          e.preventDefault()
          setOpen((prev) => !prev)
        }}
      >
        {currentFontSize}px
        <ChevronDown className="w-3 h-3" />
      </button>
      {open && (
        <ul
          role="listbox"
          aria-label="Text size"
          className="absolute left-0 top-full z-20 mt-1 min-w-16 rounded-md border border-gray-200 bg-white py-1 shadow-md"
        >
          {FONT_SIZES.map((size) => (
            <li key={size} role="option" aria-selected={size === currentFontSize}>
              <button
                type="button"
                className={cn(
                  "w-full px-3 py-1 text-left text-xs text-gray-700 hover:bg-gray-100 tabular-nums",
                  size === currentFontSize && "bg-gray-100 font-semibold",
                )}
                onMouseDown={(e) => {
                  e.preventDefault()
                  onSelect(size)
                  setOpen(false)
                }}
              >
                {size}px{size === 14 ? " (default)" : ""}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function ToolbarDivider() {
  return <div className="w-px h-6 bg-gray-300 mx-1" />
}
