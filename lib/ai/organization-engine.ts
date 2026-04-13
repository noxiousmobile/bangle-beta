// AI-powered note organization engine
export interface SmartCollection {
  id: string
  name: string
  description: string
  noteIds: number[]
  confidence: number
  type: "project" | "learning" | "decision" | "reference" | "creative" | "personal"
  createdAt: Date
  insights: string[]
}

export interface NoteInsight {
  type: "connection" | "action" | "pattern" | "suggestion" | "timing"
  title: string
  description: string
  relatedNoteIds: number[]
  confidence: number
  actionable?: boolean
}

export interface NoteRelationship {
  fromNoteId: number
  toNoteId: number
  relationshipType: "similar_topic" | "builds_on" | "contradicts" | "references" | "temporal"
  strength: number
  explanation: string
}

class AIOrganizationEngine {
  // Analyze notes and create smart collections
  async generateSmartCollections(notes: any[]): Promise<SmartCollection[]> {
    const collections: SmartCollection[] = []

    // 1. Project-based collections
    const projectCollections = this.detectProjectCollections(notes)
    collections.push(...projectCollections)

    // 2. Learning journey collections
    const learningCollections = this.detectLearningJourneys(notes)
    collections.push(...learningCollections)

    // 3. Decision-making collections
    const decisionCollections = this.detectDecisionPoints(notes)
    collections.push(...decisionCollections)

    // 4. Creative collections
    const creativeCollections = this.detectCreativeThemes(notes)
    collections.push(...creativeCollections)

    return collections.sort((a, b) => b.confidence - a.confidence)
  }

  // Detect project-related note clusters
  private detectProjectCollections(notes: any[]): SmartCollection[] {
    const collections: SmartCollection[] = []

    // Group notes by potential projects
    const projectKeywords = ["project", "build", "create", "develop", "design", "plan", "implement", "development"]
    const workNotes = notes.filter(
      (note) =>
        note.category === "work" ||
        note.category === "tech" ||
        projectKeywords.some(
          (keyword) =>
            note.title.toLowerCase().includes(keyword) ||
            note.tags.some((tag: string) => tag.toLowerCase().includes(keyword)),
        ),
    )

    if (workNotes.length >= 2) {
      // Reduced from 3 to 2
      // Cluster by similar technologies/topics
      const techClusters = this.clusterByTechnology(workNotes)

      techClusters.forEach((cluster) => {
        if (cluster.notes.length >= 2) {
          collections.push({
            id: `project-${cluster.technology}`,
            name: `${cluster.technology.charAt(0).toUpperCase() + cluster.technology.slice(1)} Project`,
            description: `Notes related to ${cluster.technology} development and planning`,
            noteIds: cluster.notes.map((n) => n.id),
            confidence: Math.min(0.95, 0.7 + cluster.notes.length * 0.1),
            type: "project",
            createdAt: new Date(),
            insights: [
              `${cluster.notes.length} notes in this project cluster`,
              `Most recent activity: ${cluster.notes[0].date}`,
              cluster.notes.length >= 4 ? "This looks like an active project!" : "Growing project collection",
              `Focus area: ${cluster.technology} development`,
            ],
          })
        }
      })
    }

    return collections
  }

  // Detect learning journey patterns
  private detectLearningJourneys(notes: any[]): SmartCollection[] {
    const collections: SmartCollection[] = []

    const learningKeywords = ["learning", "tutorial", "course", "study", "practice", "skill", "education"]
    const learningNotes = notes.filter(
      (note) =>
        note.category === "education" ||
        learningKeywords.some(
          (keyword) =>
            note.title.toLowerCase().includes(keyword) ||
            note.tags.some((tag: string) => tag.toLowerCase().includes(keyword)),
        ),
    )

    if (learningNotes.length >= 2) {
      // Reduced from 3 to 2
      // Group by subject/skill
      const subjectGroups = this.groupBySubject(learningNotes)

      Object.entries(subjectGroups).forEach(([subject, subjectNotes]) => {
        if (subjectNotes.length >= 2) {
          collections.push({
            id: `learning-${subject}`,
            name: `${subject.charAt(0).toUpperCase() + subject.slice(1)} Learning Journey`,
            description: `Your progress learning ${subject}`,
            noteIds: subjectNotes.map((n) => n.id),
            confidence: 0.85,
            type: "learning",
            createdAt: new Date(),
            insights: [
              `${subjectNotes.length} learning notes`,
              "Track your progress and insights",
              this.calculateLearningProgress(subjectNotes),
              `Subject: ${subject}`,
            ],
          })
        }
      })
    }

    return collections
  }

