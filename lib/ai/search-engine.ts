// AI-powered semantic search engine
export interface SearchResult {
  note: any
  relevanceScore: number
  matchedFields: string[]
  matchedTerms: string[]
  semanticMatch: boolean
}

export interface SearchSuggestion {
  text: string
  type: "tag" | "category" | "content" | "recent"
  count?: number
}

class AISearchEngine {
  private searchHistory: string[] = []
  private commonQueries: Map<string, number> = new Map()

  // Semantic search using AI-like understanding
  async semanticSearch(query: string, notes: any[]): Promise<SearchResult[]> {
    if (!query.trim()) return []

    const normalizedQuery = query.toLowerCase().trim()
    const queryTerms = this.extractSearchTerms(normalizedQuery)

    // Track search history
    this.addToSearchHistory(query)

    const results: SearchResult[] = []

    for (const note of notes) {
      const result = this.analyzeNoteRelevance(note, normalizedQuery, queryTerms)
      if (result.relevanceScore > 0) {
        results.push(result)
      }
    }

    // Sort by relevance score (highest first)
    return results.sort((a, b) => b.relevanceScore - a.relevanceScore)
  }

  // Generate smart search suggestions
  generateSuggestions(query: string, notes: any[]): SearchSuggestion[] {
    const suggestions: SearchSuggestion[] = []
    const normalizedQuery = query.toLowerCase().trim()

    if (!normalizedQuery) {
      // Show recent searches and popular tags when no query
      return this.getDefaultSuggestions(notes)
    }

    // Tag suggestions
    const tagSuggestions = this.getTagSuggestions(normalizedQuery, notes)
    suggestions.push(...tagSuggestions)

    // Category suggestions
    const categorySuggestions = this.getCategorySuggestions(normalizedQuery, notes)
    suggestions.push(...categorySuggestions)

    // Content-based suggestions
    const contentSuggestions = this.getContentSuggestions(normalizedQuery, notes)
    suggestions.push(...contentSuggestions)

    // Recent search suggestions
    const recentSuggestions = this.getRecentSearchSuggestions(normalizedQuery)
    suggestions.push(...recentSuggestions)

    return suggestions.slice(0, 8) // Limit to 8 suggestions
  }

  private analyzeNoteRelevance(note: any, query: string, queryTerms: string[]): SearchResult {
    let relevanceScore = 0
    const matchedFields: string[] = []
    const matchedTerms: string[] = []
    let semanticMatch = false

    // Exact title match (highest priority)
    if (note.title.toLowerCase().includes(query)) {
      relevanceScore += 100
      matchedFields.push("title")
      semanticMatch = true
    }

    // Title word matches
    for (const term of queryTerms) {
      if (note.title.toLowerCase().includes(term)) {
        relevanceScore += 50
        matchedTerms.push(term)
        if (!matchedFields.includes("title")) matchedFields.push("title")
      }
    }

    // Tag matches (high priority)
    for (const tag of note.tags) {
      if (tag.toLowerCase().includes(query)) {
        relevanceScore += 80
        matchedFields.push("tags")
        semanticMatch = true
      }

      for (const term of queryTerms) {
        if (tag.toLowerCase().includes(term)) {
          relevanceScore += 40
          matchedTerms.push(term)
          if (!matchedFields.includes("tags")) matchedFields.push("tags")
        }
      }
    }

    // Category match
    if (note.category.toLowerCase().includes(query)) {
      relevanceScore += 60
      matchedFields.push("category")
      semanticMatch = true
    }

    for (const term of queryTerms) {
      if (note.category.toLowerCase().includes(term)) {
        relevanceScore += 30
        matchedTerms.push(term)
        if (!matchedFields.includes("category")) matchedFields.push("category")
      }
    }

    // Semantic understanding for common concepts
    const semanticScore = this.calculateSemanticScore(query, queryTerms, note)
    relevanceScore += semanticScore
    if (semanticScore > 0) {
      semanticMatch = true
      matchedFields.push("semantic")
    }

    // Date relevance (recent notes get slight boost)
    const dateBoost = this.calculateDateRelevance(note.date)
    relevanceScore += dateBoost

    return {
      note,
      relevanceScore,
      matchedFields: [...new Set(matchedFields)],
      matchedTerms: [...new Set(matchedTerms)],
      semanticMatch,
    }
  }

