import { PLACES, WORLD_START } from './canon.js'
import { DEFAULT_ECONOMY, normalizeEconomy } from './economy.js'

export const SAVE_KEY = 'isso-tv-v3-run-v6'
export const PREVIOUS_SAVE_KEYS = ['isso-tv-v3-run-v5', 'isso-tv-v3-run-v4', 'isso-tv-v3-run-v3']
export const LEGACY_SAVE_KEY = 'isso-tv-v3-run-v2'

export function migrateRun(value, fallback) {
  if (value?.version === 6) return { ...fallback, ...value, player: { ...WORLD_START, ...value.player }, economy: normalizeEconomy(value.economy) }
  if (![2, 3, 4, 5].includes(value?.version)) return fallback
  const lastPlace = [...(value.events ?? [])].reverse().find((event) => PLACES[event.place])?.place ?? 'room'
  const place = PLACES[lastPlace] ?? WORLD_START
  const { mode: _mode, finance: _finance, ...story } = value
  return {
    ...fallback,
    ...story,
    version: 6,
    player: value.player ?? { x: place.x, z: place.z, location: place.id ?? 'room' },
    economy: { ...DEFAULT_ECONOMY },
  }
}

export function loadRun(fallback) {
  try {
    const raw = window.localStorage.getItem(SAVE_KEY) ?? PREVIOUS_SAVE_KEYS.map((key) => window.localStorage.getItem(key)).find(Boolean) ?? window.localStorage.getItem(LEGACY_SAVE_KEY)
    if (!raw) return fallback
    return migrateRun(JSON.parse(raw), fallback)
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
    PREVIOUS_SAVE_KEYS.forEach((key) => window.localStorage.removeItem(key))
    window.localStorage.removeItem(LEGACY_SAVE_KEY)
  } catch {
    // Nothing else is required; reset still works in memory.
  }
}
