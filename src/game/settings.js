export const SETTINGS_KEY = 'isso-tv-v3-settings-v1'

export const DEFAULT_SETTINGS = Object.freeze({
  cameraSensitivity: 0.75,
  renderQuality: 'auto',
})

export function normalizeSettings(value = {}) {
  const camera = Number(value.cameraSensitivity)
  return {
    cameraSensitivity: Number.isFinite(camera)
      ? Math.min(1.4, Math.max(0.35, camera))
      : DEFAULT_SETTINGS.cameraSensitivity,
    renderQuality: ['auto', 'high', 'efficient'].includes(value.renderQuality)
      ? value.renderQuality
      : DEFAULT_SETTINGS.renderQuality,
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
