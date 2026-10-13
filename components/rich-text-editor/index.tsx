"use client"

import type React from "react"
import { useState, useEffect, useCallback, useRef } from "react"
import { Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"
import { EditorToolbar } from "./editor-toolbar"
import { MarkdownToggle } from "./markdown-toggle"
import { TagInput } from "@/components/tag-input"
import "./editor-styles.css"

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
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null)
  const [isMarkdownMode, setIsMarkdownMode] = useState(false)
  const [markdownContent, setMarkdownContent] = useState("")
  const [autoTags, setAutoTags] = useState<string[]>([])
  const [customTags, setCustomTags] = useState<string[]>(initialTags)
  const [isGeneratingTags, setIsGeneratingTags] = useState(false)
  const [activeFormats, setActiveFormats] = useState<Record<string, boolean>>({})

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
      .replace(/<a href="(.*?)">(.*?)<\/a>/g, "[$2]($1)")
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
      const html = convertPlainTextToHtml(initialContent)
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

  const insertLink = useCallback(() => {
    const url = window.prompt("URL")
    if (url) execCmd("createLink", url)
  }, [execCmd])

  const insertImage = useCallback(() => {
    const url = window.prompt("Image URL")
    if (url) execCmd("insertImage", url)
  }, [execCmd])

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
        onHeading1={() => insertHeading(1)}
        onHeading2={() => insertHeading(2)}
        onBulletList={() => execCmd("insertUnorderedList")}
        onOrderedList={() => execCmd("insertOrderedList")}
        onBlockquote={insertBlockquote}
        onLink={insertLink}
        onImage={insertImage}
        onUndo={undo}
        onRedo={redo}
      />

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
            onKeyUp={handleSelectionChange}
            onMouseUp={handleSelectionChange}
            className="prose prose-sm max-w-none p-3 outline-none"
            data-placeholder={placeholder}
          />
        </div>
      )}

      <MarkdownToggle isMarkdownMode={isMarkdownMode} toggleMarkdownMode={toggleMarkdownMode} />

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
