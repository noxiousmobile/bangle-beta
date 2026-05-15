import type { Note } from "@/lib/data"
import type { GraphNode, GraphLink, BrainGraphData } from "@/lib/types"
import { getTagColor } from "@/components/note-card"

// Collection type (simplified for graph purposes)
export interface Collection {
  id: string
  name: string
  noteIds: number[]
  color?: string
}

// Node size constants
const NODE_SIZES = {
  note: { min: 6, max: 14 },
  tag: { min: 10, max: 22 },
  collection: { min: 12, max: 18 },
}

// Collection color
const COLLECTION_COLOR = "#8B5CF6" // Purple/violet

/**
 * Build graph data from notes and collections
 */
export function buildGraphData(
  notes: Note[],
  collections: Collection[] = []
): BrainGraphData {
  const nodes: GraphNode[] = []
  const links: GraphLink[] = []
  const tagUsageCount: Map<string, number> = new Map()
  const tagCooccurrence: Map<string, Set<string>> = new Map()

  // First pass: count tag usage and co-occurrences
  notes.forEach((note) => {
    const noteTags = note.tags || []
    noteTags.forEach((tag) => {
      tagUsageCount.set(tag, (tagUsageCount.get(tag) || 0) + 1)
      
      // Track co-occurrence
      if (!tagCooccurrence.has(tag)) {
        tagCooccurrence.set(tag, new Set())
      }
      noteTags.forEach((otherTag) => {
        if (otherTag !== tag) {
          tagCooccurrence.get(tag)!.add(otherTag)
        }
      })
    })
  })

  const maxTagUsage = Math.max(...Array.from(tagUsageCount.values()), 1)
  const maxContentLength = Math.max(
    ...notes.map((n) => (n.content?.length || 0)),
    1
  )

  // Create tag nodes
  const tagNodes = new Map<string, GraphNode>()
  tagUsageCount.forEach((count, tag) => {
    const normalizedSize = count / maxTagUsage
    const size =
      NODE_SIZES.tag.min +
      normalizedSize * (NODE_SIZES.tag.max - NODE_SIZES.tag.min)

    const node: GraphNode = {
      id: `tag-${tag}`,
      type: "tag",
      label: tag,
      color: getTagColor(tag),
      size,
      data: tag,
    }
    tagNodes.set(tag, node)
    nodes.push(node)
  })

  // Create note nodes
  notes.forEach((note) => {
    const contentLength = note.content?.length || 0
    const normalizedSize = contentLength / maxContentLength
    const size =
      NODE_SIZES.note.min +
      normalizedSize * (NODE_SIZES.note.max - NODE_SIZES.note.min)

    // Use primary tag color or default gray
    const primaryTag = note.tags?.[0]
    const color = primaryTag ? getTagColor(primaryTag) : "#8E8E93"

    const node: GraphNode = {
      id: `note-${note.id}`,
      type: "note",
      label: note.title || "Untitled",
      color,
      size,
      data: note,
    }
    nodes.push(node)

    // Create links from note to its tags
    note.tags?.forEach((tag) => {
      links.push({
        source: `note-${note.id}`,
        target: `tag-${tag}`,
        type: "note-tag",
        strength: 0.5,
        color: `${getTagColor(tag)}40`, // 25% opacity
      })
    })
  })

  // Create collection nodes and links
  collections.forEach((collection) => {
    const noteCount = collection.noteIds?.length || 0
    const normalizedSize = Math.min(noteCount / 10, 1)
    const size =
      NODE_SIZES.collection.min +
      normalizedSize * (NODE_SIZES.collection.max - NODE_SIZES.collection.min)

    const node: GraphNode = {
      id: `collection-${collection.id}`,
      type: "collection",
      label: collection.name,
      color: collection.color || COLLECTION_COLOR,
      size,
      data: collection,
    }
    nodes.push(node)

    // Create links from collection to its notes
    collection.noteIds?.forEach((noteId) => {
      if (notes.some((n) => n.id === noteId)) {
        links.push({
          source: `collection-${collection.id}`,
          target: `note-${noteId}`,
          type: "note-collection",
          strength: 0.3,
          color: `${COLLECTION_COLOR}30`, // 19% opacity
        })
      }
    })
  })

  // Create tag co-occurrence links (for tags that frequently appear together)
  const processedPairs = new Set<string>()
  tagCooccurrence.forEach((coTags, tag) => {
    coTags.forEach((coTag) => {
      const pairKey = [tag, coTag].sort().join("-")
      if (!processedPairs.has(pairKey)) {
        processedPairs.add(pairKey)
        
        // Only create link if tags co-occur in at least 2 notes
        const coCount = notes.filter(
          (n) => n.tags?.includes(tag) && n.tags?.includes(coTag)
        ).length
        
        if (coCount >= 2) {
          links.push({
            source: `tag-${tag}`,
            target: `tag-${coTag}`,
            type: "tag-cooccurrence",
            strength: Math.min(coCount / 5, 1),
            color: "#00000025", // Subtle dark for light background
          })
        }
      }
    })
  })

  return { nodes, links }
}

