"use client"

import { useState, useEffect } from "react"
import { useSpring, useMotionValue, type PanInfo } from "framer-motion"
import { recentNotes } from "@/lib/data"
import { NoteSection } from "@/components/note-section"
import { AddSection } from "@/components/add-section"
import { IndicatorDots } from "@/components/ui/indicator-dots"
import { MultiSelectProvider } from "@/components/collaborative/multi-select-provider"
import { TagVisibilityProvider } from "@/components/tag-visibility-provider"
import { ShareCollectionModal, type ShareCollectionData } from "@/components/collaborative/share-collection-modal"
import { useMultiSelect } from "@/components/collaborative/multi-select-provider"
import { DesktopLayout } from "@/components/layout/desktop-layout"
import type { Note } from "@/lib/data"
import type { ViewMode, Bangle } from "@/lib/types"

function HomeContent() {
  const [expanded, setExpanded] = useState(recentNotes.length > 0) // Set initial expanded state based on notes
  const [isAnimating, setIsAnimating] = useState(false)
  const [bottomState, setBottomState] = useState<"initial" | "options" | "preview" | "text-editor">("initial")
  const [searchTerm, setSearchTerm] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const [notes, setNotes] = useState<any[]>(recentNotes) // Use state for notes
  const [filteredNotes, setFilteredNotes] = useState(notes)
  const [viewMode, setViewMode] = useState<ViewMode>("grid")
  const [isEditorFullscreen, setIsEditorFullscreen] = useState(false)
  const [isShareModalOpen, setIsShareModalOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [singleNoteToShare, setSingleNoteToShare] = useState<Note | null>(null)
  
  // Bangles state
  const [bangles, setBangles] = useState<Bangle[]>([])
  const [selectedBangle, setSelectedBangle] = useState<Bangle | null>(null)

  const { selectedNotes, clearSelection } = useMultiSelect()

  const dragY = useMotionValue(0)

  // Spring animation for smooth transitions
  const springConfig = { stiffness: 300, damping: 30, mass: 0.8 }
  const springY = useSpring(dragY, springConfig)

  // Filter notes based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredNotes(notes)
      setIsSearching(false)
      return
    }

    setIsSearching(true)

    // Simulate a delay for the loading animation
    const timer = setTimeout(() => {
      const lowerSearchTerm = searchTerm.toLowerCase().trim()

      const filtered = notes.filter((note) => {
        // Search in title
        if (note.title.toLowerCase().includes(lowerSearchTerm)) {
          return true
        }

        // Search in tags
        if (note.tags.some((tag: any) => tag.toLowerCase().includes(lowerSearchTerm))) {
          return true
        }

        // Search in category
        if (note.category.toLowerCase().includes(lowerSearchTerm)) {
          return true
        }

        return false
      })

      setFilteredNotes(filtered)
      setIsSearching(false)
    }, 500) // Simulate a 500ms delay for search processing

    return () => clearTimeout(timer)
  }, [searchTerm, notes]) // Add notes as dependency

  // Handle search from collapsed state
  const handleSearch = (term: string) => {
    setSearchTerm(term)
  }

  // Handle view mode change
  const handleViewChange = (view: ViewMode) => {
    setViewMode(view)
    console.log(`View changed to: ${view}`)
  }

  // Handle swipe gesture - now only for closing the panel when expanded
  const handleSwipe = (
    event: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo,
    source: "top" | "bottom" | "divider",
  ) => {
    if (isAnimating) return

    // For bottom section, only handle swipe when expanded to close it
    if (source === "bottom" && expanded) {
      if (info.offset.y > 20) {
        toggleExpanded(false)
      }
      return
    }

    // For top section, only allow swipe when not expanded
    if (source === "top" && !expanded) {
      if (info.offset.y < -20) {
        toggleExpanded(true)
      }
      return
    }

    // For divider, handle both directions
    if (source === "divider") {
      if (info.offset.y < -20 && !expanded) {
        toggleExpanded(true)
      } else if (info.offset.y > 20 && expanded) {
        toggleExpanded(false)
      }
    }

    dragY.set(0)
  }

  // Toggle expanded state with animation lock
  const toggleExpanded = (value: boolean) => {
    if (isAnimating) return

    setIsAnimating(true)
    setExpanded(value)

    // Release animation lock after transition completes
    setTimeout(() => {
      setIsAnimating(false)
    }, 600) // Slightly longer than animation duration to ensure completion
  }

  // Update bottomState handler to set fullscreen state
  const handleBottomStateChange = (state: "initial" | "options" | "preview" | "text-editor") => {
    setBottomState(state)
    // Set fullscreen mode when entering text editor
    setIsEditorFullscreen(state === "text-editor")
  }

  // Handle note saved - add this new function
  const handleNoteSaved = (newNote: Note) => {
    setNotes((prevNotes) => [newNote, ...prevNotes])

    // Reset bottom state first
    setBottomState("initial")
    setIsEditorFullscreen(false)

    // Force the bottom section to collapse and top section to expand
    // Use a small delay to ensure state updates are processed
    setTimeout(() => {
      toggleExpanded(true)
    }, 100)
  }

  // Handle individual note deletion
  const handleNoteDelete = (noteId: number) => {
    setNotes((prevNotes) => prevNotes.filter((note) => note.id !== noteId))
    console.log(`Note ${noteId} deleted`)
  }

  // Handle sharing
  const handleShare = () => {
    setIsShareModalOpen(true)
  }

  const handleShareComplete = (shareData: ShareCollectionData) => {
    console.log("Sharing collection:", shareData)
    // In a real app, this would send the data to your backend
    clearSelection()
    setIsShareModalOpen(false)
  }

  // Handle multi-select delete (different from individual note delete)
  const handleMultiSelectDelete = () => {
    const selectedIds = selectedNotes.map((n) => n.id)
    setNotes((prevNotes) => prevNotes.filter((note) => !selectedIds.includes(note.id)))
    console.log("Deleted notes:", selectedIds)
    clearSelection()
  }

  const handleArchive = () => {
    console.log(
      "Archiving notes:",
      selectedNotes.map((n) => n.id),
    )
    // In a real app, this would archive the selected notes
    clearSelection()
  }

  // Handle sharing a single note from preview
  const handleShareSingleNote = (note: Note) => {
    // Temporarily set the selected notes to just this one note
    // We'll need to use the MultiSelectProvider's methods
    // For now, we'll open the modal with just this note
    setIsShareModalOpen(true)
    // Store the note to share in state
    setSingleNoteToShare(note)
  }

  // Bangle handlers
  const handleCreateBangle = (bangle: Bangle) => {
    setBangles((prev) => [bangle, ...prev])
    setSelectedBangle(bangle)
  }

  const handleDeleteBangle = (bangleId: string) => {
    setBangles((prev) => prev.filter((b) => b.id !== bangleId))
    if (selectedBangle?.id === bangleId) {
      setSelectedBangle(null)
    }
  }

  const handleUpdateBangle = (updatedBangle: Bangle) => {
    setBangles((prev) => prev.map((b) => (b.id === updatedBangle.id ? updatedBangle : b)))
    if (selectedBangle?.id === updatedBangle.id) {
      setSelectedBangle(updatedBangle)
    }
  }

  const handleSelectBangle = (bangle: Bangle) => {
    setSelectedBangle(bangle)
  }

  const handleCloseBangle = () => {
    setSelectedBangle(null)
  }

  // Prevent scrolling on the body
  useEffect(() => {
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = ""
    }
  }, [])

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 640) // sm breakpoint - true mobile only
    }

    checkScreenSize()
    window.addEventListener("resize", checkScreenSize)
    return () => window.removeEventListener("resize", checkScreenSize)
  }, [])

  return (
    <>
      {isMobile ? (
        // Mobile/Tablet Layout (existing)
        <main className="relative h-screen overflow-hidden bg-white">
          {/* Top section - Recent Notes - Now takes full height */}
          <div className="absolute inset-0 w-full h-full">
            <NoteSection
              notes={filteredNotes}
              expanded={expanded}
              toggleExpanded={toggleExpanded}
              isAnimating={isAnimating}
              springY={springY}
              handleSwipe={handleSwipe}
              isSearching={isSearching}
              searchTerm={searchTerm}
              viewMode={viewMode}
              onNoteDelete={handleNoteDelete}
              onShareNote={handleShareSingleNote}
            />
          </div>

          {/* Indicator dots - only show in default 50/50 state and when no content is being edited */}
          <div className="absolute right-4 top-1/2 transform -translate-y-1/2 z-30">
            <IndicatorDots expanded={expanded} toggleExpanded={toggleExpanded} bottomState={bottomState} />
          </div>

          {/* Bottom section - Add or Paste - Now positioned absolutely with max-height for collapsed state */}
          <div
            className={`absolute bottom-0 left-0 right-0 transition-all duration-500 ease-in-out pointer-events-none ${
              isEditorFullscreen
                ? "h-screen top-0" // Full height when editor is active
                : expanded
                  ? "h-[80px]" // Back to original height
                  : "h-[50vh]"
            }`}
          >
            {/* Add the radial glow effect for the collapsed state */}
            {expanded && (
              <div
                className="absolute inset-x-0 bottom-0 z-0"
                style={{
                  height: "80px",
                  background: "linear-gradient(to top, rgba(100, 149, 237, 0.15) 0%, rgba(100, 149, 237, 0) 100%)",
                  pointerEvents: "none",
                }}
              ></div>
            )}

            <AddSection
              expanded={expanded}
              toggleExpanded={toggleExpanded}
              isAnimating={isAnimating}
              handleSwipe={handleSwipe}
              onStateChange={handleBottomStateChange}
              onSearch={handleSearch}
              onViewChange={handleViewChange}
              currentView={viewMode}
              notes={notes} // Pass the state notes array
              className={`h-full ${!expanded ? "frosted-glass-bottom" : ""} pointer-events-auto`}
              isFullscreen={isEditorFullscreen}
              onShare={handleShare}
              onNoteSaved={handleNoteSaved} // Pass the callback
            />
          </div>
        </main>
      ) : (
        // Desktop Layout (new)
        <DesktopLayout
          notes={notes}
          filteredNotes={filteredNotes}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          isSearching={isSearching}
          viewMode={viewMode}
          onViewChange={handleViewChange}
          onNoteDelete={handleNoteDelete}
          onNoteSaved={handleNoteSaved}
          onShare={handleShare}
          onShareNote={handleShareSingleNote}
          bangles={bangles}
          selectedBangle={selectedBangle}
          onCreateBangle={handleCreateBangle}
          onDeleteBangle={handleDeleteBangle}
          onUpdateBangle={handleUpdateBangle}
          onSelectBangle={handleSelectBangle}
          onCloseBangle={handleCloseBangle}
        />
      )}

      {/* Share collection modal */}
      <ShareCollectionModal
        isOpen={isShareModalOpen}
        onClose={() => {
          setIsShareModalOpen(false)
          setSingleNoteToShare(null)
        }}
        selectedNotes={singleNoteToShare ? [singleNoteToShare] : selectedNotes}
        onShare={handleShareComplete}
      />
    </>
  )
}

export default function Home() {
  return (
    <TagVisibilityProvider>
      <MultiSelectProvider>
        <HomeContent />
      </MultiSelectProvider>
    </TagVisibilityProvider>
  )
}
