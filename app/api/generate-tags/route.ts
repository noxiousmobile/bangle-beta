import { NextResponse, type NextRequest } from "next/server"

// Mock AI tag generation function
// In a real implementation, this would use the v0 API or OpenAI
async function generateTagsFromContent(title: string, description: string, content: string): Promise<string[]> {
  // Simple keyword extraction based on common terms in the title and description
  const combinedText = `${title} ${description} ${content}`.toLowerCase()

  // Predefined categories that might be relevant
  const possibleTags = [
    "design",
    "ui",
    "ux",
    "development",
    "programming",
    "web",
    "mobile",
    "resources",
    "tools",
    "software",
    "tutorial",
    "guide",
    "inspiration",
    "productivity",
    "workflow",
    "technology",
    "creative",
    "business",
    "marketing",
    "social media",
    "education",
    "learning",
    "career",
    "freelance",
    "portfolio",
    "startup",
    "innovation",
    "research",
    "accessibility",
    "usability",
    "interface",
    "experience",
    "prototype",
    "wireframe",
    "mockup",
    "sketch",
    "figma",
    "adobe",
    "photoshop",
    "illustrator",
    "code",
    "html",
    "css",
    "javascript",
    "react",
    "angular",
    "vue",
    "node",
    "python",
    "java",
    "mobile",
    "ios",
    "android",
    "app",
    "responsive",
    "typography",
    "color",
    "layout",
    "grid",
    "animation",
    "motion",
    "3d",
    "illustration",
    "icon",
    "logo",
    "branding",
    "identity",
  ]

  // Find matching tags
  const matchedTags = possibleTags.filter(
    (tag) => combinedText.includes(tag) || combinedText.includes(tag.replace(" ", "")),
  )

  // Sort by relevance (frequency in the text)
  const tagScores = matchedTags.map((tag) => ({
    tag,
    score: (combinedText.match(new RegExp(tag, "g")) || []).length,
  }))

  // Sort by score and take top 3
  const topTags = tagScores
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map((item) => item.tag)

  // If we couldn't find enough tags, add some defaults based on the URL pattern
  if (topTags.length < 3) {
    if (combinedText.includes("design") || combinedText.includes("ui") || combinedText.includes("ux")) {
      topTags.push("design")
    }
    if (combinedText.includes("develop") || combinedText.includes("code") || combinedText.includes("program")) {
      topTags.push("development")
    }
    if (combinedText.includes("resource") || combinedText.includes("tool") || combinedText.includes("free")) {
      topTags.push("resources")
    }
  }

  // Return unique tags (up to 3)
  return [...new Set(topTags)].slice(0, 3)
}

export async function POST(request: NextRequest) {
  try {
    const { title, description, contentSample } = await request.json()

    if (!title && !description && !contentSample) {
      return NextResponse.json({ error: "Content is required for tag generation" }, { status: 400 })
    }

    const tags = await generateTagsFromContent(title || "", description || "", contentSample || "")

    return NextResponse.json({ tags })
  } catch (error) {
    console.error("Error generating tags:", error)
    return NextResponse.json({ error: "Failed to generate tags" }, { status: 500 })
  }
}
