"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Brain, Link2, CheckSquare, Clock, TrendingUp, Lightbulb, ArrowRight, Sparkles } from "lucide-react"
import { aiOrganizationEngine, type NoteInsight } from "@/lib/ai/organization-engine"
import type { Note } from "@/lib/data"

interface NoteInsightsPanelProps {
  currentNote: Note | null
  allNotes: Note[]
  onRelatedNoteClick?: (noteId: number) => void
  isVisible: boolean
}

export function NoteInsightsPanel({ currentNote, allNotes, onRelatedNoteClick, isVisible }: NoteInsightsPanelProps) {
  const [insights, setInsights] = useState<NoteInsight[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // Generate insights when current note changes
  useEffect(() => {
    if (currentNote && allNotes.length > 0 && isVisible) {
      generateInsights()
    }
  }, [currentNote, allNotes, isVisible])

  const generateInsights = async () => {
    if (!currentNote) return

    setIsLoading(true)
    try {
      const noteInsights = await aiOrganizationEngine.generateNoteInsights(currentNote, allNotes)
      setInsights(noteInsights)
    } catch (error) {
      console.error("Error generating note insights:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const getInsightIcon = (type: NoteInsight["type"]) => {
    switch (type) {
      case "connection":
        return <Link2 className="w-4 h-4 text-blue-500" />
      case "action":
        return <CheckSquare className="w-4 h-4 text-green-500" />
      case "timing":
        return <Clock className="w-4 h-4 text-purple-500" />
      case "pattern":
        return <TrendingUp className="w-4 h-4 text-orange-500" />
      case "suggestion":
        return <Lightbulb className="w-4 h-4 text-yellow-500" />
      default:
        return <Brain className="w-4 h-4 text-gray-500" />
    }
  }

  const getInsightColor = (type: NoteInsight["type"]) => {
    switch (type) {
      case "connection":
        return "bg-blue-50 border-blue-100"
      case "action":
        return "bg-green-50 border-green-100"
      case "timing":
        return "bg-purple-50 border-purple-100"
      case "pattern":
        return "bg-orange-50 border-orange-100"
      case "suggestion":
        return "bg-yellow-50 border-yellow-100"
      default:
        return "bg-gray-50 border-gray-100"
    }
  }

  if (!isVisible || !currentNote) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 max-w-md"
    >
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-5 h-5 text-blue-500" />
        <h3 className="text-lg font-semibold text-gray-800">Note Insights</h3>
        {isLoading && (
          <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        )}
      </div>

      <div className="mb-4 p-3 bg-gray-50 rounded-lg">
        <h4 className="font-medium text-gray-800 text-sm mb-1">Analyzing</h4>
        <p className="text-sm text-gray-600 truncate">{currentNote.title}</p>
      </div>

      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center justify-center py-8"
          >
            <div className="text-center">
              <Brain className="w-8 h-8 text-blue-500 animate-pulse mx-auto mb-2" />
              <p className="text-sm text-gray-600">Analyzing connections...</p>
            </div>
          </motion.div>
        ) : insights.length > 0 ? (
          <motion.div
            key="insights"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-3"
          >
            {insights.map((insight, index) => (
              <motion.div
                key={`${insight.type}-${index}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`p-4 rounded-lg border ${getInsightColor(insight.type)} hover:shadow-sm transition-all`}
              >
                <div className="flex items-start gap-3">
                  {getInsightIcon(insight.type)}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-800 text-sm mb-1">{insight.title}</h4>
                    <p className="text-sm text-gray-600 mb-2">{insight.description}</p>

                    {/* Related notes */}
                    {insight.relatedNoteIds.length > 0 && insight.type === "connection" && (
                      <div className="space-y-1">
                        {insight.relatedNoteIds.slice(0, 3).map((noteId) => {
                          const relatedNote = allNotes.find((n) => n.id === noteId)
                          if (!relatedNote) return null

                          return (
                            <button
                              key={noteId}
                              onClick={() => onRelatedNoteClick?.(noteId)}
                              className="flex items-center gap-2 text-xs text-blue-600 hover:text-blue-800 transition-colors group"
                            >
                              <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                              <span className="truncate">{relatedNote.title}</span>
                            </button>
                          )
                        })}
                      </div>
                    )}

                    {/* Action items */}
                    {insight.actionable && (
                      <div className="mt-2 pt-2 border-t border-green-100">
                        <button className="text-xs text-green-700 hover:text-green-800 font-medium transition-colors">
                          Create action item →
                        </button>
                      </div>
                    )}

                    {/* Confidence indicator */}
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-xs text-gray-500 capitalize">{insight.type} insight</span>
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full bg-gray-200">
                          <div
                            className="h-full rounded-full bg-blue-500 transition-all"
                            style={{ width: `${insight.confidence * 100}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-500">{Math.round(insight.confidence * 100)}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center py-8"
          >
            <Brain className="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-500">No insights available for this note</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
