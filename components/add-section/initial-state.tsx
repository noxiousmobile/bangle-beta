"use client"

import { motion } from "framer-motion"
import { Plus } from "lucide-react"

interface InitialStateProps {
  setBottomState: (state: "initial" | "options" | "preview") => void
}

export function InitialState({ setBottomState }: InitialStateProps) {
  return (
    <motion.div
      key="initial-state"
      className="flex-1 flex flex-col justify-center items-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.button
        className="w-20 h-20 rounded-full bg-primary shadow-md flex items-center justify-center"
        whileHover={{ scale: 1.05, boxShadow: "0 10px 25px rgba(0,0,0,0.1)" }}
        whileTap={{ scale: 0.95 }}
        onClick={(e) => {
          e.stopPropagation()
          setBottomState("options")
        }}
      >
        <Plus className="w-10 h-10 text-primary-foreground" />
      </motion.button>

      <motion.p className="mt-6 text-sm text-muted-foreground" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        or paste here
      </motion.p>
    </motion.div>
  )
}
