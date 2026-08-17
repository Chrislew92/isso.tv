const SAVE_KEY = 'isso-tv-v3-run-v2'

export function loadRun(fallback) {
  try {
    const raw = window.localStorage.getItem(SAVE_KEY)
    if (!raw) return fallback
    const value = JSON.parse(raw)
    return value?.version === 2 ? { ...fallback, ...value } : fallback
  } catch {
    return fallback
  }
}

export function saveRun(run) {
  try {
    window.localStorage.setItem(SAVE_KEY, JSON.stringify(run))
  } catch {
    // The game remains playable when private browsing blocks local storage.
  }
}

export function clearRun() {
  try {
    window.localStorage.removeItem(SAVE_KEY)
  } catch {
    // Nothing else is required; reset still works in memory.
  }
}
