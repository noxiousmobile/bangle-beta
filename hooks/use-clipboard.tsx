"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"

export function useClipboard() {
  const [clipboardContent, setClipboardContent] = useState<string | null>(null)
  const [isPasting, setIsPasting] = useState(false)

  // Check for clipboard content
  const checkClipboard = useCallback(async () => {
    try {
      const text = await navigator.clipboard.readText()
      if (text && (text.startsWith("http://") || text.startsWith("https://"))) {
        setClipboardContent(text)
      } else {
        setClipboardContent(null)
      }
    } catch (err) {
      console.log("Clipboard access denied or empty")
      setClipboardContent(null)
    }
  }, [])

  // Check clipboard on mount and when window is focused
  useEffect(() => {
    checkClipboard()

    const handleFocus = () => {
      checkClipboard()
    }

    window.addEventListener("focus", handleFocus)
    return () => {
      window.removeEventListener("focus", handleFocus)
    }
  }, [checkClipboard])

  const handlePaste = async () => {
    setIsPasting(true)
    try {
      const text = await navigator.clipboard.readText()
      console.log("Pasted content:", text)

      // Return the raw text without any modification
      setTimeout(() => setIsPasting(false), 500)
      return text
    } catch (err) {
      console.error("Failed to read clipboard", err)
      setIsPasting(false)
      return null
    }
  }

  const handlePasteEvent = async (e: React.ClipboardEvent | ClipboardEvent) => {
    // Get clipboard data
    let text: string | undefined

    if (e instanceof ClipboardEvent) {
      text = e.clipboardData?.getData("text")
    } else {
      text = e.clipboardData.getData("text")
    }

    // Return the raw text without any URL validation or modification
    if (text) {
      return text
    }
    return null
  }

  return {
    clipboardContent,
    isPasting,
    checkClipboard,
    handlePaste,
    handlePasteEvent,
  }
}
