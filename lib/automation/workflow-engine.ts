// Workflow automation engine for smart note processing
export interface WorkflowRule {
  id: string
  name: string
  description: string
  enabled: boolean
  trigger: WorkflowTrigger
  conditions: WorkflowCondition[]
  actions: WorkflowAction[]
  createdAt: Date
  lastTriggered?: Date
  triggerCount: number
}

export interface WorkflowTrigger {
  type: "note_created" | "note_updated" | "tag_added" | "url_saved" | "schedule" | "manual"
  config?: {
    schedule?: string // cron expression
    tags?: string[]
    categories?: string[]
    keywords?: string[]
  }
}

export interface WorkflowCondition {
  type: "contains_text" | "has_tag" | "in_category" | "note_age" | "note_count" | "url_domain"
  operator: "equals" | "contains" | "starts_with" | "greater_than" | "less_than" | "matches"
  value: string | number
  field?: "title" | "content" | "tags" | "category" | "url"
}

export interface WorkflowAction {
  type:
    | "add_tag"
    | "set_category"
    | "create_summary"
    | "extract_actions"
    | "link_related"
    | "send_notification"
    | "create_reminder"
    | "archive_note"
    | "share_note"
    | "apply_template"
  config: {
    value?: string
    template?: string
    delay?: number // minutes
    recipients?: string[]
    message?: string
  }
}

export interface WorkflowExecution {
  id: string
  ruleId: string
  noteId: number
  status: "success" | "failed" | "pending"
  executedAt: Date
  result?: any
  error?: string
}

class WorkflowEngine {
  private rules: WorkflowRule[] = []
  private executions: WorkflowExecution[] = []

  constructor() {
    this.initializeDefaultRules()
  }

  // Initialize with some useful default rules
  private initializeDefaultRules() {
    this.rules = [
      {
        id: "auto-tag-work",
        name: "Auto-tag Work Notes",
        description: "Automatically tag notes containing work-related keywords",
        enabled: true,
        trigger: { type: "note_created" },
        conditions: [
          {
            type: "contains_text",
            operator: "contains",
            value: "meeting|project|client|deadline|task|work",
            field: "title",
          },
        ],
        actions: [
          {
            type: "add_tag",
            config: { value: "work" },
          },
          {
            type: "set_category",
            config: { value: "work" },
          },
        ],
        createdAt: new Date(),
        triggerCount: 0,
      },
      {
        id: "extract-meeting-actions",
        name: "Extract Meeting Action Items",
        description: "Find and highlight action items in meeting notes",
        enabled: true,
        trigger: { type: "note_created" },
        conditions: [
          {
            type: "has_tag",
            operator: "equals",
            value: "meeting",
          },
        ],
        actions: [
          {
            type: "extract_actions",
            config: {},
          },
          {
            type: "create_reminder",
            config: { delay: 1440 }, // 24 hours
          },
        ],
        createdAt: new Date(),
        triggerCount: 0,
      },
      {
        id: "auto-categorize-urls",
        name: "Auto-categorize URLs",
        description: "Automatically categorize notes based on URL domain",
        enabled: true,
        trigger: { type: "url_saved" },
        conditions: [],
        actions: [
          {
            type: "set_category",
            config: { value: "auto" }, // Will be determined by domain
          },
          {
            type: "add_tag",
            config: { value: "resource" },
          },
        ],
        createdAt: new Date(),
        triggerCount: 0,
      },
      {
        id: "link-related-notes",
        name: "Auto-link Related Notes",
        description: "Automatically find and suggest related notes",
        enabled: true,
        trigger: { type: "note_created" },
        conditions: [
          {
            type: "note_count",
            operator: "greater_than",
            value: 5,
          },
        ],
        actions: [
          {
            type: "link_related",
            config: {},
          },
        ],
        createdAt: new Date(),
        triggerCount: 0,
      },
      {
        id: "weekly-review-reminder",
        name: "Weekly Review Reminder",
        description: "Remind to review notes every Sunday",
        enabled: true,
        trigger: {
          type: "schedule",
          config: { schedule: "0 9 * * 0" }, // Every Sunday at 9 AM
        },
        conditions: [],
        actions: [
          {
            type: "send_notification",
            config: {
              message: "Time for your weekly note review! Check your recent notes and organize them.",
            },
          },
        ],
        createdAt: new Date(),
        triggerCount: 0,
      },
      {
        id: "auto-archive-old",
        name: "Auto-archive Old Notes",
        description: "Archive notes older than 6 months with specific tags",
        enabled: false, // Disabled by default
        trigger: { type: "schedule", config: { schedule: "0 2 1 * *" } }, // Monthly
        conditions: [
          {
            type: "note_age",
            operator: "greater_than",
            value: 180, // days
          },
          {
            type: "has_tag",
            operator: "equals",
            value: "temporary",
          },
        ],
        actions: [
          {
            type: "archive_note",
            config: {},
          },
        ],
        createdAt: new Date(),
        triggerCount: 0,
      },
    ]
  }

