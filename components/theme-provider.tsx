'use client'

import { createContext, useCallback, useContext, useEffect, useState } from 'react'

type Theme = 'light' | 'dark'

interface ThemeContextType {
  theme: Theme
  toggleTheme: () => void
  setTheme: (theme: Theme) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

/**
 * Runs in <head> before first paint so the page never flashes the wrong theme.
 * Saved choice wins; otherwise follow the operating system.
 */
export const themeInitScript = `(function(){try{var t=localStorage.getItem('theme');if(!t){t=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'}if(t==='dark'){document.documentElement.classList.add('dark')}}catch(e){}})();`

function readInitialTheme(): Theme {
  if (typeof document === 'undefined') return 'light'
  return document.documentElement.classList.contains('dark') ? 'dark' : 'light'
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(readInitialTheme)

  // Follow OS changes until the person picks a theme themselves.
  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const onChange = (e: MediaQueryListEvent) => {
      if (localStorage.getItem('theme')) return
      const next = e.matches ? 'dark' : 'light'
      document.documentElement.classList.toggle('dark', next === 'dark')
      setThemeState(next)
    }
    media.addEventListener('change', onChange)
    return () => media.removeEventListener('change', onChange)
  }, [])

  const setTheme = useCallback((next: Theme) => {
    document.documentElement.classList.toggle('dark', next === 'dark')
    try {
      localStorage.setItem('theme', next)
    } catch {
      // Private mode: the choice lasts for this page view only.
    }
    setThemeState(next)
  }, [])

  const toggleTheme = useCallback(() => {
    setTheme(document.documentElement.classList.contains('dark') ? 'light' : 'dark')
  }, [setTheme])

  return <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
