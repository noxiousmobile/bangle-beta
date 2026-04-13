"use client"

import { useEffect } from "react"
import { workflowEngine } from "@/lib/automation/workflow-engine"
import type { Note } from "@/lib/data"

interface WorkflowTriggerProps {
  notes: Note[]
  onWorkflowExecuted?: (results: any[]) => void
}

export function WorkflowTrigger({ notes, onWorkflowExecuted }: WorkflowTriggerProps) {
  // Trigger workflows when notes change
  useEffect(() => {
    const executeWorkflows = async () => {
      // Get the most recent note (assuming it was just created/updated)
      const latestNote = notes[0]
      if (!latestNote) return

      try {
        // Execute workflows for note creation
        const results = await workflowEngine.executeWorkflows(latestNote, "note_created", notes)

        if (results.length > 0) {
          console.log("Workflows executed:", results)
          onWorkflowExecuted?.(results)

          // Show notification for executed workflows
          results.forEach((result) => {
            if (result.result) {
              console.log(`✅ Workflow "${result.rule.name}" executed successfully`)
            }
          })
        }
      } catch (error) {
        console.error("Workflow execution error:", error)
      }
    }

    executeWorkflows()
  }, [notes, onWorkflowExecuted])

  // This component doesn't render anything - it's just for triggering workflows
  return null
}
