export function clampMovement(current, desired, doorOpen) {
  const next = desired
  if (!doorOpen && current.x < 4.0 && next.x > 3.65) next.x = 3.65
  if (next.x < 4.25) {
    const insideDoorway = doorOpen && Math.abs(next.z) < 0.82
    next.x = Math.max(-5.35, Math.min(insideDoorway ? 4.24 : 3.7, next.x))
    next.z = Math.max(-4.25, Math.min(4.25, next.z))
  } else if (next.x < 10.7) {
    next.x = Math.max(4.25, next.x)
    next.z = Math.max(-1.25, Math.min(1.25, next.z))
  } else {
    next.x = Math.max(10.7, Math.min(49.5, next.x))
    next.z = Math.max(-13.7, Math.min(13.7, next.z))
  }
  return next
}

export function placeFor(position) {
  if (position.x < 4.25) return 'room'
  if (position.x < 10.7) return 'hallway'
  if (position.x > 33 && position.z < 0) return 'station'
  if (position.x > 24 && position.z < -8) return 'signalwerk'
  if (position.x < 15) return 'awning'
  return 'harbor'
}
