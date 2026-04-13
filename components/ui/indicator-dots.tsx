"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface IndicatorDotsProps {
  expanded: boolean
  toggleExpanded: (value: boolean) => void
  bottomState?: "initial" | "options" | "preview" | "text-editor"
}

export function IndicatorDots({ expanded, toggleExpanded, bottomState = "initial" }: IndicatorDotsProps) {
  // Hide dots when top section is expanded OR when bottom section has content (preview or text-editor)
  if (expanded || bottomState === "preview" || bottomState === "text-editor") return null

  return (
    <div className="absolute right-4 top-1/2 transform -translate-y-1/2 flex flex-col space-y-3 z-20">
      <motion.button
        className={cn(
          "w-3 h-3 rounded-full transition-all duration-300",
          expanded ? "bg-blue-500 scale-110" : "bg-gray-400 scale-100",
        )}
        whileHover={{ scale: 1.2 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => toggleExpanded(true)}
        aria-label="Show recent notes"
      />
      <motion.button
        className={cn(
          "w-3 h-3 rounded-full transition-all duration-300",
          !expanded ? "bg-blue-500 scale-110" : "bg-gray-400 scale-100",
        )}
        whileHover={{ scale: 1.2 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => toggleExpanded(false)}
        aria-label="Show add note section"
      />
    </div>
  )
}
