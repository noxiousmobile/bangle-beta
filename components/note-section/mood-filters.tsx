"use client"

interface MoodFiltersProps {
  activeMood: string | null
  setActiveMood: (mood: string | null) => void
}

const moods = [
  { emoji: "😊", label: "Focused", color: "#F97316" },
  { emoji: "🤯", label: "Overwhelmed", color: "#3B82F6" },
  { emoji: "😳", label: "Exploring", color: "#EAB308" },
  { emoji: "✨", label: "Inspired", color: "#F59E0B" },
  { emoji: "🧘", label: "Reflective", color: "#8B5CF6" },
  { emoji: "⚡", label: "Energized", color: "#EF4444" },
  { emoji: "😌", label: "Relaxed", color: "#10B981" },
  { emoji: "🔍", label: "Curious", color: "#06B6D4" },
]

export function MoodFilters({ activeMood, setActiveMood }: MoodFiltersProps) {
  return (
    <div className="mb-2">
      <div className="flex flex-wrap gap-2">
        {moods.map((mood) => (
          <button
            key={mood.label}
            className={`px-3 py-2 text-sm rounded-full whitespace-nowrap transition-all inline-flex items-center gap-2 ${
              activeMood === mood.label
                ? "text-white shadow-md ring-1 ring-white/20"
                : "bg-muted text-foreground hover:bg-muted/80"
            }`}
            style={{
              backgroundColor: activeMood === mood.label ? mood.color : undefined,
            }}
            onClick={() => {
              setActiveMood(activeMood === mood.label ? null : mood.label)
            }}
          >
            <span className="text-base">{mood.emoji}</span>
            <span className="font-medium">{mood.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
