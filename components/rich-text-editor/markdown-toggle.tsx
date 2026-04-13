"use client"

import { FileCode } from "lucide-react"

interface MarkdownToggleProps {
  isMarkdownMode: boolean
  toggleMarkdownMode: () => void
}

export function MarkdownToggle({ isMarkdownMode, toggleMarkdownMode }: MarkdownToggleProps) {
  return (
    <div className="flex justify-end mt-2">
      <button
        type="button"
        onClick={toggleMarkdownMode}
        className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700 transition-colors"
      >
        <FileCode className="w-3.5 h-3.5" />
        {isMarkdownMode ? "Switch to Rich Text" : "Switch to Markdown"}
      </button>
    </div>
  )
}
