"use client"

import type React from "react"
import { useState, useEffect, useCallback, useRef } from "react"
import { cn } from "@/lib/utils"
import { createLinkElement, linkifyElement, linkifyHtml, normalizeUrl } from "@/lib/linkify"
import { EditorToolbar } from "./editor-toolbar"
import { MarkdownToggle } from "./markdown-toggle"
import { TagInput } from "@/components/tag-input"
import "./editor-styles.css"

const ALLOWED_PASTE_TAGS = new Set([
  "P", "BR", "B", "STRONG", "I", "EM", "U", "S", "STRIKE", "A",
  "UL", "OL", "LI", "H1", "H2", "H3", "BLOCKQUOTE", "CODE", "PRE",
])
const BLOCK_PASTE_TAGS = new Set(["DIV", "SECTION", "ARTICLE", "TR", "H4", "H5", "H6"])

function sanitizePastedHtml(html: string): string {
  const doc = new DOMParser().parseFromString(html, "text/html")
  doc.querySelectorAll("script, style, meta, link, title, noscript").forEach((el) => el.remove())

  const clean = (node: Node): Node | DocumentFragment | null => {
    if (node.nodeType === Node.TEXT_NODE) return doc.createTextNode(node.textContent ?? "")
    if (node.nodeType !== Node.ELEMENT_NODE) return null
    const el = node as HTMLElement
    const children = doc.createDocumentFragment()
    el.childNodes.forEach((child) => {
      const cleaned = clean(child)
      if (cleaned) children.appendChild(cleaned)
    })
    if (ALLOWED_PASTE_TAGS.has(el.tagName)) {
      const out = doc.createElement(el.tagName.toLowerCase())
      if (el.tagName === "A") {
        const href = el.getAttribute("href") ?? ""
        if (/^(https?:|mailto:)/i.test(href)) {
          out.setAttribute("href", href)
          out.setAttribute("target", "_blank")
          out.setAttribute("rel", "noopener noreferrer")
        }
      }
      out.appendChild(children)
      return out
    }
    if (BLOCK_PASTE_TAGS.has(el.tagName)) {
      const p = doc.createElement("p")
      p.appendChild(children)
      return p
    }
    return children
  }

  const container = doc.createElement("div")
  doc.body.childNodes.forEach((child) => {
    const cleaned = clean(child)
    if (cleaned) container.appendChild(cleaned)
  })
  return container.innerHTML
}

interface RichTextEditorProps {
  initialContent?: string
  placeholder?: string
  onChange?: (html: string, markdown: string, tags: string[]) => void
  className?: string
  autoFocus?: boolean
  initialTags?: string[]
  showTags?: boolean
  recentTags?: string[]
  availableTags?: string[]
  footerStart?: React.ReactNode
}

