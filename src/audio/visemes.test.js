import { describe, expect, it } from 'vitest'
import { visemeAtTime, visemeForLetter } from './visemes.js'

describe('muzzle viseme cues', () => {
  it('distinguishes closed, wide and round mouth shapes', () => {
    expect(visemeForLetter('m')).toBe('CLOSED')
    expect(visemeForLetter('i')).toBe('WIDE')
    expect(visemeForLetter('u')).toBe('ROUND')
  })

  it('reads deterministic word timings', () => {
    expect(visemeAtTime([{ atMs: 100, durationMs: 400, text: 'Morgen' }], 120)).toBe('CLOSED')
    expect(visemeAtTime([], 500)).toBe('REST')
  })
})
