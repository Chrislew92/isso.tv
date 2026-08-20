import { EVENT_COPY, WORLD_START } from './canon.js'
import { DEFAULT_ECONOMY, normalizeEconomy } from './economy.js'

export function createRun() {
  return {
    version: 6,
    phase: 'mattress',
    worldMinutes: 0,
    doorOpen: false,
    cartResolved: false,
    cartStance: null,
    connectionTone: null,
    visited: ['room'],
    events: [],
    player: { ...WORLD_START },
    economy: { ...DEFAULT_ECONOMY },
    lastLine: 'Regen auf Blech. Neu in Strammburg. Im Beutel: nichts.',
  }
}

function addEvent(run, event) {
  if (run.events.some((entry) => entry.moment === event.moment)) return run.events
  const copy = EVENT_COPY[event.moment]
  return [
    ...run.events,
    {
      id: `${event.moment}-${run.events.length + 1}`,
      label: copy?.label ?? event.moment,
      chapter: copy?.chapter ?? 'STRAMMBURG',
      ...event,
    },
  ]
}

function visit(run, place) {
  return run.visited.includes(place) ? run.visited : [...run.visited, place]
}

export function runReducer(run, action) {
  switch (action.type) {
    case 'MORNING_CHOICE': {
      if (action.choice === 'sleep') {
        return { ...run, worldMinutes: run.worldMinutes + 24, lastLine: 'Der Regen bleibt. Du darfst noch einmal die Augen schließen.' }
      }
      if (action.choice === 'stay') {
        return { ...run, worldMinutes: run.worldMinutes + 3, lastLine: 'Du bleibst liegen. Keine Uhr macht daraus einen Fehler.' }
      }
      return {
        ...run,
        phase: 'free',
        worldMinutes: run.worldMinutes + 2,
        lastLine: '353L steht auf. Jetzt gehört ihm der Raum.',
        events: addEvent(run, {
          moment: 'wake_mattress',
          place: 'room',
          stance: 'stand',
          visibleAftermath: 'Das Zimmer wird zur eigenen Startbasis.',
          isRunFilmEligible: true,
        }),
      }
    }
    case 'CONNECTION_RESPONSE':
      return {
        ...run,
        connectionTone: action.choice,
        worldMinutes: run.worldMinutes + 2,
        lastLine: action.aftermath,
        events: addEvent(run, {
          moment: 'donkey_connection_greeting',
          place: 'room',
          stance: action.choice,
          visibleAftermath: action.aftermath,
          isRunFilmEligible: true,
        }),
      }
    case 'OPEN_DOOR':
      return {
        ...run,
        doorOpen: true,
        worldMinutes: run.worldMinutes + 1,
        visited: visit(run, 'hallway'),
        lastLine: 'Licht unter anderen Türen. Draußen liegt der Hafen.',
        events: addEvent(run, {
          moment: 'hallway_threshold',
          place: 'hallway',
          stance: 'continue_kindly',
          visibleAftermath: 'Der Hausflur und der Weg unter das Vordach werden offen.',
          isRunFilmEligible: true,
        }),
      }
    case 'CART_STANCE':
      return {
        ...run,
        cartResolved: true,
        cartStance: action.stance,
        worldMinutes: run.worldMinutes + 4,
        visited: visit(run, 'harbor'),
        lastLine: action.aftermath,
        events: addEvent(run, {
          moment: 'cart_edge_situation',
          place: 'harbor',
          stance: action.stance,
          visibleAftermath: action.aftermath,
          isRunFilmEligible: true,
        }),
      }
    case 'VISIT_STATION':
      return {
        ...run,
        visited: visit(run, 'station'),
        worldMinutes: run.worldMinutes + 3,
        lastLine: 'Der Zug fährt. Wiel ist ein Weg, keine Sperre.',
        events: addEvent(run, {
          moment: 'station_direction',
          place: 'station',
          stance: action.stance ?? 'wait',
          visibleAftermath: 'Gleis 4 bleibt erreichbar.',
          isRunFilmEligible: true,
        }),
      }
    case 'VISIT_SIGNALWERK':
      return {
        ...run,
        visited: visit(run, 'signalwerk'),
        worldMinutes: run.worldMinutes + 4,
        lastLine: 'Lotte: „Ich kann mitdenken. Nicht für dich leben.“',
        events: addEvent(run, {
          moment: 'signalwerk_arrival',
          place: 'signalwerk',
          stance: action.stance ?? 'ask',
          visibleAftermath: 'Eine unfertige Idee liegt sichtbar auf dem Tisch.',
          isRunFilmEligible: true,
        }),
      }
    case 'SET_LAST_LINE':
      return { ...run, lastLine: action.line }
    case 'SAVE_POSITION':
      return {
        ...run,
        player: {
          x: Number(action.position.x.toFixed(2)),
          z: Number(action.position.z.toFixed(2)),
          location: action.position.location,
        },
      }
    case 'UPDATE_ECONOMY':
      return { ...run, economy: normalizeEconomy({ ...run.economy, ...action.patch }) }
    case 'RESET':
      return createRun()
    default:
      return run
  }
}
