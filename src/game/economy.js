export const DEFAULT_ECONOMY = Object.freeze({
  cash: 0,
  assets: 0,
  target: 50000,
})

export const BUILD_GOALS = Object.freeze([
  { id: 'stability', amount: 50000, label: '50K / Luft zum Atmen' },
  { id: 'studio', amount: 250000, label: 'Eigenes Studio' },
  { id: 'million', amount: 1000000, label: 'Die erste Million' },
  { id: 'eytonland', amount: 80000000, label: 'EyTonLand' },
])

export function normalizeEconomy(value = {}) {
  const normalized = { ...DEFAULT_ECONOMY }
  for (const field of ['cash', 'assets', 'target']) {
    const number = Number(value[field])
    if (Number.isFinite(number)) normalized[field] = Math.max(0, Math.round(number * 100) / 100)
  }
  normalized.target = Math.max(1, normalized.target)
  return normalized
}

export function totalWealth(economy = DEFAULT_ECONOMY) {
  return economy.cash + economy.assets
}

export function nextBuildGoal(wealth = 0) {
  return BUILD_GOALS.find((milestone) => wealth < milestone.amount) ?? BUILD_GOALS.at(-1)
}

export function formatEuro(value) {
  return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(value)
}
