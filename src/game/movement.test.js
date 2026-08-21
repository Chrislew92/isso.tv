import { describe, expect, it } from 'vitest'
import { Box3, Vector3 } from 'three'
import { buildNavigationGraph, placeFor, resolveMovement } from './movement.js'

describe('geometry navigation', () => {
  const wall = {
    id: 'room_wall_left',
    object: null,
    bounds: new Box3(new Vector3(1, 0, -2), new Vector3(1.2, 3, 2)),
  }

  it('slides against the same visible meshes rendered in the world', () => {
    const next = resolveMovement(
      new Vector3(0.5, 0, 0),
      new Vector3(1.1, 0, 0.6),
      { blockers: [wall] },
      false,
    )
    expect(next.x).toBeLessThan(1)   // vor der Wand gestoppt (gleitet heran)
    expect(next.x).toBeGreaterThan(0.5) // aber spuerbar herangekommen
    expect(next.z).toBe(0.6)            // seitlich frei durchgeglitten
  })

  it('keeps the open door dynamic without disabling other collisions', () => {
    const door = { ...wall, id: 'apartment_door' }
    const next = resolveMovement(new Vector3(0.5, 0, 0), new Vector3(1.1, 0, 0), { blockers: [door] }, true)
    expect(next.x).toBe(1.1)
  })

  it('provides connected paths for future NPCs and traffic', () => {
    expect(buildNavigationGraph().harbor).toEqual(['awning', 'station', 'signalwerk'])
  })

  it('reports cinematic zones at both sides of the threshold', () => {
    expect(placeFor({ x: 4.24, z: 0 })).toBe('room')
    expect(placeFor({ x: 4.25, z: 0 })).toBe('hallway')
  })
  it('blockt auch grosse Schritte, die sonst durch die Wand tunneln', () => {
    // Sprint/Framerate-Einbruch: Ziel liegt WEIT hinter der Wand.
    const next = resolveMovement(
      new Vector3(0.5, 0, 0),
      new Vector3(6.0, 0, 0),          // 5 Einheiten in einem Schritt, quer durch die Wand
      { blockers: [wall] },
      false,
    )
    // Darf NICHT hinter der Wand landen (Wand bei x = 1..1.2).
    expect(next.x).toBeLessThan(1)
  })

  it('laesst normales Gehen bis kurz vor die Wand zu', () => {
    let pos = new Vector3(0, 0, 0)
    for (let i = 0; i < 40; i += 1) {
      pos = resolveMovement(pos, pos.clone().add(new Vector3(0.1, 0, 0)), { blockers: [wall] }, false)
    }
    // stoppt vor der Wand (x < 1), kommt aber spuerbar heran (x > 0.5)
    expect(pos.x).toBeLessThan(1)
    expect(pos.x).toBeGreaterThan(0.5)
  })

})
