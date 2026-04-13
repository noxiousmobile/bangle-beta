"use client";

import Image from "next/image";
import { ChevronRight, Check } from "lucide-react";
import { useState, useEffect } from "react";
import { useMultiSelect } from "./collaborative/multi-select-provider";
import { useTagVisibility } from "./tag-visibility-provider";
import type { Note as DataNote } from "@/lib/data";

// Define category colors with Apple-inspired palette
export const categoryColors = {
  work: "tag-blue",
  personal: "tag-purple",
  health: "tag-green",
  finance: "tag-yellow",
  education: "tag-orange",
  entertainment: "tag-pink",
  travel: "tag-teal",
  tech: "tag-indigo",
  cooking: "tag-red",
  home: "tag-gray",
  ideas: "tag-blue",
  important: "tag-red",
  projects: "tag-indigo",
  planning: "tag-teal",
  shopping: "tag-yellow",
  languages: "tag-blue",
  reading: "tag-orange",
  fiction: "tag-purple",
  "non-fiction": "tag-indigo",
  recipes: "tag-red",
  dinner: "tag-orange",
  healthy: "tag-green",
  dessert: "tag-pink",
  conference: "tag-blue",
  networking: "tag-teal",
  spanish: "tag-orange",
  french: "tag-blue",
  practice: "tag-green",
  summer: "tag-yellow",
  budget: "tag-yellow",
  "self-improvement": "tag-purple",
  creative: "tag-pink",
};

// Add this helper function after the categoryColors object
export const getTagColor = (tag: string): string => {
  const colorClass =
    categoryColors[tag as keyof typeof categoryColors] || "tag-gray";

  // Map color classes to actual color values
  const colorMap: Record<string, string> = {
    "tag-blue": "#0A84FF",
    "tag-green": "#30D158",
    "tag-indigo": "#5E5CE6",
    "tag-orange": "#FF9F0A",
    "tag-pink": "#FF375F",
    "tag-purple": "#BF5AF2",
    "tag-red": "#FF453A",
    "tag-teal": "#64D2FF",
    "tag-yellow": "#FFD60A",
    "tag-gray": "#8E8E93",
  };

  return colorMap[colorClass] || "#8E8E93";
};

interface Note {
  id: number;
  title: string;
  tags: string[];
  image: string;
  date: string;
  category: string;
  type: string; // Added type field
  content?: string; // Added content field
}

type NoteCardProps = {
  note: DataNote;
  relatedNotes?: number[];
  onTagClick?: (tag: string) => void;
  onNoteClick?: (note: DataNote) => void;
};

export default function NoteCard({
  note,
  relatedNotes = [],
  onTagClick,
  onNoteClick,
}: NoteCardProps) {
  const [showAllTags, setShowAllTags] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const { isMultiSelectMode, isNoteSelected, toggleNoteSelection } =
    useMultiSelect();
  const { showTagNames, expandedNotes, toggleNoteExpanded } =
    useTagVisibility();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const isThisNoteExpanded = expandedNotes.has(note.id);
  const shouldShowTagNames = showTagNames || isThisNoteExpanded;

  const initialTagsToShow = 2;
  const hasMoreTags = note.tags.length > initialTagsToShow;
  const visibleTags = showAllTags
    ? note.tags
    : note.tags.slice(0, initialTagsToShow);
  const hiddenTagsCount = note.tags.length - initialTagsToShow;

  const handleCardClick = () => {
    if (isMultiSelectMode) {
      toggleNoteSelection(note);
    } else {
      onNoteClick?.(note);
    }
  };

  const isSelected = isNoteSelected(note.id);

  const isTextNote =
    note.type === "text" && (note.image === "/placeholder.svg" || !note.image);
  const hasRealImage =
    note.type !== "text" || (note.image && note.image !== "/placeholder.svg");

  const getContentPreview = () => {
    if (!note.content) return "No content";
    const preview = note.content.slice(0, 90);
    return preview.length < note.content.length ? `${preview}...` : preview;
  };

  return (
    <div
      className={`bg-white rounded-xl overflow-hidden border relative cursor-pointer transition-shadow note-card ${
        isSelected
          ? "border-blue-500 ring-2 ring-blue-200 shadow-lg"
          : "border-gray-100 hover:shadow-md"
      } ${isMultiSelectMode ? "select-none" : ""}`}
      onClick={handleCardClick}
      data-note-card="true"
    >
      {/* Multi-select checkbox */}
      {isMultiSelectMode && (
        <div className="absolute top-2 left-2 z-10">
          <div
            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
              isSelected
                ? "bg-blue-500 border-blue-500"
                : "bg-white border-gray-300 hover:border-blue-400"
            }`}
          >
            {isSelected && <Check className="w-4 h-4 text-white" />}
          </div>
        </div>
      )}

      {/* Related notes indicator - always visible (not dependent on hover) */}

      <div className="flex p-3 items-start space-x-3">
        {hasRealImage ? (
          <div className="relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-gray-50">
            <Image
              src={note.image || "/placeholder.svg"}
              alt={note.title}
              fill
              className="object-cover"
            />
          </div>
        ) : (
          <div className="relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 flex flex-col items-start justify-start p-1.5">
            <div className="text-[9px] leading-tight text-gray-500 line-clamp-6 overflow-hidden whitespace-pre-wrap">
              {getContentPreview()}
            </div>
          </div>
        )}

        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-base mb-1 text-gray-800 truncate">
            {note.title}
          </h3>
          <div className="flex flex-wrap gap-2 mb-2">
            {isMounted && shouldShowTagNames ? (
              <>
                {visibleTags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-1 text-xs rounded-full cursor-pointer hover:bg-gray-100 transition-opacity inline-flex items-center gap-1.5 bg-gray-50 text-gray-600"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onTagClick && !isMultiSelectMode) onTagClick(tag);
                    }}
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: getTagColor(tag) }}
                    />
                    {tag}
                  </span>
                ))}

                {hasMoreTags && !showAllTags && (
                  <button
                    className="px-2 py-1 text-xs rounded-full text-gray-500 bg-gray-50 hover:bg-gray-100 flex items-center gap-1 transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowAllTags(true);
                    }}
                  >
                    <span>+{hiddenTagsCount}</span>
                    <ChevronRight className="w-3 h-3" />
                  </button>
                )}

                {showAllTags && (
                  <button
                    className="px-2 py-1 text-xs rounded-full text-gray-500 bg-gray-50 hover:bg-gray-100 transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowAllTags(false);
                    }}
                  >
                    Show less
                  </button>
                )}
              </>
            ) : isMounted ? (
              <div className="flex items-center gap-1.5">
                {note.tags.map((tag) => (
                  <button
                    key={tag}
                    className="w-2.5 h-2.5 rounded-full hover:ring-2 hover:ring-gray-300 transition-all cursor-pointer"
                    style={{ backgroundColor: getTagColor(tag) }}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleNoteExpanded(note.id);
                    }}
                    title={tag}
                  />
                ))}
              </div>
            ) : null}
          </div>
          <p className="text-xs text-gray-400">{note.date}</p>
        </div>
      </div>
    </div>
  );
}