  // Execute workflows for a note
  async executeWorkflows(note: any, triggerType: WorkflowTrigger["type"], allNotes: any[] = []) {
    const applicableRules = this.rules.filter((rule) => rule.enabled && rule.trigger.type === triggerType)

    const results = []

    for (const rule of applicableRules) {
      try {
        const shouldExecute = await this.evaluateConditions(rule.conditions, note, allNotes)

        if (shouldExecute) {
          const result = await this.executeActions(rule.actions, note, allNotes)

          // Log execution
          const execution: WorkflowExecution = {
            id: `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            ruleId: rule.id,
            noteId: note.id,
            status: "success",
            executedAt: new Date(),
            result,
          }

          this.executions.push(execution)
          rule.triggerCount++
          rule.lastTriggered = new Date()

          results.push({ rule, execution, result })
        }
      } catch (error) {
        console.error(`Workflow execution failed for rule ${rule.id}:`, error)

        const execution: WorkflowExecution = {
          id: `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          ruleId: rule.id,
          noteId: note.id,
          status: "failed",
          executedAt: new Date(),
          error: error instanceof Error ? error.message : "Unknown error",
        }

        this.executions.push(execution)
        results.push({ rule, execution, error })
      }
    }

    return results
  }

  // Evaluate if conditions are met
  private async evaluateConditions(conditions: WorkflowCondition[], note: any, allNotes: any[]): Promise<boolean> {
    if (conditions.length === 0) return true

    for (const condition of conditions) {
      const result = await this.evaluateCondition(condition, note, allNotes)
      if (!result) return false // All conditions must be true
    }

    return true
  }

  private async evaluateCondition(condition: WorkflowCondition, note: any, allNotes: any[]): Promise<boolean> {
    const { type, operator, value, field } = condition

    switch (type) {
      case "contains_text":
        const text = field ? note[field] : `${note.title} ${note.tags?.join(" ") || ""}`
        const textValue = Array.isArray(text) ? text.join(" ") : String(text).toLowerCase()
        const searchValue = String(value).toLowerCase()

        if (operator === "contains") {
          // Support regex patterns for multiple keywords
          if (searchValue.includes("|")) {
            const regex = new RegExp(searchValue, "i")
            return regex.test(textValue)
          }
          return textValue.includes(searchValue)
        }
        break

      case "has_tag":
        const tags = note.tags || []
        return tags.includes(value)

      case "in_category":
        return note.category === value

      case "note_age":
        const noteDate = new Date(note.date || note.createdAt)
        const daysDiff = Math.floor((Date.now() - noteDate.getTime()) / (1000 * 60 * 60 * 24))

        switch (operator) {
          case "greater_than":
            return daysDiff > Number(value)
          case "less_than":
            return daysDiff < Number(value)
          default:
            return false
        }

      case "note_count":
        switch (operator) {
          case "greater_than":
            return allNotes.length > Number(value)
          case "less_than":
            return allNotes.length < Number(value)
          default:
            return false
        }

      case "url_domain":
        if (note.url) {
          try {
            const domain = new URL(note.url).hostname
            return domain.includes(String(value))
          } catch {
            return false
          }
        }
        return false
    }

    return false
  }

  // Execute workflow actions
  private async executeActions(actions: WorkflowAction[], note: any, allNotes: any[]) {
    const results = []

    for (const action of actions) {
      const result = await this.executeAction(action, note, allNotes)
      results.push({ action: action.type, result })
    }

    return results
  }

  private async executeAction(action: WorkflowAction, note: any, allNotes: any[]) {
    const { type, config } = action

    switch (type) {
      case "add_tag":
        if (config.value && !note.tags?.includes(config.value)) {
          note.tags = [...(note.tags || []), config.value]
          return { added_tag: config.value }
        }
        break

      case "set_category":
        let category = config.value

        // Smart category detection for URLs
        if (category === "auto" && note.url) {
          category = this.detectCategoryFromUrl(note.url)
        }

        note.category = category
        return { set_category: category }

      case "create_summary":
        const summary = await this.generateSummary(note)
        return { summary }

      case "extract_actions":
        const actionItems = this.extractActionItems(note)
        return { action_items: actionItems }

      case "link_related":
        const relatedNotes = this.findRelatedNotes(note, allNotes)
        return { related_notes: relatedNotes.slice(0, 5) }

      case "send_notification":
        // In a real app, this would send actual notifications
        console.log("Notification:", config.message)
        return { notification_sent: true, message: config.message }

      case "create_reminder":
        const reminderDate = new Date(Date.now() + (config.delay || 60) * 60 * 1000)
        return { reminder_created: true, reminder_date: reminderDate }

      case "archive_note":
        note.archived = true
        note.archivedAt = new Date()
        return { archived: true }

      case "apply_template":
        // Apply a template structure to the note
        return { template_applied: config.template }
    }

    return null
  }

  // Helper methods
  private detectCategoryFromUrl(url: string): string {
    try {
      const domain = new URL(url).hostname.toLowerCase()

      const domainMappings = {
        "github.com": "tech",
        "stackoverflow.com": "tech",
        "medium.com": "education",
        "youtube.com": "entertainment",
        "linkedin.com": "work",
        "twitter.com": "social",
        "amazon.com": "shopping",
        "docs.google.com": "work",
        "notion.so": "productivity",
        "figma.com": "design",
      }

      for (const [domainPattern, category] of Object.entries(domainMappings)) {
        if (domain.includes(domainPattern)) {
          return category
        }
      }

      return "resource"
    } catch {
      return "resource"
    }
  }

  private async generateSummary(note: any): Promise<string> {
    // Simple summary generation (in real app, use AI)
    const text = `${note.title} ${note.content || ""}`
    const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 10)
    return sentences.slice(0, 2).join(". ") + "."
  }

