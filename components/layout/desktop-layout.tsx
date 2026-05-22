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
  Share2,
  Sparkles,
  PanelLeftClose,
  PanelLeftOpen,
  Download,
} from "lucide-react";
import { NoteSection } from "@/components/note-section";
import { TagFilters } from "@/components/note-section/tag-filters";
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
import { BangleViewer, BangleList, CreateBangleModal, RelatedNotesPanel } from "@/components/bangle";
import { BrainView } from "@/components/brain";
import { Layers } from "lucide-react";
import type { Collection } from "@/lib/brain-utils";

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
  const [isGoogleDriveInfoOpen, setIsGoogleDriveInfoOpen] = useState(false);
  const [favouriteNotes, setFavouriteNotes] = useState<Set<number>>(new Set());
  const [collections, setCollections] = useState<
    Array<{ id: string; name: string; noteIds: number[] }>
  >([]);
  const [activeCollection, setActiveCollection] = useState<any | null>(null);
  const [isCreateBangleOpen, setIsCreateBangleOpen] = useState(false);
  const [bangleSourceNote, setBangleSourceNote] = useState<Note | null>(null);
  const [relatedPanelNote, setRelatedPanelNote] = useState<Note | null>(null);
  const [relatedPanelPosition, setRelatedPanelPosition] = useState<"right" | "bottom">("right");

  // Track mount status to prevent hydration mismatch
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Open CircularAddModal on Enter key when nothing is focused except the body
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Enter") return;
      // Don't open modal if any of these are active
      if (isAddNoteOpen || selectedNote || selectedBangle) return;
      
      const active = document.activeElement;
      const tag = active?.tagName ?? "";
      
      // Check if we're inside any editable context
      const isInteractiveElement =
        tag === "INPUT" ||
        tag === "TEXTAREA" ||
        tag === "BUTTON" ||
        tag === "A" ||
        tag === "SELECT" ||
        (active as HTMLElement)?.isContentEditable;
      
      // Also check if any parent element is contenteditable
      const isInsideContentEditable = !!(active as HTMLElement)?.closest?.('[contenteditable="true"]');
      
      if (isInteractiveElement || isInsideContentEditable) return;
      
      // Only trigger if focus is on body or main container (not on any interactive element)
      if (active !== document.body && !active?.classList?.contains?.('note-section')) return;
      
      e.preventDefault();
      setIsAddNoteOpen(true);
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isAddNoteOpen, selectedNote, selectedBangle]);

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

  const handleOpenCreateBangle = (note: Note) => {
    setBangleSourceNote(note);
    setIsCreateBangleOpen(true);
  };

  const handleSeeRelated = (note: Note) => {
    setRelatedPanelNote(note);
  };

  const handleToggleRelatedPanelPosition = () => {
    setRelatedPanelPosition(prev => prev === "right" ? "bottom" : "right");
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
        <div className="p-3 border-b border-border flex items-center justify-between">
          {isMounted && !isSidebarCollapsed && (
            <div className="flex items-center gap-2 min-w-0">
              <img
                src="/bangle-logo.svg"
                alt="BangleAI"
                className="w-10 h-10 flex-shrink-0"
              />
              <h2 className="text-lg font-semibold text-foreground truncate">
                BangleAI
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
              <button
                className={`w-full flex items-center ${
                  isMounted && isSidebarCollapsed
                    ? "justify-center"
                    : "gap-2 px-3 py-2"
                } text-sm rounded-lg transition-colors ${
                  viewMode === "brain"
                    ? "bg-gradient-to-r from-purple-500/20 to-indigo-500/20 text-purple-400"
                    : "text-muted-foreground hover:bg-muted"
                }`}
                onClick={() => handleViewModeChange("brain")}
                title={isMounted && isSidebarCollapsed ? "Brain" : ""}
              >
                <Brain className="w-5 h-5" />
                {isMounted && !isSidebarCollapsed && "Brain"}
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
                title={isMounted && isSidebarCollapsed ? "Insights" : ""}
              >
                <Sparkles className="w-5 h-5" />
                {isMounted && !isSidebarCollapsed && "Insights"}
              </button>
            </div>
          </div>

          <div className="mb-6">
            {isMounted && !isSidebarCollapsed && (
              <h3 className="text-sm font-medium text-muted-foreground mb-3">
                Sort by
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

            </div>
          </div>

          {/* Integrations Section */}
          <div className="mb-6">
            {isMounted && !isSidebarCollapsed && (
              <h3 className="text-sm font-medium text-muted-foreground mb-3">
                Integrations
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
                } text-sm rounded-lg transition-colors text-muted-foreground hover:bg-muted`}
                onClick={() => setIsImportOpen(true)}
                title={isMounted && isSidebarCollapsed ? "Google Keep" : ""}
              >
                <Download className="w-5 h-5" />
                {isMounted && !isSidebarCollapsed && "Google Keep"}
              </button>
              <button
                className={`w-full flex items-center ${
                  isMounted && isSidebarCollapsed
                    ? "justify-center"
                    : "gap-2 px-3 py-2"
                } text-sm rounded-lg transition-colors text-muted-foreground/50 cursor-help`}
                onClick={() => setIsGoogleDriveInfoOpen(true)}
                title={isMounted && isSidebarCollapsed ? "Google Drive (Soon)" : ""}
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2L2 7l10 5 10-5-10-5z" />
                  <path d="M2 17l10 5 10-5" />
                  <path d="M2 12l10 5 10-5" />
                </svg>
                {isMounted && !isSidebarCollapsed && "Google Drive"}
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
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  isTagsFilterVisible
                    ? "bg-primary/10 text-primary border border-primary/20"
                    : "text-muted-foreground border border-border hover:bg-muted"
                }`}
                onClick={handleTagsToggle}
                title="Filter by tags"
              >
                <Tag className="w-4 h-4" />
                Tags
              </button>
              <button
                className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                onClick={() => setIsAddNoteOpen(true)}
              >
                <Plus className="w-4 h-4" />
                Add
              </button>
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

        <div className="flex-1 overflow-hidden">
          {viewMode === "brain" ? (
            <BrainView
              notes={notes}
              collections={collections.map((c) => ({
                id: c.id,
                name: c.name,
                noteIds: c.noteIds,
                color: c.color,
              }))}
              onNoteDelete={onNoteDelete}
              onNoteSaved={onNoteSaved}
              onClose={() => handleViewModeChange("grid")}
            />
          ) : selectedBangle ? (
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
              onSeeRelated={() => handleSeeRelated(selectedNote)}
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

        {/* Related Notes Panel */}
        {relatedPanelNote && (
          <RelatedNotesPanel
            sourceNote={relatedPanelNote}
            allNotes={notes}
            onClose={() => setRelatedPanelNote(null)}
            onViewNote={(noteId) => {
              const note = notes.find(n => n.id === noteId);
              if (note) {
                setSelectedNote(note);
                setRelatedPanelNote(null);
              }
            }}
            position={relatedPanelPosition}
            onTogglePosition={handleToggleRelatedPanelPosition}
          />
        )}

        {/* Google Drive Coming Soon Modal */}
        {isGoogleDriveInfoOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-card rounded-xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden">
              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-green-500 flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 2L2 7l10 5 10-5-10-5z" />
                      <path d="M2 17l10 5 10-5" />
                      <path d="M2 12l10 5 10-5" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-foreground">Google Drive Integration</h2>
                    <p className="text-sm text-muted-foreground">Coming Soon</p>
                  </div>
                </div>
                
                <div className="space-y-4 mb-6">
                  <p className="text-foreground">
                    We&apos;re working on bringing Google Drive integration to BangleAI. Here&apos;s what you&apos;ll be able to do:
                  </p>
                  
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-0.5">•</span>
                      <span><strong className="text-foreground">Import Documents</strong> - Bring your Google Docs, Slides, and other files directly into BangleAI</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-0.5">•</span>
                      <span><strong className="text-foreground">Smart Tagging</strong> - AI will automatically suggest tags based on your document content</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-0.5">•</span>
                      <span><strong className="text-foreground">Brain Visualization</strong> - See how your Google Drive files connect with your notes</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-0.5">•</span>
                      <span><strong className="text-foreground">Sync Changes</strong> - Keep your imported documents up-to-date automatically</span>
                    </li>
                  </ul>
                </div>
                
                <div className="flex justify-end">
                  <button
                    onClick={() => setIsGoogleDriveInfoOpen(false)}
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                  >
                    Got it
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
