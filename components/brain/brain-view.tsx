"use client"

import { useState, useEffect, useCallback, useRef, useMemo } from "react"
import dynamic from "next/dynamic"
import { Search, X, ZoomIn, ZoomOut, Maximize2, Info } from "lucide-react"
import type { Note } from "@/lib/data"
import type { GraphNode, GraphLink, BrainGraphData } from "@/lib/types"
import {
  buildGraphData,
  findConnectedNodes,
  filterGraphBySearch,
  getGraphStats,
  getNoteFromNode,
  type Collection,
} from "@/lib/brain-utils"
import { getTagColor } from "@/components/note-card"
import { InlineNoteView } from "@/components/note-preview/inline-note-view"

// Dynamically import ForceGraph2D to avoid SSR issues
const ForceGraph2D = dynamic(() => import("react-force-graph-2d"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full bg-background">
      <div className="text-muted-foreground">Loading Brain...</div>
    </div>
  ),
})

interface BrainViewProps {
  notes: Note[]
  collections?: Collection[]
  onNoteClick?: (note: Note) => void
  onNoteDelete?: (noteId: number) => void
  onNoteSaved?: (note: Note) => void
  onClose?: () => void
}

export function BrainView({
  notes,
  collections = [],
  onNoteClick,
  onNoteDelete,
  onNoteSaved,
  onClose,
}: BrainViewProps) {
  const graphRef = useRef<any>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 })
  const [searchQuery, setSearchQuery] = useState("")
  const [hoveredNode, setHoveredNode] = useState<GraphNode | null>(null)
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null)
  const [showStats, setShowStats] = useState(true)
  const [selectedTagFilter, setSelectedTagFilter] = useState<string | null>(null)
  const [viewingNote, setViewingNote] = useState<Note | null>(null)

  // Build graph data
  const graphData = useMemo(
    () => buildGraphData(notes, collections),
    [notes, collections]
  )

  // Filter results (search query or tag filter)
  const { filteredNodes, hasFilter } = useMemo(() => {
    // If tag filter is active, filter by tag connections
    if (selectedTagFilter) {
      const tagNodeId = `tag-${selectedTagFilter}`
      const connectedToTag = findConnectedNodes(tagNodeId, graphData.links)
      connectedToTag.add(tagNodeId) // Include the tag itself
      return { filteredNodes: connectedToTag, hasFilter: true }
    }
    // Otherwise use search query
    return filterGraphBySearch(graphData, searchQuery)
  }, [graphData, searchQuery, selectedTagFilter])

  // Get stats
  const stats = useMemo(() => getGraphStats(graphData), [graphData])

  // Connected nodes for highlighting
  const connectedNodes = useMemo(() => {
    if (hoveredNode) {
      return findConnectedNodes(hoveredNode.id, graphData.links)
    }
    if (selectedNode) {
      return findConnectedNodes(selectedNode.id, graphData.links)
    }
    return new Set<string>()
  }, [hoveredNode, selectedNode, graphData.links])

  // Handle resize
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight,
        })
      }
    }

    updateDimensions()
    window.addEventListener("resize", updateDimensions)
    return () => window.removeEventListener("resize", updateDimensions)
  }, [])

  // Zoom controls
  const handleZoomIn = useCallback(() => {
    if (graphRef.current) {
      const currentZoom = graphRef.current.zoom()
      graphRef.current.zoom(currentZoom * 1.3, 400)
    }
  }, [])

  const handleZoomOut = useCallback(() => {
    if (graphRef.current) {
      const currentZoom = graphRef.current.zoom()
      graphRef.current.zoom(currentZoom * 0.7, 400)
    }
  }, [])

  const handleFitToScreen = useCallback(() => {
    if (graphRef.current) {
      graphRef.current.zoomToFit(400, 50)
    }
  }, [])

  // Node click handler
  const handleNodeClick = useCallback(
    (node: GraphNode) => {
      setSelectedNode(node)
      
      if (node.type === "note") {
        // Open note in modal
        const noteData = getNoteFromNode(node)
        if (noteData) {
          setViewingNote(noteData)
        }
      } else if (node.type === "tag") {
        // Toggle tag filter - if same tag clicked, clear filter
        const tagName = node.label
        if (selectedTagFilter === tagName) {
          setSelectedTagFilter(null)
          setSearchQuery("")
        } else {
          setSelectedTagFilter(tagName)
          setSearchQuery("") // Clear search when filtering by tag
        }
      } else if (node.type === "collection") {
        // Filter by collection - show all notes in this collection
        const collectionName = node.label
        if (selectedTagFilter === `collection:${collectionName}`) {
          setSelectedTagFilter(null)
        } else {
          // Use the collection's connected nodes as filter
          setSelectedTagFilter(null)
          setSearchQuery(collectionName) // Search by collection name
        }
      }
    },
    [selectedTagFilter]
  )

  // Node hover handlers
  const handleNodeHover = useCallback((node: GraphNode | null) => {
    setHoveredNode(node)
    if (containerRef.current) {
      containerRef.current.style.cursor = node ? "pointer" : "grab"
    }
  }, [])

  // Custom node rendering
  const paintNode = useCallback(
    (node: GraphNode, ctx: CanvasRenderingContext2D, globalScale: number) => {
      const { x, y, size, color, type, label } = node
      if (x === undefined || y === undefined) return

      const isHighlighted =
        connectedNodes.has(node.id) || (!hoveredNode && !selectedNode)
      const isFiltered = hasFilter && !filteredNodes.has(node.id)
      const alpha = isFiltered ? 0.15 : isHighlighted ? 1 : 0.2

      ctx.globalAlpha = alpha

      // Draw glow for hovered/selected nodes
      if (hoveredNode?.id === node.id || selectedNode?.id === node.id) {
        ctx.beginPath()
        ctx.arc(x, y, size + 4, 0, 2 * Math.PI)
        ctx.fillStyle = `${color}40`
        ctx.fill()
      }

      // Draw node shape based on type
      ctx.beginPath()
      if (type === "note") {
        // Circle for notes
        ctx.arc(x, y, size, 0, 2 * Math.PI)
      } else if (type === "tag") {
        // Hexagon for tags
        const sides = 6
        for (let i = 0; i < sides; i++) {
          const angle = (i * 2 * Math.PI) / sides - Math.PI / 2
          const px = x + size * Math.cos(angle)
          const py = y + size * Math.sin(angle)
          if (i === 0) ctx.moveTo(px, py)
          else ctx.lineTo(px, py)
        }
        ctx.closePath()
      } else if (type === "collection") {
        // Rounded square for collections
        const s = size * 1.4
        ctx.roundRect(x - s / 2, y - s / 2, s, s, 3)
      }

      ctx.fillStyle = color
      ctx.fill()

      // Draw border
      ctx.strokeStyle = `${color}80`
      ctx.lineWidth = 1.5
      ctx.stroke()

      // Draw label for larger nodes or when zoomed in
      const fontSize = Math.max(10 / globalScale, 3)
      if (globalScale > 0.7 || type === "tag" || hoveredNode?.id === node.id) {
        ctx.globalAlpha = alpha * 0.9
        ctx.font = `${fontSize}px Inter, system-ui, sans-serif`
        ctx.textAlign = "center"
        ctx.textBaseline = "top"
        ctx.fillStyle = "#374151"
        
        // Truncate label if too long
        const maxLength = type === "tag" ? 15 : 20
        const displayLabel =
          label.length > maxLength ? label.slice(0, maxLength) + "..." : label
        
        ctx.fillText(displayLabel, x, y + size + 3)
      }

      ctx.globalAlpha = 1
    },
    [connectedNodes, hoveredNode, selectedNode, hasFilter, filteredNodes]
  )

  // Custom link rendering
  const paintLink = useCallback(
    (link: GraphLink, ctx: CanvasRenderingContext2D) => {
      const source = link.source as GraphNode
      const target = link.target as GraphNode
      
      if (!source.x || !source.y || !target.x || !target.y) return

      const isHighlighted =
        connectedNodes.has(source.id) && connectedNodes.has(target.id)
      const isFiltered =
        hasFilter &&
        (!filteredNodes.has(source.id) || !filteredNodes.has(target.id))

      ctx.globalAlpha = isFiltered ? 0.05 : isHighlighted ? 0.6 : 0.15
      ctx.strokeStyle = link.color
      ctx.lineWidth = link.type === "tag-cooccurrence" ? 1 : 1.5

      ctx.beginPath()
      ctx.moveTo(source.x, source.y)
      ctx.lineTo(target.x, target.y)

      if (link.type === "note-collection") {
        ctx.setLineDash([4, 4])
      } else if (link.type === "tag-cooccurrence") {
        ctx.setLineDash([2, 2])
      } else {
        ctx.setLineDash([])
      }

      ctx.stroke()
      ctx.setLineDash([])
      ctx.globalAlpha = 1
    },
    [connectedNodes, hasFilter, filteredNodes]
  )

  return (
      <div className="flex flex-col h-full bg-[#f5f5f7] relative overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white z-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
            <svg
              className="w-4 h-4 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
          </div>
          <div>
            <h1 className="text-lg font-semibold text-gray-900">Brain</h1>
            <p className="text-xs text-gray-500">
              {stats.noteCount} notes, {stats.tagCount} tags, {stats.totalConnections} connections
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="flex-1 max-w-md mx-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search nodes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-100 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowStats(!showStats)}
            className={`p-2 rounded-lg transition-colors ${
              showStats
                ? "bg-purple-500/20 text-purple-600"
                : "text-gray-500 hover:bg-gray-100"
            }`}
            title="Toggle stats panel"
          >
            <Info className="w-5 h-5" />
          </button>
          <div className="w-px h-6 bg-gray-200" />
          <button
            onClick={handleZoomOut}
            className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
            title="Zoom out"
          >
            <ZoomOut className="w-5 h-5" />
          </button>
          <button
            onClick={handleZoomIn}
            className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
            title="Zoom in"
          >
            <ZoomIn className="w-5 h-5" />
          </button>
          <button
            onClick={handleFitToScreen}
            className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
            title="Fit to screen"
          >
            <Maximize2 className="w-5 h-5" />
          </button>
          {onClose && (
            <>
              <div className="w-px h-6 bg-gray-200" />
              <button
                onClick={onClose}
                className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Graph container */}
      <div ref={containerRef} className="flex-1 relative">
        <ForceGraph2D
          ref={graphRef}
          width={dimensions.width}
          height={dimensions.height}
          graphData={graphData}
          nodeCanvasObject={paintNode}
          linkCanvasObject={paintLink}
          onNodeClick={handleNodeClick}
          onNodeHover={handleNodeHover}
          nodeRelSize={1}
          linkDirectionalParticles={0}
          d3AlphaDecay={0.02}
          d3VelocityDecay={0.3}
          cooldownTime={3000}
              backgroundColor="#f5f5f7"
          enableNodeDrag={true}
          enableZoomInteraction={true}
          enablePanInteraction={true}
        />

        {/* Legend */}
        <div className="absolute bottom-4 left-4 bg-white border border-gray-200 rounded-lg p-3 text-xs text-gray-600 shadow-sm">
          <div className="font-medium text-gray-900 mb-2">Legend</div>
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500" />
              <span>Notes</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rotate-45 bg-green-500" style={{ clipPath: "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)" }} />
              <span>Tags</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm bg-purple-500" />
              <span>Collections</span>
            </div>
          </div>
        </div>

        {/* Stats Panel */}
        {showStats && (
          <div className="absolute top-4 right-4 w-64 bg-white border border-gray-200 rounded-lg p-4 text-gray-900 shadow-sm">
            <h3 className="font-medium text-sm mb-3">Graph Insights</h3>
            
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-gray-50 rounded-lg p-2 text-center">
                <div className="text-lg font-semibold text-blue-600">{stats.noteCount}</div>
                <div className="text-xs text-gray-500">Notes</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-2 text-center">
                <div className="text-lg font-semibold text-green-600">{stats.tagCount}</div>
                <div className="text-xs text-gray-500">Tags</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-2 text-center">
                <div className="text-lg font-semibold text-purple-600">{stats.collectionCount}</div>
                <div className="text-xs text-gray-500">Collections</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-2 text-center">
                <div className="text-lg font-semibold text-orange-600">{stats.connectionDensity}</div>
                <div className="text-xs text-gray-500">Density</div>
              </div>
            </div>

            {stats.topTags.length > 0 && (
              <div className="mb-4">
                <div className="text-xs text-gray-500 mb-2">Top Tags</div>
                <div className="space-y-1">
                  {stats.topTags.map(({ tag, count }) => (
                    <div
                      key={tag}
                      className="flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-1.5">
                        <div
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: getTagColor(tag) }}
                        />
                        <span className="text-gray-700">{tag}</span>
                      </div>
                      <span className="text-gray-400">{count} notes</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {stats.orphanNotes.length > 0 && (
              <div>
                <div className="text-xs text-gray-500 mb-2">
                  Untagged Notes ({stats.orphanNotes.length})
                </div>
                <div className="text-xs text-gray-400 max-h-20 overflow-y-auto">
                  {stats.orphanNotes.slice(0, 5).map((title, i) => (
                    <div key={i} className="truncate">
                      {title}
                    </div>
                  ))}
                  {stats.orphanNotes.length > 5 && (
                    <div className="text-gray-400">
                      +{stats.orphanNotes.length - 5} more
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tooltip for hovered node */}
        {hoveredNode && (
          <div
            className="absolute pointer-events-none bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 max-w-xs shadow-lg"
            style={{
              left: Math.min((hoveredNode.x || 0) + dimensions.width / 2 + 15, dimensions.width - 200),
              top: Math.min((hoveredNode.y || 0) + dimensions.height / 2 - 10, dimensions.height - 100),
            }}
          >
            <div className="font-medium">{hoveredNode.label}</div>
            <div className="text-xs text-gray-500 capitalize">{hoveredNode.type}</div>
            {hoveredNode.type === "note" && (
              <div className="text-xs text-gray-400 mt-1">Click to view note</div>
            )}
            {hoveredNode.type === "tag" && (
              <div className="text-xs text-gray-400 mt-1">Click to filter by tag</div>
            )}
            {hoveredNode.type === "collection" && (
              <div className="text-xs text-gray-400 mt-1">Click to filter collection</div>
            )}
          </div>
        )}

        {/* Active tag filter indicator */}
        {selectedTagFilter && (
          <div className="absolute top-20 left-1/2 -translate-x-1/2 bg-white border border-gray-200 rounded-full px-4 py-2 shadow-lg flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: getTagColor(selectedTagFilter) }}
            />
            <span className="text-sm text-gray-700">Filtering: {selectedTagFilter}</span>
            <button
              onClick={() => setSelectedTagFilter(null)}
              className="ml-1 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Note Modal Overlay */}
      {viewingNote && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden mx-4">
            <InlineNoteView
              note={viewingNote}
              onClose={() => setViewingNote(null)}
              onDelete={(noteId) => {
                onNoteDelete?.(noteId)
                setViewingNote(null)
              }}
              onSave={(noteId, updatedData) => {
                // Merge updates with existing note and call onNoteSaved
                const updatedNote: Note = {
                  ...viewingNote,
                  ...updatedData,
                }
                onNoteSaved?.(updatedNote)
                setViewingNote(updatedNote) // Update local state too
              }}
              allNotes={notes}
            />
          </div>
        </div>
      )}
    </div>
  )
}
