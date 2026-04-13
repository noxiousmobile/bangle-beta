import { NextResponse, type NextRequest } from "next/server"
import * as cheerio from "cheerio"

export async function GET(request: NextRequest) {
  if (!request || !request.nextUrl || !request.nextUrl.searchParams) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 })
  }

  const url = request.nextUrl.searchParams.get("url")

  if (!url) {
    return NextResponse.json(
      {
        error: "URL parameter is required",
        usage: "Use: /api/metadata?url=https://example.com",
        example: "/api/metadata?url=https://github.com",
      },
      { status: 400 },
    )
  }

  try {
    // Fetch the HTML content of the URL
    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch URL: ${response.statusText}`)
    }

    const html = await response.text()
    const $ = cheerio.load(html)

    // Extract metadata
    const title = $("title").text().trim() || $("h1").first().text().trim() || ""
    const description =
      $('meta[name="description"]').attr("content") || $('meta[property="og:description"]').attr("content") || ""

    // Extract main content for better tag generation
    const mainContent = $("article").text() || $("main").text() || $("body").text()
    const contentSample = mainContent.substring(0, 1000).trim() // First 1000 chars for AI processing

    return NextResponse.json({
      title,
      description,
      contentSample,
      url,
    })
  } catch (error) {
    console.error("Error fetching metadata:", error)
    return NextResponse.json({ error: "Failed to fetch metadata" }, { status: 500 })
  }
}
