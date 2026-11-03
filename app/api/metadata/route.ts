import { NextResponse, type NextRequest } from "next/server"
import * as cheerio from "cheerio"

const toAbsolute = (value: string | undefined, base: string) => {
  if (!value) return undefined
  try {
    const resolved = new URL(value, base)
    return /^https?:$/.test(resolved.protocol) ? resolved.toString() : undefined
  } catch {
    return undefined
  }
}

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get("url")

  if (!url) {
    return NextResponse.json(
      {
        error: "URL parameter is required",
        usage: "Use: /api/metadata?url=https://example.com",
      },
      { status: 400 },
    )
  }

  let target: URL
  try {
    target = new URL(url)
    if (!/^https?:$/.test(target.protocol)) throw new Error("Unsupported protocol")
  } catch {
    return NextResponse.json({ error: "Invalid URL" }, { status: 400 })
  }

  try {
    const response = await fetch(target, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml",
      },
      redirect: "follow",
      signal: AbortSignal.timeout(8000),
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch URL: ${response.statusText}`)
    }

    const finalUrl = response.url || target.toString()
    const html = await response.text()
    const $ = cheerio.load(html)
    const meta = (selector: string) => $(selector).attr("content")?.trim() || undefined

    const title =
      meta('meta[property="og:title"]') || $("title").first().text().trim() || $("h1").first().text().trim() || ""
    const description =
      meta('meta[name="description"]') || meta('meta[property="og:description"]') || ""
    const image = toAbsolute(
      meta('meta[property="og:image"]') || meta('meta[property="og:image:url"]') || meta('meta[name="twitter:image"]'),
      finalUrl,
    )
    const favicon =
      toAbsolute(
        $('link[rel="apple-touch-icon"]').attr("href") ||
          $('link[rel="icon"]').attr("href") ||
          $('link[rel="shortcut icon"]').attr("href"),
        finalUrl,
      ) || toAbsolute("/favicon.ico", finalUrl)
    const siteName = meta('meta[property="og:site_name"]') || new URL(finalUrl).hostname.replace(/^www\./, "")

    const mainContent = $("article").text() || $("main").text() || $("body").text()
    const contentSample = mainContent.replace(/\s+/g, " ").substring(0, 1000).trim()

    return NextResponse.json(
      { title, description, image, favicon, siteName, contentSample, url: finalUrl },
      { headers: { "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800" } },
    )
  } catch (error) {
    console.error("Error fetching metadata:", error)
    return NextResponse.json({ error: "Failed to fetch metadata" }, { status: 500 })
  }
}