/**
 * Find all nodes connected to a given node
 */
export function findConnectedNodes(
  nodeId: string,
  links: GraphLink[]
): Set<string> {
  const connected = new Set<string>()
  connected.add(nodeId)

  links.forEach((link) => {
    const sourceId = typeof link.source === "string" ? link.source : (link.source as GraphNode).id
    const targetId = typeof link.target === "string" ? link.target : (link.target as GraphNode).id
    
    if (sourceId === nodeId) {
      connected.add(targetId)
    } else if (targetId === nodeId) {
      connected.add(sourceId)
    }
  })

  return connected
}

/**
 * Filter graph data by search query
 */
export function filterGraphBySearch(
  data: BrainGraphData,
  query: string
): { filteredNodes: Set<string>; hasFilter: boolean } {
  if (!query.trim()) {
    return { filteredNodes: new Set(), hasFilter: false }
  }

  const lowerQuery = query.toLowerCase()
  const matchingNodes = new Set<string>()

  data.nodes.forEach((node) => {
    const matches = node.label.toLowerCase().includes(lowerQuery)
    if (matches) {
      matchingNodes.add(node.id)
      // Also include connected nodes
      const connected = findConnectedNodes(node.id, data.links)
      connected.forEach((id) => matchingNodes.add(id))
    }
  })

  return { filteredNodes: matchingNodes, hasFilter: true }
}

/**
 * Get statistics about the graph
 */
export function getGraphStats(data: BrainGraphData) {
  const noteCount = data.nodes.filter((n) => n.type === "note").length
  const tagCount = data.nodes.filter((n) => n.type === "tag").length
  const collectionCount = data.nodes.filter((n) => n.type === "collection").length
  
  // Find most connected tags
  const tagConnections: Map<string, number> = new Map()
  data.links
    .filter((l) => l.type === "note-tag")
    .forEach((link) => {
      const targetId = typeof link.target === "string" ? link.target : (link.target as GraphNode).id
      if (targetId.startsWith("tag-")) {
        tagConnections.set(targetId, (tagConnections.get(targetId) || 0) + 1)
      }
    })

  const topTags = Array.from(tagConnections.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([id, count]) => ({
      tag: id.replace("tag-", ""),
      count,
    }))

  // Find orphan notes (no tags)
  const notesWithTags = new Set<string>()
  data.links
    .filter((l) => l.type === "note-tag")
    .forEach((link) => {
      const sourceId = typeof link.source === "string" ? link.source : (link.source as GraphNode).id
      if (sourceId.startsWith("note-")) {
        notesWithTags.add(sourceId)
      }
    })

  const orphanNotes = data.nodes
    .filter((n) => n.type === "note" && !notesWithTags.has(n.id))
    .map((n) => n.label)

  const connectionDensity = data.links.length / Math.max(data.nodes.length, 1)

  return {
    noteCount,
    tagCount,
    collectionCount,
    totalConnections: data.links.length,
    connectionDensity: connectionDensity.toFixed(2),
    topTags,
    orphanNotes,
  }
}

/**
 * Get a note from a graph node
 */
export function getNoteFromNode(node: GraphNode): Note | null {
  if (node.type === "note") {
    return node.data as Note
  }
  return null
}
