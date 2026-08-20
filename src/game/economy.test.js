import { describe, expect, it } from 'vitest'
import { DEFAULT_ECONOMY, nextBuildGoal, normalizeEconomy, totalWealth } from './economy.js'

describe('ISSO.TV game economy', () => {
  it('starts poor without hidden balances or financial casework', () => {
    expect(normalizeEconomy()).toEqual(DEFAULT_ECONOMY)
    expect(totalWealth(DEFAULT_ECONOMY)).toBe(0)
    expect(DEFAULT_ECONOMY).toEqual({ cash: 0, assets: 0, target: 50000 })
  })

  it('never invents negative or fractional garbage values', () => {
    expect(normalizeEconomy({ cash: -50, assets: 12.345 })).toMatchObject({ cash: 0, assets: 12.35 })
  })

  it('continues with larger dreams after the first 50K milestone', () => {
    expect(nextBuildGoal(0).amount).toBe(50000)
    expect(nextBuildGoal(50000).amount).toBe(250000)
    expect(nextBuildGoal(1000000).amount).toBe(80000000)
  })
})