  private calculateSemanticScore(query: string, queryTerms: string[], note: any): number {
    let score = 0

    // Semantic mappings for common concepts
    const semanticMappings = {
      work: ["project", "meeting", "client", "business", "office", "task", "deadline"],
      learning: ["study", "course", "education", "tutorial", "skill", "practice"],
      health: ["fitness", "exercise", "diet", "wellness", "medical", "workout"],
      travel: ["trip", "vacation", "journey", "destination", "flight", "hotel"],
      food: ["recipe", "cooking", "meal", "ingredient", "restaurant", "dinner"],
      tech: ["programming", "code", "software", "development", "computer", "app"],
      money: ["finance", "budget", "expense", "investment", "saving", "cost"],
      creative: ["design", "art", "writing", "inspiration", "ideas", "photography"],
      shopping: ["buy", "purchase", "store", "product", "price", "deal"],
      home: ["house", "renovation", "decoration", "furniture", "garden", "cleaning"],
    }

    // Check if query matches semantic concepts
    for (const [concept, relatedTerms] of Object.entries(semanticMappings)) {
      if (query.includes(concept) || queryTerms.some((term) => relatedTerms.includes(term))) {
        // Check if note contains related terms
        const noteText = `${note.title} ${note.tags.join(" ")} ${note.category}`.toLowerCase()

        for (const relatedTerm of relatedTerms) {
          if (noteText.includes(relatedTerm)) {
            score += 20
          }
        }

        // Check if note category or tags match the concept
        if (note.category.toLowerCase() === concept || note.tags.some((tag: string) => tag.toLowerCase() === concept)) {
          score += 30
        }
      }
    }

    // Intent-based search understanding
    const intentPatterns = {
      "how to": ["tutorial", "guide", "education", "learning"],
      best: ["recommendation", "top", "favorite", "good"],
      "ideas for": ["inspiration", "creative", "brainstorm", "planning"],
      "list of": ["collection", "items", "resources", "links"],
    }

    for (const [intent, keywords] of Object.entries(intentPatterns)) {
      if (query.includes(intent)) {
        const noteText = `${note.title} ${note.tags.join(" ")}`.toLowerCase()
        for (const keyword of keywords) {
          if (noteText.includes(keyword)) {
            score += 15
          }
        }
      }
    }

    return score
  }

  private calculateDateRelevance(dateString: string): number {
    // Parse relative dates and give recent notes a small boost
    if (dateString.includes("hour")) return 5
    if (dateString.includes("day") || dateString === "Yesterday") return 3
    if (dateString.includes("week")) return 2
    if (dateString.includes("month")) return 1
    return 0
  }

  private extractSearchTerms(query: string): string[] {
    // Remove common stop words and extract meaningful terms
    const stopWords = [
      "the",
      "a",
      "an",
      "and",
      "or",
      "but",
      "in",
      "on",
      "at",
      "to",
      "for",
      "of",
      "with",
      "by",
      "is",
      "are",
      "was",
      "were",
    ]

    return query
      .split(/\s+/)
      .filter((term) => term.length > 2 && !stopWords.includes(term))
      .map((term) => term.toLowerCase())
  }

  private getTagSuggestions(query: string, notes: any[]): SearchSuggestion[] {
    const tagCounts = new Map<string, number>()

    // Count tag occurrences
    notes.forEach((note) => {
      note.tags.forEach((tag: string) => {
        tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1)
      })
    })

    // Find matching tags
    const suggestions: SearchSuggestion[] = []
    for (const [tag, count] of tagCounts.entries()) {
      if (tag.toLowerCase().includes(query)) {
        suggestions.push({
          text: tag,
          type: "tag",
          count,
        })
      }
    }

    return suggestions.sort((a, b) => (b.count || 0) - (a.count || 0)).slice(0, 3)
  }

  private getCategorySuggestions(query: string, notes: any[]): SearchSuggestion[] {
    const categoryCounts = new Map<string, number>()

    notes.forEach((note) => {
      categoryCounts.set(note.category, (categoryCounts.get(note.category) || 0) + 1)
    })

    const suggestions: SearchSuggestion[] = []
    for (const [category, count] of categoryCounts.entries()) {
      if (category.toLowerCase().includes(query)) {
        suggestions.push({
          text: category,
          type: "category",
          count,
        })
      }
    }

    return suggestions.sort((a, b) => (b.count || 0) - (a.count || 0)).slice(0, 2)
  }

  private getContentSuggestions(query: string, notes: any[]): SearchSuggestion[] {
    const suggestions: SearchSuggestion[] = []

    // Look for partial title matches
    notes.forEach((note) => {
      if (note.title.toLowerCase().includes(query) && note.title.toLowerCase() !== query) {
        suggestions.push({
          text: note.title,
          type: "content",
        })
      }
    })

    return suggestions.slice(0, 2)
  }

  private getRecentSearchSuggestions(query: string): SearchSuggestion[] {
    return this.searchHistory
      .filter((search) => search.toLowerCase().includes(query) && search.toLowerCase() !== query)
      .slice(-3)
      .map((search) => ({
        text: search,
        type: "recent" as const,
      }))
  }

  private getDefaultSuggestions(notes: any[]): SearchSuggestion[] {
    const suggestions: SearchSuggestion[] = []

    // Most common tags
    const tagCounts = new Map<string, number>()
    notes.forEach((note) => {
      note.tags.forEach((tag: string) => {
        tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1)
      })
    })

    const topTags = Array.from(tagCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([tag, count]) => ({
        text: tag,
        type: "tag" as const,
        count,
      }))

    suggestions.push(...topTags)

    // Recent searches
    const recentSearches = this.searchHistory.slice(-3).map((search) => ({
      text: search,
      type: "recent" as const,
    }))

    suggestions.push(...recentSearches)

    return suggestions
  }

  private addToSearchHistory(query: string) {
    // Add to search history (keep last 20 searches)
    this.searchHistory = this.searchHistory.filter((q) => q !== query)
    this.searchHistory.push(query)
    if (this.searchHistory.length > 20) {
      this.searchHistory = this.searchHistory.slice(-20)
    }

    // Track common queries
    this.commonQueries.set(query, (this.commonQueries.get(query) || 0) + 1)
  }

  // Get search analytics
  getSearchAnalytics() {
    return {
      totalSearches: this.searchHistory.length,
      uniqueQueries: this.commonQueries.size,
      topQueries: Array.from(this.commonQueries.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10),
    }
  }
}

export const aiSearchEngine = new AISearchEngine()
