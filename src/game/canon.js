export const BUILD = '3.1.0'

export const WORLD_START = Object.freeze({ x: -1.1, z: 0.7, location: 'room' })

export const PLACES = {
  room: { id: 'room', label: 'Fährstraße 5B', short: 'ZIMMER', x: -1.1, z: 0.7 },
  hallway: { id: 'hallway', label: 'Hausflur', short: 'FLUR', x: 7.35, z: 0 },
  awning: { id: 'awning', label: 'Unter dem Vordach', short: 'VORDACH', x: 13.8, z: 0 },
  harbor: { id: 'harbor', label: 'Pier 17', short: 'HAFEN', x: 19, z: 3.1 },
  station: { id: 'station', label: 'Gleis 4 / Wiel', short: 'BAHNHOF', x: 35.5, z: -4.5 },
  signalwerk: { id: 'signalwerk', label: 'Signalwerk / HQ1', short: 'HQ1', x: 27, z: -11 },
}

export const INTERACTIONS = {
  connection: {
    id: 'connection',
    label: 'Donkey-Connection öffnen',
    quiet: 'still bleiben',
    place: 'room',
    x: -3.15,
    z: -3.36,
    radius: 2.25,
  },
  door: {
    id: 'door',
    label: 'Tür öffnen',
    quiet: 'noch im Zimmer bleiben',
    place: 'room',
    x: 4.15,
    z: 0.8,
    radius: 2.1,
  },
  cart: {
    id: 'cart',
    label: 'Rollwagen ansehen',
    quiet: 'still beobachten',
    place: 'harbor',
    x: 19,
    z: 3.1,
    radius: 2.8,
  },
  station: {
    id: 'station',
    label: 'Gleis 4 ansehen',
    quiet: 'nur zuhören',
    place: 'station',
    x: 35.5,
    z: -4.5,
    radius: 3.4,
  },
  signalwerk: {
    id: 'signalwerk',
    label: 'Signalwerk betreten',
    quiet: 'Idee noch liegen lassen',
    place: 'signalwerk',
    x: 27,
    z: -11,
    radius: 3.4,
  },
}

export const CART_STANCES = [
  { id: 'help_directly', icon: '◒', label: 'Direkt helfen', copy: 'Mit dem Vorderhuf den Wagen stabilisieren.' },
  { id: 'organize', icon: '⌁', label: 'Jemanden holen', copy: 'Am Kiosk ruhig Bescheid sagen.' },
  { id: 'wait', icon: '◷', label: 'Warten', copy: 'In der Nähe bleiben, ohne zu übernehmen.' },
  { id: 'continue_kindly', icon: '→', label: 'Weitergehen', copy: 'Den trockenen Weg nehmen. Ohne Rechtfertigung.' },
  { id: 'silence', icon: 'Q', label: 'Still bleiben', copy: 'Beobachten und dem Moment Raum geben.' },
]

export const CONNECTION_CHOICES = [
  { id: 'morning', key: '1', label: 'Guten Morgen.', reply: '„Morgen.“', aftermath: 'Die Verbindung bleibt kurz warm und ruhig.' },
  { id: 'signals', key: '2', label: 'Was liegt an?', reply: '„Was liegt an?“', aftermath: 'Ein paar Signale. Nichts davon läuft weg.' },
  { id: 'silence', key: 'Q', label: 'Still bleiben.', reply: '', aftermath: 'Alles klar. Ich bleibe kurz da.' },
]

export const EVENT_COPY = {
  wake_mattress: { label: 'Der Morgen beginnt', chapter: 'SIGNAL AM MORGEN' },
  donkey_connection_greeting: { label: 'Die Verbindung antwortet', chapter: 'DONKEY-CONNECTION' },
  hallway_threshold: { label: 'Die Tür zur Stadt', chapter: 'DIE SCHWELLE' },
  cart_edge_situation: { label: 'Der nasse Weg', chapter: 'PIER 17' },
  station_direction: { label: 'Gleis 4 bleibt offen', chapter: 'WIEL' },
  signalwerk_arrival: { label: 'Eine Idee bleibt liegen', chapter: 'SIGNALWERK' },
}

export function formatWorldTime(minutes) {
  const total = 7 * 60 + minutes
  const hours = Math.floor(total / 60) % 24
  const mins = total % 60
  return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`
}
