import { describe, expect, it } from 'vitest'
import { NEUTRAL_TOUCH_INPUT, updateTouchInput } from './touch.js'

describe('touch movement input', () => {
  it('presses and releases one axis without corrupting the other controls', () => {
    const input = { ...NEUTRAL_TOUCH_INPUT }
    expect(updateTouchInput(input, { y: 1 })).toBe(input)
    expect(input).toEqual({ x: 0, y: 1, sprint: false })
    updateTouchInput(input, { sprint: true })
    updateTouchInput(input, { y: 0 })
    expect(input).toEqual({ x: 0, y: 0, sprint: true })
  })

  it('creates a safe input state when a ref was not initialized', () => {
    expect(updateTouchInput(null, { x: -1 })).toEqual({ x: -1, y: 0, sprint: false })
  })
})
