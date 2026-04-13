// Function to generate a real screenshot from a URL
export const generateScreenshot = async (url: string) => {
  try {
    console.log("[v0] Generating screenshot for:", url)

    // Use our API route to generate the screenshot
    // This adds a layer of security and error handling
    const screenshotUrl = `/api/screenshot?url=${encodeURIComponent(url)}`

    console.log("[v0] Screenshot API URL:", screenshotUrl)

    // Return the URL to our API endpoint
    return screenshotUrl
  } catch (error) {
    console.error("[v0] Error generating screenshot:", error)
    // Fallback to a placeholder if the API fails
    return "/placeholder.svg?height=400&width=600&text=Website"
  }
}
