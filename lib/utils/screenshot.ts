/**
 * Uses the site's own Open Graph image when it has one (free), and only falls back
 * to the paid ApiFlash screenshot when the page doesn't publish a preview image.
 */
export const generateScreenshot = async (url: string) => {
  try {
    const response = await fetch(`/api/metadata?url=${encodeURIComponent(url)}`)
    if (response.ok) {
      const metadata = await response.json()
      if (typeof metadata.image === "string" && metadata.image) return metadata.image as string
    }
  } catch (error) {
    console.error("Error reading preview image:", error)
  }
  return `/api/screenshot?url=${encodeURIComponent(url)}`
}
