export const VISEMES = ['REST', 'CLOSED', 'OPEN', 'WIDE', 'ROUND', 'TEETH', 'TONGUE', 'BREATH']

export function visemeForLetter(letter = '') {
  if ('bmp'.includes(letter)) return 'CLOSED'
  if ('ao'.includes(letter)) return 'OPEN'
  if ('uwöü'.includes(letter)) return 'ROUND'
  if ('eiyä'.includes(letter)) return 'WIDE'
  if ('fvszßx'.includes(letter)) return 'TEETH'
  if ('ltdn'.includes(letter)) return 'TONGUE'
  if ('h'.includes(letter)) return 'BREATH'
  return 'REST'
}

export function visemeAtTime(words = [], atMs = 0) {
  const word = words.find((entry) => atMs >= entry.atMs && atMs <= entry.atMs + entry.durationMs)
  if (!word) return 'REST'
  const letters = word.text.toLocaleLowerCase('de-DE').replace(/[^a-zäöüß]/g, '')
  if (!letters) return 'REST'
  const progress = Math.min(0.999, Math.max(0, (atMs - word.atMs) / Math.max(1, word.durationMs)))
  return visemeForLetter(letters[Math.floor(progress * letters.length)])
}
