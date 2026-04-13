"use client";

import type React from "react";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  motion,
  useTransform,
  useMotionValue,
  type MotionValue,
  AnimatePresence,
} from "framer-motion";
import { cn } from "@/lib/utils";
import NoteCard, { getTagColor } from "@/components/note-card";
import { type Note, findRelatedNotes } from "@/lib/data";
import type { PanInfo } from "framer-motion";
import {
  Loader2,
  Tag,
  Share2,
  Search,
  X,
  Smile,
  Heart,
  Trash2,
  Save,
  Brain,
  Star,
  LayoutGrid,
  Table,
  Columns2,
  Check,
} from "lucide-react";
import Image from "next/image"; // Added for note image
import { SmartCollectionsPanel } from "@/components/ai-insights/smart-collections-panel";
import { NotePreview } from "@/components/note-preview";
import { abbreviateDate } from "@/lib/utils/date-formatter";
import { aiSearchEngine } from "@/lib/ai/search-engine";
import { useMultiSelect } from "@/components/collaborative/multi-select-provider";
import { useTagVisibility } from "@/components/tag-visibility-provider";
import { TagFilters } from "@/components/note-section/tag-filters";
import { RichTextEditor } from "@/components/rich-text-editor";
import type { ViewMode } from "@/lib/types";
import { FocusModeBar } from "@/components/search/focus-mode-bar";

interface NoteSectionProps {
  notes: Note[];
  expanded: boolean;
  toggleExpanded: () => void;
  isAnimating: boolean;
  springY: MotionValue<number> | null;
  handleSwipe: (
    event: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo,
    source: "top" | "bottom" | "divider",
  ) => void;
  isSearching: boolean;
  searchTerm: string;
  viewMode: ViewMode;
  onNoteDelete: (noteId: number) => void;
  activeFilter: string[];
  setActiveFilter: (filters: string[]) => void;
  activeView: "recents" | "common" | "favourites";
  setActiveView: (view: "recents" | "common" | "favourites") => void;
  onShareNote?: (note: Note) => void; // Changed to onShare for split view compatibility
  onShare?: () => void;
  isDesktopTagsFilterVisible?: boolean;
  activeMoodFilter?: string | null;
  setActiveMoodFilter?: (mood: string | null) => void; // Added declaration here
  onNoteSave?: (
    noteId: number,
    content: { content: string; title?: string },
  ) => void; // Updated for title
  onNoteEdit?: (note: Note) => void;
  onNoteSelect?: (note: Note) => void; // For inline note view
  favouriteNotes?: Set<number>;
  onToggleFavourite?: (noteId: number) => void;
  externalActiveCollection?: any | null;
  onSetActiveCollection?: (collection: any | null) => void;
}

const categoryColors = {
  "tag-blue": "bg-blue-500",
  "tag-green": "bg-green-500",
  "tag-indigo": "bg-indigo-500",
  "tag-orange": "bg-orange-500",
  "tag-pink": "bg-pink-500",
  "tag-purple": "bg-purple-500",
  "tag-red": "bg-red-500",
  "tag-teal": "bg-teal-500",
  "tag-yellow": "bg-yellow-500",
  "tag-gray": "bg-gray-500",
};

