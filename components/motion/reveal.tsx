'use client'

import { motion, type HTMLMotionProps } from 'framer-motion'

/** Short fade-and-rise used on a few image-led blocks only (see PLAN §3.6). */
export function Reveal({ delay = 0, children, ...props }: HTMLMotionProps<'div'> & { delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '0px 0px -12% 0px' }}
      transition={{ duration: 0.5, delay, ease: [0.2, 0.7, 0.2, 1] }}
      {...props}
    >
      {children}
    </motion.div>
  )
}
