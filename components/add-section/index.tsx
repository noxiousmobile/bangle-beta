"use client"

import { useRef, useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { InitialState } from "./initial-state"
import { OptionMenu } from "./option-menu"
import { PreviewCard } from "./preview-card"
import { TextEditorCard } from "./text-editor-card"
import { CollapsedState } from "./collapsed-state"
import { useClipboard } from "@/hooks/use-clipboard"
import { generateScreenshot } from "@/lib/utils/screenshot"
import { isUrl, ensureUrlProtocol } from "@/lib/utils/content-detector"
import type { PanInfo } from "framer-motion"
import { ImagePreviewCard } from "./image-preview-card"

interface AddSectionProps {
  expanded: boolean
  toggleExpanded: (value: boolean) => void
  isAnimating: boolean
  handleSwipe: (
    event: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo,
    source: "top" | "bottom" | "divider",
  ) => void
  onStateChange?: (state: "initial" | "options" | "preview" | "text-editor") => void
  onSearch?: (searchTerm: string) => void
  onViewChange?: (view: "grid" | "table") => void
  currentView?: "grid" | "table"
  notes?: any[]
  className?: string
  isFullscreen?: boolean
  onShare?: () => void
  onNoteSaved?: (note: any) => void // Add this new prop
  initialContent?: { content: string; type: "url" | "text" | "image" } | null // Add prop for initial content from circular modal
  onDismiss?: () => void // Add onDismiss prop for closing circular modal
}

export function AddSection({
  expanded,
  toggleExpanded,
  isAnimating,
  handleSwipe,
  onStateChange,
  onSearch,
  onViewChange,
  currentView = "grid",
  notes = [],
  className,
  isFullscreen = false,
  onShare,
  onNoteSaved, // Add this parameter
  initialContent = null,
  onDismiss, // Accept onDismiss prop
}: AddSectionProps) {
  const [bottomState, setBottomState] = useState<"initial" | "options" | "preview" | "text-editor" | "image-preview">(
    notes.length === 0 ? "initial" : "options",
  )
  type BottomState = "initial" | "options" | "preview" | "text-editor" | "image-preview"
  type EmittableState = Exclude<BottomState, "image-preview">
  const isEmittable = (s: BottomState): s is EmittableState => s !== "image-preview"

  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [screenshotUrl, setScreenshotUrl] = useState<string | null>(null)
  const [isGeneratingScreenshot, setIsGeneratingScreenshot] = useState(false)
  const [pageTitle, setPageTitle] = useState<string>("")
  const [pageTags, setPageTags] = useState<string[]>([])
  const [noteText, setNoteText] = useState<string>("")
  const [hasInitialized, setHasInitialized] = useState(false)
  const [lastDismissedState, setLastDismissedState] = useState<
    "initial" | "options" | "preview" | "text-editor" | "image-preview" | null
  >(null)

  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [isProcessingImage, setIsProcessingImage] = useState(false)

  const bottomRef = useRef<HTMLDivElement>(null)
  const hiddenInputRef = useRef<HTMLInputElement>(null)
  const { clipboardContent, handlePaste, handlePasteEvent } = useClipboard()

  // Set the initial expanded state based on whether there are notes
  // Only run this once when the component mounts
  useEffect(() => {
    if (!hasInitialized) {
      if (notes.length > 0) {
        toggleExpanded(true)
      }
      setHasInitialized(true)
    }
  }, [notes.length, toggleExpanded, hasInitialized])

  // Notify parent component when bottomState changes
  useEffect(() => {
    if (onStateChange && isEmittable(bottomState)) {
      onStateChange(bottomState) // types ok
    }
  }, [bottomState, onStateChange])

  // Reset to options state when expanded changes from true to false (plus button clicked)
  useEffect(() => {
    if (!expanded && lastDismissedState) {
      // If we're expanding the bottom section after a dismiss, reset to options
      setBottomState("options")
      setLastDismissedState(null)
    }
  }, [expanded, lastDismissedState])

  useEffect(() => {
    if (initialContent) {
      handlePastedContent(initialContent.content)
    }
  }, [initialContent])

  const handleAddNote = (type: string) => {
    if (type === "text") {
      console.log("Adding text note")
      setBottomState("text-editor")
      setNoteText("")
    } else if (type === "file") {
      console.log("Adding file")
      // Implementation for adding files
    } else if (type === "link") {
      console.log("Adding link")
      // Implementation for adding links
    } else if (type === "image-upload") {
      console.log("Adding image upload")
      setBottomState("image-preview")
    }

    // Show options when plus is clicked
    if (bottomState === "initial") {
      setBottomState("options")
    }
  }

  const handlePasteAndPreview = async () => {
    const text = await handlePaste()
    if (text) {
      handlePastedContent(text)
    }
  }

  const isImageUrl = (url: string): boolean => {
    const imageExtensions = [".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg", ".bmp", ".ico"]
    const lowerUrl = url.toLowerCase()
    return (
      imageExtensions.some((ext) => lowerUrl.includes(ext)) ||
      lowerUrl.includes("image") ||
      lowerUrl.includes("photo") ||
      lowerUrl.includes("picture")
    )
  }

  const handlePastedContent = (content: string) => {
    console.log("[v0] Pasted content:", content)

    // Check if it's an image URL first
    if (isUrl(content) && isImageUrl(content)) {
      console.log("[v0] Detected as image URL")
      // Handle image URL
      const urlWithProtocol = ensureUrlProtocol(content)
      setImageUrl(urlWithProtocol)
      setBottomState("image-preview")
      return
    }

    // Use a very strict URL check to avoid misclassifying text as URLs
    if (isUrl(content)) {
      console.log("[v0] Detected as URL")
      // Handle URL content
      const urlWithProtocol = ensureUrlProtocol(content)
      console.log("[v0] URL with protocol:", urlWithProtocol)
      setPreviewUrl(urlWithProtocol)
      setBottomState("preview")

      // Generate screenshot
      console.log("[v0] Starting screenshot generation...")
      setIsGeneratingScreenshot(true)
      generateScreenshot(urlWithProtocol)
        .then((screenshot) => {
          console.log("[v0] Screenshot URL received:", screenshot)
          setScreenshotUrl(screenshot)
          setIsGeneratingScreenshot(false)
        })
        .catch((error) => {
          console.error("[v0] Screenshot generation failed:", error)
          setIsGeneratingScreenshot(false)
        })
    } else {
      console.log("[v0] Detected as text content")
      // Handle text content - pass the raw text without any modification
      // Remove any http:// or https:// prefixes that might have been added
      const cleanedText = content.replace(/^https?:\/\//i, "")
      setNoteText(cleanedText)
      setBottomState("text-editor")
    }
  }

  const handleSaveUrl = (savedNote: any) => {
    if (previewUrl) {
      // In a real app, save the note to storage with title and tags
      console.log(`Saving URL note: ${previewUrl}`)
      console.log(`Title: ${pageTitle}`)
      console.log(`Tags: ${pageTags.join(", ")}`)

      // Notify parent component about the new note
      if (onNoteSaved && savedNote) {
        onNoteSaved(savedNote)
      }

      // Add to recent notes (mock implementation)
      console.log("URL note saved!")

      // Reset state
      resetBottomState()
    }
  }

  const handleSaveText = (text: string, tags: string[], savedNote: any) => {
    // In a real app, save the note to storage with text and tags
    console.log(`Saving text note: ${text}`)
    console.log(`Tags: ${tags.join(", ")}`)

    // Notify parent component about the new note
    if (onNoteSaved && savedNote) {
      onNoteSaved(savedNote)
    }

    // Add to recent notes (mock implementation)
    console.log("Text note saved!")

    // Reset state
    resetBottomState()
  }

  const handleSaveImage = (description: string, tags: string[], savedNote: any) => {
    // In a real app, save the image note to storage
    console.log(`Saving image note: ${description}`)
    console.log(`Tags: ${tags.join(", ")}`)
    console.log(`Image URL: ${imageUrl}`)
    console.log(`Image File: ${imageFile?.name}`)

    // Notify parent component about the new note
    if (onNoteSaved && savedNote) {
      onNoteSaved(savedNote)
    }

    // Add to recent notes (mock implementation)
    console.log("Image note saved!")

    // Reset state
    resetBottomState()
  }

  const handleDismiss = () => {
    if (onDismiss) {
      onDismiss()
      return
    }

    // Remember the current state before dismissing
    setLastDismissedState(bottomState)

    // Explicitly set the state to "options" when dismissing
    setBottomState("options")

    // Clear all content
    setNoteText("")
    setPreviewUrl(null)
    setScreenshotUrl(null)
    setPageTitle("")
    setPageTags([])
    setImageFile(null)
    setImageUrl(null)
    setIsProcessingImage(false)
  }

  const toggleToCollapsedState = () => {
    // Remember the current state before dismissing
    setLastDismissedState(bottomState)

    // Clear all content
    setNoteText("")
    setPreviewUrl(null)
    setScreenshotUrl(null)
    setPageTitle("")
    setPageTags([])

    // Reset the bottom state to options for when the user expands again
    setBottomState("options")

    // Toggle to expanded state to show the collapsed view with the three buttons
    toggleExpanded(true)
  }

  const resetBottomState = () => {
    // Clear all content first
    setPreviewUrl(null)
    setScreenshotUrl(null)
    setPageTitle("")
    setPageTags([])
    setNoteText("")
    setImageFile(null)
    setImageUrl(null)
    setIsProcessingImage(false)

    // Always go back to initial state when resetting
    setBottomState("initial")

    // If there are notes, ensure we're in the expanded (collapsed bottom) state
    if (notes.length > 0) {
      // Small delay to ensure state is properly set
      setTimeout(() => {
        toggleExpanded(true)
      }, 50)
    }
  }

  const focusHiddenInput = () => {
    if (hiddenInputRef.current) {
      hiddenInputRef.current.focus()
    }
  }

  const handleMetadataLoaded = (title: string, tags: string[]) => {
    setPageTitle(title)
    setPageTags(tags)
  }

  useEffect(() => {
    const handleGlobalPaste = async (e: ClipboardEvent) => {
      // Only handle paste if bottom section is visible and not expanded
      if (!expanded && bottomRef.current) {
        // Check for image data first
        const items = Array.from(e.clipboardData?.items || [])
        const imageItem = items.find((item) => item.type.startsWith("image/"))

        if (imageItem) {
          const file = imageItem.getAsFile()
          if (file) {
            setImageFile(file)
            setImageUrl(URL.createObjectURL(file))
            setBottomState("image-preview")
            return
          }
        }

        // If no image, handle text content
        const content = await handlePasteEvent(e)
        if (content) {
          handlePastedContent(content)
        }
      }
    }

    window.addEventListener("paste", handleGlobalPaste)
    return () => {
      window.removeEventListener("paste", handleGlobalPaste)
    }
  }, [expanded, handlePasteEvent])

  useEffect(() => {
    const handleImageSelected = async (e: CustomEvent) => {
      const file = e.detail as File
      if (file) {
        setImageFile(file)
        setImageUrl(URL.createObjectURL(file))
        setIsProcessingImage(true)

        // Analyze the image using our new API
        try {
          const formData = new FormData()
          formData.append("image", file)

          const response = await fetch("/api/analyze-image", {
            method: "POST",
            body: formData,
          })

          if (response.ok) {
            const result = await response.json()
            // Set the analysis results
            setPageTitle(result.analysis.description)
            setPageTags(result.analysis.tags)
            if (result.analysis.extractedText) {
              setNoteText(result.analysis.extractedText)
            }
          }
        } catch (error) {
          console.error("Error analyzing image:", error)
        } finally {
          setIsProcessingImage(false)
        }
      }
    }

    window.addEventListener("imageSelected", handleImageSelected as EventListener)
    return () => {
      window.removeEventListener("imageSelected", handleImageSelected as EventListener)
    }
  }, [])

  return (
    <div
      ref={bottomRef}
      className={cn("h-full w-full", !expanded && "shadow-[0_-8px_10px_rgba(0,0,0,0.05)]", className)}
      onClick={(e) => {
        if (expanded) {
          toggleExpanded(false)
        } else {
          focusHiddenInput()
        }
      }}
      onContextMenu={(e) => {
        if (clipboardContent) {
          console.log("Right-click detected, clipboard has URL")
        } else {
          e.preventDefault()
        }
      }}
    >
      {/* Hidden input to capture paste events */}
      <input
        ref={hiddenInputRef}
        type="text"
        className="sr-only"
        aria-hidden="true"
        value=""
        onChange={(e) => {
          const typedText = e.target.value
          if (typedText) {
            // User started typing, transition to text-editor with the typed text
            setNoteText(typedText)
            setBottomState("text-editor")
          }
        }}
        onPaste={async (e) => {
          const content = await handlePasteEvent(e)
          if (content) {
            handlePastedContent(content)
          }
        }}
      />

      {expanded ? (
        // Collapsed state - View All button and Plus button
        <div className="h-full relative">
          <CollapsedState
            toggleExpanded={toggleExpanded}
            onSearch={onSearch}
            onViewChange={onViewChange}
            currentView={currentView}
            handleSwipe={(e, info) => handleSwipe(e, info, "bottom")}
            onShare={onShare}
          />
        </div>
      ) : (
        // Different states for the bottom section
        <div
          className={`flex flex-col p-6 z-10 ${
            isFullscreen ? "h-screen" : "h-full"
          } relative rounded-t-xl bg-white/90 backdrop-blur-md ${bottomState === "text-editor" ? "overflow-auto" : "overflow-hidden"}`}
          dragMomentum={false}
        >
          {/* Only show initial state if there are no notes */}
          {bottomState === "initial" && notes.length === 0 && <InitialState setBottomState={setBottomState} />}

          {/* Show options state if there are notes or if bottomState is explicitly set to options */}
          {(bottomState === "options" || (bottomState === "initial" && notes.length > 0)) && (
            <OptionMenu
              handleAddNote={handleAddNote}
              handlePaste={handlePasteAndPreview}
              setBottomState={setBottomState}
              toggleExpanded={toggleExpanded}
            />
          )}

          {bottomState === "preview" && (
            <div className="flex-1 overflow-auto">
              <PreviewCard
                previewUrl={previewUrl}
                screenshotUrl={screenshotUrl}
                isGeneratingScreenshot={isGeneratingScreenshot}
                handleDismiss={handleDismiss}
                handleSave={handleSaveUrl}
                onMetadataLoaded={handleMetadataLoaded}
              />
            </div>
          )}

          {bottomState === "text-editor" && (
            <div className="flex-1 flex flex-col min-h-0">
              <TextEditorCard
                initialText={noteText}
                handleDismiss={handleDismiss}
                handleSave={handleSaveText}
                toggleToCollapsedState={toggleToCollapsedState}
                stickyButtons={true}
                isFullscreen={isFullscreen}
              />
            </div>
          )}

          {bottomState === "image-preview" && (
            <div className="flex-1 overflow-auto">
              <ImagePreviewCard
                imageUrl={imageUrl}
                imageFile={imageFile}
                isProcessingImage={isProcessingImage}
                handleDismiss={handleDismiss}
                handleSave={handleSaveImage}
                analysisDescription={pageTitle}
                analysisTags={pageTags}
                extractedText={noteText}
              />
            </div>
          )}
        </div>
      )}
    </div>
  )
}
