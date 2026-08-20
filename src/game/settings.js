export const SETTINGS_KEY = 'isso-tv-v3-settings-v2'

export const DEFAULT_SETTINGS = Object.freeze({
  cameraSensitivity: 0.75,
  renderQuality: 'auto',
  subtitles: true,
  subtitleSize: 'medium',
  highContrast: false,
  reducedMotion: false,
  audio: Object.freeze({ master: 0.85, voice: 1, ambience: 0.72, effects: 0.82 }),
})

function volume(value, fallback) {
  const next = Number(value)
  return Number.isFinite(next) ? Math.min(1, Math.max(0, next)) : fallback
}

export function normalizeSettings(value = {}) {
  const camera = Number(value.cameraSensitivity)
  return {
    cameraSensitivity: Number.isFinite(camera)
      ? Math.min(1.4, Math.max(0.35, camera))
      : DEFAULT_SETTINGS.cameraSensitivity,
    renderQuality: ['auto', 'high', 'efficient'].includes(value.renderQuality)
      ? value.renderQuality
      : DEFAULT_SETTINGS.renderQuality,
    subtitles: value.subtitles !== false,
    subtitleSize: ['small', 'medium', 'large'].includes(value.subtitleSize) ? value.subtitleSize : DEFAULT_SETTINGS.subtitleSize,
    highContrast: value.highContrast === true,
    reducedMotion: value.reducedMotion === true,
    audio: {
      master: volume(value.audio?.master, DEFAULT_SETTINGS.audio.master),
      voice: volume(value.audio?.voice, DEFAULT_SETTINGS.audio.voice),
      ambience: volume(value.audio?.ambience, DEFAULT_SETTINGS.audio.ambience),
      effects: volume(value.audio?.effects, DEFAULT_SETTINGS.audio.effects),
    },
  }
}

export function loadSettings(storage = globalThis.localStorage) {
  try {
    const saved = storage?.getItem(SETTINGS_KEY)
    return normalizeSettings(saved ? JSON.parse(saved) : DEFAULT_SETTINGS)
  } catch {
    return { ...DEFAULT_SETTINGS }
  }
}

export function saveSettings(settings, storage = globalThis.localStorage) {
  try {
    storage?.setItem(SETTINGS_KEY, JSON.stringify(normalizeSettings(settings)))
    return true
  } catch {
    return false
  }
}
