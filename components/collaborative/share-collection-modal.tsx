"use client"

import { useState } from "react"
import { X, Share2, Users, Copy, Check, Globe, Lock, Eye, Calendar, Sparkles } from "lucide-react"
import type { Note } from "@/lib/data"
import { VoiceRecorder } from "./voice-recorder"
import Image from "next/image"
import { getTagColor } from "@/components/note-card"

interface ShareCollectionModalProps {
  isOpen: boolean
  onClose: () => void
  selectedNotes: Note[]
  onShare: (shareData: ShareCollectionData) => void
}

export interface ShareCollectionData {
  title: string
  description: string
  notes: Note[]
  voiceMessage?: { blob: Blob; duration: number }
  isPublic: boolean
  expiresAt?: Date
}

export function ShareCollectionModal({ isOpen, onClose, selectedNotes, onShare }: ShareCollectionModalProps) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [isPublic, setIsPublic] = useState(true)
  const [expiresAt, setExpiresAt] = useState<Date | undefined>()
  const [voiceMessage, setVoiceMessage] = useState<{ blob: Blob; duration: number } | null>(null)
  const [isSharing, setIsSharing] = useState(false)
  const [shareLink, setShareLink] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const handleShare = async () => {
    if (!title.trim()) return

    setIsSharing(true)

    // Simulate API call to create share link
    await new Promise((resolve) => setTimeout(resolve, 1500))

    // Generate a unique share link (in real app, this would come from the server)
    const shareId = Math.random().toString(36).substring(2, 15)
    const generatedLink = `${window.location.origin}/shared/${shareId}`
    setShareLink(generatedLink)

    // Don't call onShare here - wait for user to close modal
    setIsSharing(false)
  }

  const copyToClipboard = async () => {
    if (shareLink) {
      await navigator.clipboard.writeText(shareLink)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleClose = () => {
    setTitle("")
    setDescription("")
    setVoiceMessage(null)
    setShareLink(null)
    setCopied(false)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/60" onClick={handleClose}>
      <div
        className="absolute inset-4 md:inset-8 lg:inset-16 bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-w-4xl mx-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Share2 className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Share Collection</h2>
              <p className="text-sm text-gray-600">{selectedNotes.length} notes selected</p>
            </div>
          </div>
          <button onClick={handleClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto">
          {!shareLink ? (
            <div className="p-6 space-y-6">
              {/* Collection Details */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Collection Title *</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., My Best Shopping Resources"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description (Optional)</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Add a brief description of what this collection contains..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  />
                </div>
              </div>

              {/* Voice Message */}
              <VoiceRecorder
                onRecordingComplete={(blob, duration) => setVoiceMessage({ blob, duration })}
                onRecordingDelete={() => setVoiceMessage(null)}
                existingRecording={voiceMessage}
              />

              {/* Privacy Settings */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">Privacy Settings</h4>
                <div className="space-y-3">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="privacy"
                      checked={isPublic}
                      onChange={() => setIsPublic(true)}
                      className="w-4 h-4 text-blue-600"
                    />
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4 text-green-500" />
                      <span className="text-sm font-medium">Public</span>
                    </div>
                    <span className="text-sm text-gray-500">Anyone with the link can view</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="privacy"
                      checked={!isPublic}
                      onChange={() => setIsPublic(false)}
                      className="w-4 h-4 text-blue-600"
                    />
                    <div className="flex items-center gap-2">
                      <Lock className="w-4 h-4 text-orange-500" />
                      <span className="text-sm font-medium">Private</span>
                    </div>
                    <span className="text-sm text-gray-500">Only people you invite can view</span>
                  </label>
                </div>
              </div>

              {/* Selected Notes Preview */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-gray-900">Selected Notes</h4>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Eye className="w-4 h-4" />
                    <span>Preview how others will see this</span>
                  </div>
                </div>
                <div className="max-h-60 overflow-auto space-y-3 bg-gray-50 rounded-lg p-4">
                  {selectedNotes.map((note) => (
                    <div key={note.id} className="bg-white rounded-lg p-3 border border-gray-200">
                      <div className="flex items-start gap-3">
                        <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                          <Image
                            src={note.image || "/placeholder.svg"}
                            alt={note.title}
                            width={48}
                            height={48}
                            className="object-cover w-full h-full"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h5 className="font-medium text-gray-900 truncate">{note.title}</h5>
                          <div className="flex items-center gap-2 mt-1">
                            <Calendar className="w-3 h-3 text-gray-400" />
                            <span className="text-xs text-gray-500">{note.date}</span>
                            <span className="text-xs text-gray-400">•</span>
                            <span className="text-xs text-gray-500 capitalize">{note.category}</span>
                          </div>
                          <div className="flex gap-1 mt-2">
                            {note.tags.slice(0, 3).map((tag) => (
                              <span
                                key={tag}
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-600"
                              >
                                <span
                                  className="w-1.5 h-1.5 rounded-full"
                                  style={{ backgroundColor: getTagColor(tag) }}
                                />
                                {tag}
                              </span>
                            ))}
                            {note.tags.length > 3 && (
                              <span className="text-xs text-gray-400">+{note.tags.length - 3}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* Share Success */
            <div className="p-6 text-center space-y-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <Check className="w-8 h-8 text-green-600" />
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Collection Shared Successfully!</h3>
                <p className="text-gray-600">Your collection "{title}" is now ready to be shared.</p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Share Link</span>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Users className="w-3 h-3" />
                    <span>{isPublic ? "Public" : "Private"}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-600 font-mono truncate">
                    {shareLink}
                  </div>
                  <button
                    onClick={copyToClipboard}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      copied ? "bg-green-100 text-green-700" : "bg-blue-500 text-white hover:bg-blue-600"
                    }`}
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="space-y-1">
                  <div className="text-lg font-semibold text-gray-900">{selectedNotes.length}</div>
                  <div className="text-xs text-gray-500">Notes</div>
                </div>
                <div className="space-y-1">
                  <div className="text-lg font-semibold text-gray-900">{voiceMessage ? "Yes" : "No"}</div>
                  <div className="text-xs text-gray-500">Voice Message</div>
                </div>
                <div className="space-y-1">
                  <div className="text-lg font-semibold text-gray-900">{isPublic ? "Public" : "Private"}</div>
                  <div className="text-xs text-gray-500">Visibility</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {!shareLink ? (
          <div className="p-6 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <button
                onClick={handleClose}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleShare}
                disabled={!title.trim() || isSharing}
                className="flex items-center gap-2 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSharing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Creating Share Link...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Create Share Link
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          <div className="p-6 border-t border-gray-100">
            <button
              onClick={() => {
                const shareData: ShareCollectionData = {
                  title: title.trim(),
                  description: description.trim(),
                  notes: selectedNotes,
                  voiceMessage: voiceMessage || undefined,
                  isPublic,
                  expiresAt,
                }
                onShare(shareData)
                handleClose()
              }}
              className="w-full px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
