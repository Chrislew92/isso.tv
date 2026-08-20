import { describe, expect, it } from 'vitest'
import { migrateRun } from './save.js'
import { createRun } from './state.js'

describe('save migration', () => {
  it('keeps the played story but retires the old detailed finance profile', () => {
    const migrated = migrateRun({
      version: 5,
      mode: 'highroller',
      phase: 'free',
      events: [{ moment: 'wake_mattress', place: 'room' }],
      finance: { available: 18000, protectedBalance: 2100, insolvency: true },
    }, createRun())

    expect(migrated.version).toBe(6)
    expect(migrated.phase).toBe('free')
    expect(migrated.events).toHaveLength(1)
    expect(migrated).not.toHaveProperty('finance')
    expect(migrated).not.toHaveProperty('mode')
    expect(migrated.economy).toEqual({ cash: 0, assets: 0, target: 50000 })
  })
})
