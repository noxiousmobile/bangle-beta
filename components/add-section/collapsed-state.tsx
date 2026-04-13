"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence, type Variants } from "framer-motion"
import { Plus, Search, X, List, LayoutGrid, Table, Folder, Brain, Share2 } from "lucide-react"
import { debounce } from "lodash"
import { useMultiSelect } from "@/components/collaborative/multi-select-provider"

type CollapsedStateProps<TView extends string> = {
  toggleExpanded: (v: boolean) => void
  onSearch?: (s: string) => void
  handleSwipe?: (e: MouseEvent | TouchEvent | PointerEvent, info: any) => void
  onViewChange?: (view: TView) => void
  currentView?: TView
  onShare?: () => void
}

export function CollapsedState<TView extends string>({
  toggleExpanded,
  onSearch,
  handleSwipe,
  onViewChange,
  currentView,
  onShare,
}: CollapsedStateProps<TView>) {
  const [isSearchExpanded, setIsSearchExpanded] = useState(false)
  const [isViewExpanded, setIsViewExpanded] = useState(false)
  const [isMultiSelectExpanded, setIsMultiSelectExpanded] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [activeView, setActiveView] = useState<any>(currentView)
  const { isMultiSelectMode, toggleMultiSelectMode, selectedNotes } = useMultiSelect()

  useEffect(() => {
    if (isMultiSelectMode && selectedNotes.length > 0 && !isMultiSelectExpanded) {
      setIsMultiSelectExpanded(true)
    }
  }, [isMultiSelectMode, selectedNotes.length, isMultiSelectExpanded])

  const debouncedSearch = useCallback(
    debounce((term: string) => {
      if (onSearch) {
        onSearch(term)
      }
    }, 300),
    [onSearch],
  )

  useEffect(() => {
    setActiveView(currentView)
  }, [currentView])

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchTerm(value)
    debouncedSearch(value)
  }

  const handleCloseSearch = (e: React.MouseEvent) => {
    e.stopPropagation()
    setSearchTerm("")
    setIsSearchExpanded(false)
    if (onSearch) {
      onSearch("")
    }
  }

  const handleViewChange = (view: any) => {
    setActiveView(view)
    setIsViewExpanded(false)
    if (onViewChange) {
      onViewChange(view)
    }
  }

  const handleCloseView = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsViewExpanded(false)
  }

  const handleCloseMultiSelect = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsMultiSelectExpanded(false)
    if (isMultiSelectMode) {
      toggleMultiSelectMode()
    }
  }

  useEffect(() => {
    return () => {
      debouncedSearch.cancel()
    }
  }, [debouncedSearch])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement

      const isClickingOnNote = target.closest("[data-note-card]") || target.closest(".note-card")

      if (
        isSearchExpanded ||
        isViewExpanded ||
        (isMultiSelectExpanded && !(isMultiSelectMode && selectedNotes.length > 0 && isClickingOnNote))
      ) {
        if (
          !target.closest(".search-container") &&
          !target.closest(".view-container") &&
          !target.closest(".multi-select-container")
        ) {
          setIsSearchExpanded(false)
          setIsViewExpanded(false)
        }
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isSearchExpanded, isViewExpanded, isMultiSelectExpanded, isMultiSelectMode, selectedNotes.length])

  const buttonVariants: Variants = {
    initial: { scale: 0.8, opacity: 0 },
    animate: {
      scale: 1,
      opacity: 1,
      transition: { type: "spring", stiffness: 400, damping: 15, delay: 0.1 },
    },
    exit: { scale: 0.8, opacity: 0, transition: { duration: 0.2 } },
  }

  const expandedVariants: Variants = {
    collapsed: {
      width: 40, // px
      opacity: 0,
    },
    expanded: {
      width: 320, // px
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 25,
      },
    },
  }

  const handlePlusButtonClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    toggleExpanded(false) // This should expand the bottom panel
  }

  return (
    <motion.div
      className="relative w-full h-full max-h-[80px] flex flex-col items-center justify-center"
      style={{
        background:
          "radial-gradient(ellipse at center bottom, hsl(var(--primary) / 0.25) -10%, hsl(var(--primary) / 0.08) 20%, hsl(var(--primary) / 0.02) 50%, hsl(var(--primary) / 0) 70%)",
        boxShadow: "inset 0 -10px 30px -10px hsl(var(--primary) / 0.15)",
      }}
      drag="y"
      dragConstraints={{ top: 0, bottom: 0 }}
      dragElastic={0.1}
      onDragEnd={handleSwipe}
      dragMomentum={false}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      onClick={(e) => {
        e.stopPropagation()
      }}
    >
      <motion.div
        key="button-container"
        className="flex justify-center items-center space-x-4 relative z-10"
        variants={buttonVariants}
        initial="initial"
        animate="animate"
        exit="exit"
      >
        {!isSearchExpanded && !isViewExpanded && !isMultiSelectExpanded && (
          <>
            <motion.button
              className="w-12 h-12 rounded-full bg-background shadow-[0_0_10px_rgba(0,0,0,0.08)] flex items-center justify-center border border-border"
              whileHover={{ scale: 1.05, boxShadow: "0 0 15px rgba(0,0,0,0.12)" }}
              whileTap={{ scale: 0.95 }}
              onClick={(e) => {
                e.stopPropagation()
                setIsViewExpanded(true)
              }}
              aria-label="Change view"
            >
              <List className="w-5 h-5 text-foreground" />
            </motion.button>

            <motion.button
              className="w-12 h-12 rounded-full bg-primary shadow-md flex items-center justify-center"
              whileHover={{ scale: 1.05, boxShadow: "0 10px 25px rgba(0,0,0,0.1)" }}
              whileTap={{ scale: 0.95 }}
              onClick={handlePlusButtonClick}
            >
              <Plus className="w-6 h-6 text-primary-foreground" />
            </motion.button>

            <motion.button
              className="w-12 h-12 rounded-full bg-background shadow-[0_0_10px_rgba(0,0,0,0.08)] flex items-center justify-center border border-border"
              whileHover={{ scale: 1.05, boxShadow: "0 0 15px rgba(0,0,0,0.12)" }}
              whileTap={{ scale: 0.95 }}
              onClick={(e) => {
                e.stopPropagation()
                setIsSearchExpanded(true)
              }}
            >
              <Search className="w-5 h-5 text-foreground" />
            </motion.button>
          </>
        )}

        <AnimatePresence mode="wait">
          {isViewExpanded ? (
            <motion.div
              key="expanded-view"
              className="relative flex items-center z-10 view-container"
              initial="collapsed"
              animate="expanded"
              exit="collapsed"
              variants={expandedVariants}
            >
              <div className="w-full h-12 px-1 rounded-full bg-background shadow-sm flex items-center justify-between border border-border">
                <button
                  className={`flex items-center justify-center gap-1 px-2 py-1.5 rounded-full transition-colors ${
                    activeView === "grid" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted"
                  }`}
                  onClick={(e) => {
                    e.stopPropagation()
                    handleViewChange("grid")
                  }}
                >
                  <LayoutGrid className="w-4 h-4" />
                  <span className="text-sm font-medium">Grid</span>
                </button>

                <button
                  className={`flex items-center justify-center gap-1 px-2 py-1.5 rounded-full transition-colors ${
                    activeView === "table" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted"
                  }`}
                  onClick={(e) => {
                    e.stopPropagation()
                    handleViewChange("table")
                  }}
                >
                  <Table className="w-4 h-4" />
                  <span className="text-sm font-medium">Table</span>
                </button>

                <button
                  className={`flex items-center justify-center gap-1 px-2 py-1.5 rounded-full transition-colors ${
                    activeView === "folder" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted"
                  }`}
                  onClick={(e) => {
                    e.stopPropagation()
                    handleViewChange("folder")
                  }}
                >
                  <Folder className="w-4 h-4" />
                  <span className="text-sm font-medium">Folder</span>
                </button>

                <button
                  className={`flex items-center justify-center gap-1 px-2 py-1.5 rounded-full transition-colors ${
                    activeView === "collections"
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground hover:bg-muted"
                  }`}
                  onClick={(e) => {
                    e.stopPropagation()
                    handleViewChange("collections")
                  }}
                >
                  <Brain className="w-4 h-4" />
                  <span className="text-sm font-medium">AI</span>
                </button>

                <button
                  className="absolute -right-10 w-8 h-8 rounded-full bg-background border border-border shadow-sm flex items-center justify-center"
                  onClick={handleCloseView}
                >
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>
            </motion.div>
          ) : isSearchExpanded ? (
            <motion.div
              key="expanded-search"
              className="relative flex items-center z-10 search-container"
              initial="collapsed"
              animate="expanded"
              exit="collapsed"
              variants={expandedVariants}
            >
              <input
                type="text"
                className="w-full h-12 pl-10 pr-10 rounded-full bg-background shadow-sm text-sm text-foreground border border-border focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                placeholder="Search notes, tags or anything"
                value={searchTerm}
                onChange={handleSearchChange}
                autoFocus
                onClick={(e) => e.stopPropagation()}
                onKeyDown={(e) => {
                  if (e.key === "Escape") {
                    handleCloseSearch(e as unknown as React.MouseEvent)
                  }
                }}
              />
              <div className="absolute left-3 text-muted-foreground">
                <Search className="w-5 h-5" />
              </div>
              <button
                className="absolute -right-10 w-8 h-8 rounded-full bg-background border border-border shadow-sm flex items-center justify-center"
                onClick={handleCloseSearch}
              >
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </motion.div>
          ) : isMultiSelectExpanded ? (
            <motion.div
              key="expanded-multi-select"
              className="relative flex items-center z-10 multi-select-container"
              initial="collapsed"
              animate="expanded"
              exit="collapsed"
              variants={expandedVariants}
            >
              <div className="w-full h-12 px-4 rounded-full bg-background shadow-sm flex items-center justify-between border border-border">
                <span className="text-sm font-medium text-foreground">{selectedNotes.length} Selected</span>
                <button
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    selectedNotes.length > 0
                      ? "bg-primary text-primary-foreground hover:bg-primary/90"
                      : "bg-muted text-muted-foreground cursor-not-allowed"
                  }`}
                  onClick={(e) => {
                    e.stopPropagation()
                    console.log(
                      "Share button clicked, selectedNotes.length:",
                      selectedNotes.length,
                      "onShare function:",
                      onShare,
                    )
                    if (selectedNotes.length > 0) {
                      onShare?.()
                    }
                  }}
                  disabled={selectedNotes.length === 0}
                >
                  <Share2 className="w-4 h-4 inline-block mr-1" />
                  Share
                </button>
              </div>
              <button
                className="absolute -right-10 w-8 h-8 rounded-full bg-background border border-border shadow-sm flex items-center justify-center"
                onClick={handleCloseMultiSelect}
              >
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  )
}
