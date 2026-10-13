"use client"

import type React from "react"
import { useId, useMemo, useRef, useState } from "react"
import { Plus, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { getTagColor } from "@/components/note-card"

interface TagInputProps {
  tags: string[]
  onChange: (tags: string[]) => void
  availableTags?: string[]
  recentTags?: string[]
  excludeTags?: string[]
  leading?: React.ReactNode
  placeholder?: string
  autoFocus?: boolean
  className?: string
}

const MAX_SUGGESTIONS = 8

export function TagInput({
  tags,
  onChange,
  availableTags,
  recentTags = [],
  excludeTags = [],
  leading,
  placeholder = "Search or add tags...",
  autoFocus = false,
  className,
}: TagInputProps) {
  const [query, setQuery] = useState("")
  const [isOpen, setIsOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const listId = useId()

  const taken = useMemo(
    () => new Set([...tags, ...excludeTags].map((t) => t.toLowerCase())),
    [tags, excludeTags],
  )
  const pool = useMemo(
    () => Array.from(new Set([...(availableTags ?? []), ...recentTags])).sort((a, b) => a.localeCompare(b)),
    [availableTags, recentTags],
  )

  const trimmed = query.trim()
  const matches = trimmed
    ? pool.filter((t) => !taken.has(t.toLowerCase()) && t.toLowerCase().includes(trimmed.toLowerCase()))
    : pool.filter((t) => !taken.has(t.toLowerCase()))
  const suggestions = matches.slice(0, MAX_SUGGESTIONS)
  const canCreate =
    trimmed.length > 0 &&
    !taken.has(trimmed.toLowerCase()) &&
    !pool.some((t) => t.toLowerCase() === trimmed.toLowerCase())
  const options = canCreate ? [...suggestions, trimmed] : suggestions
  const showList = isOpen && options.length > 0
  const visibleRecent = recentTags.filter((t) => !taken.has(t.toLowerCase()))

  const addTag = (raw: string) => {
    const tag = raw.trim()
    if (!tag || taken.has(tag.toLowerCase())) return
    onChange([...tags, tag])
    setQuery("")
    setActiveIndex(0)
    inputRef.current?.focus()
  }

  const removeTag = (tag: string) => {
    onChange(tags.filter((t) => t !== tag))
    inputRef.current?.focus()
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.nativeEvent.isComposing || e.keyCode === 229) return
    if (e.key === "ArrowDown" && options.length > 0) {
      e.preventDefault()
      setIsOpen(true)
      setActiveIndex((i) => (i + 1) % options.length)
    } else if (e.key === "ArrowUp" && options.length > 0) {
      e.preventDefault()
      setIsOpen(true)
      setActiveIndex((i) => (i - 1 + options.length) % options.length)
    } else if (e.key === "Enter" || e.key === ",") {
      e.preventDefault()
      if (showList && options[activeIndex]) addTag(options[activeIndex])
      else if (trimmed) addTag(trimmed)
    } else if (e.key === "Backspace" && query === "" && tags.length > 0) {
      onChange(tags.slice(0, -1))
    } else if (e.key === "Escape") {
      setIsOpen(false)
    }
  }

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <div className="relative">
        <div
          className="flex min-h-10 flex-wrap items-center gap-1.5 rounded-md border border-border bg-background p-2 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20"
          onClick={() => inputRef.current?.focus()}
        >
          {leading}
          {tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted py-0.5 pl-2 pr-1 text-xs font-medium text-foreground"
            >
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: getTagColor(tag) }} aria-hidden="true" />
              {tag}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  removeTag(tag)
                }}
                className="inline-flex h-4 w-4 items-center justify-center rounded-full text-muted-foreground hover:bg-background hover:text-foreground"
                aria-label={`Remove tag ${tag}`}
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
          <input
            ref={inputRef}
            type="text"
            value={query}
            autoFocus={autoFocus}
            onChange={(e) => {
              setQuery(e.target.value.replace(",", ""))
              setIsOpen(true)
              setActiveIndex(0)
            }}
            onFocus={() => setIsOpen(true)}
            onBlur={() => setIsOpen(false)}
            onKeyDown={handleKeyDown}
            placeholder={tags.length === 0 ? placeholder : ""}
            className="min-w-24 flex-1 bg-transparent py-0.5 text-sm text-foreground outline-none placeholder:text-muted-foreground"
            role="combobox"
            aria-expanded={showList}
            aria-controls={listId}
            aria-autocomplete="list"
            aria-label="Tags"
          />
        </div>

        {showList && (
          <ul
            id={listId}
            role="listbox"
            className="absolute z-20 mt-1 max-h-56 w-full overflow-auto rounded-md border border-border bg-popover p-1 text-popover-foreground shadow-lg"
          >
            {options.map((option, index) => {
              const isCreate = canCreate && index === options.length - 1
              return (
                <li
                  key={isCreate ? `create-${option}` : option}
                  role="option"
                  aria-selected={index === activeIndex}
                  onMouseDown={(e) => {
                    e.preventDefault()
                    addTag(option)
                  }}
                  onMouseEnter={() => setActiveIndex(index)}
                  className={cn(
                    "flex cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-sm",
                    index === activeIndex && "bg-accent text-accent-foreground",
                  )}
                >
                  {isCreate ? (
                    <>
                      <Plus className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
                      <span>
                        Create <span className="font-medium">{`"${option}"`}</span>
                      </span>
                    </>
                  ) : (
                    <>
                      <span
                        className="h-2 w-2 rounded-full"
                        style={{ backgroundColor: getTagColor(option) }}
                        aria-hidden="true"
                      />
                      {option}
                    </>
                  )}
                </li>
              )
            })}
          </ul>
        )}
      </div>

      {visibleRecent.length > 0 && (
        <div className="flex flex-col gap-1.5">
          <span className="text-xs text-muted-foreground">Recently used</span>
          <div className="flex flex-wrap gap-1.5">
            {visibleRecent.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => addTag(tag)}
                className="inline-flex items-center gap-1 rounded-md border border-dashed border-border px-2 py-0.5 text-xs text-muted-foreground transition-colors hover:border-primary hover:bg-primary/5 hover:text-primary"
              >
                <Plus className="h-3 w-3" aria-hidden="true" />
                {tag}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
