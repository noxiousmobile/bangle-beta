"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Brain, X, Sparkles, BarChart3, Lightbulb } from "lucide-react"
import { SmartCollectionsPanel } from "./smart-collections-panel"
import { NoteInsightsPanel } from "./note-insights-panel"
import type { Note } from "@/lib/data"
import type { SmartCollection } from "@/lib/ai/organization-engine"

interface AIOrganizationHubProps {
  notes: Note[]
  currentNote?: Note | null
  isVisible: boolean
  onToggle: () => void
  onCollectionClick?: (collection: SmartCollection) => void
  onRelatedNoteClick?: (noteId: number) => void
}

export function AIOrganizationHub({
  notes,
  currentNote,
  isVisible,
  onToggle,
  onCollectionClick,
  onRelatedNoteClick,
}: AIOrganizationHubProps) {
  const [activeTab, setActiveTab] = useState<"collections" | "insights">("collections")

  return (
    <>
      {/* AI Hub Toggle Button */}
      <motion.button
        className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full shadow-lg flex items-center justify-center z-50 hover:shadow-xl transition-all"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onToggle}
      >
        <AnimatePresence mode="wait">
          {isVisible ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <X className="w-6 h-6 text-white" />
            </motion.div>
          ) : (
            <motion.div
              key="brain"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Brain className="w-6 h-6 text-white" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* AI Hub Panel */}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="fixed bottom-24 right-6 z-40"
          >
            <div className="bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden max-w-md w-80">
              {/* Header with tabs */}
              <div className="bg-gradient-to-r from-purple-500 to-blue-500 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="w-5 h-5 text-white" />
                  <h2 className="text-lg font-semibold text-white">AI Organization</h2>
                </div>

                <div className="flex bg-white/20 rounded-lg p-1">
                  <button
                    className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md text-sm font-medium transition-all ${
                      activeTab === "collections"
                        ? "bg-white text-purple-600 shadow-sm"
                        : "text-white/80 hover:text-white"
                    }`}
                    onClick={() => setActiveTab("collections")}
                  >
                    <BarChart3 className="w-4 h-4" />
                    Collections
                  </button>
                  <button
                    className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md text-sm font-medium transition-all ${
                      activeTab === "insights" ? "bg-white text-purple-600 shadow-sm" : "text-white/80 hover:text-white"
                    }`}
                    onClick={() => setActiveTab("insights")}
                  >
                    <Lightbulb className="w-4 h-4" />
                    Insights
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="max-h-96 overflow-y-auto">
                <AnimatePresence mode="wait">
                  {activeTab === "collections" ? (
                    <motion.div
                      key="collections"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.2 }}
                    >
                      <SmartCollectionsPanel notes={notes} onCollectionClick={onCollectionClick} isVisible={true} />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="insights"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.2 }}
                    >
                      <NoteInsightsPanel
                        currentNote={currentNote || null}
                        allNotes={notes}
                        onRelatedNoteClick={onRelatedNoteClick}
                        isVisible={true}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