  // Detect decision-making note patterns
  private detectDecisionPoints(notes: any[]): SmartCollection[] {
    const collections: SmartCollection[] = []

    const decisionKeywords = ["decide", "choice", "option", "consider", "evaluate", "compare", "pros", "cons", "should"]
    const decisionNotes = notes.filter((note) =>
      decisionKeywords.some(
        (keyword) =>
          note.title.toLowerCase().includes(keyword) ||
          note.tags.some((tag: string) => tag.toLowerCase().includes(keyword)),
      ),
    )

    if (decisionNotes.length >= 2) {
      // Group by decision context
      const decisionGroups = this.groupDecisionsByContext(decisionNotes)

      Object.entries(decisionGroups).forEach(([context, contextNotes]) => {
        if (contextNotes.length >= 2) {
          collections.push({
            id: `decision-${context}`,
            name: `${context.charAt(0).toUpperCase() + context.slice(1)} Decisions`,
            description: `Decision-making process for ${context}`,
            noteIds: contextNotes.map((n) => n.id),
            confidence: 0.8,
            type: "decision",
            createdAt: new Date(),
            insights: [
              `${contextNotes.length} decision-related notes`,
              "Review your thought process",
              "Consider creating a decision matrix",
              `Context: ${context}`,
            ],
          })
        }
      })
    }

    return collections
  }

  // Detect creative themes and inspiration
  private detectCreativeThemes(notes: any[]): SmartCollection[] {
    const collections: SmartCollection[] = []

    const creativeKeywords = ["creative", "inspiration", "ideas", "design", "art", "writing", "photography"]
    const creativeNotes = notes.filter(
      (note) =>
        creativeKeywords.some(
          (keyword) =>
            note.title.toLowerCase().includes(keyword) ||
            note.tags.some((tag: string) => tag.toLowerCase().includes(keyword)),
        ) || note.category === "creative",
    )

    if (creativeNotes.length >= 2) {
      // Reduced from 3 to 2
      collections.push({
        id: "creative-inspiration",
        name: "Creative Inspiration",
        description: "Your collection of creative ideas and inspiration",
        noteIds: creativeNotes.map((n) => n.id),
        confidence: 0.75,
        type: "creative",
        createdAt: new Date(),
        insights: [
          `${creativeNotes.length} creative notes`,
          "Your inspiration archive",
          "Great source for future projects",
          "Creativity is flowing!",
        ],
      })
    }

    return collections
  }

  // Generate insights for a specific note
  async generateNoteInsights(note: any, allNotes: any[]): Promise<NoteInsight[]> {
    const insights: NoteInsight[] = []

    // 1. Find related notes
    const relatedNotes = this.findRelatedNotes(note, allNotes)
    if (relatedNotes.length > 0) {
      insights.push({
        type: "connection",
        title: `Connected to ${relatedNotes.length} other notes`,
        description: `This note relates to your thoughts on ${relatedNotes
          .map((n) => n.title)
          .slice(0, 2)
          .join(", ")}`,
        relatedNoteIds: relatedNotes.map((n) => n.id),
        confidence: 0.8,
      })
    }

    // 2. Detect action items
    const actionItems = this.detectActionItems(note)
    if (actionItems.length > 0) {
      insights.push({
        type: "action",
        title: `${actionItems.length} action items detected`,
        description: actionItems.join(", "),
        relatedNoteIds: [note.id],
        confidence: 0.9,
        actionable: true,
      })
    }

    // 3. Temporal insights
    const temporalInsight = this.generateTemporalInsight(note, allNotes)
    if (temporalInsight) {
      insights.push(temporalInsight)
    }

    // 4. Pattern recognition
    const patternInsight = this.detectPatterns(note, allNotes)
    if (patternInsight) {
      insights.push(patternInsight)
    }

    return insights
  }

  // Helper methods
  private clusterByTechnology(notes: any[]) {
    const techKeywords = ["react", "javascript", "python", "design", "ai", "web", "mobile", "data"]
    const clusters: { technology: string; notes: any[] }[] = []

    techKeywords.forEach((tech) => {
      const techNotes = notes.filter(
        (note) =>
          note.title.toLowerCase().includes(tech) || note.tags.some((tag: string) => tag.toLowerCase().includes(tech)),
      )

      if (techNotes.length > 0) {
        clusters.push({ technology: tech, notes: techNotes })
      }
    })

    return clusters
  }

