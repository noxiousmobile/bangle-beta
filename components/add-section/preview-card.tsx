"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { ExternalLink, Save, X, Loader2 } from "lucide-react"
import { fetchUrlMetadata, generateTags } from "@/lib/utils/url-metadata"
import { categoryColors } from "@/components/note-card"

interface PreviewCardProps {
  previewUrl: string | null
  screenshotUrl: string | null
  isGeneratingScreenshot: boolean
  handleDismiss: () => void
  handleSave: (savedNote?: any) => void // Update this type
  onMetadataLoaded?: (title: string, tags: string[]) => void
}

export function PreviewCard({
  previewUrl,
  screenshotUrl,
  isGeneratingScreenshot,
  handleDismiss,
  handleSave,
  onMetadataLoaded,
}: PreviewCardProps) {
  const [pageTitle, setPageTitle] = useState<string>("")
  const [pageTags, setPageTags] = useState<string[]>([])
  const [isLoadingMetadata, setIsLoadingMetadata] = useState<boolean>(true)
  const [isLoadingTags, setIsLoadingTags] = useState<boolean>(true)
  const [isImageLoaded, setIsImageLoaded] = useState<boolean>(false)

  useEffect(() => {
    if (screenshotUrl) {
      setIsImageLoaded(false)
    }
  }, [screenshotUrl])

  // This effect runs once when the component mounts
  useEffect(() => {
    // Skip if no URL
    if (!previewUrl) {
      setIsLoadingMetadata(false)
      setIsLoadingTags(false)
      return
    }

    // Load metadata
    const loadMetadata = async () => {
      try {
        const metadata = await fetchUrlMetadata(previewUrl)

        if (metadata.title) {
          setPageTitle(metadata.title)
        } else {
          setPageTitle("Untitled Page")
        }
      } catch (error) {
        console.error("Failed to load metadata:", error)
        setPageTitle(previewUrl || "Website Link")
      } finally {
        setIsLoadingMetadata(false)
      }
    }

    // Load tags
    const loadTags = async () => {
      try {
        const metadata = await fetchUrlMetadata(previewUrl)
        const tags = await generateTags(metadata.title || "", metadata.description || "", metadata.contentSample || "")

        setPageTags(tags)

        // Notify parent component
        if (onMetadataLoaded) {
          onMetadataLoaded(metadata.title || "", tags)
        }
      } catch (error) {
        console.error("Failed to generate tags:", error)
        setPageTags(["website", "link"])
      } finally {
        setIsLoadingTags(false)
      }
    }

    // Start loading processes
    loadMetadata()
    loadTags()
  }, [previewUrl, onMetadataLoaded])

  // Update the handleSave function
  const handleSaveNew = async () => {
    if (!previewUrl) {
      return
    }

    try {
      // Determine category based on tags or use 'resource' as default
      const category =
        pageTags.find((tag) =>
          [
            "work",
            "personal",
            "tech",
            "travel",
            "health",
            "finance",
            "education",
            "cooking",
            "home",
            "entertainment",
          ].includes(tag),
        ) || "resource"

      // Create the note object with unique ID
      const savedNote = {
        id: Date.now(),
        title: pageTitle || previewUrl,
        tags: pageTags,
        image: screenshotUrl || "/placeholder.svg?height=80&width=80",
        date: "Just now",
        category: category,
        type: "url" as const,
        url: previewUrl,
      }

      // Call the original handleSave function with the saved note
      handleSave(savedNote)
    } catch (error) {
      console.error("Error saving URL note:", error)
    }
  }

  return (
    <motion.div
      key="preview-state"
      className="flex-1 flex flex-col justify-between"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="w-full max-w-2xl bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="flex flex-row">
            {/* Image on the left */}
            <div className="relative w-1/3 h-auto max-h-[195px] bg-gray-100 flex-shrink-0">
              {(isGeneratingScreenshot || (screenshotUrl && !isImageLoaded)) && (
                <div className="absolute inset-0 flex flex-col items-center justify-center space-y-3 bg-gray-100 z-10">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-600"></div>
                  <p className="text-xs text-gray-600 font-medium">Generating preview...</p>
                </div>
              )}
              {screenshotUrl && (
                <img
                  src={screenshotUrl || "/placeholder.svg"}
                  alt="Website preview"
                  className="w-full h-full object-cover"
                  style={{
                    minHeight: "140px",
                    opacity: isImageLoaded ? 1 : 0,
                    transition: "opacity 0.3s ease-in-out",
                  }}
                  onLoad={() => {
                    console.log("[v0] Screenshot image loaded successfully")
                    setIsImageLoaded(true)
                  }}
                  onError={(e) => {
                    console.error("[v0] Screenshot image failed to load:", screenshotUrl)
                    setIsImageLoaded(true) // Hide spinner even on error
                    e.currentTarget.onerror = null
                    e.currentTarget.src = "/placeholder.svg?height=400&width=600&text=Failed+to+load+preview"
                  }}
                />
              )}
            </div>

            {/* Content on the right */}
            <div className="p-4 w-2/3">
              {/* Page Title */}
              {isLoadingMetadata ? (
                <div className="flex items-center space-x-2 mb-3">
                  <Loader2 className="w-4 h-4 animate-spin text-gray-500" />
                  <span className="text-sm text-gray-500">Loading page information...</span>
                </div>
              ) : pageTitle ? (
                <h3 className="text-base font-medium text-gray-800 mb-3 line-clamp-2">{pageTitle}</h3>
              ) : null}

              {/* AI Generated Tags */}
              <div className="mb-4">
                <div className="flex flex-wrap gap-2">
                  {isLoadingTags ? (
                    <div className="flex items-center space-x-2">
                      <Loader2 className="w-3 h-3 animate-spin text-gray-500" />
                      <span className="px-2 py-1 text-xs rounded-full text-gray-700 bg-gray-100">
                        Generating tags...
                      </span>
                    </div>
                  ) : pageTags.length > 0 ? (
                    pageTags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-1 text-xs rounded-full text-gray-700"
                        style={{
                          backgroundColor: categoryColors[tag as keyof typeof categoryColors] || "#e5e7eb",
                        }}
                      >
                        {tag}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-gray-500">No tags available</span>
                  )}
                </div>
              </div>

              {/* URL Link - moved to right column */}
              <div className="flex items-center mb-3">
                <ExternalLink className="w-4 h-4 mr-2 text-gray-500 flex-shrink-0" />
                <a
                  href={previewUrl || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline text-sm truncate"
                >
                  {previewUrl}
                </a>
              </div>
            </div>
          </div>

          {/* Only buttons remain in the bottom section */}
          <div className="p-4 pt-0 border-t border-gray-100">
            <div className="flex justify-end space-x-3">
              <motion.button
                className="flex items-center space-x-1 px-4 py-2 bg-gray-200 rounded-md text-gray-700"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleDismiss}
              >
                <X className="w-4 h-4" />
                <span>Dismiss</span>
              </motion.button>

              <motion.button
                className="flex items-center space-x-1 px-4 py-2 bg-[#3da763] rounded-md text-white"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSaveNew}
              >
                <Save className="w-4 h-4" />
                <span>Save</span>
              </motion.button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
