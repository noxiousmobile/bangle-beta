"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Check, X, ImageIcon, Loader2 } from "lucide-react"

interface ImagePreviewCardProps {
  imageUrl: string | null
  imageFile: File | null
  isProcessingImage: boolean
  handleDismiss: () => void
  handleSave: (description: string, tags: string[], savedNote?: any) => void // Update this type
  analysisDescription?: string
  analysisTags?: string[]
  extractedText?: string
}

// Mock function to simulate adding a note (replace with your actual implementation)
const addNote = (note: any) => {
  // In a real application, you would save this to a database or state management system
  console.log("Saving note:", note)
  // Mock return value
  return {
    ...note,
    id: Math.random().toString(36).substring(7), // Generate a random ID
    createdAt: new Date(),
  }
}

export function ImagePreviewCard({
  imageUrl,
  imageFile,
  isProcessingImage,
  handleDismiss,
  handleSave,
  analysisDescription,
  analysisTags,
  extractedText,
}: ImagePreviewCardProps) {
  const [description, setDescription] = useState("")
  const [tags, setTags] = useState<string[]>([])
  const [customTags, setCustomTags] = useState<string[]>([])
  const [customTagInput, setCustomTagInput] = useState("")
  const [isGeneratingTags, setIsGeneratingTags] = useState(false)

  useEffect(() => {
    if (analysisDescription) {
      setDescription(analysisDescription)
    }
    if (analysisTags && analysisTags.length > 0) {
      setTags(analysisTags)
      setIsGeneratingTags(false)
    } else if (imageUrl || imageFile) {
      setIsGeneratingTags(true)
      // Fallback logic for when no analysis results are provided
      setTimeout(() => {
        const mockTags = ["image", "visual", "media"]
        if (imageFile) {
          if (imageFile.type.includes("png")) mockTags.push("screenshot")
          if (imageFile.name.toLowerCase().includes("photo")) mockTags.push("photo")
        }
        if (imageUrl) {
          if (imageUrl.includes("wikipedia")) mockTags.push("reference")
          if (imageUrl.includes("photo") || imageUrl.includes("picture")) mockTags.push("photo")
        }
        setTags(mockTags.slice(0, 3))
        setIsGeneratingTags(false)
      }, 1000)
    }
  }, [analysisDescription, analysisTags, imageUrl, imageFile])

  const handleAddCustomTag = () => {
    if (customTagInput.trim() && !customTags.includes(customTagInput.trim())) {
      setCustomTags([...customTags, customTagInput.trim()])
      setCustomTagInput("")
    }
  }

  const handleRemoveCustomTag = (tagToRemove: string) => {
    setCustomTags(customTags.filter((tag) => tag !== tagToRemove))
  }

  const handleSaveClick = () => {
    try {
      const allTags = [...tags, ...customTags]

      // Determine category based on tags or use 'media' as default
      const category =
        allTags.find((tag) =>
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
        ) || "media"

      // Save the note to mock array
      const savedNote = addNote({
        title: description || "Image Note",
        tags: allTags,
        category: category,
        type: "media",
        image: imageUrl || "/placeholder.svg?height=80&width=80",
        date: new Date().toISOString(),
      })

      // Call the original handleSave function with the saved note
      handleSave(description, allTags, savedNote)
    } catch (error) {
      console.error("Error saving image note:", error)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleAddCustomTag()
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="w-full max-w-2xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden"
    >
      {/* Image Preview */}
      <div className="relative bg-gray-100 flex items-center justify-center min-h-[150px] max-h-[200px]">
        {imageUrl ? (
          <img
            src={imageUrl || "/placeholder.svg"}
            alt="Preview"
            className="max-w-[25%] max-h-[120px] object-contain"
            onError={() => console.error("Failed to load image")}
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-gray-500">
            <ImageIcon className="w-12 h-12 mb-2" />
            <span>Loading image...</span>
          </div>
        )}

        {isProcessingImage && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white rounded-lg p-4 flex items-center space-x-2">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Analyzing image content...</span>
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {/* Description Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add a description for this image..."
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            rows={3}
          />
        </div>

        {/* Tags Section */}
        <div className="space-y-3">
          {/* Auto-generated tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Generated Tags</label>
            <div className="flex flex-wrap gap-2">
              {isGeneratingTags ? (
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Extracting content from image...</span>
                </div>
              ) : (
                tags.map((tag) => (
                  <span key={tag} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                    {tag}
                  </span>
                ))
              )}
              {tags.length === 0 && !isGeneratingTags && (
                <span className="text-sm text-gray-500">No auto-generated tags</span>
              )}
            </div>
          </div>

          {/* Custom tags input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Add Custom Tags</label>
            <div className="flex flex-wrap gap-1 p-2 border border-gray-300 rounded-md focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent bg-white min-h-[38px]">
              {customTags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium"
                >
                  {tag}
                  <button
                    onClick={() => handleRemoveCustomTag(tag)}
                    className="ml-1 text-green-600 hover:text-green-800"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
              <input
                type="text"
                value={customTagInput}
                onChange={(e) => setCustomTagInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={customTags.length === 0 ? "Or add tags" : "Add tags"}
                className="flex-1 min-w-[100px] outline-none bg-transparent text-sm"
              />
            </div>
          </div>
        </div>

        {/* Image Info */}
        {imageFile && (
          <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
            <div>File: {imageFile.name}</div>
            <div>Size: {(imageFile.size / 1024 / 1024).toFixed(2)} MB</div>
            <div>Type: {imageFile.type}</div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 pt-3 border-t border-gray-100">
          <motion.button
            className="flex items-center space-x-1 px-4 py-2 bg-gray-100 rounded-md text-gray-700 hover:bg-gray-200"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleDismiss}
          >
            <span>Dismiss</span>
          </motion.button>

          <motion.button
            className="flex items-center space-x-1 px-4 py-2 bg-[#87b717] rounded-md text-white hover:bg-[#7aa615] disabled:opacity-50"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSaveClick}
            disabled={!imageUrl && !imageFile}
          >
            <Check className="w-4 h-4" />
            <span>Save</span>
          </motion.button>
        </div>
      </div>
    </motion.div>
  )
}
