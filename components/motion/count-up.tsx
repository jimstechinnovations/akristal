'use client'

import { useEffect, useRef, useState } from 'react'
import { animate, useInView, useReducedMotion } from 'framer-motion'

/**
 * Counts up to `value` the first time it scrolls into view.
 * Server HTML and no-JS visitors get the real number; reduced-motion visitors never see it move.
 */
export function CountUp({
  value,
  duration = 1.4,
  format = (n: number) => Math.round(n).toLocaleString('en'),
  className,
}: {
  value: number
  duration?: number
  format?: (n: number) => string
  className?: string
}) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, margin: '0px 0px -10% 0px' })
  const reduce = useReducedMotion()
  const [display, setDisplay] = useState(value)
  const armed = useRef(false)

  // Below the fold on load: reset to zero while unseen, so the count is visible when it starts.
  useEffect(() => {
    if (reduce || !ref.current) return
    if (ref.current.getBoundingClientRect().top > window.innerHeight) {
      armed.current = true
      setDisplay(0)
    }
  }, [reduce])

  useEffect(() => {
    if (!inView || reduce || !armed.current) return
    const controls = animate(0, value, {
      duration,
      ease: [0.2, 0.7, 0.2, 1],
      onUpdate: (v) => setDisplay(v),
    })
    return () => controls.stop()
  }, [inView, reduce, value, duration])

  return (
    <span ref={ref} className={className}>
      {/* Screen readers get the final figure once, not every frame. */}
      <span aria-hidden className="tabular lining-nums">
        {format(display)}
      </span>
      <span className="sr-only">{format(value)}</span>
    </span>
  )
}
