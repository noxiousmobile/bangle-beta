"use client";

import { useState, useEffect } from "react";
import {
  Plus,
  LayoutGrid,
  Table,
  Columns2,
  Brain,
  Tag,
  X,
  Clock,
  BarChart2,
  Star,
  Smile,
  Share2,
  Sparkles,
  PanelLeftClose,
  PanelLeftOpen,
  Download,
  Settings,
} from "lucide-react";
import { NoteSection } from "@/components/note-section";
import { TagFilters } from "@/components/note-section/tag-filters";
import { MoodFilters } from "@/components/note-section/mood-filters";
import { AISearchBar } from "@/components/search/ai-search-bar";
import { useMultiSelect } from "@/components/collaborative/multi-select-provider";
import { useTagVisibility } from "@/components/tag-visibility-provider";
import { CircularAddModal } from "@/components/add-section/circular-add-modal";
import { GoogleKeepImportModal } from "@/components/import/google-keep-import-modal";
import { aiOrganizationEngine } from "@/lib/ai/organization-engine";
import { InlineNoteView } from "@/components/note-preview/inline-note-view";
import type { Note } from "@/lib/data";
import type { PanInfo } from "framer-motion";
import type { ViewMode, Bangle } from "@/lib/types";
import { BangleViewer, BangleList, CreateBangleModal } from "@/components/bangle";
import { Layers } from "lucide-react";

interface DesktopLayoutProps {
  notes: Note[];
  filteredNotes: Note[];
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  isSearching: boolean;
  viewMode: ViewMode;
  onViewChange: (view: ViewMode) => void;
  onNoteDelete: (noteId: number) => void;
  onNoteSaved: (note: Note) => void;
  onShare: () => void;
  onShareNote?: (note: Note) => void;
  // Bangle props
  bangles?: Bangle[];
  selectedBangle?: Bangle | null;
  onCreateBangle?: (bangle: Bangle) => void;
  onDeleteBangle?: (bangleId: string) => void;
  onUpdateBangle?: (bangle: Bangle) => void;
  onSelectBangle?: (bangle: Bangle) => void;
  onCloseBangle?: () => void;
}

