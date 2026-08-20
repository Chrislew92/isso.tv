import { describe, expect, it } from 'vitest'
import { createRun, runReducer } from './state.js'

describe('ISSO.TV V3 run state', () => {
  it('starts at the mattress with no score system', () => {
    const run = createRun()
    expect(run.phase).toBe('mattress')
    expect(run.events).toEqual([])
    expect(run).not.toHaveProperty('xp')
    expect(run).not.toHaveProperty('karma')
  })

  it('lets the player sleep without punishment', () => {
    const run = runReducer(createRun(), { type: 'MORNING_CHOICE', choice: 'sleep' })
    expect(run.phase).toBe('mattress')
    expect(run.events).toHaveLength(0)
    expect(run.worldMinutes).toBe(24)
  })

  it('creates only one wake memory', () => {
    const awake = runReducer(createRun(), { type: 'MORNING_CHOICE', choice: 'stand' })
    const repeated = runReducer(awake, { type: 'MORNING_CHOICE', choice: 'stand' })
    expect(awake.phase).toBe('free')
    expect(repeated.events.filter((event) => event.moment === 'wake_mattress')).toHaveLength(1)
  })

  it.each(['help_directly', 'organize', 'wait', 'continue_kindly', 'silence'])('accepts %s as a complete cart stance', (stance) => {
    const run = runReducer(createRun(), { type: 'CART_STANCE', stance, aftermath: 'Der Morgen geht weiter.' })
    expect(run.cartResolved).toBe(true)
    expect(run.cartStance).toBe(stance)
    expect(run.events[0].stance).toBe(stance)
  })

  it('stores a compact reload position without changing the story', () => {
    const run = runReducer(createRun(), { type: 'SAVE_POSITION', position: { x: 19.123, z: 3.086, location: 'harbor' } })
    expect(run.version).toBe(6)
    expect(run.player).toEqual({ x: 19.12, z: 3.09, location: 'harbor' })
    expect(run.events).toEqual([])
  })

  it('starts as one game with a simple zero-euro economy', () => {
    const run = createRun()
    expect(run).not.toHaveProperty('mode')
    expect(run).not.toHaveProperty('finance')
    expect(run.economy).toEqual({ cash: 0, assets: 0, target: 50000 })
  })
})
