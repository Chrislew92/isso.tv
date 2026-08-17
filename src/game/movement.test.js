import { describe, expect, it } from 'vitest'
import { clampMovement, placeFor } from './movement.js'

describe('connected room and hallway movement', () => {
  it('keeps the closed apartment door solid', () => {
    expect(clampMovement({ x: 3.64, z: 0 }, { x: 3.72, z: 0 }, false).x).toBe(3.65)
  })

  it('allows continuous progress through an open doorway', () => {
    expect(clampMovement({ x: 3.70, z: 0 }, { x: 3.78, z: 0 }, true).x).toBe(3.78)
    expect(clampMovement({ x: 4.24, z: 0 }, { x: 4.30, z: 0 }, true).x).toBe(4.30)
  })

  it('does not allow walking through the room wall beside the door', () => {
    expect(clampMovement({ x: 3.70, z: 1.3 }, { x: 3.78, z: 1.3 }, true).x).toBe(3.7)
  })

  it('keeps the character inside the actual hallway width', () => {
    expect(clampMovement({ x: 7, z: 1.2 }, { x: 7.1, z: 1.8 }, true).z).toBe(1.25)
  })

  it('reports the active camera zone at both sides of the threshold', () => {
    expect(placeFor({ x: 4.24, z: 0 })).toBe('room')
    expect(placeFor({ x: 4.25, z: 0 })).toBe('hallway')
  })
})
