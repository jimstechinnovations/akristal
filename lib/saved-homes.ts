'use client'

import { useSyncExternalStore } from 'react'

// Saved homes live on this device until accounts sync them (PLAN §9).
const KEY = 'akristal:saved-homes'
const listeners = new Set<() => void>()
let cache: string[] | null = null

function read(): string[] {
  if (cache) return cache
  try {
    const parsed = JSON.parse(localStorage.getItem(KEY) ?? '[]')
    cache = Array.isArray(parsed) ? parsed.filter((x) => typeof x === 'string') : []
  } catch {
    cache = []
  }
  return cache
}

function write(ids: string[]) {
  cache = ids
  try {
    localStorage.setItem(KEY, JSON.stringify(ids))
  } catch {
    // Storage full or blocked: keep the in-memory list for this visit.
  }
  listeners.forEach((l) => l())
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  const onStorage = (e: StorageEvent) => {
    if (e.key === KEY) {
      cache = null
      listener()
    }
  }
  window.addEventListener('storage', onStorage)
  return () => {
    listeners.delete(listener)
    window.removeEventListener('storage', onStorage)
  }
}

const EMPTY: string[] = []

export function useSavedHomes() {
  const ids = useSyncExternalStore(subscribe, read, () => EMPTY)
  return {
    ids,
    isSaved: (id: string) => ids.includes(id),
    toggle: (id: string) => write(ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id]),
  }
}
