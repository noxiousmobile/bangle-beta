"use client"

import React from "react"

import { useState, useCallback, useRef, useEffect } from "react"

import { 
  X, 
  Upload, 
  FileArchive, 
  ExternalLink, 
  CheckCircle2, 
  AlertCircle,
  Sparkles,
  FileText,
  Tag,
  ChevronDown,
  ChevronUp,
  Loader2,
  Cloud,
  HardDrive
} from "lucide-react"
import type { Note } from "@/lib/data"
import JSZip from "jszip"

// Google API types
declare global {
  interface Window {
    gapi: any
    google: any
  }
}

interface GoogleKeepImportModalProps {
  isOpen: boolean
  onClose: () => void
  onImportComplete: (notes: Note[]) => void
  existingNotes: Note[]
}

interface KeepNote {
  title: string
  textContent?: string
  listContent?: { text: string; isChecked: boolean }[]
  color: string
  isTrashed: boolean
  isPinned: boolean
  isArchived: boolean
  labels?: { name: string }[]
  userEditedTimestampUsec?: number
  attachments?: { filePath: string; mimetype: string }[]
}

interface ParsedNote {
  title: string
  content: string
  tags: string[]
  isPinned: boolean
  color: string
  date: Date
  selected: boolean
}

type ImportStep = "choose" | "upload" | "preview" | "importing" | "complete"

// Google Keep color mapping
const keepColorMap: Record<string, string> = {
  "DEFAULT": "gray",
  "RED": "red",
  "ORANGE": "orange",
  "YELLOW": "yellow",
  "GREEN": "green",
  "TEAL": "teal",
  "BLUE": "blue",
  "CERULEAN": "blue",
  "PURPLE": "purple",
  "PINK": "pink",
  "BROWN": "orange",
  "GRAY": "gray",
}

const SCOPES = "https://www.googleapis.com/auth/drive.readonly"

interface GoogleConfig {
  clientId: string
  apiKey: string
}

