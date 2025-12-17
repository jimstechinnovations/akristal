'use client'

import { useEffect } from 'react'

/**
 * Suppresses the WebCrypto API warning from Supabase
 * This warning is harmless and Supabase automatically falls back to plain code challenge
 */
export function SuppressWebCryptoWarning() {
  useEffect(() => {
    // Store original console.warn
    const originalWarn = console.warn

    // Override console.warn to filter out WebCrypto warnings
    console.warn = (...args: unknown[]) => {
      const message = args.join(' ')
      // Filter out WebCrypto API warnings
      if (
        message.includes('WebCrypto API is not supported') ||
        message.includes('Code challenge method will default to use plain instead of sha256')
      ) {
        // Suppress this specific warning
        return
      }
      // Allow all other warnings
      originalWarn.apply(console, args)
    }

    // Cleanup: restore original console.warn on unmount
    return () => {
      console.warn = originalWarn
    }
  }, [])

  return null
}

