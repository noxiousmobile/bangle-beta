"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Calendar, Tag, Volume2, Play, Pause, ExternalLink, ArrowLeft, Share2, Eye } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { getTagColor } from "@/components/note-card"

// Mock data - in real app, this would come from API based on the share ID
const mockSharedCollection = {
  id: "abc123",
  title: "My Best Shopping Resources",
  description: "A curated collection of the best shopping websites and tools I've discovered over the years.",
  createdAt: "2024-01-15",
  creatorName: "Alex Johnson",
  isPublic: true,
  voiceMessage: {
    duration: 45,
    // In real app, this would be a URL to the audio file
    audioUrl: null,
  },
  notes: [
    {
      id: 1,
      title: "Amazon Price Tracker",
      tags: ["shopping", "tools", "price-tracking"],
      image: "/placeholder.svg?height=80&width=80",
      date: "2 weeks ago",
      category: "shopping",
      type: "url",
      url: "https://example.com/price-tracker",
    },
    {
      id: 2,
      title: "Best Deals Newsletter",
      tags: ["shopping", "deals", "newsletter"],
      image: "/placeholder.svg?height=80&width=80",
      date: "1 month ago",
      category: "shopping",
      type: "url",
      url: "https://example.com/deals",
    },
    {
      id: 3,
      title: "Coupon Aggregator",
      tags: ["shopping", "coupons", "savings"],
      image: "/placeholder.svg?height=80&width=80",
      date: "3 weeks ago",
      category: "shopping",
      type: "url",
      url: "https://example.com/coupons",
    },
  ],
}

export default function SharedCollectionPage({ params }: { params: { id: string } }) {
  const [collection, setCollection] = useState(mockSharedCollection)
  const [isPlayingVoice, setIsPlayingVoice] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate loading the shared collection
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [params.id])

  const playVoiceMessage = () => {
    setIsPlayingVoice(true)
    // Simulate voice message playback
    setTimeout(() => {
      setIsPlayingVoice(false)
    }, collection.voiceMessage.duration * 1000)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading shared collection...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </Link>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Share2 className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h1 className="text-lg font-semibold text-gray-900">Shared Collection</h1>
                  <p className="text-sm text-gray-600">by {collection.creatorName}</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Eye className="w-4 h-4" />
              <span>Public Collection</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Collection Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200 p-8 mb-8"
        >
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-3">{collection.title}</h1>
            {collection.description && (
              <p className="text-gray-600 text-lg leading-relaxed max-w-2xl mx-auto">{collection.description}</p>
            )}
          </div>

          <div className="flex items-center justify-center gap-8 text-sm text-gray-600 mb-6">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>Shared on {collection.createdAt}</span>
            </div>
            <div className="flex items-center gap-2">
              <Tag className="w-4 h-4" />
              <span>{collection.notes.length} notes</span>
            </div>
          </div>

          {/* Voice Message */}
          {collection.voiceMessage && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-blue-50 rounded-xl p-6 border border-blue-100"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Volume2 className="w-5 h-5 text-blue-600" />
                  <div>
                    <h3 className="font-medium text-gray-900">Personal Message</h3>
                    <p className="text-sm text-gray-600">{collection.creatorName} left you a voice message</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-mono text-gray-600">
                    {formatTime(collection.voiceMessage.duration)}
                  </span>
                  <button
                    onClick={playVoiceMessage}
                    disabled={!collection.voiceMessage.audioUrl}
                    className="p-3 bg-blue-500 text-white rounded-full hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isPlayingVoice ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                  </button>
                </div>
              </div>
              {!collection.voiceMessage.audioUrl && (
                <p className="text-xs text-blue-600 mt-2">Voice message preview not available in demo</p>
              )}
            </motion.div>
          )}
        </motion.div>

        {/* Notes Grid */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900">Collection Notes</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {collection.notes.map((note, index) => (
              <motion.div
                key={note.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
                className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all"
              >
                <div className="aspect-video relative bg-gray-100">
                  <Image src={note.image || "/placeholder.svg"} alt={note.title} fill className="object-cover" />
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">{note.title}</h3>
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                    <Calendar className="w-3 h-3" />
                    <span>{note.date}</span>
                    <span>•</span>
                    <span className="capitalize">{note.category}</span>
                  </div>
                  <div className="flex flex-wrap gap-1 mb-4">
                    {note.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-600"
                      >
                        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: getTagColor(tag) }} />
                        {tag}
                      </span>
                    ))}
                  </div>
                  {note.type === "url" && note.url && (
                    <a
                      href={note.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Visit Link
                    </a>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center mt-12 py-8 border-t border-gray-200"
        >
          <p className="text-gray-600 mb-4">Want to create your own note collections?</p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            <Share2 className="w-4 h-4" />
            Try Our Note App
          </Link>
        </motion.div>
      </div>
    </div>
  )
}
