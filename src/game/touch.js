export const NEUTRAL_TOUCH_INPUT = Object.freeze({ x: 0, y: 0, sprint: false })

export function updateTouchInput(current, patch) {
  if (!current || typeof current !== 'object') return { ...NEUTRAL_TOUCH_INPUT, ...patch }
  Object.assign(current, patch)
  return current
}
