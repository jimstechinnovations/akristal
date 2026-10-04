'use client'

import { useEffect, useRef, useState } from 'react'
import { animate, useReducedMotion } from 'framer-motion'

/** Tweens from the previous value to the new one whenever `value` changes (calculator results). */
export function AnimatedNumber({ value, format, className }: { value: number; format: (n: number) => string; className?: string }) {
  const reduce = useReducedMotion()
  const [display, setDisplay] = useState(value)
  const from = useRef(value)

  useEffect(() => {
    if (reduce) {
      from.current = value
      return
    }
    const controls = animate(from.current, value, {
      duration: 0.45,
      ease: [0.2, 0.7, 0.2, 1],
      onUpdate: (v) => setDisplay(v),
      onComplete: () => {
        from.current = value
      },
    })
    return () => {
      controls.stop()
      from.current = value
    }
  }, [value, reduce])

  return (
    <span className={className}>
      <span aria-hidden className="tabular">
        {format(reduce ? value : display)}
      </span>
      {/* Announce only the settled value. */}
      <span className="sr-only" aria-live="polite">
        {format(value)}
      </span>
    </span>
  )
}
