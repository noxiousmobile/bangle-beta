"use client"

import { motion, type Variants } from "framer-motion"
import { FileText, LinkIcon, X, ImageIcon, Sparkles } from "lucide-react"

interface OptionMenuProps {
  handleAddNote: (type: string) => void
  handlePaste: () => void
  setBottomState: (state: "initial" | "options" | "preview" | "text-editor") => void
  toggleExpanded: (value: boolean) => void
}

export function OptionMenu({ handleAddNote, handlePaste, setBottomState, toggleExpanded }: OptionMenuProps) {
  const optionsVariants: Variants = {
    initial: { opacity: 0, y: 20 },
    animate: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring" as const,
        stiffness: 300,
        damping: 20,
        staggerChildren: 0.1,
        delayChildren: 0.1,
      },
    },
    exit: { opacity: 0, y: 20, transition: { duration: 0.2 } },
  }

  const optionItemVariants: Variants = {
    initial: { opacity: 0, y: 20 },
    animate: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 300, damping: 20 },
    },
    exit: { opacity: 0, y: 20, transition: { duration: 0.2 } },
  }

  const handleImageUpload = () => {
    const input = document.createElement("input")
    input.type = "file"
    input.accept = "image/*"
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        handleAddNote("image-upload")
        const event = new CustomEvent("imageSelected", { detail: file })
        window.dispatchEvent(event)
      }
    }
    input.click()
  }

  return (
    <motion.div
      key="options-state"
      className="flex-1 flex flex-col justify-center items-center"
      variants={optionsVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <motion.div className="flex flex-row space-x-6 items-center justify-center" variants={optionsVariants}>
        <motion.div
          className="flex flex-col items-center"
          variants={optionItemVariants}
          onClick={(e) => {
            e.stopPropagation()
            handleAddNote("text")
          }}
        >
          <motion.div
            className="flex items-center justify-center bg-background shadow-sm rounded-full w-16 h-16 p-0 mb-2 hover:shadow-md transition-shadow"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <FileText className="w-5 h-5 text-primary" />
          </motion.div>
          <span className="text-sm text-foreground">Note</span>
        </motion.div>

        <motion.div
          className="flex flex-col items-center"
          variants={optionItemVariants}
          onClick={(e) => {
            e.stopPropagation()
            handlePaste()
          }}
        >
          <motion.div
            className="flex items-center justify-center bg-background shadow-sm rounded-full w-16 h-16 p-0 mb-2 hover:shadow-md transition-shadow"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <LinkIcon className="w-5 h-5 text-primary" />
          </motion.div>
          <span className="text-sm text-foreground">Link</span>
        </motion.div>

        <motion.div
          className="flex flex-col items-center"
          variants={optionItemVariants}
          onClick={(e) => {
            e.stopPropagation()
            handleImageUpload()
          }}
        >
          <motion.div
            className="flex items-center justify-center bg-background shadow-sm rounded-full w-16 h-16 p-0 mb-2 hover:shadow-md transition-shadow"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <ImageIcon className="w-5 h-5 text-primary" />
          </motion.div>
          <span className="text-sm text-foreground">Media</span>
        </motion.div>
      </motion.div>

      <motion.div
        className="flex items-center gap-2 mt-8 mb-2 text-muted-foreground text-sm"
        variants={optionItemVariants}
      >
        <Sparkles className="w-4 h-4" />
        <span>or paste your link or url here</span>
      </motion.div>

      <motion.button
        className="mt-6 w-10 h-10 rounded-full bg-background shadow-md flex items-center justify-center border border-border md:hidden"
        variants={optionItemVariants}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={(e) => {
          e.stopPropagation()
          toggleExpanded(true)
        }}
      >
        <X className="w-5 h-5 text-muted-foreground" />
      </motion.button>
    </motion.div>
  )
}
