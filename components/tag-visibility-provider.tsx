"use client"

import { createContext, useContext, useState, type ReactNode } from "react"

interface TagVisibilityContextType {
  showTagNames: boolean
  toggleTagNames: () => void
  expandedNotes: Set<number>
  toggleNoteExpanded: (noteId: number) => void
}

const TagVisibilityContext = createContext<TagVisibilityContextType | undefined>(undefined)

export function TagVisibilityProvider({ children }: { children: ReactNode }) {
  const [showTagNames, setShowTagNames] = useState(false)
  const [expandedNotes, setExpandedNotes] = useState<Set<number>>(new Set())

  const toggleTagNames = () => {
    setShowTagNames((prev) => !prev)
  }

  const toggleNoteExpanded = (noteId: number) => {
    setExpandedNotes((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(noteId)) {
        newSet.delete(noteId)
      } else {
        newSet.add(noteId)
      }
      return newSet
    })
  }

  return (
    <TagVisibilityContext.Provider value={{ showTagNames, toggleTagNames, expandedNotes, toggleNoteExpanded }}>
      {children}
    </TagVisibilityContext.Provider>
  )
}

export function useTagVisibility() {
  const context = useContext(TagVisibilityContext)
  if (context === undefined) {
    throw new Error("useTagVisibility must be used within a TagVisibilityProvider")
  }
  return context
}
