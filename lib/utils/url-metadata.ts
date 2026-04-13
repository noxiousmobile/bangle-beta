// Function to fetch metadata from a URL
export async function fetchUrlMetadata(url: string) {
  try {
    const response = await fetch(`/api/metadata?url=${encodeURIComponent(url)}`)

    if (!response.ok) {
      throw new Error(`Failed to fetch metadata: ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Error fetching URL metadata:", error)
    throw error
  }
}

// Function to generate tags from content using AI
export async function generateTags(title: string, description: string, contentSample: string) {
  try {
    const response = await fetch("/api/generate-tags", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ title, description, contentSample }),
    })

    if (!response.ok) {
      throw new Error(`Failed to generate tags: ${response.statusText}`)
    }

    const data = await response.json()
    return data.tags
  } catch (error) {
    console.error("Error generating tags:", error)
    return []
  }
}
