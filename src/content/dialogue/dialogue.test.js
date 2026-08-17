import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import dialogue from './de.json'

describe('German voice vertical slice', () => {
  it('uses unique stable dialogue ids', () => {
    const ids = dialogue.map((line) => line.id)
    expect(new Set(ids).size).toBe(ids.length)
    expect(ids.every((id) => id.startsWith('de.'))).toBe(true)
  })

  it('ships every referenced audio and timing file', () => {
    for (const line of dialogue) {
      expect(existsSync(resolve('public', line.audio.slice(1))), line.audio).toBe(true)
      expect(existsSync(resolve('public', line.timings.slice(1))), line.timings).toBe(true)
    }
  })

  it('keeps word timings tied to the same dialogue id', () => {
    for (const line of dialogue) {
      const timingFile = resolve('public', line.timings.slice(1))
      const timings = JSON.parse(readFileSync(timingFile, 'utf8'))
      expect(timings.dialogueId).toBe(line.id)
      expect(timings.speaker).toBe(line.speaker)
      expect(timings.words.length).toBeGreaterThan(0)
    }
  })
})
