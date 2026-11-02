import { NextResponse } from "next/server"

export async function GET(request: Request) {
  console.log("[v0] Screenshot API called")

  const { searchParams } = new URL(request.url)
  const url = searchParams.get("url")
  console.log("[v0] Requested URL:", url)

  if (!url) {
    console.log("[v0] Error: No URL parameter provided")
    return NextResponse.json({ error: "URL parameter is required" }, { status: 400 })
  }

  const apiKey = process.env.APIFLASH_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: "Screenshot service is not configured" }, { status: 503 })
  }

  try {
    // Use the Apiflash API to generate a screenshot
    const apiUrl = `https://api.apiflash.com/v1/urltoimage?access_key=${apiKey}&url=${encodeURIComponent(url)}&format=jpeg&quality=80&width=800&height=600&response_type=image`

    console.log("[v0] Calling ApiFlash API...")

    // Fetch the screenshot
    const response = await fetch(apiUrl)
    console.log("[v0] ApiFlash response status:", response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error("[v0] ApiFlash error:", errorText)
      throw new Error(`Failed to generate screenshot: ${response.statusText}`)
    }

    // Get the image data
    const imageData = await response.arrayBuffer()
    console.log("[v0] Screenshot generated successfully, size:", imageData.byteLength, "bytes")

    // Return the image with proper content type
    return new NextResponse(imageData, {
      headers: {
        "Content-Type": "image/jpeg",
        "Cache-Control": "public, max-age=3600",
      },
    })
  } catch (error) {
    console.error("[v0] Error generating screenshot:", error)
    return NextResponse.json({ error: "Failed to generate screenshot" }, { status: 500 })
  }
}
