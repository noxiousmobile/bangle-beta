import { generateText, Output } from "ai"
import { z } from "zod"
import { NextResponse, type NextRequest } from "next/server"

// Schema for categorized search results
const contextSearchSchema = z.object({
  directMatches: z.array(
    z.object({
      noteId: z.number(),
      relevanceScore: z.number().min(0).max(100),
      reason: z.string().describe("Brief explanation of why this note matches the query"),
    })
  ).describe("Notes that directly match the search intent"),
  relatedResources: z.array(
    z.object({
      noteId: z.number(),
      relevanceScore: z.number().min(0).max(100),
      reason: z.string().describe("Why this note could be helpful for the query topic"),
    })
  ).describe("Notes that could help with the topic (guides, links, decks)"),
  supportingInfo: z.array(
    z.object({
      noteId: z.number(),
      relevanceScore: z.number().min(0).max(100),
      reason: z.string().describe("How this note adds context or background"),
    })
  ).describe("Tangentially related notes that add context"),
  searchSummary: z.string().describe("A brief summary of what was found and how it helps the user"),
})

export type ContextSearchResult = z.infer<typeof contextSearchSchema>

export interface NoteForSearch {
  id: number
  title: string
  content: string
  tags: string[]
  category: string
  date: string
}

// Mock search function for demo mode (when AI Gateway is not available)
function mockContextSearch(query: string, notes: NoteForSearch[]): ContextSearchResult {
  const lowerQuery = query.toLowerCase()
  
  // Simple keyword-based categorization for demo
  const directMatches = notes
    .filter(note => 
      note.title.toLowerCase().includes(lowerQuery) || 
      note.content.toLowerCase().includes(lowerQuery)
    )
    .slice(0, 3)
    .map(note => ({
      noteId: note.id,
      relevanceScore: 85,
      reason: `Direct match for "${query}"`,
    }))

  const relatedResources = notes
    .filter(note => 
      note.tags.some(tag => tag.toLowerCase().includes(lowerQuery)) &&
      !directMatches.some(dm => dm.noteId === note.id)
    )
    .slice(0, 3)
    .map(note => ({
      noteId: note.id,
      relevanceScore: 70,
      reason: `Related to ${query} through tags`,
    }))

  const supportingInfo = notes
    .filter(note => 
      !directMatches.some(dm => dm.noteId === note.id) &&
      !relatedResources.some(rr => rr.noteId === note.id)
    )
    .slice(0, 2)
    .map(note => ({
      noteId: note.id,
      relevanceScore: 50,
      reason: `Additional context about the topic`,
    }))

  return {
    directMatches,
    relatedResources,
    supportingInfo,
    searchSummary: `Found ${directMatches.length + relatedResources.length + supportingInfo.length} notes related to "${query}". Configure AI Gateway with a valid credit card to enable intelligent semantic search.`,
  }
}

export async function POST(request: NextRequest) {
  try {
    const { query, notes } = (await request.json()) as {
      query: string
      notes: NoteForSearch[]
    }

    if (!query?.trim()) {
      return NextResponse.json(
        { error: "Search query is required" },
        { status: 400 }
      )
    }

    if (!notes || notes.length === 0) {
      return NextResponse.json({
        directMatches: [],
        relatedResources: [],
        supportingInfo: [],
        searchSummary: "No notes available to search.",
      })
    }

    try {
      // Try to use AI Gateway for intelligent search
      const notesContext = notes
        .map(
          (note) =>
            `[Note ID: ${note.id}]
Title: ${note.title}
Tags: ${note.tags.join(", ") || "none"}
Category: ${note.category}
Date: ${note.date}
Content: ${note.content.substring(0, 500)}${note.content.length > 500 ? "..." : ""}`
        )
        .join("\n\n---\n\n")

      const { output } = await generateText({
        model: "openai/gpt-4o-mini",
        output: Output.object({
          schema: contextSearchSchema,
        }),
        messages: [
          {
            role: "system",
            content: `You are an intelligent search assistant for a note-taking app called Bangle. Your job is to understand the user's search intent and find relevant notes - not just direct matches, but also notes that could be HELPFUL for their query.

For example, if someone searches "Best startup ideas last year", you should:
1. Find notes about startup ideas (direct matches)
2. Find notes like pitch decks, business plans, marketing materials that could help them (related resources)
3. Find notes with useful links, slides, or background info (supporting info)

Be intelligent about understanding context and relationships. A note about "investor pitch template" is related to startup ideas even if it doesn't mention "startup" or "ideas".

Rules:
- Each category should have 0-5 notes maximum
- Order by relevance score (100 = perfect match, 0 = not relevant)
- Only include notes with relevance score > 30
- Keep reasons brief but specific (1 sentence)
- If a note fits multiple categories, put it in the most relevant one only
- Be generous with finding connections - the user wants to discover useful related content`,
          },
          {
            role: "user",
            content: `Search query: "${query}"

Available notes:
${notesContext}

Find notes that match this query directly, notes that could be helpful resources, and notes with supporting information. Remember to understand the INTENT behind the search, not just keyword matching.`,
          },
        ],
      })

      return NextResponse.json(output)
    } catch (aiError: any) {
      // If AI Gateway fails (e.g., no credit card), fall back to demo mode
      if (aiError?.statusCode === 403) {
        console.log("AI Gateway not available - using demo search mode")
        return NextResponse.json(mockContextSearch(query, notes))
      }
      throw aiError
    }
  } catch (error) {
    console.error("Context search error:", error)
    return NextResponse.json(
      { error: "Failed to perform context search" },
      { status: 500 }
    )
  }
}
