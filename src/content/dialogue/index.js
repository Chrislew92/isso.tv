import germanDialogue from './de.json'

export const DIALOGUE = Object.fromEntries(germanDialogue.map((line) => [line.id, line]))

export function getDialogue(id) {
  const line = DIALOGUE[id]
  if (!line) console.warn(`[ISSO.TV voice] Unknown dialogue id: ${id}`)
  return line ?? null
}
