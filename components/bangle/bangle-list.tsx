"use client"

import { Layers, ChevronRight, Hash } from "lucide-react"
import { formatAtomCount } from "@/lib/bangle-utils"
import { getTagColor } from "@/components/note-card"
import type { Bangle } from "@/lib/types"

interface BangleListProps {
  bangles: Bangle[]
  selectedBangleId?: string
  onSelectBangle: (bangle: Bangle) => void
}

export function BangleList({ bangles, selectedBangleId, onSelectBangle }: BangleListProps) {
  if (bangles.length === 0) {
    return (
      <div className="p-4 text-center">
        <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
          <Layers className="w-6 h-6 text-muted-foreground" />
        </div>
        <p className="text-sm text-muted-foreground mb-1">No Bangles yet</p>
        <p className="text-xs text-muted-foreground">
          Open a note and click &quot;Create a Bangle&quot; to connect related notes
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-1">
      {bangles.map((bangle) => {
        const isSelected = bangle.id === selectedBangleId
        const previewTags = bangle.mergedTags.slice(0, 3)
        const hasMoreTags = bangle.mergedTags.length > 3

        return (
          <button
            key={bangle.id}
            onClick={() => onSelectBangle(bangle)}
            className={`w-full text-left p-3 rounded-lg transition-all ${
              isSelected
                ? "bg-primary/10 border border-primary/30"
                : "hover:bg-muted border border-transparent"
            }`}
          >
            <div className="flex items-start gap-3">
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  isSelected ? "bg-primary/20" : "bg-muted"
                }`}
              >
                <Layers className={`w-4 h-4 ${isSelected ? "text-primary" : "text-muted-foreground"}`} />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="font-medium text-sm text-foreground truncate">
                    {bangle.title}
                  </h4>
                  <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                </div>

                <div className="flex items-center gap-2 mt-0.5 text-xs text-muted-foreground">
                  <span>{formatAtomCount(bangle.atomIds.length)}</span>
                  <span>·</span>
                  <span className="flex items-center gap-0.5">
                    <Hash className="w-3 h-3" />
                    {bangle.mergedTags.length}
                  </span>
                </div>

                {/* Tag preview */}
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {previewTags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 px-1.5 py-0.5 text-xs rounded bg-muted text-muted-foreground"
                    >
                      <span
                        className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: getTagColor(tag) }}
                      />
                      {tag}
                    </span>
                  ))}
                  {hasMoreTags && (
                    <span className="text-xs text-muted-foreground">
                      +{bangle.mergedTags.length - 3}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </button>
        )
      })}
    </div>
  )
}
