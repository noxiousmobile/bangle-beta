"use client"

import type React from "react"
import { useState, useEffect, useCallback, useRef } from "react"
import { X, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"
import { EditorToolbar } from "./editor-toolbar"
import { MarkdownToggle } from "./markdown-toggle"
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
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null)
  const [isMarkdownMode, setIsMarkdownMode] = useState(false)
  const [markdownContent, setMarkdownContent] = useState("")
  const [autoTags, setAutoTags] = useState<string[]>([])
  const [customTags, setCustomTags] = useState<string[]>(initialTags)
  const [newTagInput, setNewTagInput] = useState("")
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
      
      // Fix duplicate character issue: always remove last char when initialContent exists
      // The keydown handler captures the keystroke which causes duplication
      setTimeout(() => {
        if (editorRef.current) {
          const text = editorRef.current.innerText || ""
          if (text.length > 1) {
            // Remove the last character (the duplicate from keydown)
            const correctedText = text.slice(0, -1)
            const correctedHtml = convertPlainTextToHtml(correctedText)
            editorRef.current.innerHTML = correctedHtml
            setMarkdownContent(htmlToMarkdown(correctedHtml))
            
            // Move cursor to the end of the text
            const selection = window.getSelection()
            const range = document.createRange()
            range.selectNodeContents(editorRef.current)
            range.collapse(false) // false = collapse to end
            selection?.removeAllRanges()
            selection?.addRange(range)
          }
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

  const addCustomTag = useCallback(() => {
    if (newTagInput.trim() && !customTags.includes(newTagInput.trim())) {
      setCustomTags([...customTags, newTagInput.trim()])
      setNewTagInput("")
    }
  }, [newTagInput, customTags])

  const removeCustomTag = useCallback((tag: string) => {
    setCustomTags(customTags.filter((t) => t !== tag))
  }, [customTags])

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
          className="editor-container border border-gray-200 rounded-md focus-within:ring-2 focus-within:ring-primary/20"
          style={{ minHeight: "10rem" }}
        >
          <div
            ref={editorRef}
            contentEditable
            suppressContentEditableWarning
            onInput={handleInput}
            onKeyUp={handleSelectionChange}
            onMouseUp={handleSelectionChange}
            className="prose prose-sm max-w-none p-3 outline-none min-h-[10rem]"
            data-placeholder={placeholder}
          />
        </div>
      )}

      <MarkdownToggle isMarkdownMode={isMarkdownMode} toggleMarkdownMode={toggleMarkdownMode} />

      {showTags && (
        <div className="mt-4 p-3 bg-muted/50 rounded-md border">
          <div className="flex flex-col space-y-3">
            <div className="flex flex-wrap gap-2">
              {autoTags.map((tag) => (
                <span key={tag} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                  {tag}
                </span>
              ))}
              {autoTags.length === 0 && !isGeneratingTags && (
                <span className="text-sm text-muted-foreground flex items-center gap-1">
                  <Sparkles className="w-4 h-4" />
                  Type to auto-generate tags
                </span>
              )}
            </div>
            <div className="flex flex-wrap gap-1 p-2 border border-border rounded-md bg-background min-h-[38px]">
              {customTags.map((tag) => (
                <span key={tag} className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                  {tag}
                  <button onClick={() => removeCustomTag(tag)} className="ml-1 inline-flex items-center justify-center w-3 h-3 rounded-full hover:bg-green-200">
                    <X className="w-2 h-2" />
                  </button>
                </span>
              ))}
              <input
                type="text"
                value={newTagInput}
                onChange={(e) => setNewTagInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addCustomTag())}
                placeholder={customTags.length === 0 ? "Add tags" : "Add more"}
                className="flex-1 min-w-[100px] outline-none bg-transparent text-sm py-1"
              />
            </div>

            {recentTags.length > 0 && (
              <div className="flex flex-col gap-1.5">
                <span className="text-xs text-muted-foreground">Recently used</span>
                <div className="flex flex-wrap gap-1.5">
                  {recentTags
                    .filter((tag) => !customTags.includes(tag))
                    .map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => {
                          if (!customTags.includes(tag)) {
                            setCustomTags([...customTags, tag])
                          }
                        }}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs border border-dashed border-border text-muted-foreground hover:border-primary hover:text-primary hover:bg-primary/5 transition-colors"
                      >
                        <span>+</span>
                        {tag}
                      </button>
                    ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
