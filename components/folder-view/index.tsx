"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Folder, FileText, Link, ImageIcon, ChevronLeft, Info } from "lucide-react"
import { getAllCategories, getNotesByCategory } from "@/lib/data"
import { abbreviateDate } from "@/lib/utils/date-formatter"
import type { Note } from "@/lib/data";

interface FolderViewProps {
  notes: Note[]
  onNoteClick?: (note: Note) => void;
}

export function FolderView({ notes, onNoteClick }: FolderViewProps) {
  const [currentCategory, setCurrentCategory] = useState<string | null>(null)
  const categories = getAllCategories()
  type NoteLike = Omit<Note, "type"> & { type: string; url?: string };

  // Get folder color based on category
  const getFolderColor = (category: string) => {
    const colorMap: Record<string, string> = {
      personal: "bg-blue-100 text-blue-700",
      work: "bg-purple-100 text-purple-700",
      tech: "bg-indigo-100 text-indigo-700",
      travel: "bg-teal-100 text-teal-700",
      health: "bg-green-100 text-green-700",
      finance: "bg-yellow-100 text-yellow-700",
      education: "bg-orange-100 text-orange-700",
      cooking: "bg-red-100 text-red-700",
      home: "bg-gray-100 text-gray-700",
      entertainment: "bg-pink-100 text-pink-700",
    }

    return colorMap[category] || "bg-gray-100 text-gray-700"
  }

  // Get icon based on note type
  const getNoteIcon = (n: NoteLike) => {
      const t = (n.type as Note["type"]) ?? "text";
      switch (t) {
        case "url":   return <Link className="w-4 h-4 text-blue-500" />;
        case "media": return <ImageIcon className="w-4 h-4 text-green-500" />;
        case "text":
        default:      return <FileText className="w-4 h-4 text-gray-500" />;
      }
  }

  const handleImgError: React.ReactEventHandler<HTMLImageElement> = (e) => {
  const img = e.currentTarget;
    img.onerror = null; // prevent loop if placeholder fails
    img.src = "/placeholder.svg?height=64&width=64";
  };

  // If no category is selected, show folders
  if (!currentCategory) {
    return (
      <div className="pb-20">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {categories.map((category) => {
            const categoryNotes = getNotesByCategory(category)
            return (
              <motion.div
                key={category}
                className="cursor-pointer"
                whileHover={{ y: -5 }}
                onClick={() => setCurrentCategory(category)}
              >
                <div className={`p-4 rounded-lg bg-white shadow-sm border border-gray-100 flex flex-col items-center`}>
                  <Folder className={`w-16 h-16 mb-2 ${getFolderColor(category).split(" ")[1]}`} />
                  <span className={`font-medium capitalize ${getFolderColor(category).split(" ")[1]}`}>{category}</span>
                  <span className="text-xs opacity-75">{categoryNotes.length} items</span>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    )
  }

  // If category is selected, show files in that folder
  const categoryNotes = getNotesByCategory(currentCategory)

  return (
    <div className="pb-20">
      <div className="mb-4 flex items-center">
        <button
          className="flex items-center text-gray-600 hover:text-gray-900"
          onClick={() => setCurrentCategory(null)}
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          <span>Back to folders</span>
        </button>
        <h2 className="ml-4 text-lg font-medium capitalize">{currentCategory}</h2>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4">
        {categoryNotes.map((note) => (
          <motion.div
            key={note.id}
            className="cursor-pointer"
            whileHover={{ y: -3 }}
            onClick={() => onNoteClick?.(note)}
          >
            <div className="flex flex-col items-center">
              <div className="relative w-16 h-16 mb-2 overflow-hidden rounded-md bg-gray-100 flex items-center justify-center">
                {note.type === "url" || note.type === "media" ? (
                  // <img
                  //   src={note.image || "/placeholder.svg"}
                  //   alt={note.title}
                  //   className="w-full h-full object-cover"
                  //   onError={(e) => {
                  //     e.currentTarget.onerror = null;
                  //     e.currentTarget.src = "/placeholder.svg?height=64&width=64";
                  //   }}
                  // />
                  <img
                    src={note.image || "/placeholder.svg"}
                    alt={note.title}
                    className="w-full h-full object-cover"
                    onError={handleImgError}
                  />
                ) : (
                  getNoteIcon(note)
                )}
                <div className="absolute bottom-0 right-0 p-0.5 bg-white rounded-tl-md">{getNoteIcon(note)}</div>
              </div>
              <span className="text-xs font-medium text-center line-clamp-2">{note.title}</span>
              <span className="text-xs text-gray-500">{abbreviateDate(note.date)}</span>
            </div>
          </motion.div>
        ))}
      </div>

      {categoryNotes.length === 0 && (
        <div className="flex flex-col items-center justify-center h-40 text-center">
          <Info className="w-8 h-8 text-gray-400 mb-2" />
          <div className="text-gray-500">No notes in this folder</div>
        </div>
      )}
    </div>
  )
}
