"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Search, X, Clock, Tag, Folder, FileText, TrendingUp } from "lucide-react"
import { aiSearchEngine, type SearchSuggestion } from "@/lib/ai/search-engine"
import type { Note } from "@/lib/data"

interface AISearchBarProps {
  onSearch: (query: string) => void
  notes: Note[]
  placeholder?: string
  value?: string
  onChange?: (value: string) => void
}

export function AISearchBar({
  onSearch,
  notes,
  placeholder = "Search any text, tags or context...", // Updated placeholder text
  value: controlledValue,
  onChange: controlledOnChange,
}: AISearchBarProps) {
  const [query, setQuery] = useState(controlledValue || "")
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1)
  const [isLoading, setIsLoading] = useState(false)

  const inputRef = useRef<HTMLInputElement>(null)
  const suggestionsRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowSuggestions(false)
        setSelectedSuggestionIndex(-1)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Sync with controlled value
  useEffect(() => {
    if (controlledValue !== undefined) {
      setQuery(controlledValue)
    }
  }, [controlledValue])

  // Generate suggestions when query changes
  useEffect(() => {
    const generateSuggestions = async () => {
      const newSuggestions = aiSearchEngine.generateSuggestions(query, notes)
      setSuggestions(newSuggestions)
      setShowSuggestions(newSuggestions.length > 0 && query.length > 0)
      setSelectedSuggestionIndex(-1)
    }

    generateSuggestions()
  }, [query, notes])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setQuery(value)
    if (controlledOnChange) {
      controlledOnChange(value)
    }
  }

  const handleSearch = async (searchQuery: string = query) => {
    if (!searchQuery.trim()) return

    setIsLoading(true)
    setShowSuggestions(false)

    // Simulate AI processing delay for better UX
    await new Promise((resolve) => setTimeout(resolve, 300))

    onSearch(searchQuery.trim())
    setIsLoading(false)
  }

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    setQuery(suggestion.text)
    if (controlledOnChange) {
      controlledOnChange(suggestion.text)
    }
    handleSearch(suggestion.text)
  }

  const handleClear = () => {
    setQuery("")
    if (controlledOnChange) {
      controlledOnChange("")
    }
    onSearch("")
    setShowSuggestions(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setShowSuggestions(false)
      setSelectedSuggestionIndex(-1)
      return
    }

    if (e.key === "Enter") {
      if (selectedSuggestionIndex >= 0 && suggestions[selectedSuggestionIndex]) {
        handleSuggestionClick(suggestions[selectedSuggestionIndex])
      } else {
        handleSearch()
      }
      return
    }

    if (e.key === "ArrowDown") {
      e.preventDefault()
      setSelectedSuggestionIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : prev))
      return
    }

    if (e.key === "ArrowUp") {
      e.preventDefault()
      setSelectedSuggestionIndex((prev) => (prev > 0 ? prev - 1 : -1))
      return
    }
  }

  const getSuggestionIcon = (type: SearchSuggestion["type"]) => {
    switch (type) {
      case "tag":
        return <Tag className="w-4 h-4 text-blue-500" />
      case "category":
        return <Folder className="w-4 h-4 text-purple-500" />
      case "content":
        return <FileText className="w-4 h-4 text-green-500" />
      case "recent":
        return <Clock className="w-4 h-4 text-gray-500" />
      default:
        return <Search className="w-4 h-4 text-gray-400" />
    }
  }

  const getSuggestionLabel = (type: SearchSuggestion["type"]) => {
    switch (type) {
      case "tag":
        return "Tag"
      case "category":
        return "Category"
      case "content":
        return "Note"
      case "recent":
        return "Recent"
      default:
        return ""
    }
  }

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Search Input */}
      <div className="relative">
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 z-10">
          {isLoading ? (
            <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          ) : (
            <Search className="w-4 h-4 text-gray-400" />
          )}
        </div>

        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setShowSuggestions(suggestions.length > 0 && query.length > 0)}
          placeholder={placeholder}
          className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />

        {query && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Suggestions Dropdown */}
      <AnimatePresence>
        {showSuggestions && suggestions.length > 0 && (
          <motion.div
            ref={suggestionsRef}
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-xl z-[9999] overflow-hidden"
          >
            <div className="p-2">
              <div className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-gray-500 border-b border-gray-100">
                <TrendingUp className="w-3 h-3" />
                Smart Suggestions
              </div>

              {suggestions.map((suggestion, index) => (
                <motion.button
                  key={`${suggestion.type}-${suggestion.text}`}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className={`w-full flex items-center gap-3 px-3 py-3 text-left hover:bg-gray-50 rounded-lg transition-colors ${
                    selectedSuggestionIndex === index ? "bg-blue-50 border-blue-200" : ""
                  }`}
                >
                  {getSuggestionIcon(suggestion.type)}
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 truncate">{suggestion.text}</div>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span>{getSuggestionLabel(suggestion.type)}</span>
                      {suggestion.count && (
                        <>
                          <span>•</span>
                          <span>{suggestion.count} notes</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="text-xs text-gray-400">↵</div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