export function GoogleKeepImportModal({ 
  isOpen, 
  onClose, 
  onImportComplete,
  existingNotes 
}: GoogleKeepImportModalProps) {
  const [step, setStep] = useState<ImportStep>("choose")
  const [isDragging, setIsDragging] = useState(false)
  const [parsedNotes, setParsedNotes] = useState<ParsedNote[]>([])
  const [error, setError] = useState<string | null>(null)
  const [importProgress, setImportProgress] = useState(0)
  const [showAllNotes, setShowAllNotes] = useState(false)
  const [isLoadingDrive, setIsLoadingDrive] = useState(false)
  const [gapiLoaded, setGapiLoaded] = useState(false)
  const [pickerLoaded, setPickerLoaded] = useState(false)
  const [googleConfig, setGoogleConfig] = useState<GoogleConfig | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const tokenClientRef = useRef<any>(null)
  const accessTokenRef = useRef<string | null>(null)

  // Google Takeout URL with Keep pre-selected and Drive as destination
  const GOOGLE_TAKEOUT_URL = "https://takeout.google.com/takeout/custom/keep?dest=drive"

  // Fetch Google config from server
  useEffect(() => {
    if (!isOpen || googleConfig) return

    const fetchConfig = async () => {
      try {
        const response = await fetch("/api/google-config")
        const config = await response.json()
        if (config.clientId && config.apiKey) {
          setGoogleConfig(config)
        }
      } catch (e) {
        console.warn("Failed to load Google config")
      }
    }
    fetchConfig()
  }, [isOpen, googleConfig])

  // Load Google APIs after config is available
  useEffect(() => {
    if (!isOpen || !googleConfig) return

    // Load GAPI
    const loadGapi = () => {
      const script = document.createElement("script")
      script.src = "https://apis.google.com/js/api.js"
      script.onload = () => {
        window.gapi.load("picker", () => {
          setPickerLoaded(true)
        })
        window.gapi.load("client", async () => {
          await window.gapi.client.init({
            apiKey: googleConfig.apiKey,
          })
          setGapiLoaded(true)
        })
      }
      document.body.appendChild(script)
    }

    // Load Google Identity Services
    const loadGis = () => {
      const script = document.createElement("script")
      script.src = "https://accounts.google.com/gsi/client"
      script.onload = () => {
        tokenClientRef.current = window.google.accounts.oauth2.initTokenClient({
          client_id: googleConfig.clientId,
          scope: SCOPES,
          callback: (response: any) => {
            if (response.access_token) {
              accessTokenRef.current = response.access_token
              openPicker(response.access_token)
            }
          },
        })
      }
      document.body.appendChild(script)
    }

    if (!window.gapi) {
      loadGapi()
    } else {
      setGapiLoaded(true)
      setPickerLoaded(true)
    }

    if (!window.google?.accounts) {
      loadGis()
    }
  }, [isOpen, googleConfig])

  const resetModal = useCallback(() => {
    setStep("choose")
    setParsedNotes([])
    setError(null)
    setImportProgress(0)
    setShowAllNotes(false)
    setIsLoadingDrive(false)
  }, [])

  const handleClose = () => {
    resetModal()
    onClose()
  }

  const parseKeepNote = (json: KeepNote, filename: string): ParsedNote | null => {
    if (json.isTrashed) return null

    let content = ""
    if (json.textContent) {
      content = json.textContent
    } else if (json.listContent) {
      content = json.listContent
        .map(item => `${item.isChecked ? "- [x]" : "- [ ]"} ${item.text}`)
        .join("\n")
    }

    const title = json.title || filename.replace(".json", "") || "Untitled Note"
    const tags = json.labels?.map(label => label.name.toLowerCase()) || []
    const date = json.userEditedTimestampUsec 
      ? new Date(json.userEditedTimestampUsec / 1000) 
      : new Date()

    return {
      title,
      content,
      tags,
      isPinned: json.isPinned || false,
      color: keepColorMap[json.color] || "gray",
      date,
      selected: true
    }
  }

  const processZipFile = async (file: File | Blob) => {
    setError(null)
    
    try {
      const zip = await JSZip.loadAsync(file)
      const notes: ParsedNote[] = []

      const jsonFiles = Object.keys(zip.files).filter(
        path => path.includes("Keep/") && path.endsWith(".json") && !path.includes("__MACOSX")
      )

      if (jsonFiles.length === 0) {
        setError("No Google Keep notes found in this ZIP file. Make sure you exported from Google Takeout with Keep selected.")
        setStep("choose")
        return
      }

      for (const path of jsonFiles) {
        try {
          const content = await zip.files[path].async("string")
          const json = JSON.parse(content) as KeepNote
          const filename = path.split("/").pop() || ""
          const parsed = parseKeepNote(json, filename)
          if (parsed) {
            notes.push(parsed)
          }
        } catch (e) {
          console.warn(`Skipping invalid file: ${path}`)
        }
      }

      if (notes.length === 0) {
        setError("No valid notes found in the export. Notes may be empty or trashed.")
        setStep("choose")
        return
      }

      notes.sort((a, b) => b.date.getTime() - a.date.getTime())
      setParsedNotes(notes)
      setStep("preview")
    } catch (e) {
      setError("Failed to read the ZIP file. Please make sure it's a valid Google Takeout export.")
      setStep("choose")
    }
  }

  const handleFileUpload = async (file: File) => {
    if (!file.name.endsWith(".zip")) {
      setError("Please upload a ZIP file from Google Takeout")
      return
    }
    await processZipFile(file)
  }

  // Open Google Drive Picker
  const openPicker = (accessToken: string) => {
    if (!pickerLoaded || !window.google || !googleConfig) {
      setError("Google Picker is still loading. Please try again.")
      setIsLoadingDrive(false)
      return
    }

    // Create a view that shows all files, navigable with folders
    const docsView = new window.google.picker.DocsView()
      .setIncludeFolders(true)
      .setSelectFolderEnabled(false)
    
    // Create a view specifically for the Takeout folder with ZIP files  
    const takeoutView = new window.google.picker.DocsView()
      .setIncludeFolders(true)
      .setSelectFolderEnabled(false)
      .setParent("root")
    
    const picker = new window.google.picker.PickerBuilder()
      .setAppId(googleConfig.clientId?.split("-")[0])
      .setOAuthToken(accessToken)
      .setDeveloperKey(googleConfig.apiKey)
      .addView(docsView)
      .addView(window.google.picker.ViewId.RECENTLY_PICKED)
      .setTitle("Select your Google Takeout ZIP file")
      .setCallback(async (data: any) => {
        if (data.action === window.google.picker.Action.PICKED) {
          const fileId = data.docs[0].id
          setIsLoadingDrive(true)
          
          try {
            // Fetch the file content via our API route to avoid CORS issues
            const response = await fetch("/api/google-drive-download", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                fileId,
                accessToken,
              }),
            })
            
            if (!response.ok) {
              throw new Error("Failed to download file from Drive")
            }
            
            const blob = await response.blob()
            await processZipFile(blob)
          } catch (e) {
            setError("Failed to download the file from Google Drive. Please try again or use manual upload.")
            setStep("choose")
          } finally {
            setIsLoadingDrive(false)
          }
        } else if (data.action === window.google.picker.Action.CANCEL) {
          setIsLoadingDrive(false)
        }
      })
      .build()
    
    picker.setVisible(true)
  }

  const handleDriveSelect = () => {
    setIsLoadingDrive(true)
    setError(null)
    
    if (!googleConfig) {
      setError("Google configuration is loading. Please try again.")
      setIsLoadingDrive(false)
      return
    }
    
    if (!tokenClientRef.current) {
      setError("Google authentication is not ready. Please refresh the page and try again.")
      setIsLoadingDrive(false)
      return
    }

    // Request access token
    if (accessTokenRef.current) {
      openPicker(accessTokenRef.current)
    } else {
      tokenClientRef.current.requestAccessToken({ prompt: "consent" })
    }
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    
    const file = e.dataTransfer.files[0]
    if (file) {
      handleFileUpload(file)
    }
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const toggleNoteSelection = (index: number) => {
    setParsedNotes(prev => prev.map((note, i) => 
      i === index ? { ...note, selected: !note.selected } : note
    ))
  }

  const toggleAllNotes = (selected: boolean) => {
    setParsedNotes(prev => prev.map(note => ({ ...note, selected })))
  }

  const handleImport = async () => {
    const selectedNotes = parsedNotes.filter(n => n.selected)
    if (selectedNotes.length === 0) return

    setStep("importing")
    
    const importedNotes: Note[] = []
    const maxId = Math.max(...existingNotes.map(n => n.id), 0)

    for (let i = 0; i < selectedNotes.length; i++) {
      const note = selectedNotes[i]
      
      await new Promise(resolve => setTimeout(resolve, 50))
      
      const newNote: Note = {
        id: maxId + i + 1,
        title: note.title,
        content: note.content,
        tags: note.tags.length > 0 ? note.tags : ["imported"],
        image: "/placeholder.svg",
        date: formatRelativeDate(note.date),
        category: note.tags[0] || "personal",
        type: "text",
        isPinned: note.isPinned,
        isFavorite: note.isPinned,
      }
      
      importedNotes.push(newNote)
      setImportProgress(Math.round(((i + 1) / selectedNotes.length) * 100))
    }

    await new Promise(resolve => setTimeout(resolve, 300))
    
    onImportComplete(importedNotes)
    setStep("complete")
  }

  const formatRelativeDate = (date: Date): string => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    
    if (days === 0) return "Today"
    if (days === 1) return "Yesterday"
    if (days < 7) return `${days} days ago`
    if (days < 30) return `${Math.floor(days / 7)} weeks ago`
    if (days < 365) return `${Math.floor(days / 30)} months ago`
    return `${Math.floor(days / 365)} years ago`
  }

  const selectedCount = parsedNotes.filter(n => n.selected).length
  const displayedNotes = showAllNotes ? parsedNotes : parsedNotes.slice(0, 5)

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 bg-background/25 backdrop-blur-[2px] z-50 flex items-center justify-center p-4"
      onClick={handleClose}
    >
      <div
        className="bg-card rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col"
        onClick={e => e.stopPropagation()}
      >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center">
                <FileArchive className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-foreground">Import from Google Keep</h2>
                <p className="text-sm text-muted-foreground">
                  {step === "choose" && "Bring your notes to Bangle"}
                  {step === "upload" && "Upload your export file"}
                  {step === "preview" && `${parsedNotes.length} notes found`}
                  {step === "importing" && "Importing your notes..."}
                  {step === "complete" && "Import complete!"}
                </p>
              </div>
            </div>
            <button 
              onClick={handleClose}
              className="w-8 h-8 rounded-full hover:bg-muted flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {step === "choose" && (
              <div className="space-y-6">
                {/* Main instruction */}
                <div className="text-center pb-4">
                  <h3 className="text-lg font-semibold text-foreground mb-2">How it works</h3>
                  <p className="text-sm text-muted-foreground max-w-md mx-auto">
                    Export your notes from Google Takeout, then import them here. 
                    Your notes stay private - everything is processed locally.
                  </p>
                </div>

                {/* Step 1: Export */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 rounded-xl p-5 border border-blue-100 dark:border-blue-900">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-bold text-primary-foreground">1</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground mb-1">Export from Google</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Click below to open Google Takeout with Keep pre-selected. Choose <strong>"Export to Drive"</strong> for the smoothest experience.
                      </p>
                      <a
                        href={GOOGLE_TAKEOUT_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium shadow-sm"
                      >
                        Open Google Takeout
                        <ExternalLink className="w-4 h-4" />
                      </a>
                      <p className="text-xs text-muted-foreground mt-3">
                        Tip: Select "Export to Drive" in step 2 for instant import
                      </p>
                    </div>
                  </div>
                </div>

                {/* Step 2: Import options */}
                <div className="bg-muted/30 rounded-xl p-5 border border-border">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-bold text-primary-foreground">2</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground mb-1">Import your notes</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Choose how to import your Takeout file:
                      </p>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {/* Google Drive option */}
                        <button
                          onClick={handleDriveSelect}
                          disabled={isLoadingDrive || !gapiLoaded || !googleConfig}
                          className="flex flex-col items-center gap-3 p-5 rounded-xl border-2 border-dashed border-primary/30 bg-primary/5 hover:bg-primary/10 hover:border-primary/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isLoadingDrive ? (
                            <Loader2 className="w-8 h-8 text-primary animate-spin" />
                          ) : (
                            <Cloud className="w-8 h-8 text-primary" />
                          )}
                          <div className="text-center">
                            <p className="font-medium text-foreground text-sm">From Google Drive</p>
                            <p className="text-xs text-muted-foreground">Recommended - No download needed</p>
                          </div>
                        </button>

                        {/* Manual upload option */}
                        <button
                          onClick={() => setStep("upload")}
                          className="flex flex-col items-center gap-3 p-5 rounded-xl border-2 border-dashed border-border hover:border-primary/30 hover:bg-muted/50 transition-all"
                        >
                          <HardDrive className="w-8 h-8 text-muted-foreground" />
                          <div className="text-center">
                            <p className="font-medium text-foreground text-sm">Upload ZIP File</p>
                            <p className="text-xs text-muted-foreground">From your computer</p>
                          </div>
                        </button>
                      </div>

                      {error && (
                        <div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg flex items-start gap-2">
                          <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
                          <p className="text-sm text-destructive">{error}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Privacy note */}
                <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  <span>Your notes are processed locally and never sent to our servers</span>
                </div>
              </div>
            )}

            {step === "upload" && (
              <div className="space-y-4">
                <button
                  onClick={() => setStep("choose")}
                  className="text-sm text-primary hover:text-primary/80 flex items-center gap-1 mb-2"
                >
                  <ChevronUp className="w-4 h-4 rotate-[-90deg]" />
                  Back
                </button>
                
                <div
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onClick={() => fileInputRef.current?.click()}
                  className={`
                    border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all
                    ${isDragging 
                      ? "border-primary bg-primary/5 scale-[1.02]" 
                      : "border-border hover:border-primary/50 hover:bg-muted/50"
                    }
                  `}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".zip"
                    className="hidden"
                    onChange={e => {
                      const file = e.target.files?.[0]
                      if (file) handleFileUpload(file)
                    }}
                  />
                  <Upload className={`w-12 h-12 mx-auto mb-4 ${isDragging ? "text-primary" : "text-muted-foreground"}`} />
                  <p className="text-base font-medium text-foreground mb-2">
                    {isDragging ? "Drop your file here" : "Drag & drop your Takeout ZIP"}
                  </p>
                  <p className="text-sm text-muted-foreground">or click to browse</p>
                </div>

                {error && (
                  <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-destructive">{error}</p>
                  </div>
                )}
              </div>
            )}

            {step === "preview" && (
              <div className="space-y-4">
                {/* Selection controls */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={selectedCount === parsedNotes.length}
                      onChange={e => toggleAllNotes(e.target.checked)}
                      className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
                    />
                    <span className="text-sm text-muted-foreground">
                      {selectedCount} of {parsedNotes.length} selected
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Sparkles className="w-4 h-4 text-primary" />
                    <span>AI will auto-generate tags</span>
                  </div>
                </div>

                {/* Notes list */}
                <div className="space-y-2">
                  {displayedNotes.map((note, index) => (
                    <div
                      key={index}
                      onClick={() => toggleNoteSelection(index)}
                      className={`
                        p-4 rounded-xl border cursor-pointer transition-all
                        ${note.selected 
                          ? "border-primary/50 bg-primary/5" 
                          : "border-border hover:border-primary/30 hover:bg-muted/50"
                        }
                      `}
                    >
                      <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          checked={note.selected}
                          onChange={() => toggleNoteSelection(index)}
                          onClick={e => e.stopPropagation()}
                          className="w-4 h-4 mt-1 rounded border-border text-primary focus:ring-primary"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <FileText className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                            <h4 className="font-medium text-foreground truncate">{note.title}</h4>
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                            {note.content || "No content"}
                          </p>
                          <div className="flex items-center gap-2 flex-wrap">
                            {note.tags.slice(0, 3).map((tag, i) => (
                              <span 
                                key={i}
                                className="inline-flex items-center gap-1 px-2 py-0.5 bg-muted rounded-full text-xs text-muted-foreground"
                              >
                                <Tag className="w-3 h-3" />
                                {tag}
                              </span>
                            ))}
                            {note.tags.length > 3 && (
                              <span className="text-xs text-muted-foreground">+{note.tags.length - 3} more</span>
                            )}
                            <span className="text-xs text-muted-foreground ml-auto">
                              {formatRelativeDate(note.date)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Show more/less */}
                {parsedNotes.length > 5 && (
                  <button
                    onClick={() => setShowAllNotes(!showAllNotes)}
                    className="w-full py-2 text-sm text-primary hover:text-primary/80 flex items-center justify-center gap-1 transition-colors"
                  >
                    {showAllNotes ? (
                      <>Show less <ChevronUp className="w-4 h-4" /></>
                    ) : (
                      <>Show all {parsedNotes.length} notes <ChevronDown className="w-4 h-4" /></>
                    )}
                  </button>
                )}
              </div>
            )}

            {step === "importing" && (
              <div className="py-12 text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                  <Loader2 className="w-8 h-8 text-primary animate-spin" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Importing your notes</h3>
                <p className="text-sm text-muted-foreground mb-6">
                  Processing {selectedCount} notes with AI enhancement...
                </p>
                <div className="w-full max-w-xs mx-auto">
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary transition-all duration-300"
                      style={{ width: `${importProgress}%` }}
                    />
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">{importProgress}%</p>
                </div>
              </div>
            )}

            {step === "complete" && (
              <div className="py-12 text-center">
                <div 
                  className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-6"
                >
                  <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Import successful!</h3>
                <p className="text-sm text-muted-foreground mb-6">
                  {selectedCount} notes have been imported to Bangle.
                </p>
                <button
                  onClick={handleClose}
                  className="px-6 py-2.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
                >
                  Start exploring
                </button>
              </div>
            )}
          </div>

          {/* Footer */}
          {step === "preview" && (
            <div className="p-6 border-t border-border bg-muted/30">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setStep("choose")}
                  className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handleImport}
                  disabled={selectedCount === 0}
                  className="px-6 py-2.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  Import {selectedCount} notes
                </button>
              </div>
            </div>
          )}
      </div>
    </div>
  )
}