  private groupBySubject(notes: any[]) {
    const subjects: { [key: string]: any[] } = {}

    notes.forEach((note) => {
      // Extract potential subjects from tags and title
      const potentialSubjects = [...note.tags, ...note.title.toLowerCase().split(" ")].filter(
        (item: string) => item.length > 3 && !["learning", "tutorial", "course", "study", "practice"].includes(item),
      )

      potentialSubjects.forEach((subject: string) => {
        if (!subjects[subject]) subjects[subject] = []
        if (!subjects[subject].some((n) => n.id === note.id)) {
          subjects[subject].push(note)
        }
      })
    })

    return subjects
  }

  private calculateLearningProgress(notes: any[]): string {
    const timeSpan = this.calculateTimeSpan(notes)
    if (timeSpan > 30) return "Long-term learning journey"
    if (timeSpan > 7) return "Active learning phase"
    return "Recent learning burst"
  }

  private groupDecisionsByContext(notes: any[]) {
    const contexts: { [key: string]: any[] } = {}

    notes.forEach((note) => {
      const context = note.category || "general"
      if (!contexts[context]) contexts[context] = []
      contexts[context].push(note)
    })

    return contexts
  }

  private findRelatedNotes(note: any, allNotes: any[]): any[] {
    return allNotes
      .filter((otherNote) => {
        if (otherNote.id === note.id) return false

        // Check for tag overlap
        const tagOverlap = note.tags.filter((tag: string) => otherNote.tags.includes(tag)).length

        // Check for title similarity
        const titleSimilarity = this.calculateTitleSimilarity(note.title, otherNote.title)

        return tagOverlap >= 1 || titleSimilarity > 0.3
      })
      .slice(0, 5)
  }

  private detectActionItems(note: any): string[] {
    const actionWords = [
      "todo",
      "need to",
      "should",
      "must",
      "action",
      "next step",
      "follow up",
      "build",
      "create",
      "develop",
    ]
    const actions: string[] = []

    actionWords.forEach((word) => {
      if (note.title.toLowerCase().includes(word)) {
        actions.push(`Action detected: ${word}`)
      }
    })

    return actions
  }

  private generateTemporalInsight(note: any, allNotes: any[]): NoteInsight | null {
    const noteDate = new Date(note.date)
    const oneYearAgo = new Date()
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1)

    const similarTimeNotes = allNotes.filter((n) => {
      const nDate = new Date(n.date)
      return Math.abs(nDate.getTime() - oneYearAgo.getTime()) < 7 * 24 * 60 * 60 * 1000 // Within a week
    })

    if (similarTimeNotes.length > 0) {
      return {
        type: "timing",
        title: "Time-based connection",
        description: `You were thinking about similar topics around this time last year`,
        relatedNoteIds: similarTimeNotes.map((n) => n.id),
        confidence: 0.6,
      }
    }

    return null
  }

  private detectPatterns(note: any, allNotes: any[]): NoteInsight | null {
    // Detect if this note is part of a recurring pattern
    const sameCategory = allNotes.filter((n) => n.category === note.category)

    if (sameCategory.length >= 3) {
      // Reduced from 5 to 3
      return {
        type: "pattern",
        title: "Part of a pattern",
        description: `This is one of ${sameCategory.length} notes in the ${note.category} category`,
        relatedNoteIds: sameCategory.slice(0, 3).map((n) => n.id),
        confidence: 0.7,
      }
    }

    return null
  }

  private calculateTitleSimilarity(title1: string, title2: string): number {
    const words1 = title1.toLowerCase().split(" ")
    const words2 = title2.toLowerCase().split(" ")
    const commonWords = words1.filter((word) => words2.includes(word))
    return commonWords.length / Math.max(words1.length, words2.length)
  }

  private calculateTimeSpan(notes: any[]): number {
    if (notes.length < 2) return 0

    const dates = notes.map((n) => new Date(n.date)).sort((a, b) => a.getTime() - b.getTime())
    const earliest = dates[0]
    const latest = dates[dates.length - 1]

    return Math.floor((latest.getTime() - earliest.getTime()) / (1000 * 60 * 60 * 24))
  }
}

export const aiOrganizationEngine = new AIOrganizationEngine()
