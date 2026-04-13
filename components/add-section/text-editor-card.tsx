"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Check } from "lucide-react"
import { RichTextEditor } from "@/components/rich-text-editor"

// Update the TextEditorCardProps interface to include isFullscreen prop
interface TextEditorCardProps {
  initialText: string
  handleDismiss: () => void
  handleSave: (text: string, tags: string[], savedNote?: any) => void // Update this type
  toggleToCollapsedState?: () => void
  stickyButtons?: boolean
  isFullscreen?: boolean // New prop to indicate fullscreen mode
  recentTags?: string[]
}

// Add the isFullscreen prop to the function parameters with default value
export function TextEditorCard({
  initialText,
  handleDismiss,
  handleSave,
  toggleToCollapsedState,
  stickyButtons = false,
  isFullscreen = false, // Default to false
  recentTags = [],
}: TextEditorCardProps) {
  const [text, setText] = useState<string>(initialText)
  const [htmlContent, setHtmlContent] = useState<string>("")
  const [tags, setTags] = useState<string[]>([])
  const [isGeneratingTags, setIsGeneratingTags] = useState<boolean>(true)

  // Generate tags based on text content
  useEffect(() => {
    const generateTags = async () => {
      setIsGeneratingTags(true)
      try {
        // Simple tag generation logic based on keywords
        const keywords = {
          work: [
            "work",
            "project",
            "meeting",
            "deadline",
            "client",
            "presentation",
            "report",
            "email",
            "task",
            "job",
            "office",
            "business",
            "company",
            "team",
            "colleague",
            "manager",
            "technology",
            "technologies",
          ],
          personal: [
            "personal",
            "family",
            "friend",
            "home",
            "life",
            "birthday",
            "holiday",
            "weekend",
            "hobby",
            "interest",
          ],
          tech: [
            "tech",
            "technology",
            "software",
            "hardware",
            "app",
            "application",
            "website",
            "code",
            "programming",
            "development",
            "computer",
            "digital",
            "online",
            "internet",
            "web",
            "device",
            "gadget",
          ],
          education: [
            "education",
            "learn",
            "study",
            "course",
            "class",
            "school",
            "college",
            "university",
            "degree",
            "knowledge",
            "skill",
            "training",
            "book",
            "reading",
            "research",
            "academic",
          ],
          health: [
            "health",
            "fitness",
            "exercise",
            "workout",
            "gym",
            "diet",
            "nutrition",
            "wellness",
            "medical",
            "doctor",
            "hospital",
            "medicine",
            "therapy",
            "mental",
            "physical",
          ],
          finance: [
            "finance",
            "money",
            "budget",
            "expense",
            "income",
            "saving",
            "investment",
            "bank",
            "account",
            "payment",
            "bill",
            "tax",
            "financial",
            "economic",
            "cost",
            "price",
          ],
          travel: [
            "travel",
            "trip",
            "vacation",
            "journey",
            "tour",
            "destination",
            "flight",
            "hotel",
            "booking",
            "passport",
            "visa",
            "luggage",
            "suitcase",
            "map",
            "guide",
            "tourist",
            "explore",
          ],
          cooking: [
            "cooking",
            "recipe",
            "food",
            "meal",
            "ingredient",
            "kitchen",
            "dish",
            "bake",
            "cook",
            "chef",
            "restaurant",
            "dinner",
            "lunch",
            "breakfast",
            "grocery",
            "taste",
            "flavor",
          ],
          shopping: [
            "shopping",
            "buy",
            "purchase",
            "store",
            "shop",
            "mall",
            "online",
            "price",
            "discount",
            "sale",
            "product",
            "item",
            "brand",
            "retail",
            "consumer",
            "customer",
            "order",
          ],
          important: [
            "important",
            "urgent",
            "priority",
            "critical",
            "essential",
            "necessary",
            "vital",
            "key",
            "significant",
            "crucial",
            "major",
            "primary",
            "fundamental",
            "central",
            "core",
          ],
        }

        const lowerText = text.toLowerCase()
        const matchedTags: string[] = []

        // Check for keyword matches
        Object.entries(keywords).forEach(([category, words]) => {
          if (words.some((word) => lowerText.includes(word))) {
            matchedTags.push(category)
          }
        })

        // Limit to 3 tags
        setTags(matchedTags.slice(0, 3))

        // If no tags found, add a default tag
        if (matchedTags.length === 0) {
          setTags(["personal"])
        }
      } catch (error) {
        console.error("Failed to generate tags:", error)
        setTags(["personal"])
      } finally {
        setIsGeneratingTags(false)
      }
    }

    // Only generate tags if there's text
    if (text.trim()) {
      generateTags()
    } else {
      setTags([])
      setIsGeneratingTags(false)
    }
  }, [text])

  const handleEditorChange = (html: string, markdown: string, tags: string[] = []) => {
    setHtmlContent(html)
    setText(markdown)
    setTags(tags)
  }

  const handleSaveClick = () => {
    if (!text.trim()) {
      return
    }

    try {
      // Determine category based on tags or use 'personal' as default
      const category =
        tags.find((tag) =>
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
        ) || "personal"

      // Save text and html content before clearing
      const savedText = text
      const savedHtmlContent = htmlContent
      const savedTags = [...tags]

      // Create the note object with content included
      const savedNote = {
        id: Date.now(), // Use timestamp for unique ID
        title: savedText.split("\n")[0].substring(0, 50) || "Untitled Note",
        content: savedHtmlContent || savedText,
        tags: savedTags,
        image: "/placeholder.svg?height=80&width=80",
        date: "Just now",
        category: category,
        type: "text" as const,
      }

      // Call the save handler first, before clearing
      handleSave(savedText, savedTags, savedNote)

      // Clear the text after save completes
      setText("")
    } catch (error) {
      console.error("Error saving note:", error)
    }
  }

  const handleDismissClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    setText("")
    handleDismiss()
  }

  return (
    <motion.div
      key="text-editor-state"
      className="flex-1 flex flex-col min-h-0"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex-1 flex flex-col min-h-0">
        <div className="w-full max-w-5xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden flex flex-col flex-1 min-h-0">
          <div className="py-4 flex-1 min-h-0 overflow-auto">
            <div className="h-full px-6">
              <RichTextEditor
                initialContent={initialText}
                onChange={handleEditorChange}
                placeholder="Write your note here..."
                className="w-full h-full"
                autoFocus={true}
                recentTags={recentTags}
              />
            </div>
          </div>

          <div className="border-t border-gray-100 bg-white flex-shrink-0">
            <div className="flex justify-end space-x-3 px-6 py-4">
              <motion.button
                className="flex items-center space-x-1 px-4 py-2 bg-[#edf0f1] rounded-md text-gray-700"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleDismissClick}
              >
                <span>Dismiss</span>
              </motion.button>

              <motion.button
                className="flex items-center space-x-1 px-4 py-2 bg-[#87b717] rounded-md text-white"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSaveClick}
                disabled={!text.trim()}
              >
                <Check className="w-4 h-4" />
                <span>Save</span>
              </motion.button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