export function DesktopLayout({
  notes,
  filteredNotes,
  searchTerm,
  setSearchTerm,
  isSearching,
  viewMode,
  onViewChange,
  onNoteDelete,
  onNoteSaved,
  onShare,
  onShareNote,
  bangles = [],
  selectedBangle,
  onCreateBangle,
  onDeleteBangle,
  onUpdateBangle,
  onSelectBangle,
  onCloseBangle,
}: DesktopLayoutProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [activeFilter, setActiveFilter] = useState<string[]>([]);
  const [isAddNoteOpen, setIsAddNoteOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [activeView, setActiveView] = useState<
    "recents" | "common" | "favourites"
  >("recents");
  const [tagsToShow, setTagsToShow] = useState(20);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [recentTagsLimit, setRecentTagsLimit] = useState<number>(() => {
    try { return parseInt(localStorage.getItem("recentTagsLimit") || "5", 10) || 5 } catch { return 5 }
  });
  const [isTagsFilterVisible, setIsTagsFilterVisible] = useState(false);
  const [isMoodsFilterVisible, setIsMoodsFilterVisible] = useState(false);
  const [activeMood, setActiveMood] = useState<string | null>(null);
  const [favouriteNotes, setFavouriteNotes] = useState<Set<number>>(new Set());
  const [collections, setCollections] = useState<
    Array<{ id: string; name: string; noteIds: number[] }>
  >([]);
  const [activeCollection, setActiveCollection] = useState<any | null>(null);
  const [isCreateBangleOpen, setIsCreateBangleOpen] = useState(false);
  const [bangleSourceNote, setBangleSourceNote] = useState<Note | null>(null);

  // Track mount status to prevent hydration mismatch
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Open CircularAddModal on Enter key when nothing is focused except the body
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Enter") return;
      if (isAddNoteOpen || selectedNote) return;
      const active = document.activeElement;
      const tag = active?.tagName ?? "";
      const isInteractiveElement =
        tag === "INPUT" ||
        tag === "TEXTAREA" ||
        tag === "BUTTON" ||
        tag === "A" ||
        tag === "SELECT" ||
        (active as HTMLElement)?.isContentEditable;
      if (isInteractiveElement) return;
      e.preventDefault();
      setIsAddNoteOpen(true);
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isAddNoteOpen, selectedNote]);

  // Compute AI collections when notes change
  useEffect(() => {
    const loadCollections = async () => {
      const smartCollections =
        await aiOrganizationEngine.generateSmartCollections(notes);
      setCollections(smartCollections);
    };
    loadCollections();
  }, [notes]);

  const handleToggleFavourite = (noteId: number) => {
    setFavouriteNotes((prev) => {
      const newFavourites = new Set(prev);
      if (newFavourites.has(noteId)) {
        newFavourites.delete(noteId);
      } else {
        newFavourites.add(noteId);
      }
      return newFavourites;
    });
  };

  // Find which AI collection the selected note belongs to
  const getCollectionForNote = (noteId: number): string | null => {
    const collection = collections.find((col) => col.noteIds.includes(noteId));
    return collection ? collection.name : null;
  };
  const { isMultiSelectMode, toggleMultiSelectMode, selectedNotes } =
    useMultiSelect();
  const { showTagNames, toggleTagNames } = useTagVisibility();

  const allTags = Array.from(new Set(notes.flatMap((note) => note.tags)));

  const handleSearch = (query: string) => {
    setSearchTerm(query);
  };

  const handleViewModeChange = (view: ViewMode) => {
    onViewChange(view);
  };

  const handleFilterViewChange = (
    view: "recents" | "common" | "favourites",
  ) => {
    if (view === "favourites" && activeView === "favourites") {
      setActiveView("recents");
    } else {
      setActiveView(view);
    }
    if (viewMode === "collections") {
      onViewChange("grid");
    }
  };

  const handleMoodsToggle = () => {
    const newVisibility = !isMoodsFilterVisible;
    setIsMoodsFilterVisible(newVisibility);
    if (!newVisibility) {
      setActiveMood(null);
    }
  };

  const handleOpenCreateBangle = (note: Note) => {
    setBangleSourceNote(note);
    setIsCreateBangleOpen(true);
  };

  const handleCreateBangleComplete = (bangle: Bangle) => {
    if (onCreateBangle) {
      onCreateBangle(bangle);
    }
    setIsCreateBangleOpen(false);
    setBangleSourceNote(null);
    setSelectedNote(null); // Close note view after creating bangle
  };

  const handleTagsToggle = () => {
    const newVisibility = !isTagsFilterVisible;
    setIsTagsFilterVisible(newVisibility);
    if (!newVisibility) {
      setActiveFilter([]);
    }
  };

  const handleSwipe = (
    event: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo,
    source: "top" | "bottom" | "divider",
  ) => {
    // Desktop doesn't need swipe functionality
  };

  return (
    <div className="h-screen flex bg-background">
      <div
        suppressHydrationWarning
        className={`bg-card border-r border-border flex flex-col desktop-sidebar transition-all duration-300 flex-shrink-0 ${
          isMounted && isSidebarCollapsed ? "w-16" : "w-48 min-w-48"
        }`}
      >
        <div className="p-4 border-b border-border flex items-center justify-between">
          {isMounted && !isSidebarCollapsed && (
            <div className="flex items-center gap-2 min-w-0">
              <Sparkles className="w-5 h-5 text-primary flex-shrink-0" />
              <h2 className="text-lg font-semibold text-foreground truncate">
                Bangle
              </h2>
            </div>
          )}
          <button
            suppressHydrationWarning
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className={`text-muted-foreground hover:text-foreground transition-colors flex-shrink-0 focus:outline-none ${
              isMounted && isSidebarCollapsed ? "mx-auto" : ""
            }`}
            title={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isMounted && isSidebarCollapsed ? (
              <PanelLeftOpen className="w-5 h-5" />
            ) : (
              <PanelLeftClose className="w-5 h-5" />
            )}
          </button>
        </div>

        <div className="flex-1 overflow-auto p-4">
          <div className="mb-6">
            {isMounted && !isSidebarCollapsed && (
              <h3 className="text-sm font-medium text-muted-foreground mb-3">
                View
              </h3>
            )}
            <div
              className={
                isMounted && isSidebarCollapsed ? "space-y-4" : "space-y-1"
              }
            >
              <button
                className={`w-full flex items-center ${
                  isMounted && isSidebarCollapsed
                    ? "justify-center"
                    : "gap-2 px-3 py-2"
                } text-sm rounded-lg transition-colors ${
                  viewMode === "grid"
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted"
                }`}
                onClick={() => handleViewModeChange("grid")}
                title={isMounted && isSidebarCollapsed ? "Grid" : ""}
              >
                <LayoutGrid className="w-5 h-5" />
                {isMounted && !isSidebarCollapsed && "Grid"}
              </button>
              <button
                className={`w-full flex items-center ${
                  isMounted && isSidebarCollapsed
                    ? "justify-center"
                    : "gap-2 px-3 py-2"
                } text-sm rounded-lg transition-colors ${
                  viewMode === "table"
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted"
                }`}
                onClick={() => handleViewModeChange("table")}
                title={isMounted && isSidebarCollapsed ? "Table" : ""}
              >
                <Table className="w-5 h-5" />
                {isMounted && !isSidebarCollapsed && "Table"}
              </button>
              <button
                className={`w-full flex items-center ${
                  isMounted && isSidebarCollapsed
                    ? "justify-center"
                    : "gap-2 px-3 py-2"
                } text-sm rounded-lg transition-colors ${
                  viewMode === "split"
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted"
                }`}
                onClick={() => handleViewModeChange("split")}
                title={isMounted && isSidebarCollapsed ? "Split" : ""}
              >
                <Columns2 className="w-5 h-5" />
                {isMounted && !isSidebarCollapsed && "Split"}
              </button>
            </div>
          </div>

          <div className="mb-6">
            {isMounted && !isSidebarCollapsed && (
              <h3 className="text-sm font-medium text-muted-foreground mb-3">
                Sort
              </h3>
            )}
            <div
              className={
                isMounted && isSidebarCollapsed ? "space-y-4" : "space-y-1"
              }
            >
              <button
                className={`w-full flex items-center ${
                  isMounted && isSidebarCollapsed
                    ? "justify-center"
                    : "gap-2 px-3 py-2"
                } text-sm rounded-lg transition-colors ${
                  activeView === "recents" && viewMode !== "collections"
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted"
                }`}
                onClick={() => handleFilterViewChange("recents")}
                title={isMounted && isSidebarCollapsed ? "Recent" : ""}
              >
                <Clock className="w-5 h-5" />
                {isMounted && !isSidebarCollapsed && "Recent"}
              </button>
              <button
                className={`w-full flex items-center ${
                  isMounted && isSidebarCollapsed
                    ? "justify-center"
                    : "gap-2 px-3 py-2"
                } text-sm rounded-lg transition-colors ${
                  activeView === "common" && viewMode !== "collections"
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted"
                }`}
                onClick={() => handleFilterViewChange("common")}
                title={isMounted && isSidebarCollapsed ? "Common" : ""}
              >
                <BarChart2 className="w-5 h-5" />
                {isMounted && !isSidebarCollapsed && "Common"}
              </button>
              <button
                className={`w-full flex items-center ${
                  isMounted && isSidebarCollapsed
                    ? "justify-center"
                    : "gap-2 px-3 py-2"
                } text-sm rounded-lg transition-colors ${
                  viewMode === "collections"
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted"
                }`}
                onClick={() => handleViewModeChange("collections")}
                title={isMounted && isSidebarCollapsed ? "Insight (AI)" : ""}
              >
                <Brain className="w-5 h-5" />
                {isMounted && !isSidebarCollapsed && "Insight (AI)"}
              </button>
            </div>
          </div>

          <div className="mb-6">
            {isMounted && !isSidebarCollapsed && (
              <h3 className="text-sm font-medium text-muted-foreground mb-3">
                Filter
              </h3>
            )}
            <div
              className={
                isMounted && isSidebarCollapsed ? "space-y-4" : "space-y-1"
              }
            >
              <button
                className={`w-full flex items-center ${
                  isMounted && isSidebarCollapsed
                    ? "justify-center"
                    : "gap-2 px-3 py-2"
                } text-sm rounded-lg transition-colors ${
                  activeView === "favourites" && viewMode !== "collections"
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted"
                }`}
                onClick={() => handleFilterViewChange("favourites")}
                title={isMounted && isSidebarCollapsed ? "Favourites" : ""}
              >
                <Star className="w-5 h-5" />
                {isMounted && !isSidebarCollapsed && "Favourites"}
              </button>
              <button
                className={`w-full flex items-center ${
                  isMounted && isSidebarCollapsed
                    ? "justify-center"
                    : "gap-2 px-3 py-2"
                } text-sm rounded-lg transition-colors ${
                  isMoodsFilterVisible
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted"
                }`}
                onClick={handleMoodsToggle}
                title={isMounted && isSidebarCollapsed ? "Moods" : ""}
              >
                <Smile className="w-5 h-5" />
                {isMounted && !isSidebarCollapsed && "Moods"}
              </button>
              <button
                className={`w-full flex items-center ${
                  isMounted && isSidebarCollapsed
                    ? "justify-center"
                    : "gap-2 px-3 py-2"
                } text-sm rounded-lg transition-colors ${
                  isTagsFilterVisible
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted"
                }`}
                onClick={handleTagsToggle}
                title={isMounted && isSidebarCollapsed ? "Tags" : ""}
              >
                <Tag className="w-5 h-5" />
                {isMounted && !isSidebarCollapsed && "Tags"}
              </button>
            </div>
          </div>

          {/* Bangles Section */}
          {bangles.length > 0 && (
            <div className="mb-6">
              {isMounted && !isSidebarCollapsed && (
                <h3 className="text-sm font-medium text-muted-foreground mb-3">
                  Bangles
                </h3>
              )}
              <div
                className={
                  isMounted && isSidebarCollapsed ? "space-y-4" : "space-y-1"
                }
              >
                {bangles.slice(0, isSidebarCollapsed ? 3 : 5).map((bangle) => (
                  <button
                    key={bangle.id}
                    className={`w-full flex items-center ${
                      isMounted && isSidebarCollapsed
                        ? "justify-center"
                        : "gap-2 px-3 py-2"
                    } text-sm rounded-lg transition-colors ${
                      selectedBangle?.id === bangle.id
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-muted"
                    }`}
                    onClick={() => onSelectBangle?.(bangle)}
                    title={isMounted && isSidebarCollapsed ? bangle.title : ""}
                  >
                    <Layers className="w-5 h-5 flex-shrink-0" />
                    {isMounted && !isSidebarCollapsed && (
                      <span className="truncate">{bangle.title}</span>
                    )}
                  </button>
                ))}
                {bangles.length > (isSidebarCollapsed ? 3 : 5) && !isSidebarCollapsed && (
                  <p className="text-xs text-muted-foreground px-3">
                    +{bangles.length - 5} more
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        <div className="bg-card border-b border-border px-6 py-3 pb-2 desktop-header relative z-50">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1">
              <AISearchBar
                notes={notes}
                onSearch={handleSearch}
                value={searchTerm}
                onChange={setSearchTerm}
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                onClick={() => setIsAddNoteOpen(true)}
              >
                <Plus className="w-4 h-4" />
                Add
              </button>
              <div className="relative">
                <button
                  className="flex items-center justify-center w-10 h-10 border border-border bg-card text-foreground rounded-lg hover:bg-muted transition-colors"
                  onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                  title="Settings"
                >
                  <Settings className="w-4 h-4" />
                </button>
                {isSettingsOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setIsSettingsOpen(false)}
                    />
                    <div className="absolute right-0 top-full mt-1 bg-card border border-border rounded-lg shadow-lg z-50 py-1 min-w-[220px]">
                      <button
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-muted transition-colors whitespace-nowrap"
                        onClick={() => {
                          setIsSettingsOpen(false);
                          setIsImportOpen(true);
                        }}
                      >
                        <Download className="w-4 h-4 flex-shrink-0" />
                        Import (Google Keep)
                      </button>
                      <div className="border-t border-border mx-1 my-1" />
                      <div className="px-3 py-2">
                        <div className="flex items-center gap-1.5 mb-2">
                          <Tag className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                          <span className="text-sm text-foreground">Recent tags to show</span>
                        </div>
                        <div className="flex items-center gap-1">
                          {[3, 5, 8, 10].map((n) => (
                            <button
                              key={n}
                              className={`flex-1 py-1 text-xs rounded border transition-colors ${
                                recentTagsLimit === n
                                  ? "bg-primary text-primary-foreground border-primary"
                                  : "bg-background text-muted-foreground border-border hover:border-primary hover:text-foreground"
                              }`}
                              onClick={() => {
                                setRecentTagsLimit(n);
                                try { localStorage.setItem("recentTagsLimit", String(n)) } catch {}
                              }}
                            >
                              {n}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {isTagsFilterVisible && (
          <div className="bg-card border-b border-border px-6 py-4">
            <TagFilters
              allTags={allTags}
              activeFilter={activeFilter}
              tagsToShow={tagsToShow}
              setTagsToShow={setTagsToShow}
              setActiveFilter={setActiveFilter}
            />
          </div>
        )}

        {isMoodsFilterVisible && (
          <div className="bg-card border-b border-border px-6 py-4">
            <MoodFilters
              activeMood={activeMood}
              setActiveMood={setActiveMood}
            />
          </div>
        )}

        <div className="flex-1 overflow-hidden">
          {selectedBangle ? (
            <BangleViewer
              bangle={selectedBangle}
              notes={notes}
              onClose={() => onCloseBangle?.()}
              onDelete={onDeleteBangle}
              onUpdate={onUpdateBangle}
              onViewNote={(noteId) => {
                const note = notes.find((n) => n.id === noteId);
                if (note) {
                  onCloseBangle?.();
                  setSelectedNote(note);
                }
              }}
            />
          ) : selectedNote ? (
            <InlineNoteView
              note={selectedNote}
              onClose={() => setSelectedNote(null)}
              onDelete={(noteId) => {
                onNoteDelete(noteId);
                setSelectedNote(null);
              }}
              onSave={(noteId, updatedData) => {
                const updatedNote = { ...selectedNote, ...updatedData };
                onNoteSaved(updatedNote);
                setSelectedNote(updatedNote);
              }}
              onShare={() => {
                if (onShareNote) onShareNote(selectedNote);
              }}
              isFavourite={favouriteNotes.has(selectedNote.id)}
              onToggleFavourite={handleToggleFavourite}
              collectionName={getCollectionForNote(selectedNote.id)}
              onCollectionClick={() => {
                const col = collections.find((c) =>
                  c.noteIds.includes(selectedNote.id),
                );
                if (col) setActiveCollection(col);
                handleViewModeChange("collections");
                setSelectedNote(null);
              }}
              onCreateBangle={() => handleOpenCreateBangle(selectedNote)}
              allNotes={notes}
            />
          ) : (
            <NoteSection
              notes={filteredNotes}
              expanded={true}
              toggleExpanded={() => {}}
              isAnimating={false}
              springY={null}
              handleSwipe={handleSwipe}
              isSearching={isSearching}
              searchTerm={searchTerm}
              viewMode={viewMode}
              onNoteDelete={onNoteDelete}
              activeFilter={activeFilter}
              setActiveFilter={setActiveFilter}
              activeView={activeView}
              setActiveView={setActiveView}
              onShareNote={onShareNote}
              onShare={onShare}
              isDesktopTagsFilterVisible={isTagsFilterVisible}
              activeMoodFilter={activeMood}
              onNoteSelect={setSelectedNote}
              favouriteNotes={favouriteNotes}
              onToggleFavourite={handleToggleFavourite}
              externalActiveCollection={activeCollection}
              onSetActiveCollection={setActiveCollection}
            />
          )}
        </div>

        {isMultiSelectMode && selectedNotes.length > 0 && (
          <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
            <div className="bg-card rounded-full shadow-lg border border-border px-6 py-3 flex items-center gap-4">
              <span className="text-sm font-medium text-foreground">
                {selectedNotes.length} Selected
              </span>
              <button
                className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-colors text-sm font-medium"
                onClick={(e) => {
                  e.stopPropagation();
                  onShare();
                }}
              >
                <Share2 className="w-4 h-4" />
                Share
              </button>
              <button
                className="w-8 h-8 rounded-full hover:bg-muted flex items-center justify-center transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleMultiSelectMode();
                }}
              >
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
          </div>
        )}

        <CircularAddModal
          isOpen={isAddNoteOpen}
          onClose={() => setIsAddNoteOpen(false)}
          onNoteSaved={(note) => {
            onNoteSaved(note);
            setIsAddNoteOpen(false);
          }}
          notes={notes}
        />

        <GoogleKeepImportModal
          isOpen={isImportOpen}
          onClose={() => setIsImportOpen(false)}
          onImportComplete={(importedNotes) => {
            importedNotes.forEach((note) => onNoteSaved(note));
            setIsImportOpen(false);
          }}
          existingNotes={notes}
        />

        {bangleSourceNote && (
          <CreateBangleModal
            isOpen={isCreateBangleOpen}
            sourceNote={bangleSourceNote}
            allNotes={notes}
            onClose={() => {
              setIsCreateBangleOpen(false);
              setBangleSourceNote(null);
            }}
            onCreate={handleCreateBangleComplete}
          />
        )}
      </div>
    </div>
  );
}
