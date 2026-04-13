"use client"
import { ChevronRight } from "lucide-react"
import { getTagColor } from "@/components/note-card"

interface TagFiltersProps {
  allTags: string[]
  activeFilter: string[] // Changed from string | null to string[]
  tagsToShow: number
  setTagsToShow: (value: number | ((prev: number) => number)) => void
  setActiveFilter: (value: string[]) => void // Changed to accept string[]
}

export function TagFilters({ allTags, activeFilter, tagsToShow, setTagsToShow, setActiveFilter }: TagFiltersProps) {
  return (
    <div className="mb-2">
      <div className="flex flex-wrap gap-2">
        {allTags.slice(0, tagsToShow).map((tag) => (
          <button
            key={tag}
            className={`px-2 py-1 text-xs rounded-full whitespace-nowrap transition-all inline-flex items-center gap-1.5 ${
              activeFilter.includes(tag)
                ? "text-white shadow-md ring-1 ring-white/20"
                : "bg-gray-50 text-gray-600 hover:bg-gray-100"
            }`}
            style={{
              backgroundColor: activeFilter.includes(tag) ? getTagColor(tag) : undefined,
            }}
            onClick={() => {
              // Toggle the tag in the activeFilter array
              if (activeFilter.includes(tag)) {
                setActiveFilter(activeFilter.filter((t) => t !== tag))
              } else {
                setActiveFilter([...activeFilter, tag])
              }
            }}
          >
            <span
              className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${activeFilter.includes(tag) ? "bg-white/30" : ""}`}
              style={{
                backgroundColor: activeFilter.includes(tag) ? "rgba(255, 255, 255, 0.3)" : getTagColor(tag),
              }}
            />
            {tag}
          </button>
        ))}

        {allTags.length > tagsToShow && (
          <button
            className="px-2 py-1 text-xs rounded-full text-gray-500 whitespace-nowrap transition-all flex items-center bg-gray-50 hover:bg-gray-100"
            onClick={(e) => {
              e.stopPropagation()
              setTagsToShow((prev) => prev + 10)
            }}
          >
            <span>+{allTags.length - tagsToShow}</span>
            <ChevronRight className="w-3 h-3 ml-1" />
          </button>
        )}
      </div>
    </div>
  )
}
