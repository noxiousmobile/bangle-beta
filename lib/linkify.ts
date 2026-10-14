const URL_PATTERN = /(?:https?:\/\/|www\.)(?:(?!&nbsp;|&lt;|&gt;)[^\s<>"])+/gi
const TRAILING_PUNCTUATION = /[.,;:!?)\]}'"]+$/

export function normalizeUrl(raw: string): string | null {
  const value = raw.trim()
  if (!value) return null
  if (/^(javascript|data|vbscript):/i.test(value)) return null
  if (/^(https?:|mailto:)/i.test(value)) return value
  return `https://${value.replace(/^\/+/, "")}`
}

function findUrls(text: string): { start: number; end: number; url: string }[] {
  const matches: { start: number; end: number; url: string }[] = []
  for (const match of text.matchAll(URL_PATTERN)) {
    const trimmed = match[0].replace(TRAILING_PUNCTUATION, "")
    if (trimmed.length < 5 || match.index === undefined) continue
    matches.push({ start: match.index, end: match.index + trimmed.length, url: trimmed })
  }
  return matches
}

const escapeAttribute = (value: string) => value.replace(/"/g, "&quot;")

/** String-based so it renders identically on the server and client. */
export function linkifyHtml(html: string): string {
  if (!html) return html
  let insideAnchor = 0
  return html
    .split(/(<[^>]+>)/)
    .map((segment) => {
      if (segment.startsWith("<")) {
        if (/^<a[\s>]/i.test(segment)) {
          insideAnchor++
          return /\starget=/i.test(segment) ? segment : segment.replace(/^<a/i, '<a target="_blank" rel="noopener noreferrer"')
        }
        if (/^<\/a>/i.test(segment)) insideAnchor = Math.max(0, insideAnchor - 1)
        return segment
      }
      if (insideAnchor || !segment) return segment
      let result = ""
      let cursor = 0
      for (const { start, end, url } of findUrls(segment)) {
        const href = normalizeUrl(url.replace(/&amp;/g, "&"))
        if (!href) continue
        result += segment.slice(cursor, start)
        result += `<a href="${escapeAttribute(href)}" target="_blank" rel="noopener noreferrer">${url}</a>`
        cursor = end
      }
      return result + segment.slice(cursor)
    })
    .join("")
}

export function createLinkElement(href: string, text?: string): HTMLAnchorElement {
  const anchor = document.createElement("a")
  anchor.href = href
  anchor.target = "_blank"
  anchor.rel = "noopener noreferrer"
  anchor.textContent = text ?? href
  return anchor
}

/**
 * Wraps bare URLs inside `root` in anchors and keeps the caret where it was,
 * so it can run while the user is typing.
 */
export function linkifyElement(root: HTMLElement): boolean {
  const selection = window.getSelection()
  const caretNode = selection?.isCollapsed ? selection.anchorNode : null
  const caretOffset = selection?.anchorOffset ?? 0
  let changed = false

  root.querySelectorAll("a").forEach((anchor) => {
    if (anchor.target !== "_blank") {
      anchor.target = "_blank"
      anchor.rel = "noopener noreferrer"
    }
  })

  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode: (node) => (node.parentElement?.closest("a, code, pre") ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT),
  })
  const textNodes: Text[] = []
  while (walker.nextNode()) textNodes.push(walker.currentNode as Text)

  for (const node of textNodes) {
    const text = node.data
    const hasCaret = node === caretNode
    // Don't wrap a URL the caret is still touching; it may still be being typed.
    const urls = findUrls(text).filter(({ end }) => !hasCaret || end < caretOffset)
    if (!urls.length) continue

    const fragment = document.createDocumentFragment()
    let cursor = 0
    let newCaret: { node: Node; offset: number } | null = null
    for (const { start, end, url } of urls) {
      const href = normalizeUrl(url)
      if (!href) continue
      if (start > cursor) fragment.appendChild(document.createTextNode(text.slice(cursor, start)))
      fragment.appendChild(createLinkElement(href, url))
      cursor = end
    }
    const tail = document.createTextNode(text.slice(cursor))
    fragment.appendChild(tail)
    if (hasCaret) newCaret = { node: tail, offset: Math.max(0, caretOffset - cursor) }

    node.replaceWith(fragment)
    changed = true

    if (newCaret && selection) {
      const range = document.createRange()
      range.setStart(newCaret.node, Math.min(newCaret.offset, newCaret.node.textContent?.length ?? 0))
      range.collapse(true)
      selection.removeAllRanges()
      selection.addRange(range)
    }
  }
  return changed
}
