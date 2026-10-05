'use client'

import { createContext, useCallback, useContext, useSyncExternalStore } from 'react'

export const AS_LISTED = 'AS_LISTED'
const KEY = 'display-currency'

type Ctx = {
  /** AS_LISTED or a currency code */
  display: string
  setDisplay: (code: string) => void
  rates: Record<string, number> | null
}

const CurrencyContext = createContext<Ctx>({ display: AS_LISTED, setDisplay: () => {}, rates: null })

const listeners = new Set<() => void>()
function subscribe(cb: () => void) {
  listeners.add(cb)
  window.addEventListener('storage', cb)
  return () => {
    listeners.delete(cb)
    window.removeEventListener('storage', cb)
  }
}
function read() {
  try {
    return localStorage.getItem(KEY) || AS_LISTED
  } catch {
    return AS_LISTED
  }
}

export function CurrencyProvider({ rates, children }: { rates: Record<string, number> | null; children: React.ReactNode }) {
  // Server and first client render use "as listed", so the HTML always matches; the saved choice applies straight after.
  const display = useSyncExternalStore(subscribe, read, () => AS_LISTED)
  const setDisplay = useCallback((code: string) => {
    try {
      localStorage.setItem(KEY, code)
    } catch {
      // Private mode: the choice lasts until the page is reloaded.
    }
    listeners.forEach((l) => l())
  }, [])
  return <CurrencyContext.Provider value={{ display: rates ? display : AS_LISTED, setDisplay, rates }}>{children}</CurrencyContext.Provider>
}

export const useCurrency = () => useContext(CurrencyContext)
