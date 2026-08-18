import { describe, expect, it } from 'vitest'
import { DEFAULT_SETTINGS, SETTINGS_KEY, loadSettings, normalizeSettings, saveSettings } from './settings.js'

function fakeStorage(initial = null) {
  let value = initial
  return {
    getItem: (key) => key === SETTINGS_KEY ? value : null,
    setItem: (key, next) => { if (key === SETTINGS_KEY) value = next },
    read: () => value,
  }
}

describe('settings', () => {
  it('uses safe defaults for missing or malformed data', () => {
    expect(loadSettings(fakeStorage())).toEqual(DEFAULT_SETTINGS)
    expect(loadSettings(fakeStorage('{broken'))).toEqual(DEFAULT_SETTINGS)
  })

  it('clamps camera sensitivity and rejects unknown quality modes', () => {
    expect(normalizeSettings({ cameraSensitivity: 9, renderQuality: 'cinema' })).toEqual({
      cameraSensitivity: 1.4,
      renderQuality: 'auto',
    })
  })

  it('round-trips normalized local settings', () => {
    const storage = fakeStorage()
    expect(saveSettings({ cameraSensitivity: 0.55, renderQuality: 'high' }, storage)).toBe(true)
    expect(loadSettings(storage)).toEqual({ cameraSensitivity: 0.55, renderQuality: 'high' })
    expect(JSON.parse(storage.read())).toEqual({ cameraSensitivity: 0.55, renderQuality: 'high' })
  })
})
