import { describe, expect, it } from 'vitest'
import { INTERACTIONS, PLACES, WORLD_START } from './canon.js'

describe('canonical world data', () => {
  it('owns every interaction coordinate in one place', () => {
    expect(WORLD_START).toEqual({ x: PLACES.room.x, z: PLACES.room.z, location: 'room' })
    for (const target of Object.values(INTERACTIONS)) {
      expect(PLACES[target.place]).toBeDefined()
      expect(Number.isFinite(target.x) && Number.isFinite(target.z)).toBe(true)
      expect(target.radius).toBeGreaterThan(0)
    }
  })

  it('matches the exported 3D interaction markers', () => {
    expect(INTERACTIONS.cart).toMatchObject({ x: 19, z: 3.1 })
    expect(INTERACTIONS.station).toMatchObject({ x: 35.5, z: -4.5 })
    expect(INTERACTIONS.signalwerk).toMatchObject({ x: 27, z: -11 })
  })
})
