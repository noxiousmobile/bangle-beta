export const ANCHOR_CLASS = "note-anchor"

// Skips CSS hex colors like #fff or #a1b2c3 so they stay plain text.
const NAME = "(?!(?:[0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})(?![\\w-]))[A-Za-z][\\w-]{0,39}"
const HTML_HASHTAG = new RegExp(`(^|[\\s(>;])#(${NAME})(?=[\\s.,;:!?)&<]|$)`, "g")
const TEXT_HASHTAG = new RegExp(`(^|[\\s\\u00A0\\u200B(])#(${NAME})(?=[\\s\\u00A0.,;:!?)]|$)`, "g")
const ANCHOR_SPAN = `<span class="${ANCHOR_CLASS}"[^>]*>[^<]*<\\/span>`

export const anchorSpanHtml = (name: string) =>
  `<span class="${ANCHOR_CLASS}" data-anchor="${name}" contenteditable="false">#${name}</span>`

/** String-based so it renders identically on the server and client. */
export function anchorifyHtml(html: string): string {
  if (!html) return html
  let skipDepth = 0
  let insideAnchorSpan = false
  const converted = html
    .split(/(<[^>]+>)/)
    .map((segment) => {
      if (segment.startsWith("<")) {
        if (/^<(a|code|pre)[\s>]/i.test(segment)) skipDepth++
        else if (/^<\/(a|code|pre)>/i.test(segment)) skipDepth = Math.max(0, skipDepth - 1)
        else if (segment.includes(ANCHOR_CLASS)) insideAnchorSpan = true
        else if (insideAnchorSpan && /^<\/span>/i.test(segment)) insideAnchorSpan = false
        return segment
      }
      if (skipDepth || insideAnchorSpan || !segment) return segment
      return segment.replace(HTML_HASHTAG, (_, lead: string, name: string) => `${lead}${anchorSpanHtml(name)}`)
    })
    .join("")

  // A hashtag alone on its line marks the line below it instead of leaving an empty line behind.
  return converted
    .replace(new RegExp(`(^|<p>|<div>|<br\\s*\\/?>)((?:\\s|&nbsp;)*)(${ANCHOR_SPAN})(?:\\s|&nbsp;)*<br\\s*\\/?>`, "g"), "$1$3")
    .replace(new RegExp(`<(p|div)>(?:\\s|&nbsp;)*(${ANCHOR_SPAN})(?:\\s|&nbsp;|<br\\s*\\/?>)*<\\/\\1>\\s*<(p|div)>`, "g"), "<$3>$2")
}

export function extractAnchors(html: string): string[] {
  const seen = new Map<string, string>()
  for (const match of anchorifyHtml(html).matchAll(/data-anchor="([^"]+)"/g)) {
    const key = match[1].toLowerCase()
    if (!seen.has(key)) seen.set(key, match[1])
  }
  return Array.from(seen.values())
}

const isBlank = (node: Node | null, caretNode: Node | null) =>
  !!node && node.nodeType === Node.TEXT_NODE && node !== caretNode && !node.textContent?.replace(/[\s\u00A0\u200B]/g, "")

function attachToNextLine(anchor: HTMLElement, root: HTMLElement, selection: Selection | null) {
  const caretNode = selection?.anchorNode ?? null
  const siblingSkippingBlanks = (start: Node | null, dir: "previousSibling" | "nextSibling") => {
    let node = start
    while (isBlank(node, caretNode)) node = node![dir]
    return node
  }
  const prev = siblingSkippingBlanks(anchor.previousSibling, "previousSibling")
  if (prev && prev.nodeName !== "BR") return
  const next = siblingSkippingBlanks(anchor.nextSibling, "nextSibling")

  if (next?.nodeName === "BR") {
    while (anchor.nextSibling && anchor.nextSibling !== next) anchor.nextSibling.remove()
    ;(next as ChildNode).remove()
    return
  }
  if (next) return

  const block = anchor.parentElement
  if (!block || block === root || !/^(P|DIV)$/.test(block.nodeName)) return
  if (caretNode && block.contains(caretNode)) return
  const nextBlock = block.nextElementSibling
  if (!nextBlock || !/^(P|DIV|H1|H2|H3|BLOCKQUOTE)$/.test(nextBlock.nodeName)) return

  const caretAtNextStart = caretNode === nextBlock && selection?.anchorOffset === 0
  nextBlock.prepend(anchor)
  if (!block.textContent?.replace(/[\s\u00A0\u200B]/g, "") && !block.querySelector("img")) block.remove()
  if (caretAtNextStart && selection) {
    const range = document.createRange()
    range.setStartAfter(anchor)
    range.collapse(true)
    selection.removeAllRanges()
    selection.addRange(range)
  }
}

/** Turns typed `#name` text inside `root` into anchor markers, keeping the caret in place. */
export function anchorifyElement(root: HTMLElement): boolean {
  const selection = window.getSelection()
  const caretNode = selection?.isCollapsed ? selection.anchorNode : null
  const caretOffset = selection?.anchorOffset ?? 0
  const created: HTMLElement[] = []

  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode: (node) =>
      node.parentElement?.closest(`a, code, pre, .${ANCHOR_CLASS}`) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT,
  })
  const textNodes: Text[] = []
  while (walker.nextNode()) textNodes.push(walker.currentNode as Text)

  for (const node of textNodes) {
    const text = node.data
    const hasCaret = node === caretNode
    const matches = Array.from(text.matchAll(TEXT_HASHTAG))
      .map((m) => ({ start: m.index! + m[1].length, end: m.index! + m[0].length, name: m[2] }))
      // Leave a hashtag the caret is still touching alone; it may still be being typed.
      .filter(({ end }) => !hasCaret || end < caretOffset)
    if (!matches.length) continue

    const fragment = document.createDocumentFragment()
    let cursor = 0
    for (const { start, end, name } of matches) {
      if (start > cursor) fragment.appendChild(document.createTextNode(text.slice(cursor, start)))
      const span = document.createElement("span")
      span.className = ANCHOR_CLASS
      span.dataset.anchor = name
      span.contentEditable = "false"
      span.textContent = `#${name}`
      fragment.appendChild(span)
      created.push(span)
      cursor = end
    }
    const tail = document.createTextNode(text.slice(cursor))
    fragment.appendChild(tail)
    node.replaceWith(fragment)

    if (hasCaret && selection) {
      const range = document.createRange()
      range.setStart(tail, Math.min(Math.max(0, caretOffset - cursor), tail.length))
      range.collapse(true)
      selection.removeAllRanges()
      selection.addRange(range)
    }
  }

  root.querySelectorAll<HTMLElement>(`.${ANCHOR_CLASS}`).forEach((anchor) => attachToNextLine(anchor, root, selection))
  return created.length > 0
}

export function jumpToAnchor(container: HTMLElement | null, name: string) {
  const target = container?.querySelector<HTMLElement>(`.${ANCHOR_CLASS}[data-anchor="${CSS.escape(name)}" i]`)
  if (!target) return
  target.scrollIntoView({ behavior: "smooth", block: "center" })
  target.classList.remove("is-pinged")
  void target.offsetWidth
  target.classList.add("is-pinged")
  window.setTimeout(() => target.classList.remove("is-pinged"), 1800)
}

export function setAnchorHighlight(container: HTMLElement | null, name: string | null) {
  container?.querySelectorAll<HTMLElement>(`.${ANCHOR_CLASS}`).forEach((el) => {
    el.classList.toggle("is-highlighted", !!name && el.dataset.anchor?.toLowerCase() === name.toLowerCase())
  })
}
