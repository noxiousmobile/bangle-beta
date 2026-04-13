"use client"
import { motion } from "framer-motion"
import type React from "react"

import { useIsMobile } from "@/hooks/use-mobile"

interface FocusModeBarProps {
  onClose: () => void
  onMoodFilter: (mood: string) => void
  anchorRef?: React.RefObject<HTMLElement>
}

// Define mood types with their corresponding emojis and meanings
const MOOD_FILTERS = [
  {
    emoji: "😊",
    label: "Focused",
    description: "When you're in the zone and productive",
    keywords: ["focused", "productive", "work", "deep work", "concentration", "flow state"],
  },
  {
    emoji: "😰",
    label: "Overwhelmed",
    description: "When you have too much on your plate",
    keywords: ["overwhelmed", "stressed", "busy", "deadline", "pressure", "urgent", "todo"],
  },
  {
    emoji: "🤔",
    label: "Exploring",
    description: "When you're learning and discovering new things",
    keywords: ["exploring", "learning", "research", "ideas", "brainstorm", "curious", "discovery"],
  },
  {
    emoji: "✨",
    label: "Inspired",
    description: "When creativity strikes and ideas flow",
    keywords: ["inspired", "creative", "breakthrough", "innovation", "vision", "imagination", "eureka"],
  },
  {
    emoji: "🧘",
    label: "Reflective",
    description: "When you're reviewing and contemplating",
    keywords: ["reflective", "review", "contemplating", "thinking", "analysis", "retrospective", "meditation"],
  },
  {
    emoji: "⚡",
    label: "Energized",
    description: "When you're motivated and ready to act",
    keywords: ["energized", "motivated", "action", "momentum", "drive", "ambitious", "pumped"],
  },
  {
    emoji: "😌",
    label: "Relaxed",
    description: "When you're calm and organizing thoughts",
    keywords: ["relaxed", "calm", "peaceful", "planning", "organizing", "mindful", "zen"],
  },
  {
    emoji: "🔍",
    label: "Curious",
    description: "When you're asking questions and seeking answers",
    keywords: ["curious", "questions", "wondering", "investigating", "seeking", "inquiry", "explore"],
  },
]

export function FocusModeBar({ onClose, onMoodFilter, anchorRef }: FocusModeBarProps) {
  const isMobile = useIsMobile()

  const handleMoodClick = (mood: (typeof MOOD_FILTERS)[0]) => {
    onMoodFilter(mood.label.toLowerCase())
  }

  return (
    <div className="relative w-full max-w-md">
      {/* What are you up to section */}
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-4">What are you up to?</h2>

        {/* Mood filters */}
        <div className="grid grid-cols-4 gap-2">
          {MOOD_FILTERS.map((mood) => (
            <motion.button
              key={mood.label}
              onClick={() => handleMoodClick(mood)}
              className="flex flex-col items-center gap-1.5 p-2 rounded-xl bg-background border border-border hover:border-primary hover:shadow-md transition-all group"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center text-xl group-hover:bg-primary/10 transition-colors">
                {mood.emoji}
              </div>
              <span className="text-xs font-medium text-muted-foreground group-hover:text-primary transition-colors text-center">
                {mood.label}
              </span>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  )
}
