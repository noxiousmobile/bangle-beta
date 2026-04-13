"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Mic, Square, Play, Pause, Trash2, Volume2 } from "lucide-react"

interface VoiceRecorderProps {
  onRecordingComplete: (audioBlob: Blob, duration: number) => void
  onRecordingDelete: () => void
  existingRecording?: { blob: Blob; duration: number } | null
}

export function VoiceRecorder({ onRecordingComplete, onRecordingDelete, existingRecording }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(existingRecording?.blob || null)
  const [recordingDuration, setRecordingDuration] = useState(existingRecording?.duration || 0)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const chunksRef = useRef<Blob[]>([])

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [])

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      chunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" })
        setAudioBlob(blob)
        setRecordingDuration(recordingTime)
        onRecordingComplete(blob, recordingTime)
        stream.getTracks().forEach((track) => track.stop())
      }

      mediaRecorder.start()
      setIsRecording(true)
      setRecordingTime(0)

      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1)
      }, 1000)
    } catch (error) {
      console.error("Error accessing microphone:", error)
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }

  const playRecording = () => {
    if (audioBlob) {
      const audioUrl = URL.createObjectURL(audioBlob)
      audioRef.current = new Audio(audioUrl)
      audioRef.current.play()
      setIsPlaying(true)

      audioRef.current.onended = () => {
        setIsPlaying(false)
        URL.revokeObjectURL(audioUrl)
      }
    }
  }

  const pauseRecording = () => {
    if (audioRef.current) {
      audioRef.current.pause()
      setIsPlaying(false)
    }
  }

  const deleteRecording = () => {
    setAudioBlob(null)
    setRecordingDuration(0)
    setRecordingTime(0)
    onRecordingDelete()
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-medium text-gray-900">Voice Message (Optional)</h4>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Volume2 className="w-4 h-4" />
          <span>Add a personal touch</span>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {!audioBlob ? (
          <motion.div
            key="recording-controls"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-4"
          >
            {!isRecording ? (
              <button
                onClick={startRecording}
                className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                <Mic className="w-4 h-4" />
                Start Recording
              </button>
            ) : (
              <div className="flex items-center gap-4">
                <button
                  onClick={stopRecording}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  <Square className="w-4 h-4" />
                  Stop Recording
                </button>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                  <span className="text-sm font-mono text-gray-600">{formatTime(recordingTime)}</span>
                </div>
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="playback-controls"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-gray-50 rounded-lg p-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={isPlaying ? pauseRecording : playRecording}
                  className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors"
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </button>
                <div className="flex items-center gap-2">
                  <Volume2 className="w-4 h-4 text-gray-500" />
                  <span className="text-sm font-mono text-gray-600">{formatTime(recordingDuration)}</span>
                </div>
              </div>
              <button
                onClick={deleteRecording}
                className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            <div className="mt-2 text-xs text-gray-500">Voice message recorded successfully</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
