"use client"

import { useState, useEffect } from "react"
import {
  Brain,
  Lightbulb,
  Target,
  BookOpen,
  Palette,
  User,
  ChevronRight,
  Sparkles,
  TrendingUp,
  ChevronDown,
  Tag,
} from "lucide-react"
import { aiOrganizationEngine, type SmartCollection } from "@/lib/ai/organization-engine"
import type { Note } from "@/lib/data"

interface SmartCollectionsPanelProps {
  notes: Note[]
  onCollectionClick?: (collection: SmartCollection) => void
  isVisible: boolean
}

export function SmartCollectionsPanel({ notes, onCollectionClick, isVisible }: SmartCollectionsPanelProps) {
  const [collections, setCollections] = useState<SmartCollection[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedCollection, setSelectedCollection] = useState<SmartCollection | null>(null)
  const [isMoreExpanded, setIsMoreExpanded] = useState(false)

  useEffect(() => {
    if (notes.length > 0 && isVisible) {
      generateCollections()
    }
  }, [notes, isVisible])

  const generateCollections = async () => {
    setIsLoading(true)
    try {
      const smartCollections = await aiOrganizationEngine.generateSmartCollections(notes)
      setCollections(smartCollections)
    } catch (error) {
      console.error("Error generating smart collections:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const getCollectionIcon = (type: SmartCollection["type"]) => {
    switch (type) {
      case "project":
        return <Target className="w-6 h-6 text-blue-500" />
      case "learning":
        return <BookOpen className="w-6 h-6 text-green-500" />
      case "decision":
        return <Brain className="w-6 h-6 text-purple-500" />
      case "creative":
        return <Palette className="w-6 h-6 text-pink-500" />
      case "personal":
        return <User className="w-6 h-6 text-orange-500" />
      default:
        return <Lightbulb className="w-6 h-6 text-yellow-500" />
    }
  }

  const getCollectionGradient = (type: SmartCollection["type"]) => {
    switch (type) {
      case "project":
        return "from-blue-50 to-blue-100 border-blue-200"
      case "learning":
        return "from-green-50 to-green-100 border-green-200"
      case "decision":
        return "from-purple-50 to-purple-100 border-purple-200"
      case "creative":
        return "from-pink-50 to-pink-100 border-pink-200"
      case "personal":
        return "from-orange-50 to-orange-100 border-orange-200"
      default:
        return "from-gray-50 to-gray-100 border-gray-200"
    }
  }

  const getTrendingTags = () => {
    const now = new Date()
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

    const recentNotes = notes.filter((note) => {
      const noteDate = new Date(note.date || note.timestamp)
      return noteDate >= sevenDaysAgo
    })

    const tagCounts: Record<string, number> = {}
    recentNotes.forEach((note) => {
      note.tags?.forEach((tag) => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1
      })
    })

    return Object.entries(tagCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([tag]) => tag)
  }

  if (!isVisible) return null

  return (
    <div className="w-full">
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Brain className="w-12 h-12 text-purple-500 animate-pulse mx-auto mb-4" />
            <p className="text-lg text-gray-600 mb-2">AI is analyzing your notes...</p>
            <p className="text-sm text-gray-500">Discovering patterns and connections</p>
          </div>
        </div>
      ) : collections.length > 0 ? (
        <div className="space-y-6">
          {/* Stats Bar */}
          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl border border-purple-100">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Brain className="w-5 h-5 text-purple-500" />
                <span className="text-sm text-gray-600">Notes Analyzed:</span>
                <span className="text-lg font-semibold text-gray-800">{notes.length}</span>
              </div>
              <div className="h-6 w-px bg-gray-300" />
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-500" />
                <span className="text-sm text-gray-600">AI Collections:</span>
                <span className="text-lg font-semibold text-purple-600">{collections.length}</span>
              </div>
              <div className="h-6 w-px bg-gray-300" />
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-blue-500" />
                <span className="text-sm text-gray-600">Insights Found:</span>
                <span className="text-lg font-semibold text-gray-800">
                  {collections.reduce((acc, c) => acc + c.insights.length, 0)}
                </span>
              </div>
            </div>

            <button
              onClick={() => setIsMoreExpanded(!isMoreExpanded)}
              className="flex items-center gap-2 px-3 py-1.5 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <span className="text-sm font-semibold text-gray-800">MORE</span>
              <ChevronDown
                className={`w-4 h-4 text-gray-600 transition-transform ${isMoreExpanded ? "rotate-180" : ""}`}
              />
            </button>
          </div>

          {isMoreExpanded && (
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <TrendingUp className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <strong className="text-gray-800">Trending Tags:</strong>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {getTrendingTags().map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full text-xs"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <Lightbulb className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <strong className="text-gray-800">Top Collection:</strong>
                      <p className="text-gray-700 mt-1">
                        {collections[0]?.name || "No collections yet"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Collections Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {collections.map((collection) => (
              <div
                key={collection.id}
                className={`p-6 rounded-xl border bg-gradient-to-br ${getCollectionGradient(collection.type)} hover:shadow-lg transition-all cursor-pointer group`}
                onClick={() => {
                  onCollectionClick?.(collection)
                }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-white/80 shadow-sm">
                      {getCollectionIcon(collection.type)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 group-hover:text-purple-600 transition-colors">
                        {collection.name}
                      </h3>
                      <span className="text-xs text-gray-500 capitalize">{collection.type}</span>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-purple-500 group-hover:translate-x-1 transition-all" />
                </div>

                <p className="text-sm text-gray-700 mb-4 line-clamp-2">{collection.description}</p>

                {collection.insights.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs font-medium text-gray-600">
                      <Sparkles className="w-3.5 h-3.5 text-purple-500" />
                      AI Insights
                    </div>
                    <div className="space-y-1">
                      {collection.insights.slice(0, 2).map((insight, i) => (
                        <p key={i} className="text-xs text-gray-600 pl-5 line-clamp-1">
                          {insight}
                        </p>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <Brain className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Collections Yet</h3>
          <p className="text-gray-500 max-w-md mx-auto">
            Add more notes and the AI will automatically discover patterns and create smart collections for you.
          </p>
        </div>
      )}
    </div>
  )
}
