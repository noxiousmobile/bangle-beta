"use client"

import type React from "react"

import { useCallback, useRef, useState } from "react"

interface LongPressOptions {
  shouldPreventDefault?: boolean
  delay?: number
}

interface LongPressResult {
  onMouseDown: (e: React.MouseEvent) => void
  onTouchStart: (e: React.TouchEvent) => void
  onMouseUp: (e: React.MouseEvent) => void
  onMouseLeave: (e: React.MouseEvent) => void
  onTouchEnd: (e: React.TouchEvent) => void
}

export default function useLongPress(
  onLongPress: () => void,
  onClick: () => void,
  { shouldPreventDefault = true, delay = 300 }: LongPressOptions = {},
): LongPressResult {
  const [longPressTriggered, setLongPressTriggered] = useState(false)
  const timeout = useRef<NodeJS.Timeout>()
  const target = useRef<EventTarget>()

  const start = useCallback(
    (event: React.MouseEvent | React.TouchEvent) => {
      if (shouldPreventDefault && event.target) {
        event.target.addEventListener("touchend", preventDefault, { passive: false })
        target.current = event.target
      }

      timeout.current = setTimeout(() => {
        onLongPress()
        setLongPressTriggered(true)
      }, delay)
    },
    [onLongPress, delay, shouldPreventDefault],
  )

  const clear = useCallback(
    (event: React.MouseEvent | React.TouchEvent, shouldTriggerClick = true) => {
      timeout.current && clearTimeout(timeout.current)
      shouldTriggerClick && !longPressTriggered && onClick()
      setLongPressTriggered(false)

      if (shouldPreventDefault && target.current) {
        ;(target.current as Element).removeEventListener("touchend", preventDefault)
      }
    },
    [shouldPreventDefault, onClick, longPressTriggered],
  )

  return {
    onMouseDown: (e: React.MouseEvent) => start(e),
    onTouchStart: (e: React.TouchEvent) => start(e),
    onMouseUp: (e: React.MouseEvent) => clear(e),
    onMouseLeave: (e: React.MouseEvent) => clear(e, false),
    onTouchEnd: (e: React.TouchEvent) => clear(e),
  }
}

const preventDefault = (event: Event) => {
  if (!event.defaultPrevented) {
    event.preventDefault()
  }
}
