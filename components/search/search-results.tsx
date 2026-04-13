"use client"

import type React from "react"

import { motion, AnimatePresence } from "framer-motion"
import { Search, Sparkles, Target, Clock, FileText, TrendingUp } from "lucide-react"
import NoteCard from "@/components/note-card"
import type { SearchResult } from "@/lib/ai/search-engine"
import { findRelatedNotes } from "@/lib/data"

interface SearchResultsProps {
  results: SearchResult[]
  query: string
  isLoading: boolean
  onNoteClick?: (note: any) => void
  onTagClick?: (tag: string) => void
}

export function SearchResults({ results, query, isLoading, onNoteClick, onTagClick }: SearchResultsProps) {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin" />
          <Sparkles className="w-6 h-6 text-blue-500 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
        </div>
        <p className="text-lg text-gray-600 mt-4">AI is searching...</p>
        <p className="text-sm text-gray-500">Finding the most relevant results</p>
      </div>
    )
  }

  if (!query.trim()) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <Search className="w-16 h-16 text-gray-300 mb-4" />
        <h3 className="text-xl font-semibold text-gray-600 mb-2">Start searching</h3>
        <p className="text-gray-500 max-w-md">
          Use natural language to find your notes. Try searching for topics, tags, or even asking questions.
        </p>
        <div className="mt-6 grid grid-cols-2 gap-3 text-sm">
          <div className="bg-gray-50 rounded-lg p-3">
            <strong>Examples:</strong>
            <div className="mt-1 text-gray-600">
              "work projects"
              <br />
              "how to cook"
              <br />
              "travel ideas"
            </div>
          </div>
          <div className="bg-blue-50 rounded-lg p-3">
            <strong>AI Features:</strong>
            <div className="mt-1 text-blue-600">
              Semantic search
              <br />
              Smart suggestions
              <br />
              Context understanding
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (results.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <Search className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-xl font-semibold text-gray-600 mb-2">No results found</h3>
        <p className="text-gray-500 max-w-md mb-6">
          We couldn't find any notes matching "<strong>{query}</strong>". Try different keywords or check your spelling.
        </p>
        <div className="bg-blue-50 rounded-lg p-4 max-w-md">
          <h4 className="font-medium text-blue-900 mb-2">Search Tips:</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Try broader terms</li>
            <li>• Use synonyms or related words</li>
            <li>• Search by category or tags</li>
            <li>• Ask questions naturally</li>
          </ul>
        </div>
      </div>
    )
  }

  // Group results by relevance
  const highRelevance = results.filter((r) => r.relevanceScore >= 80)
  const mediumRelevance = results.filter((r) => r.relevanceScore >= 40 && r.relevanceScore < 80)
  const lowRelevance = results.filter((r) => r.relevanceScore < 40)

  const getMatchBadge = (result: SearchResult) => {
    if (result.semanticMatch) {
      return (
        <div className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
          <Sparkles className="w-3 h-3" />
          AI Match
        </div>
      )
    }

    if (result.relevanceScore >= 80) {
      return (
        <div className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
          <Target className="w-3 h-3" />
          Exact Match
        </div>
      )
    }

    return null
  }

  const renderResultGroup = (groupResults: SearchResult[], title: string, icon: React.ReactNode) => {
    if (groupResults.length === 0) return null

    return (
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          {icon}
          <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
          <span className="text-sm text-gray-500">({groupResults.length})</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {groupResults.map((result, index) => (
            <motion.div
              key={result.note.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="relative"
            >
              {/* Match information overlay */}
              <div className="absolute top-2 left-2 z-10 flex flex-col gap-1">
                {getMatchBadge(result)}
                {result.matchedFields.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {result.matchedFields.map((field) => (
                      <span key={field} className="px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                        {field}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <NoteCard
                note={result.note}
                relatedNotes={findRelatedNotes(result.note.id)}
                onTagClick={onTagClick}
                onNoteClick={onNoteClick}
              />

              {/* Relevance score for debugging (can be removed in production) */}
              <div className="absolute bottom-2 right-2 px-2 py-1 bg-gray-800 text-white text-xs rounded">
                {Math.round(result.relevanceScore)}%
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Search Summary */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-100">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl font-semibold text-gray-800">Search Results for "{query}"</h2>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <TrendingUp className="w-4 h-4" />
            <span>{results.length} results found</span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="bg-white rounded-lg p-3">
            <div className="text-2xl font-bold text-green-600">{highRelevance.length}</div>
            <div className="text-sm text-gray-600">Exact Matches</div>
          </div>
          <div className="bg-white rounded-lg p-3">
            <div className="text-2xl font-bold text-blue-600">{mediumRelevance.length}</div>
            <div className="text-sm text-gray-600">Good Matches</div>
          </div>
          <div className="bg-white rounded-lg p-3">
            <div className="text-2xl font-bold text-purple-600">{results.filter((r) => r.semanticMatch).length}</div>
            <div className="text-sm text-gray-600">AI Matches</div>
          </div>
        </div>
      </div>

      {/* Results by relevance */}
      <AnimatePresence>
        {renderResultGroup(highRelevance, "Best Matches", <Target className="w-5 h-5 text-green-500" />)}

        {renderResultGroup(mediumRelevance, "Good Matches", <FileText className="w-5 h-5 text-blue-500" />)}

        {renderResultGroup(lowRelevance, "Other Results", <Clock className="w-5 h-5 text-gray-500" />)}
      </AnimatePresence>
    </div>
  )
}
