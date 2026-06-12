"use client"

import { useEffect, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import {
  Sparkles,
  Network,
  PenLine,
  Share2,
  Tag,
  ArrowRight,
  X,
} from "lucide-react"

const STORAGE_KEY = "bangle_welcome_seen_v1"

const features = [
  {
    icon: PenLine,
    title: "Capture thoughts instantly",
    description:
      "A fast, distraction-free editor with rich text and Markdown. Jot an idea and it's saved the moment you type.",
  },
  {
    icon: Sparkles,
    title: "AI-powered organization",
    description:
      "Bangle auto-suggests tags and structure so your notes stay tidy without the manual busywork.",
  },
  {
    icon: Network,
    title: "Your knowledge graph",
    description:
      "The Brain view connects notes, tags, and ideas visually — discover links you didn't know existed.",
  },
  {
    icon: Tag,
    title: "Smart tags & filters",
    description:
      "Group and surface anything in seconds with flexible tagging and instant filtering.",
  },
  {
    icon: Share2,
    title: "Share & collaborate",
    description:
      "Bundle notes into collections and share them — built for working and thinking together.",
  },
]

export function WelcomeModal() {
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    try {
      const seen = localStorage.getItem(STORAGE_KEY)
      if (!seen) {
        setIsOpen(true)
      }
    } catch {
      // localStorage unavailable (private mode, etc.) — show once anyway
      setIsOpen(true)
    }
  }, [])

  // Lock background scroll while open
  useEffect(() => {
    if (isOpen) {
      const prev = document.body.style.overflow
      document.body.style.overflow = "hidden"
      return () => {
        document.body.style.overflow = prev
      }
    }
  }, [isOpen])

  const handleDismiss = () => {
    try {
      localStorage.setItem(STORAGE_KEY, "true")
    } catch {
      // ignore
    }
    setIsOpen(false)
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="welcome-title"
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm"
            onClick={handleDismiss}
            aria-hidden="true"
          />

          {/* Panel */}
          <motion.div
            className="relative z-10 flex h-full max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-black/5"
            initial={{ opacity: 0, scale: 0.96, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 8 }}
            transition={{ type: "spring", stiffness: 260, damping: 26 }}
          >
            {/* Close button */}
            <button
              onClick={handleDismiss}
              className="absolute right-4 top-4 z-20 flex h-9 w-9 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
              aria-label="Close welcome"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto">
              {/* Hero */}
              <div className="relative overflow-hidden px-6 pb-8 pt-12 text-center sm:px-10 sm:pt-14">
                <div
                  className="pointer-events-none absolute inset-x-0 top-0 h-48"
                  style={{
                    background:
                      "radial-gradient(ellipse at center top, rgba(59,130,246,0.14) 0%, rgba(59,130,246,0) 70%)",
                  }}
                  aria-hidden="true"
                />
                <div className="relative">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                    Beta · Early Preview
                  </span>

                  <div className="mt-6 flex items-center justify-center gap-2.5">
                    <img
                      src="/bangle-logo.svg"
                      alt="Bangle AI logo"
                      className="h-11 w-11 flex-shrink-0"
                    />
                    <h1
                      id="welcome-title"
                      className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl"
                    >
                      Welcome to Bangle AI
                    </h1>
                  </div>

                  <p className="mx-auto mt-4 max-w-xl text-pretty text-base leading-relaxed text-gray-500 sm:text-lg">
                    Your AI-powered space for notes, ideas, and connections.
                    Bangle helps you capture thoughts fast, organize them
                    effortlessly, and see how everything links together.
                  </p>
                </div>
              </div>

              {/* Features */}
              <div className="px-6 pb-2 sm:px-10">
                <div className="grid gap-3 sm:grid-cols-2">
                  {features.map((feature) => (
                    <div
                      key={feature.title}
                      className="flex gap-3.5 rounded-xl border border-gray-100 bg-gray-50/60 p-4 transition-colors hover:border-primary/20 hover:bg-primary/5"
                    >
                      <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <feature.icon className="h-5 w-5" />
                      </span>
                      <div>
                        <h3 className="text-sm font-semibold text-gray-900">
                          {feature.title}
                        </h3>
                        <p className="mt-1 text-sm leading-relaxed text-gray-500">
                          {feature.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Beta note */}
              <div className="px-6 py-6 sm:px-10">
                <div className="rounded-xl border border-amber-200/70 bg-amber-50 p-4">
                  <h3 className="text-sm font-semibold text-amber-900">
                    A quick heads-up
                  </h3>
                  <p className="mt-1 text-sm leading-relaxed text-amber-800/90">
                    Bangle AI is an early MVP built for previews and early
                    adopters. Some features are still being shaped, so expect
                    rough edges. We'd love for you to explore, share feedback,
                    and help us build something great.
                  </p>
                </div>
              </div>
            </div>

            {/* Sticky footer CTA */}
            <div className="border-t border-gray-100 bg-white/95 px-6 py-4 backdrop-blur sm:px-10">
              <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
                <p className="text-xs text-gray-400">
                  You can always revisit this later.
                </p>
                <motion.button
                  onClick={handleDismiss}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 sm:w-auto"
                >
                  Get into the app
                  <ArrowRight className="h-4 w-4" />
                </motion.button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