export function RichTextEditor({
  initialContent = "",
  placeholder = "Write your note here...",
  onChange,
  className,
  autoFocus = true,
  initialTags = [],
  showTags = true,
  recentTags = [],
  availableTags,
  footerStart,
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null)
  const [currentFontSize, setCurrentFontSize] = useState(14)
  const [isMarkdownMode, setIsMarkdownMode] = useState(false)
  const [markdownContent, setMarkdownContent] = useState("")
  const [autoTags, setAutoTags] = useState<string[]>([])
  const [customTags, setCustomTags] = useState<string[]>(initialTags)
  const [isGeneratingTags, setIsGeneratingTags] = useState(false)
  const [activeFormats, setActiveFormats] = useState<Record<string, boolean>>({})
  const [isLinkInputOpen, setIsLinkInputOpen] = useState(false)
  const [linkValue, setLinkValue] = useState("")
  const savedRangeRef = useRef<Range | null>(null)

  const convertPlainTextToHtml = (text: string): string => {
    if (!text) return ""
    if (/<[a-z][\s\S]*>/i.test(text)) return text
    const lines = text.split("\n")
    let html = ""
    let currentParagraph = ""
    for (const line of lines) {
      if (line.trim() === "") {
        if (currentParagraph) {
          html += `<p>${currentParagraph}</p>`
          currentParagraph = ""
        }
      } else {
        currentParagraph = currentParagraph ? currentParagraph + "<br>" + line : line
      }
    }
    if (currentParagraph) html += `<p>${currentParagraph}</p>`
    return html || "<p></p>"
  }

  const htmlToMarkdown = (html: string): string => {
    return html
      .replace(/<h1>(.*?)<\/h1>/g, "# $1\n\n")
      .replace(/<h2>(.*?)<\/h2>/g, "## $1\n\n")
      .replace(/<h3>(.*?)<\/h3>/g, "### $1\n\n")
      .replace(/<strong>(.*?)<\/strong>/g, "**$1**")
      .replace(/<b>(.*?)<\/b>/g, "**$1**")
      .replace(/<em>(.*?)<\/em>/g, "*$1*")
      .replace(/<i>(.*?)<\/i>/g, "*$1*")
      .replace(/<a [^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/g, "[$2]($1)")
      .replace(/<code>(.*?)<\/code>/g, "`$1`")
      .replace(/<pre><code>(.*?)<\/code><\/pre>/g, "```\n$1\n```")
      .replace(/<li>(.*?)<\/li>/g, "- $1\n")
      .replace(/<ul>|<\/ul>|<ol>|<\/ol>/g, "")
      .replace(/<blockquote>(.*?)<\/blockquote>/g, "> $1\n")
      .replace(/<p>(.*?)<\/p>/g, "$1\n\n")
      .replace(/<br\s*\/?>/g, "\n")
      .replace(/&nbsp;/g, " ")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&amp;/g, "&")
      .replace(/<[^>]+>/g, "")
      .trim()
  }

  // Initialize content
  useEffect(() => {
    if (editorRef.current && initialContent) {
      const html = linkifyHtml(convertPlainTextToHtml(initialContent))
      editorRef.current.innerHTML = html
      const markdown = htmlToMarkdown(html)
      setMarkdownContent(markdown)
      
      // When a new note is started by typing, the first keystroke is already in
      // initialContent and can land in the editor a second time while it mounts.
      // Only revert that stray input; never trim content that was loaded as-is.
      setTimeout(() => {
        const editor = editorRef.current
        if (!editor) return
        if (editor.innerHTML !== html) {
          editor.innerHTML = html
          setMarkdownContent(markdown)
        }
        if (autoFocus) {
          const selection = window.getSelection()
          const range = document.createRange()
          range.selectNodeContents(editor)
          range.collapse(false)
          selection?.removeAllRanges()
          selection?.addRange(range)
        }
      }, 0)
    }
    if (autoFocus && editorRef.current) {
      editorRef.current.focus()
    }
  }, [])

  const handleInput = useCallback(() => {
    if (!editorRef.current) return
    
    const html = editorRef.current.innerHTML
    const markdown = htmlToMarkdown(html)
    setMarkdownContent(markdown)
    if (onChange) {
      const allTags = [...new Set([...autoTags, ...customTags])]
      onChange(html, markdown, allTags)
    }
  }, [onChange, autoTags, customTags])

  // Trigger onChange when customTags changes (e.g., adding from recent tags)
  useEffect(() => {
    if (onChange && editorRef.current) {
      const html = editorRef.current.innerHTML
      const markdown = htmlToMarkdown(html)
      const allTags = [...new Set([...autoTags, ...customTags])]
      onChange(html, markdown, allTags)
    }
  }, [customTags, autoTags, onChange])

  const handleSelectionChange = useCallback(() => {
    setActiveFormats({
      bold: document.queryCommandState("bold"),
      italic: document.queryCommandState("italic"),
      underline: document.queryCommandState("underline"),
      strikeThrough: document.queryCommandState("strikeThrough"),
      insertUnorderedList: document.queryCommandState("insertUnorderedList"),
      insertOrderedList: document.queryCommandState("insertOrderedList"),
    })
    const editor = editorRef.current
    const selection = window.getSelection()
    if (!editor || !selection || selection.rangeCount === 0) return
    const range = selection.getRangeAt(0)
    if (!editor.contains(range.commonAncestorContainer)) return

    // Range boundaries often sit on the parent block (e.g. after wrapping in a span), so measure the first selected text node instead
    let target: Node | null = range.startContainer
    if (!range.collapsed && target.nodeType !== Node.TEXT_NODE) {
      const walker = document.createTreeWalker(range.commonAncestorContainer, NodeFilter.SHOW_TEXT)
      let node = walker.nextNode()
      while (node && !(range.intersectsNode(node) && node.textContent?.trim())) node = walker.nextNode()
      if (node) target = node
    }
    const element = target.nodeType === Node.ELEMENT_NODE ? (target as Element) : target.parentElement
    if (element) setCurrentFontSize(Math.round(parseFloat(window.getComputedStyle(element).fontSize)))
  }, [])

  useEffect(() => {
    document.addEventListener("selectionchange", handleSelectionChange)
    return () => document.removeEventListener("selectionchange", handleSelectionChange)
  }, [handleSelectionChange])

  const execCmd = useCallback((command: string, value?: string) => {
    editorRef.current?.focus()
    document.execCommand(command, false, value)
    handleInput()
    handleSelectionChange()
  }, [handleInput, handleSelectionChange])

  const insertHeading = useCallback((level: 1 | 2 | 3) => {
    editorRef.current?.focus()
    document.execCommand("formatBlock", false, `h${level}`)
    handleInput()
  }, [handleInput])

  const insertBlockquote = useCallback(() => {
    editorRef.current?.focus()
    document.execCommand("formatBlock", false, "blockquote")
    handleInput()
  }, [handleInput])

  const openLinkInput = useCallback(() => {
    const editor = editorRef.current
    const selection = window.getSelection()
    if (editor && selection?.rangeCount && editor.contains(selection.anchorNode)) {
      savedRangeRef.current = selection.getRangeAt(0).cloneRange()
      const selected = selection.toString().trim()
      setLinkValue(/^(https?:\/\/|www\.)/i.test(selected) ? selected : "")
    } else {
      savedRangeRef.current = null
      setLinkValue("")
    }
    setIsLinkInputOpen(true)
  }, [])

  const closeLinkInput = useCallback(() => {
    setIsLinkInputOpen(false)
    setLinkValue("")
    editorRef.current?.focus()
  }, [])

  const applyLink = useCallback(() => {
    const editor = editorRef.current
    const href = normalizeUrl(linkValue)
    if (!editor || !href) return
    editor.focus()

    const selection = window.getSelection()
    let range = savedRangeRef.current
    if (!range || !editor.contains(range.commonAncestorContainer)) {
      range = document.createRange()
      range.selectNodeContents(editor)
      range.collapse(false)
    }

    const anchor = createLinkElement(href, range.collapsed ? linkValue.trim() : undefined)
    if (!range.collapsed) {
      anchor.textContent = ""
      const contents = range.extractContents()
      contents.querySelectorAll("a").forEach((nested) => nested.replaceWith(...Array.from(nested.childNodes)))
      anchor.appendChild(contents)
    }
    range.insertNode(anchor)

    const after = document.createRange()
    after.setStartAfter(anchor)
    after.collapse(true)
    selection?.removeAllRanges()
    selection?.addRange(after)

    savedRangeRef.current = null
    setIsLinkInputOpen(false)
    setLinkValue("")
    handleInput()
  }, [linkValue, handleInput])

  const autoLinkify = useCallback(() => {
    if (editorRef.current && linkifyElement(editorRef.current)) handleInput()
  }, [handleInput])

  const handleEditorKeyUp = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === " " || e.key === "Enter" || e.key === "Tab") autoLinkify()
    handleSelectionChange()
  }, [autoLinkify, handleSelectionChange])

  const handleEditorClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const anchor = (e.target as HTMLElement).closest("a")
    if (!anchor?.href) return
    e.preventDefault()
    window.open(anchor.href, "_blank", "noopener,noreferrer")
  }, [])

  const insertImage = useCallback(() => {
    const url = window.prompt("Image URL")
    if (url) execCmd("insertImage", url)
  }, [execCmd])

  const clearFormatting = useCallback(() => {
    const editor = editorRef.current
    const selection = window.getSelection()
    if (!editor || !selection || selection.isCollapsed) return
    if (!editor.contains(selection.anchorNode)) return
    editor.focus()

    const range = selection.getRangeAt(0)
    const topLevelNode = (node: Node): Node => {
      let current = node
      while (current.parentNode && current.parentNode !== editor) current = current.parentNode
      return current
    }
    const startBlock = topLevelNode(range.startContainer === editor ? editor.childNodes[range.startOffset] ?? editor.lastChild! : range.startContainer)
    const endBlock = topLevelNode(range.endContainer === editor ? editor.childNodes[Math.max(range.endOffset - 1, 0)] ?? editor.lastChild! : range.endContainer)
    if (!startBlock || !endBlock) return

    // Keep the untouched text before/after the selection (with its own formatting) on the same lines
    const beforeRange = document.createRange()
    beforeRange.setStartBefore(startBlock)
    beforeRange.setEnd(range.startContainer, range.startOffset)
    const afterRange = document.createRange()
    afterRange.setStart(range.endContainer, range.endOffset)
    afterRange.setEndAfter(endBlock)
    const beforeFragment = beforeRange.cloneContents()
    const afterFragment = afterRange.cloneContents()

    const toInline = (fragment: DocumentFragment) => {
      const holder = document.createElement("div")
      holder.appendChild(fragment)
      const blocks = holder.querySelectorAll("p,div,h1,h2,h3,h4,h5,h6,blockquote,pre,li")
      blocks.forEach((block) => block.replaceWith(...Array.from(block.childNodes)))
      holder.querySelectorAll("ul,ol").forEach((list) => list.replaceWith(...Array.from(list.childNodes)))
      return Array.from(holder.childNodes).filter((node) => node.textContent !== "" || node.nodeName === "IMG")
    }

    const beforeNodes = toInline(beforeFragment)
    const afterNodes = toInline(afterFragment)
    const lines = selection.toString().replace(/\r/g, "").split("\n")

    const paragraphs = lines.map((line) => {
      const p = document.createElement("p")
      if (line) p.appendChild(document.createTextNode(line))
      return p
    })
    const first = paragraphs[0]
    const last = paragraphs[paragraphs.length - 1]
    first.prepend(...beforeNodes)
    const selectedEndNode = last.lastChild
    last.append(...afterNodes)
    paragraphs.forEach((p) => {
      if (!p.hasChildNodes()) p.appendChild(document.createElement("br"))
    })

    const replaceRange = document.createRange()
    replaceRange.setStartBefore(startBlock)
    replaceRange.setEndAfter(endBlock)
    replaceRange.deleteContents()
    const fragment = document.createDocumentFragment()
    paragraphs.forEach((p) => fragment.appendChild(p))
    replaceRange.insertNode(fragment)

    const newSelection = document.createRange()
    const firstTextNode = beforeNodes.length ? first.childNodes[beforeNodes.length] : first.firstChild
    if (firstTextNode) newSelection.setStartBefore(firstTextNode)
    else newSelection.setStart(first, 0)
    if (selectedEndNode) newSelection.setEndAfter(selectedEndNode)
    else newSelection.setEnd(last, 0)
    selection.removeAllRanges()
    selection.addRange(newSelection)

    handleInput()
    handleSelectionChange()
  }, [handleInput, handleSelectionChange])

  const applyFontSize = useCallback((px: number) => {
    const editor = editorRef.current
    const selection = window.getSelection()
    if (!editor || !selection) return
    editor.focus()

    if (!selection.rangeCount || !editor.contains(selection.anchorNode)) {
      const endRange = document.createRange()
      endRange.selectNodeContents(editor)
      endRange.collapse(false)
      selection.removeAllRanges()
      selection.addRange(endRange)
    }

    if (selection.isCollapsed) {
      // No text selected: insert an empty sized span at the caret so the next typed characters use this size.
      // The zero-width space gives the caret a text node inside the span to land in.
      const range = selection.getRangeAt(0)
      const span = document.createElement("span")
      span.style.fontSize = `${px}px`
      const placeholder = document.createTextNode("\u200B")
      span.appendChild(placeholder)
      range.insertNode(span)
      const caret = document.createRange()
      caret.setStart(placeholder, 1)
      caret.collapse(true)
      selection.removeAllRanges()
      selection.addRange(caret)
      setCurrentFontSize(px)
      return
    }

    // execCommand("fontSize") only supports 1-7, so mark the selection with size 7 and swap in a real px span
    document.execCommand("styleWithCSS", false, "false")
    document.execCommand("fontSize", false, "7")
    const marked = Array.from(editor.querySelectorAll('font[size="7"]'))
    let firstSpan: HTMLSpanElement | null = null
    let lastSpan: HTMLSpanElement | null = null
    marked.forEach((font) => {
      const span = document.createElement("span")
      span.style.fontSize = `${px}px`
      span.append(...Array.from(font.childNodes))
      span.querySelectorAll<HTMLElement>("[style]").forEach((el) => {
        el.style.removeProperty("font-size")
        if (!el.getAttribute("style")) el.removeAttribute("style")
      })
      font.replaceWith(span)
      firstSpan ??= span
      lastSpan = span
    })

    if (firstSpan && lastSpan) {
      const range = document.createRange()
      range.setStartBefore(firstSpan)
      range.setEndAfter(lastSpan)
      selection.removeAllRanges()
      selection.addRange(range)
    }
    setCurrentFontSize(px)
    handleInput()
  }, [handleInput])

  const handlePaste = useCallback((e: React.ClipboardEvent<HTMLDivElement>) => {
    const html = e.clipboardData.getData("text/html")
    const text = e.clipboardData.getData("text/plain")
    if (!html && !text) return
    e.preventDefault()
    if (html) {
      document.execCommand("insertHTML", false, sanitizePastedHtml(html))
    } else {
      document.execCommand("insertText", false, text)
    }
    if (editorRef.current) linkifyElement(editorRef.current)
    handleInput()
  }, [handleInput])

  const undo = useCallback(() => execCmd("undo"), [execCmd])
  const redo = useCallback(() => execCmd("redo"), [execCmd])

  const toggleMarkdownMode = useCallback(() => {
    if (!isMarkdownMode) {
      // switching TO markdown — read current HTML
      if (editorRef.current) {
        setMarkdownContent(htmlToMarkdown(editorRef.current.innerHTML))
      }
    } else {
      // switching BACK to rich text — convert markdown to HTML
      if (editorRef.current) {
        const html = markdownContent
          .replace(/^# (.*?)$/gm, "<h1>$1</h1>")
          .replace(/^## (.*?)$/gm, "<h2>$1</h2>")
          .replace(/^### (.*?)$/gm, "<h3>$1</h3>")
          .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
          .replace(/\*(.*?)\*/g, "<em>$1</em>")
          .replace(/`([^`]+)`/g, "<code>$1</code>")
          .replace(/^- (.*?)$/gm, "<li>$1</li>")
          .replace(/^> (.*?)$/gm, "<blockquote>$1</blockquote>")
          .replace(/\n\n/g, "</p><p>")
          .replace(/\n/g, "<br>")
        editorRef.current.innerHTML = `<p>${html}</p>`
      }
    }
    setIsMarkdownMode((prev) => !prev)
  }, [isMarkdownMode, markdownContent])

  const handleMarkdownChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newMarkdown = e.target.value
    setMarkdownContent(newMarkdown)
    if (onChange) {
      const allTags = [...new Set([...autoTags, ...customTags])]
      onChange("", newMarkdown, allTags)
    }
  }, [onChange, autoTags, customTags])

  // Auto tag generation
  useEffect(() => {
    const generateTags = async () => {
      if (!markdownContent.trim()) { setAutoTags([]); return }
      setIsGeneratingTags(true)
      try {
        const keywords: Record<string, string[]> = {
          work: ["work","project","meeting","deadline","client","presentation","report","email","task","job","office","business"],
          personal: ["personal","family","friend","home","life","birthday","holiday","weekend","hobby"],
          tech: ["tech","technology","software","hardware","app","code","programming","development","computer","web"],
          education: ["education","learn","study","course","class","school","university","degree","knowledge","research"],
          health: ["health","fitness","exercise","workout","gym","diet","nutrition","wellness","medical"],
          finance: ["finance","money","budget","expense","income","saving","investment","bank","payment"],
          travel: ["travel","trip","vacation","journey","flight","hotel","destination","explore"],
          cooking: ["cooking","recipe","food","meal","ingredient","kitchen","dish","restaurant"],
          important: ["important","urgent","priority","critical","essential","vital","key"],
        }
        const lowerText = markdownContent.toLowerCase()
        const matched = Object.entries(keywords)
          .filter(([, words]) => words.some((w) => lowerText.includes(w)))
          .map(([cat]) => cat)
        setAutoTags(matched.slice(0, 3))
      } finally {
        setIsGeneratingTags(false)
      }
    }
    const t = setTimeout(generateTags, 500)
    return () => clearTimeout(t)
  }, [markdownContent])

  return (
    <div className={cn("rich-text-editor w-full flex flex-col", className)}>
      <EditorToolbar
        activeFormats={activeFormats}
        isMarkdownMode={isMarkdownMode}
        onBold={() => execCmd("bold")}
        onItalic={() => execCmd("italic")}
        onUnderline={() => execCmd("underline")}
        onStrike={() => execCmd("strikeThrough")}
        onClearFormatting={clearFormatting}
        currentFontSize={currentFontSize}
        onFontSize={applyFontSize}
        onHeading1={() => insertHeading(1)}
        onHeading2={() => insertHeading(2)}
        onBulletList={() => execCmd("insertUnorderedList")}
        onOrderedList={() => execCmd("insertOrderedList")}
        onBlockquote={insertBlockquote}
        onLink={openLinkInput}
        onImage={insertImage}
        onUndo={undo}
        onRedo={redo}
      />

      {isLinkInputOpen && !isMarkdownMode && (
        <form
          className="mb-2 flex items-center gap-2 rounded-md border border-border bg-muted/50 p-2"
          onSubmit={(e) => {
            e.preventDefault()
            applyLink()
          }}
        >
          <label htmlFor="editor-link-url" className="sr-only">Link URL</label>
          <input
            id="editor-link-url"
            type="text"
            inputMode="url"
            autoFocus
            value={linkValue}
            onChange={(e) => setLinkValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                e.preventDefault()
                closeLinkInput()
              }
            }}
            placeholder="https://example.com"
            className="h-8 flex-1 rounded border border-border bg-background px-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/30"
          />
          <button
            type="submit"
            disabled={!normalizeUrl(linkValue)}
            className="h-8 rounded bg-primary px-3 text-sm font-medium text-primary-foreground disabled:opacity-50"
          >
            Add link
          </button>
          <button
            type="button"
            onClick={closeLinkInput}
            className="h-8 rounded px-3 text-sm text-muted-foreground hover:bg-muted"
          >
            Cancel
          </button>
        </form>
      )}

      {isMarkdownMode ? (
        <textarea
          className="w-full h-64 p-3 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none font-mono text-sm"
          value={markdownContent}
          onChange={handleMarkdownChange}
          placeholder="Write in Markdown..."
        />
      ) : (
        <div
          className="editor-container border border-gray-200 rounded-md focus-within:ring-2 focus-within:ring-primary/20 overflow-y-auto"
          style={{ minHeight: "10rem", maxHeight: "calc(100vh - 400px)" }}
        >
          <div
            ref={editorRef}
            contentEditable
            suppressContentEditableWarning
            onInput={handleInput}
            onPaste={handlePaste}
            onKeyUp={handleEditorKeyUp}
            onMouseUp={handleSelectionChange}
            onClick={handleEditorClick}
            className="note-content prose prose-sm max-w-none p-3 outline-none"
            style={{ fontSize: "14px" }}
            data-placeholder={placeholder}
          />
        </div>
      )}

      <MarkdownToggle
          isMarkdownMode={isMarkdownMode}
          toggleMarkdownMode={toggleMarkdownMode}
          leading={footerStart}
        />

      {showTags && (
        <div className="mt-4 rounded-md border bg-muted/50 p-3">
          <TagInput
            tags={customTags}
            onChange={setCustomTags}
            availableTags={availableTags ?? recentTags}
            recentTags={recentTags}
            excludeTags={autoTags}
            placeholder={autoTags.length === 0 ? "Type to auto-generate tags, or search and add your own..." : "Search or add tags..."}
            leading={autoTags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary"
              >
                {tag}
              </span>
            ))}
          />
        </div>
      )}
    </div>
  )
}