  private extractActionItems(note: any): string[] {
    const text = `${note.title} ${note.content || ""}`.toLowerCase()
    const actionPatterns = [
      /(?:need to|should|must|todo|action|follow up|next step)[\s:]+([^.!?]+)/gi,
      /(?:^|\s)(?:□|☐|\[ \]|-)\s*([^.!?\n]+)/gm,
    ]

    const actions: string[] = []

    for (const pattern of actionPatterns) {
      const matches = text.matchAll(pattern)
      for (const match of matches) {
        if (match[1]?.trim()) {
          actions.push(match[1].trim())
        }
      }
    }

    return [...new Set(actions)].slice(0, 5) // Remove duplicates, limit to 5
  }

  private findRelatedNotes(note: any, allNotes: any[]): any[] {
    return allNotes
      .filter((n) => n.id !== note.id)
      .map((n) => ({
        note: n,
        score: this.calculateSimilarity(note, n),
      }))
      .filter((item) => item.score > 0.3)
      .sort((a, b) => b.score - a.score)
      .map((item) => item.note)
  }

  private calculateSimilarity(note1: any, note2: any): number {
    let score = 0

    // Tag overlap
    const tags1 = note1.tags || []
    const tags2 = note2.tags || []
    const commonTags = tags1.filter((tag: string) => tags2.includes(tag))
    score += commonTags.length * 0.3

    // Category match
    if (note1.category === note2.category) {
      score += 0.2
    }

    // Title similarity (simple word overlap)
    const words1 = note1.title.toLowerCase().split(/\s+/)
    const words2 = note2.title.toLowerCase().split(/\s+/)
    const commonWords = words1.filter((word: string) => words2.includes(word) && word.length > 3)
    score += commonWords.length * 0.1

    return Math.min(score, 1) // Cap at 1
  }

  // Management methods
  addRule(rule: Omit<WorkflowRule, "id" | "createdAt" | "triggerCount">) {
    const newRule: WorkflowRule = {
      ...rule,
      id: `rule_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
      triggerCount: 0,
    }

    this.rules.push(newRule)
    return newRule
  }

  updateRule(id: string, updates: Partial<WorkflowRule>) {
    const ruleIndex = this.rules.findIndex((r) => r.id === id)
    if (ruleIndex >= 0) {
      this.rules[ruleIndex] = { ...this.rules[ruleIndex], ...updates }
      return this.rules[ruleIndex]
    }
    return null
  }

  deleteRule(id: string) {
    this.rules = this.rules.filter((r) => r.id !== id)
  }

  getRules() {
    return this.rules
  }

  getExecutions(limit = 50) {
    return this.executions.sort((a, b) => b.executedAt.getTime() - a.executedAt.getTime()).slice(0, limit)
  }

  getAnalytics() {
    const totalExecutions = this.executions.length
    const successfulExecutions = this.executions.filter((e) => e.status === "success").length
    const failedExecutions = this.executions.filter((e) => e.status === "failed").length

    const ruleStats = this.rules.map((rule) => ({
      id: rule.id,
      name: rule.name,
      triggerCount: rule.triggerCount,
      lastTriggered: rule.lastTriggered,
      enabled: rule.enabled,
    }))

    return {
      totalExecutions,
      successfulExecutions,
      failedExecutions,
      successRate: totalExecutions > 0 ? (successfulExecutions / totalExecutions) * 100 : 0,
      activeRules: this.rules.filter((r) => r.enabled).length,
      totalRules: this.rules.length,
      ruleStats,
    }
  }
}

export const workflowEngine = new WorkflowEngine()
