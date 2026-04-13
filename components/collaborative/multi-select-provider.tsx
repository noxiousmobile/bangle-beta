"use client"

import { createContext, useContext, useState, type ReactNode } from "react"
import type { Note } from "@/lib/data"

interface MultiSelectContextType {
  isMultiSelectMode: boolean
  selectedNotes: Note[]
  toggleMultiSelectMode: () => void
  toggleNoteSelection: (note: Note) => void
  clearSelection: () => void
  isNoteSelected: (noteId: number) => boolean
}

const MultiSelectContext = createContext<MultiSelectContextType | null>(null)

export function useMultiSelect() {
  const context = useContext(MultiSelectContext)
  if (!context) {
    throw new Error("useMultiSelect must be used within MultiSelectProvider")
  }
  return context
}

interface MultiSelectProviderProps {
  children: ReactNode
}

export function MultiSelectProvider({ children }: MultiSelectProviderProps) {
  const [isMultiSelectMode, setIsMultiSelectMode] = useState(false)
  const [selectedNotes, setSelectedNotes] = useState<Note[]>([])

  const toggleMultiSelectMode = () => {
    setIsMultiSelectMode(!isMultiSelectMode)
    if (isMultiSelectMode) {
      setSelectedNotes([])
    }
  }

  const toggleNoteSelection = (note: Note) => {
    setSelectedNotes((prev) => {
      const isSelected = prev.some((n) => n.id === note.id)
      if (isSelected) {
        return prev.filter((n) => n.id !== note.id)
      } else {
        return [...prev, note]
      }
    })
  }

  const clearSelection = () => {
    setSelectedNotes([])
    setIsMultiSelectMode(false)
  }

  const isNoteSelected = (noteId: number) => {
    return selectedNotes.some((note) => note.id === noteId)
  }

  return (
    <MultiSelectContext.Provider
      value={{
        isMultiSelectMode,
        selectedNotes,
        toggleMultiSelectMode,
        toggleNoteSelection,
        clearSelection,
        isNoteSelected,
      }}
    >
      {children}
    </MultiSelectContext.Provider>
  )
}
