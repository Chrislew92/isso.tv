import { describe, expect, it } from 'vitest'
import { AMBIENCE_MIX, FOOTSTEP_TONE } from './useVoicePlayer.js'

describe('world audio mix', () => {
  it('gives every playable Vertical-Slice zone an authored ambience', () => {
    expect(Object.keys(AMBIENCE_MIX)).toEqual(['room', 'hallway', 'awning', 'harbor', 'station', 'signalwerk'])
    for (const mix of Object.values(AMBIENCE_MIX)) {
      expect(mix.rain).toBeGreaterThanOrEqual(0)
      expect(mix.rain).toBeLessThan(0.1)
      expect(mix.hum).toBeLessThan(0.05)
    }
  })

  it('keeps hoof transients short and zone-specific', () => {
    expect(Object.keys(FOOTSTEP_TONE)).toEqual(Object.keys(AMBIENCE_MIX))
    expect(new Set(Object.values(FOOTSTEP_TONE).map((tone) => tone.frequency)).size).toBe(6)
    for (const tone of Object.values(FOOTSTEP_TONE)) expect(tone.duration).toBeLessThanOrEqual(0.13)
  })
})
