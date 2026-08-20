import { describe, expect, it } from 'vitest'
import { readGamepad } from './gamepad.js'

describe('controller input', () => {
  it('returns a quiet neutral state without hardware', () => {
    expect(readGamepad()).toEqual({ x: 0, y: 0, interact: false, sprint: false, quiet: false, memory: false, buttons: [] })
  })

  it('applies the deadzone and maps the four action buttons', () => {
    const buttons = [true, true, false, true].map((pressed) => ({ pressed }))
    expect(readGamepad({ axes: [0.15, -0.8], buttons })).toMatchObject({ x: 0, y: 0.8, interact: true, sprint: true, quiet: false, memory: true })
  })
})
