"use client"

import type { RefObject } from "react"
import { jumpToAnchor, setAnchorHighlight } from "@/lib/anchors"

interface NoteAnchorsProps {
  anchors: string[]
  containerRef: RefObject<HTMLElement | null>
}

export function NoteAnchors({ anchors, containerRef }: NoteAnchorsProps) {
  if (anchors.length === 0) return null

  const highlight = (name: string | null) => setAnchorHighlight(containerRef.current, name)

  return (
    <nav aria-label="Jump to section in note" className="flex flex-wrap items-center gap-1.5">
      <span className="mr-1 text-xs text-muted-foreground">Jump to</span>
      {anchors.map((name) => (
        <button
          key={name}
          type="button"
          onClick={() => jumpToAnchor(containerRef.current, name)}
          onMouseEnter={() => highlight(name)}
          onMouseLeave={() => highlight(null)}
          onFocus={() => highlight(name)}
          onBlur={() => highlight(null)}
          className="group inline-flex items-center gap-1.5 rounded-md border border-dashed border-border px-2 py-0.5 font-mono text-xs text-muted-foreground transition-colors hover:border-solid hover:border-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <span
            aria-hidden="true"
            className="size-2 rounded-full border-[1.5px] border-current transition-colors group-hover:bg-current"
          />
          {name}
        </button>
      ))}
    </nav>
  )
}
