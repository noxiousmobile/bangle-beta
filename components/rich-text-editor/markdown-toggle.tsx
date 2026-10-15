"use client"

import { FileCode } from "lucide-react"

interface MarkdownToggleProps {
  isMarkdownMode: boolean
  toggleMarkdownMode: () => void
  leading?: React.ReactNode
}

export function MarkdownToggle({ isMarkdownMode, toggleMarkdownMode, leading }: MarkdownToggleProps) {
  return (
    <div className={`flex items-center mt-2 ${leading ? "justify-between" : "justify-end"}`}>
      {leading}
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