export function NoteSection({
  notes,
  expanded,
  toggleExpanded,
  isAnimating,
  springY,
  handleSwipe,
  isSearching = false,
  searchTerm = "",
  viewMode = "grid",
  onNoteDelete,
  activeFilter: externalActiveFilter,
  setActiveFilter: externalSetActiveFilter,
  activeView: externalActiveView,
  setActiveView: externalSetActiveView,
  onShareNote, // Renamed to onShare for consistency with split view usage
  onShare,
  isDesktopTagsFilterVisible = false,
  activeMoodFilter,
  setActiveMoodFilter,
  onNoteSave,
  onNoteEdit,
  onNoteSelect,
  favouriteNotes: externalFavouriteNotes,
  onToggleFavourite: externalToggleFavourite,
  externalActiveCollection,
  onSetActiveCollection,
}: NoteSectionProps) {
  const [internalActiveFilter, setInternalActiveFilter] = useState<string[]>(
    [],
  );
  const activeFilter = externalActiveFilter || internalActiveFilter;
  const setActiveFilter = externalSetActiveFilter || setInternalActiveFilter;

  const [internalActiveView, setInternalActiveView] = useState<
    "recents" | "common" | "favourites"
  >("recents");
  const activeView = externalActiveView || internalActiveView;
  const setActiveView = externalSetActiveView || setInternalActiveView;

  const [tagsToShow, setTagsToShow] = useState(10);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isTagsCollapsed, setIsTagsCollapsed] = useState(false);
  const [isTagsVisible, setIsTagsVisible] = useState(false);
  const [isMobileTagsFilterVisible, setIsMobileTagsFilterVisible] =
    useState(false);
  const [ignoreScroll, setIgnoreScroll] = useState(false);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [isNotePreviewOpen, setIsNotePreviewOpen] = useState(false);
  const [splitViewSelectedNote, setSplitViewSelectedNote] =
    useState<Note | null>(null);
  const topRef = useRef<HTMLDivElement>(null);
  const filterRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [collectionFilter, setCollectionFilter] = useState<number[] | null>(
    null,
  );
  const [isFocusModeOpen, setIsFocusModeOpen] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearchingState, setIsSearching] = useState(false);
  const [activeSearchQuery, setActiveSearchQuery] = useState<string>("");
  const [isInSearchMode, setIsInSearchMode] = useState(false);
  const [internalActiveCollection, setInternalActiveCollection] = useState<
    any | null
  >(null);
  const activeCollection =
    externalActiveCollection !== undefined
      ? externalActiveCollection
      : internalActiveCollection;
  const setActiveCollection =
    onSetActiveCollection || setInternalActiveCollection;
  const {
    isMultiSelectMode,
    toggleMultiSelectMode,
    toggleNoteSelection,
    isNoteSelected,
    selectedNotes,
  } = useMultiSelect();
  const { showTagNames, toggleTagNames } = useTagVisibility();
  const [isShareModeActive, setIsShareModeActive] = useState(false);
  const [internalFavouriteNotes, setInternalFavouriteNotes] = useState<
    Set<number>
  >(new Set());
  const favouriteNotes = externalFavouriteNotes || internalFavouriteNotes;
  const [isSplitViewEditingContent, setIsSplitViewEditingContent] =
    useState(false);
  const [splitViewEditedContent, setSplitViewEditedContent] = useState("");
  const [isSplitViewEditingTitle, setIsSplitViewEditingTitle] = useState(false);
  const [splitViewEditedTitle, setSplitViewEditedTitle] = useState("");
  const splitViewTitleInputRef = useRef<HTMLInputElement>(null);
  const [splitViewWidth, setSplitViewWidth] = useState(35); // Percentage width for left panel
  const [isResizing, setIsResizing] = useState(false);

  const fallbackMotionValue = useMotionValue(0);

  const topOpacity = useTransform(
    springY || fallbackMotionValue, // Use proper MotionValue fallback
    [0, -50],
    [1, expanded ? 1 : 0.6],
  );

  const allTags = Array.from(new Set(notes.flatMap((note) => note.tags)));

  const groupNotesByCommonTags = (notesToGroup: Note[]) => {
    const tagGroups: Map<string, Note[]> = new Map();

    notesToGroup.forEach((note) => {
      note.tags.forEach((tag) => {
        if (!tagGroups.has(tag)) {
          tagGroups.set(tag, []);
        }
        const existingNotes = tagGroups.get(tag) || [];
        if (!existingNotes.some((n) => n.id === note.id)) {
          existingNotes.push(note);
          tagGroups.set(tag, existingNotes);
        }
      });
    });

    const sortedGroups = Array.from(tagGroups.entries()).sort(
      (a, b) => b[1].length - a[1].length,
    );

    const seenIds = new Set<number>();
    const result: Note[] = [];

    sortedGroups.forEach(([_, groupNotes]) => {
      groupNotes.forEach((note) => {
        if (!seenIds.has(note.id)) {
          result.push(note);
          seenIds.add(note.id);
        }
      });
    });

    notesToGroup.forEach((note) => {
      if (note.tags.length === 0 && !seenIds.has(note.id)) {
        result.push(note);
        seenIds.add(note.id);
      }
    });

    return result;
  };

  const handleToggleFavourite = (noteId: number) => {
    if (externalToggleFavourite) {
      externalToggleFavourite(noteId);
    } else {
      setInternalFavouriteNotes((prev) => {
        const newFavourites = new Set(prev);
        if (newFavourites.has(noteId)) {
          newFavourites.delete(noteId);
        } else {
          newFavourites.add(noteId);
        }
        return newFavourites;
      });
    }
  };

  // Helper for checking if a note is selected in multi-select mode

  const filterNotesByMood = (notes: Note[], mood: string) => {
    const moodKeywords = {
      focused: [
        "focused",
        "productive",
        "work",
        "deep work",
        "concentration",
        "flow state",
        "project",
        "task",
        "goal",
      ],
      overwhelmed: [
        "overwhelmed",
        "stressed",
        "busy",
        "deadline",
        "pressure",
        "urgent",
        "todo",
        "multiple",
        "rush",
      ],
      exploring: [
        "exploring",
        "learning",
        "research",
        "ideas",
        "brainstorm",
        "curious",
        "discovery",
        "new",
        "study",
      ],
    };

    const keywords = moodKeywords[mood as keyof typeof moodKeywords] || [];

    return notes.filter((note) => {
      const searchText =
        `${note.title} ${note.tags.join(" ")} ${note.category}`.toLowerCase();
      return keywords.some((keyword) => searchText.includes(keyword));
    });
  };

  const processedNotes = useMemo(() => {
    if (isInSearchMode && searchResults.length > 0) {
      return searchResults;
    }

    const filteredNotes = activeCollection
      ? notes.filter((note) => activeCollection.noteIds.includes(note.id))
      : collectionFilter
        ? notes.filter((note) => collectionFilter.includes(note.id))
        : [...notes];

    const moodFilteredNotes = activeMoodFilter
      ? filterNotesByMood(filteredNotes, activeMoodFilter)
      : filteredNotes;

    const filteredByTag =
      activeFilter.length > 0
        ? moodFilteredNotes.filter((note) =>
            activeFilter.some(
              (filter) =>
                note.category === filter || note.tags.includes(filter),
            ),
          )
        : moodFilteredNotes;

    switch (activeView) {
      case "recents":
        return filteredByTag;
      case "common":
        return groupNotesByCommonTags(filteredByTag);
      case "favourites":
        return filteredByTag.filter((note) => favouriteNotes.has(note.id));
      default:
        return filteredByTag;
    }
  }, [
    notes,
    activeFilter,
    activeView,
    collectionFilter,
    activeCollection,
    favouriteNotes,
    isInSearchMode,
    searchResults,
    activeMoodFilter, // Added to dependency array
  ]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        filterRef.current &&
        !filterRef.current.contains(event.target as Node)
      ) {
        setIsFilterOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (contentRef.current && !ignoreScroll) {
        if (contentRef.current.scrollTop > 50 && !isTagsCollapsed) {
          setIsTagsCollapsed(true);
          setIsTagsVisible(false);
        } else if (contentRef.current.scrollTop <= 50 && isTagsCollapsed) {
          setIsTagsCollapsed(false);
          setIsTagsVisible(true);
        }
      }
    };

    const currentContentRef = contentRef.current;
    if (currentContentRef) {
      currentContentRef.addEventListener("scroll", handleScroll);
    }

    return () => {
      if (currentContentRef) {
        currentContentRef.removeEventListener("scroll", handleScroll);
      }
    };
  }, [isTagsCollapsed, ignoreScroll]);

  useEffect(() => {
    if (contentRef.current) {
      if (contentRef.current.scrollTop <= 50) {
        setIsTagsVisible(true);
      } else {
        setIsTagsVisible(false);
      }
    }
  }, []);

  useEffect(() => {
    const handleFocusModeTrigger = (e: CustomEvent) => {
      setIsFocusModeOpen(true);
    };

    window.addEventListener("triggerFocusMode", handleFocusModeTrigger);

    return () => {
      window.removeEventListener("triggerFocusMode", handleFocusModeTrigger);
    };
  }, []);

  useEffect(() => {
    if (viewMode !== "collections" && activeCollection) {
      setActiveCollection(null);
    }
  }, [viewMode, activeCollection]);

  useEffect(() => {
    const isTagsFilterActive =
      isDesktopTagsFilterVisible || isMobileTagsFilterVisible;

    if (isTagsFilterActive && !showTagNames) {
      // Show tag names when Tags filter becomes active
      toggleTagNames();
    } else if (!isTagsFilterActive && showTagNames) {
      // Hide tag names when Tags filter becomes inactive
      toggleTagNames();
    }
  }, [isDesktopTagsFilterVisible, isMobileTagsFilterVisible]);

  useEffect(() => {
    if (viewMode === "table" && !showTagNames) {
      toggleTagNames();
    } else if (viewMode !== "table" && showTagNames) {
      toggleTagNames();
    }
  }, [viewMode]);

  const getViewTitle = () => {
    if (viewMode === "collections" && !activeCollection) {
      return "Insights (Powered by Bangle AI)";
    }

    if (activeCollection) {
      return activeCollection.name;
    }

    if (activeMoodFilter) {
      const moodLabels = {
        focused: "Focused Notes",
        overwhelmed: "Overwhelmed Notes",
        exploring: "Exploring Notes",
      };
      return (
        moodLabels[activeMoodFilter as keyof typeof moodLabels] ||
        "Filtered Notes"
      );
    }

    switch (activeView) {
      case "recents":
        return "Recent";
      case "common":
        return "Common Tags";
      case "favourites":
        return "Favourites";
      default:
        return "Notes";
    }
  };

  const handleNoteClick = (note: Note) => {
    setSelectedNote(note);
    setIsNotePreviewOpen(true);
  };

  const handleNoteCardClick = (note: Note) => {
    if (viewMode === "split") {
      setSplitViewSelectedNote(note);
      return;
    }

    // Use inline note view if onNoteSelect is provided (desktop)
    if (onNoteSelect) {
      onNoteSelect(note);
      if (isFocusModeOpen) {
        setIsFocusModeOpen(false);
      }
      return;
    }

    // Fallback to modal for mobile
    setSelectedNote(note);
    setIsNotePreviewOpen(true);
    if (isFocusModeOpen) {
      setIsFocusModeOpen(false);
    }
  };

  const toggleTagsCollapsed = () => {
    if (isTagsCollapsed) {
      setIsTagsCollapsed(false);
      setIsTagsVisible(true);
      setIgnoreScroll(true);

      setTimeout(() => {
        setIgnoreScroll(false);
      }, 2000);
    } else {
      setIsTagsCollapsed(true);
      setIsTagsVisible(false);
    }
  };

  const activeFilterCount = activeFilter.length;

  const handleAdvancedSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      setIsInSearchMode(false);
      setActiveSearchQuery("");
      return;
    }

    setIsSearching(true);
    try {
      const results = await aiSearchEngine.semanticSearch(query, notes);
      setSearchResults(results.map((r) => r.note));
      setIsInSearchMode(true);
      setActiveSearchQuery(query);
      setIsFocusModeOpen(false);
    } catch (error) {
      console.error("Search error:", error);
      setSearchResults([]);
      setIsInSearchMode(false);
      setActiveSearchQuery("");
    } finally {
      setIsSearching(false);
    }
  };

  const handleMoodFilter = (mood: string) => {
    setIsFocusModeOpen(false);
  };

  const clearSearch = () => {
    setSearchResults([]);
    setIsInSearchMode(false);
    setActiveSearchQuery("");
    setIsSearching(false);
  };

  // Handle multi-select actions
  const handleMultiSelectAction = async (
    action: "delete" | "share" | "tag",
  ) => {
    if (selectedNotes.length === 0) return;

    switch (action) {
      case "delete":
        selectedNotes.forEach((note) => onNoteDelete(note.id));
        toggleMultiSelectMode();
        // Selection is cleared by the provider when multi-select mode is turned off
        break;
      case "share":
        // Implement share logic for multiple notes if applicable
        console.log(
          "Sharing notes:",
          selectedNotes.map((n) => n.id),
        );
        break;
      case "tag":
        // Implement tag logic for multiple notes if applicable
        console.log(
          "Tagging notes:",
          selectedNotes.map((n) => n.id),
        );
        break;
    }
  };

  const handleSplitViewEditTitle = () => {
    if (!isSplitViewEditingTitle && splitViewSelectedNote) {
      setIsSplitViewEditingTitle(true);
      setSplitViewEditedTitle(splitViewSelectedNote.title);
      setTimeout(() => {
        splitViewTitleInputRef.current?.focus();
      }, 100);
    }
  };

  const handleSplitViewSaveTitle = () => {
    if (
      splitViewSelectedNote &&
      splitViewEditedTitle !== splitViewSelectedNote.title
    ) {
      onNoteSave?.(splitViewSelectedNote.id, {
        title: splitViewEditedTitle,
      });
      if (onNoteEdit) {
        const updatedNote = {
          ...splitViewSelectedNote,
          title: splitViewEditedTitle,
        };
        onNoteEdit(updatedNote);
        setSplitViewSelectedNote(updatedNote);
      }
    }
    setIsSplitViewEditingTitle(false);
  };

  const handleSplitViewCancelTitle = () => {
    if (splitViewSelectedNote) {
      setSplitViewEditedTitle(splitViewSelectedNote.title);
    }
    setIsSplitViewEditingTitle(false);
  };

  const handleSplitViewEditContent = () => {
    if (!isSplitViewEditingContent && splitViewSelectedNote) {
      setIsSplitViewEditingContent(true);
      setSplitViewEditedContent(splitViewSelectedNote.content || "");
    }
  };

  const handleSplitViewSaveContent = () => {
    if (
      splitViewSelectedNote &&
      splitViewEditedContent !== splitViewSelectedNote.content
    ) {
      onNoteSave?.(splitViewSelectedNote.id, {
        content: splitViewEditedContent,
      });
      if (onNoteEdit) {
        const updatedNote = {
          ...splitViewSelectedNote,
          content: splitViewEditedContent,
        };
        onNoteEdit(updatedNote);
        setSplitViewSelectedNote(updatedNote);
      }
    }
    setIsSplitViewEditingContent(false);
  };

  const handleSplitViewCancelContent = () => {
    if (splitViewSelectedNote) {
      setSplitViewEditedContent(splitViewSelectedNote.content || "");
    }
    setIsSplitViewEditingContent(false);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;

      const container = document.querySelector(".split-view-container");
      if (!container) return;

      const containerRect = container.getBoundingClientRect();
      const newWidth =
        ((e.clientX - containerRect.left) / containerRect.width) * 100;

      // Constrain between 20% and 70%
      if (newWidth >= 20 && newWidth <= 70) {
        setSplitViewWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isResizing]);

  const renderContent = () => {
    if (viewMode === "collections" && !activeCollection) {
      return (
        <div className="px-6 pb-6">
          <SmartCollectionsPanel
            notes={notes}
            isVisible={true}
            onCollectionClick={(collection) => {
              console.log("Collection clicked:", collection);
              setActiveCollection(collection);
            }}
          />
        </div>
      );
    } else if (viewMode === "split") {
      // Paginate notes for the split view list
      const notesPerPage = 10;
      const paginatedNotes = processedNotes.slice(0, notesPerPage); // Simple pagination

      return (
        <div className="flex gap-0 h-[calc(100vh-160px)] split-view-container relative">
          {/* Left column - Notes list with adjustable width */}
          <div
            className="flex-shrink-0 overflow-y-auto pr-2 h-full"
            style={{ width: `${splitViewWidth}%` }}
          >
            <div className="space-y-2 p-2">
              {paginatedNotes.map((note) => (
                <div
                  key={note.id}
                  className={`p-3 rounded-lg border transition-all cursor-pointer ${
                    splitViewSelectedNote?.id === note.id
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 bg-white hover:border-gray-300"
                  } ${isMultiSelectMode && isNoteSelected(note.id) ? "ring-2 ring-blue-200 border-blue-500" : ""}`}
                  onClick={() => {
                    if (isMultiSelectMode) {
                      toggleNoteSelection(note);
                    } else {
                      if (
                        isSplitViewEditingContent &&
                        splitViewSelectedNote?.id !== note.id
                      ) {
                        setIsSplitViewEditingContent(false);
                        setSplitViewEditedContent("");
                      }
                      if (
                        isSplitViewEditingTitle &&
                        splitViewSelectedNote?.id !== note.id
                      ) {
                        setIsSplitViewEditingTitle(false);
                        setSplitViewEditedTitle("");
                      }
                      setSplitViewSelectedNote(note);
                    }
                  }}
                >
                  {isMultiSelectMode && (
                    <div className="flex items-start gap-2 mb-2">
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all flex-shrink-0 ${
                          isNoteSelected(note.id)
                            ? "bg-blue-500 border-blue-500"
                            : "bg-white border-gray-300 hover:border-blue-300"
                        }`}
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleNoteSelection(note);
                        }}
                      >
                        {isNoteSelected(note.id) && (
                          <Check className="w-3.5 h-3.5 text-white" />
                        )}
                      </div>
                    </div>
                  )}

                  <div className="flex items-start gap-3">
                    {note.image && note.image !== "/placeholder.svg" ? (
                      <div className="relative w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-gray-50">
                        <Image
                          src={note.image || "/placeholder.svg"}
                          alt={note.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="relative w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 flex items-start justify-start p-1.5">
                        <div className="text-[8px] leading-tight text-gray-500 line-clamp-5">
                          {note.content?.slice(0, 80) || "No content"}
                        </div>
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 mb-1 line-clamp-1 text-sm">
                        {note.title}
                      </h3>
                      <p className="text-xs text-gray-500 line-clamp-2">
                        {note.content?.slice(0, 100) || "No content"}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          {note.tags && note.tags.length > 0 && (
                            <>
                              {showTagNames ||
                              isDesktopTagsFilterVisible ||
                              isMobileTagsFilterVisible ? (
                                <>
                                  {note.tags.slice(0, 2).map((tag) => (
                                    <span
                                      key={tag}
                                      className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs text-gray-600 bg-gray-50"
                                    >
                                      <span
                                        className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                                        style={{
                                          backgroundColor: getTagColor(tag),
                                        }}
                                      />
                                      {tag}
                                    </span>
                                  ))}
                                  {note.tags.length > 2 && (
                                    <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs text-gray-500 bg-gray-50">
                                      +{note.tags.length - 2}
                                    </span>
                                  )}
                                </>
                              ) : (
                                <>
                                  {note.tags.slice(0, 3).map((tag) => (
                                    <span
                                      key={tag}
                                      className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                                      style={{
                                        backgroundColor: getTagColor(tag),
                                      }}
                                    />
                                  ))}
                                  {note.tags.length > 3 && (
                                    <span className="text-xs text-gray-400">
                                      +{note.tags.length - 3}
                                    </span>
                                  )}
                                </>
                              )}
                            </>
                          )}
                        </div>
                        <span className="text-xs text-gray-400">
                          {abbreviateDate(note.date || note.timestamp)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div
            className={`w-1 bg-gray-200 hover:bg-blue-400 cursor-col-resize transition-colors relative group ${
              isResizing ? "bg-blue-500" : ""
            }`}
            onMouseDown={handleMouseDown}
          >
            <div className="absolute inset-0 w-3 -mx-1" />
          </div>

          {/* Right column - Note preview with adjustable width */}
          <div className="flex-1 overflow-hidden flex flex-col bg-white border-l border-gray-200 h-full">
            {splitViewSelectedNote ? (
              <>
                {/* Note header - fixed at top */}
                <div className="border-b border-gray-200 px-6 py-2 bg-gradient-to-r from-blue-50 to-purple-50 flex-shrink-0">
                  <div className="flex items-center gap-2">
                    {isSplitViewEditingTitle ? (
                      <>
                        <input
                          ref={splitViewTitleInputRef}
                          type="text"
                          value={splitViewEditedTitle}
                          onChange={(e) =>
                            setSplitViewEditedTitle(e.target.value)
                          }
                          className="flex-1 text-xl font-bold text-gray-900 bg-white border border-gray-300 rounded-lg px-3 py-1.5 focus:outline-none focus:border-blue-400 focus:shadow-sm transition-all"
                          placeholder="Note title"
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              handleSplitViewSaveTitle();
                            } else if (e.key === "Escape") {
                              handleSplitViewCancelTitle();
                            }
                          }}
                        />
                        <button
                          onClick={handleSplitViewSaveTitle}
                          className="p-2 hover:bg-green-100 rounded-full transition-colors text-green-600"
                          title="Save title"
                        >
                          <Save className="w-5 h-5" />
                        </button>
                        <button
                          onClick={handleSplitViewCancelTitle}
                          className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-600"
                          title="Cancel"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </>
                    ) : (
                      <h2
                        className="text-xl font-bold text-gray-900 cursor-pointer hover:text-gray-700 transition-colors"
                        onClick={handleSplitViewEditTitle}
                        title="Click to edit title"
                      >
                        {splitViewSelectedNote.title}
                      </h2>
                    )}
                  </div>
                </div>

                {/* Note content - scrollable area */}
                <div className="flex-1 overflow-y-auto p-6 min-h-0">
                  <div className="prose max-w-none">
                    {isSplitViewEditingContent ? (
                      <div className="bg-card rounded-xl border border-border p-4 md:p-6">
                        <RichTextEditor
                          initialContent={splitViewEditedContent}
                          placeholder="Write your note content here..."
                          onChange={(html) => setSplitViewEditedContent(html)}
                          autoFocus={true}
                          showTags={false}
                        />
                      </div>
                    ) : (
                      <div
                        className="cursor-pointer hover:bg-muted/50 transition-colors rounded-lg p-4"
                        onClick={handleSplitViewEditContent}
                      >
                        <p className="text-foreground whitespace-pre-wrap leading-relaxed">
                          {splitViewSelectedNote.content ||
                            "No content available"}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action buttons - fixed at bottom */}
                <div className="border-t border-border p-4 flex items-center justify-between gap-4 flex-shrink-0 bg-white">
                  {/* Left side: Save/Cancel buttons when editing, or date/category when viewing */}
                  <div className="flex items-center gap-2">
                    {isSplitViewEditingContent ? (
                      <>
                        <button
                          onClick={handleSplitViewSaveContent}
                          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm"
                        >
                          <Save className="w-4 h-4" />
                          Save
                        </button>
                        <button
                          onClick={handleSplitViewCancelContent}
                          className="flex items-center gap-2 px-4 py-2 bg-muted text-muted-foreground rounded-lg hover:bg-muted/80 transition-colors text-sm"
                        >
                          <X className="w-4 h-4" />
                          Cancel
                        </button>
                      </>
                    ) : (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <span>{splitViewSelectedNote.date}</span>
                        <span>•</span>
                        <span className="capitalize">
                          {splitViewSelectedNote.category}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Action buttons on the right */}
                  <div className="flex items-center gap-2">
                    <button
                      className={`p-2 rounded-full transition-all ${
                        favouriteNotes.has(splitViewSelectedNote.id)
                          ? "bg-destructive/10 text-destructive"
                          : "hover:bg-muted text-muted-foreground"
                      }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleFavourite(splitViewSelectedNote.id);
                      }}
                      title={
                        favouriteNotes.has(splitViewSelectedNote.id)
                          ? "Remove from favorites"
                          : "Add to favorites"
                      }
                    >
                      <Heart
                        className={`w-5 h-5 ${favouriteNotes.has(splitViewSelectedNote.id) ? "fill-current" : ""}`}
                      />
                    </button>
                    <button
                      className="p-2 hover:bg-muted rounded-full transition-colors text-muted-foreground"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onShareNote) {
                          onShareNote(splitViewSelectedNote);
                        }
                      }}
                      title="Share this note"
                    >
                      <Share2 className="w-5 h-5" />
                    </button>
                    <button
                      className="p-2 hover:bg-destructive/10 rounded-full transition-colors text-destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onNoteDelete && splitViewSelectedNote) {
                          onNoteDelete(splitViewSelectedNote.id);
                          setSplitViewSelectedNote(null);
                        }
                      }}
                      title="Delete this note"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400">
                <div className="text-center">
                  <div className="text-6xl mb-4">📝</div>
                  <p className="text-lg">Select a note to view its content</p>
                </div>
              </div>
            )}
          </div>
        </div>
      );
    } else if (viewMode === "grid" || activeCollection) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-20">
          {processedNotes.map((note) => (
            <NoteCard
              key={note.id}
              note={note}
              relatedNotes={findRelatedNotes(note.id)}
              onTagClick={(tag) =>
                setActiveFilter(
                  activeFilter.includes(tag)
                    ? activeFilter.filter((t) => t !== tag)
                    : [...activeFilter, tag],
                )
              }
              onNoteClick={handleNoteCardClick}
            />
          ))}
        </div>
      );
    } else {
      // This covers the 'table' view mode
      return (
        <div className="overflow-hidden rounded-lg border border-gray-200 shadow-sm mb-20">
          <div className="overflow-x-auto w-full">
            <table className="w-full border-collapse bg-white text-left text-sm text-gray-500 min-w-[500px]">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-4 font-medium text-gray-900"
                  >
                    Title
                  </th>
                  <th
                    scope="col"
                    className="hidden sm:table-cell px-6 py-4 font-medium text-gray-900"
                  >
                    Category
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-4 font-medium text-gray-900"
                  >
                    Tags
                  </th>
                  <th
                    scope="col"
                    className="hidden sm:table-cell px-6 py-4 font-medium text-gray-900"
                  >
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 border-t border-gray-100">
                {processedNotes.map((note) => (
                  <tr
                    key={note.id}
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => handleNoteCardClick(note)}
                  >
                    <td className="px-3 pr-2 sm:px-6 py-2 sm:py-4 font-medium text-gray-900 w-[140px] sm:w-auto max-w-[140px] sm:max-w-none">
                      <div className="text-sm sm:text-base truncate">
                        {note.title}
                      </div>
                      <div className="sm:hidden text-xs text-gray-500 mt-0.5">
                        {abbreviateDate(note.date)} in{" "}
                        <span className="font-semibold">{note.category}</span>
                      </div>
                    </td>
                    <td className="hidden sm:table-cell px-6 py-4">
                      {note.category}
                    </td>
                    <td className="px-6 py-3 sm:py-4">
                      <div className="flex flex-wrap gap-1.5">
                        {note.tags.slice(0, 2).map((tag: any) => (
                          <span
                            key={tag}
                            className={`inline-flex items-center gap-1.5 rounded-full transition-colors ${
                              showTagNames
                                ? "px-2 py-0.5 sm:py-1 text-xs text-gray-600 bg-gray-50 hover:bg-gray-100 cursor-pointer"
                                : "w-3 h-3 cursor-pointer hover:ring-2 hover:ring-offset-1 hover:ring-gray-300"
                            }`}
                            style={
                              !showTagNames
                                ? { backgroundColor: getTagColor(tag) }
                                : undefined
                            }
                            onClick={(e) => {
                              e.stopPropagation();
                              if (activeFilter.includes(tag)) {
                                setActiveFilter(
                                  activeFilter.filter((t) => t !== tag),
                                );
                              } else {
                                setActiveFilter([...activeFilter, tag]);
                              }
                            }}
                          >
                            {showTagNames && (
                              <>
                                <span
                                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                                  style={{ backgroundColor: getTagColor(tag) }}
                                />
                                {tag}
                              </>
                            )}
                          </span>
                        ))}
                        {note.tags.length > 2 && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-gray-50 px-2 py-0.5 sm:py-1 text-xs text-gray-600">
                            +{note.tags.length - 2}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="hidden sm:table-cell px-6 py-4">
                      {note.date}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      );
    }
  };

  useEffect(() => {
    if (
      viewMode === "split" &&
      processedNotes.length > 0 &&
      !splitViewSelectedNote
    ) {
      setSplitViewSelectedNote(processedNotes[0]);
    }
  }, [viewMode, processedNotes, splitViewSelectedNote]);

  const handleMobileMoodsToggle = () => {
    const newVisibility = !isFocusModeOpen;
    setIsFocusModeOpen(newVisibility);
    if (!newVisibility && setActiveMoodFilter) {
      setActiveMoodFilter(null);
    }
  };

  const handleMobileTagsToggle = () => {
    const newVisibility = !isMobileTagsFilterVisible;
    setIsMobileTagsFilterVisible(newVisibility);
    if (!newVisibility) {
      setActiveFilter([]);
    }
  };

  return (
    <>
      <div
        ref={topRef}
        className={cn(
          "h-full w-full bg-white overflow-auto",
          !expanded ? "cursor-pointer" : "",
        )}
        onClick={() => !expanded && toggleExpanded(true)}
      >
        <div
          ref={contentRef}
          className={cn(
            "h-full bg-gradient-to-br from-gray-100 to-gray-200",
            viewMode === "split" ? "overflow-hidden" : "overflow-auto",
          )}
        >
          <div className="sticky top-0 z-10 py-4 px-6 pb-2 bg-gradient-to-br from-gray-100 to-gray-200 shadow-sm">
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center gap-2">
                {activeCollection ? (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setActiveCollection(null)}
                      className="text-blue-600 hover:text-blue-800 text-xl font-semibold transition-colors"
                    >
                      AI Collections
                    </button>
                    <span className="text-gray-400 text-xl">/</span>
                    <span className="text-xl font-semibold text-gray-800">
                      {getViewTitle()}
                    </span>
                  </div>
                ) : (
                  <h1 className="text-2xl lg:text-xl font-semibold text-gray-800">
                    {getViewTitle()}
                  </h1>
                )}
              </div>

              <div className="flex items-center gap-3">
                {expanded &&
                  viewMode !== "collections" &&
                  !activeCollection && (
                    <div className="lg:hidden relative" ref={filterRef}>
                      <button
                        className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 bg-white rounded-full shadow-sm hover:bg-gray-50 transition-colors"
                        data-filter-button
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsFilterOpen(!isFilterOpen);
                        }}
                      >
                        <svg
                          className="w-3.5 h-3.5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                          />
                        </svg>
                        <span>
                          Menu{" "}
                          {activeFilterCount > 0 && `(${activeFilterCount})`}
                        </span>
                        <svg
                          className={`w-3.5 h-3.5 transition-transform ${isFilterOpen ? "rotate-180" : ""}`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </button>

                      {isFilterOpen && (
                        <div className="absolute top-full left-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
                          <div className="p-4">
                            <div className="mb-4">
                              <h3 className="text-sm font-medium text-gray-900 mb-3">
                                View
                              </h3>
                              <div className="space-y-1">
                                <button
                                  className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors ${
                                    viewMode === "grid"
                                      ? "bg-blue-50 text-blue-700"
                                      : "text-gray-600 hover:bg-gray-50"
                                  }`}
                                  onClick={() => {
                                    if (typeof window !== "undefined") {
                                      const event = new CustomEvent(
                                        "viewModeChange",
                                        { detail: "grid" },
                                      );
                                      window.dispatchEvent(event);
                                    }
                                    setIsFilterOpen(false);
                                  }}
                                >
                                  <LayoutGrid className="w-4 h-4" />
                                  Grid
                                </button>
                                <button
                                  className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors ${
                                    viewMode === "table"
                                      ? "bg-blue-50 text-blue-700"
                                      : "text-gray-600 hover:bg-gray-50"
                                  }`}
                                  onClick={() => {
                                    if (typeof window !== "undefined") {
                                      const event = new CustomEvent(
                                        "viewModeChange",
                                        { detail: "table" },
                                      );
                                      window.dispatchEvent(event);
                                    }
                                    setIsFilterOpen(false);
                                  }}
                                >
                                  <Table className="w-4 h-4" />
                                  Table
                                </button>
                                <button
                                  className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors ${
                                    viewMode === "split"
                                      ? "bg-blue-50 text-blue-700"
                                      : "text-gray-600 hover:bg-gray-50"
                                  }`}
                                  onClick={() => {
                                    if (typeof window !== "undefined") {
                                      const event = new CustomEvent(
                                        "viewModeChange",
                                        { detail: "split" },
                                      );
                                      window.dispatchEvent(event);
                                    }
                                    setIsFilterOpen(false);
                                  }}
                                >
                                  <Columns2 className="w-4 h-4" />
                                  Split
                                </button>
                              </div>
                            </div>

                            <div className="border-t border-gray-100 pt-4 mb-4">
                              <h3 className="text-sm font-medium text-gray-900 mb-3">
                                Sort
                              </h3>
                              <div className="space-y-1">
                                <button
                                  className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors ${
                                    activeView === "recents"
                                      ? "bg-blue-50 text-blue-700"
                                      : "text-gray-600 hover:bg-gray-50"
                                  }`}
                                  onClick={() => {
                                    setActiveView("recents");
                                    setIsFilterOpen(false);
                                  }}
                                >
                                  <svg
                                    className="w-4 h-4"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <circle cx="12" cy="12" r="10"></circle>
                                    <polyline points="12,6 12,12 16,14"></polyline>
                                  </svg>
                                  Recent
                                </button>
                                <button
                                  className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors ${
                                    activeView === "common"
                                      ? "bg-blue-50 text-blue-700"
                                      : "text-gray-600 hover:bg-gray-50"
                                  }`}
                                  onClick={() => {
                                    setActiveView("common");
                                    setIsFilterOpen(false);
                                  }}
                                >
                                  <svg
                                    className="w-4 h-4"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <line
                                      x1="18"
                                      y1="20"
                                      x2="18"
                                      y2="10"
                                    ></line>
                                    <line x1="12" y1="20" x2="12" y2="4"></line>
                                    <line x1="6" y1="20" x2="6" y2="14"></line>
                                  </svg>
                                  Common
                                </button>
                                <button
                                  className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors text-gray-600 hover:bg-gray-50"
                                  onClick={() => {
                                    // Trigger AI mode
                                    if (typeof window !== "undefined") {
                                      const event = new CustomEvent(
                                        "viewModeChange",
                                        { detail: "collections" },
                                      );
                                      window.dispatchEvent(event);
                                    }
                                    setIsFilterOpen(false);
                                  }}
                                >
                                  <Brain className="w-4 h-4" />
                                  Insight (AI)
                                </button>
                              </div>
                            </div>

                            <div className="border-t border-gray-100 pt-4 mb-4">
                              <h3 className="text-sm font-medium text-gray-900 mb-3">
                                Filter
                              </h3>
                              <div className="space-y-1">
                                <button
                                  className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors ${
                                    activeView === "favourites"
                                      ? "bg-blue-50 text-blue-700"
                                      : "text-gray-600 hover:bg-gray-50"
                                  }`}
                                  onClick={() => {
                                    setActiveView("favourites");
                                    setIsFilterOpen(false);
                                  }}
                                >
                                  <Star className="w-4 h-4" />
                                  Favourites
                                </button>
                                <button
                                  className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors text-gray-600 hover:bg-gray-50"
                                  onClick={() => {
                                    setIsFocusModeOpen(true);
                                    setIsFilterOpen(false);
                                  }}
                                >
                                  <Smile className="w-4 h-4" />
                                  Moods
                                </button>
                                <button
                                  className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors ${
                                    isMobileTagsFilterVisible
                                      ? "bg-blue-50 text-blue-700"
                                      : "text-gray-600 bg-white hover:bg-gray-50"
                                  }`}
                                  onClick={() => {
                                    setIsMobileTagsFilterVisible(
                                      !isMobileTagsFilterVisible,
                                    );
                                    setIsFilterOpen(false);
                                  }}
                                >
                                  <Tag className="w-4 h-4" />
                                  Tags
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                {expanded &&
                  viewMode !== "collections" &&
                  !activeCollection &&
                  !isDesktopTagsFilterVisible &&
                  !isMobileTagsFilterVisible && (
                    <button
                      className={`flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-full shadow-sm transition-colors ${
                        showTagNames
                          ? "bg-blue-50 text-blue-600 border border-blue-200"
                          : "text-gray-600 bg-white hover:bg-gray-50"
                      }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleTagNames();
                      }}
                      title={showTagNames ? "Hide tag names" : "Show tag names"}
                    >
                      <Tag className="w-3.5 h-3.5" />
                      <span>{showTagNames ? "Hide Tags" : "Show Tags"}</span>
                    </button>
                  )}

                {expanded &&
                  viewMode !== "collections" &&
                  !activeCollection && (
                    <button
                      className={`flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-full shadow-sm transition-colors ${
                        isMultiSelectMode
                          ? "bg-blue-500 text-white hover:bg-blue-600"
                          : "text-gray-600 bg-white hover:bg-gray-50"
                      }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleMultiSelectMode();
                      }}
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      <span>Share</span>
                    </button>
                  )}

                {/* Add multi-select actions */}
                {isMultiSelectMode && selectedNotes.length > 0 && (
                  <div className="flex items-center gap-2">
                    {/* Multi-select mode is only for sharing in split view, no delete action */}
                  </div>
                )}
              </div>
            </div>

            {isInSearchMode && (
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Search className="w-4 h-4 text-blue-600" />
                  <span className="text-sm text-blue-800">
                    Search results for: <strong>"{activeSearchQuery}"</strong>
                  </span>
                  <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                    {searchResults.length} found
                  </span>
                </div>
                <button
                  onClick={clearSearch}
                  className="flex items-center gap-1 px-2 py-1 text-xs text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded transition-colors"
                >
                  <X className="w-3 h-3" />
                  Clear search
                </button>
              </div>
            )}
          </div>

          <div
            className={cn(
              "px-2 pb-6 pt-4",
              viewMode === "split" && "h-full overflow-hidden",
            )}
          >
            {isMobileTagsFilterVisible && (
              <div className="lg:hidden mb-4 p-4 bg-gray-50 rounded-lg">
                <TagFilters
                  allTags={allTags}
                  activeFilter={activeFilter}
                  tagsToShow={tagsToShow}
                  setTagsToShow={setTagsToShow}
                  setActiveFilter={setActiveFilter}
                />
              </div>
            )}

            {isSearching ? (
              <div className="flex items-center justify-center h-40">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                <span className="ml-3 text-gray-600">Searching notes...</span>
              </div>
            ) : viewMode === "collections" || processedNotes.length > 0 ? (
              renderContent()
            ) : (
              <div className="flex flex-col items-center justify-center h-40 text-center">
                <div className="text-gray-500 mb-2">No notes found</div>
                <div className="text-sm text-gray-400">
                  {isInSearchMode
                    ? `No results matching "${activeSearchQuery}"`
                    : searchTerm
                      ? `No results matching "${searchTerm}"`
                      : activeMoodFilter
                        ? `No ${activeMoodFilter} notes found. Try a different mood or add some notes.`
                        : "Try a different filter or add some notes"}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <NotePreview
        note={selectedNote}
        isOpen={isNotePreviewOpen}
        isFavourite={selectedNote ? favouriteNotes.has(selectedNote.id) : false}
        onToggleFavourite={handleToggleFavourite}
        onClose={() => {
          setIsNotePreviewOpen(false);
          setSelectedNote(null);
        }}
        onEdit={(note) => {
          console.log("Edit note:", note);
        }}
        onDelete={onNoteDelete}
        onNoteChange={(note) => setSelectedNote(note)}
        onShare={onShareNote}
      />

      {/* Floating selection bar for split view - appears when notes are selected */}
      <AnimatePresence>
        {viewMode === "split" &&
          isMultiSelectMode &&
          selectedNotes.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.2 }}
              className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50"
            >
              <div className="bg-white shadow-2xl rounded-full border border-gray-200 px-6 py-3 flex items-center gap-4">
                <span className="text-sm font-medium text-gray-700">
                  {selectedNotes.length} Selected
                </span>
                <button
                  onClick={async () => {
                    if (onShare) {
                      onShare();
                    }
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors text-sm font-medium"
                >
                  <Share2 className="w-4 h-4" />
                  Share
                </button>
                <button
                  onClick={() => {
                    toggleMultiSelectMode();
                  }}
                  className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </motion.div>
          )}
      </AnimatePresence>

      <FocusModeBar
        isOpen={isFocusModeOpen}
        onClose={() => {
          setIsFocusModeOpen(false);
          if (setActiveMoodFilter) {
            setActiveMoodFilter(null);
          }
        }}
        onMoodSelect={(mood) => {
          if (setActiveMoodFilter) {
            setActiveMoodFilter(mood);
          }
          setIsFocusModeOpen(false);
        }}
      />
    </>
  );
}
