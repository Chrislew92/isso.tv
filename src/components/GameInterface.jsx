import { BUILD, PLACES, formatWorldTime } from '../game/canon.js'
import { formatEuro } from '../game/economy.js'
import { updateTouchInput } from '../game/touch.js'
import MiniMap from './MiniMap.jsx'

function TouchControls({ inputState }) {
  const set = (next) => updateTouchInput(inputState.current, next)
  const bind = (pressed, released) => ({
    onPointerDown: (event) => { event.preventDefault(); event.currentTarget.setPointerCapture?.(event.pointerId); set(pressed) },
    onPointerUp: () => set(released),
    onPointerCancel: () => set(released),
    onKeyDown: (event) => { if (event.key === ' ' || event.key === 'Enter') set(pressed) },
    onKeyUp: () => set(released),
  })
  return (
    <div className="touch-controls" aria-label="Touch-Steuerung">
      <div className="touch-pad">
        <button aria-label="Vorwärts" {...bind({ y: 1 }, { y: 0 })}>▲</button>
        <button aria-label="Links" {...bind({ x: -1 }, { x: 0 })}>◀</button>
        <button aria-label="Rückwärts" {...bind({ y: -1 }, { y: 0 })}>▼</button>
        <button aria-label="Rechts" {...bind({ x: 1 }, { x: 0 })}>▶</button>
      </div>
      <button className="touch-sprint" aria-label="Hufsprint halten" {...bind({ sprint: true }, { sprint: false })}>⇧<small>SPRINT</small></button>
    </div>
  )
}

export default function GameInterface({ run, position, prompt, voice, settings, inputState, cinematic, onAction }) {
  const place = PLACES[position.location] ?? PLACES.room
  const currentEvent = run.events.at(-1)

  return (
    <div className="game-interface">
      <header className="master-bar">
        <div className="master-brand">
          <span className="logo-mark">ISSO<span>.TV</span></span>
          <small>V{BUILD} / MASTER EDITION</small>
        </div>
        <div className="world-readout">
          <span>● {formatWorldTime(run.worldMinutes)}</span>
          <span>{place.label}</span>
          <span>{formatEuro(run.economy.cash)}</span>
          <span>REGEN / 9°</span>
        </div>
        <nav aria-label="Spielmenü">
          <button data-short={cinematic ? '■' : '▶'} onClick={() => onAction('film')} aria-pressed={cinematic}>{cinematic ? '■ FILM' : '▶ FILM'}</button>
          <button data-short="◫" onClick={() => onAction('memory')}>◫ NACHHALL <i>{run.events.length}</i></button>
          <button data-short={voice.enabled ? '◖' : '○'} onClick={() => onAction('voice-toggle')} title="Stimmen und Atmosphäre ein- oder ausschalten">{voice.enabled ? '◖ TON AN' : '○ TON AUS'}</button>
          <button data-short="353L" onClick={() => onAction('character')} title="353L und Outfit">353L PROFIL</button>
          <button data-short="€" onClick={() => onAction('economy')} title="Bargeld, Besitz und Ziele">€ AUFBAU</button>
          <button data-short="⚙" onClick={() => onAction('settings')} title="Kamera- und Grafikeinstellungen">⚙ OPTIONEN</button>
          <button data-short="↻" onClick={() => onAction('reset')}>↻ RESET</button>
        </nav>
      </header>

      <aside className="chapter-panel">
        <p className="eyebrow">{currentEvent?.chapter ?? 'SIGNAL AM MORGEN'}</p>
        <h2>{currentEvent?.label ?? 'Die Wohnung ist wach.'}</h2>
        <p>{run.lastLine}</p>
        <div className="chapter-panel__rule">
          <span />
          <small>Keine Punkte. Kein falscher Weg. Nur Folgen, die du sehen kannst.</small>
        </div>
      </aside>

      <MiniMap position={position} />

      {prompt && (
        <div className="interaction-prompt" role="status">
          <button type="button" onClick={() => onAction(prompt.id)}>
            <span className="keycap">E</span>
            <p><b>{prompt.label}</b><small>einmal drücken</small></p>
          </button>
          <button type="button" className="interaction-prompt__quiet" onClick={() => onAction(`${prompt.id}:silence`)}>
            <span className="keycap keycap--quiet">Q</span>
            <p><b>{prompt.quiet}</b><small>Stille ist eine Haltung</small></p>
          </button>
        </div>
      )}

      {settings.subtitles && voice.caption && (
        <div className={`voice-caption${voice.active ? ' voice-caption--active' : ''}`} aria-live="polite">
          <span>{voice.caption.speaker}</span>
          <p>{voice.caption.text}</p>
          {voice.needsGesture && <button onClick={() => onAction('voice-replay')}>◖ STIMME STARTEN</button>}
        </div>
      )}

      <div className="control-strip" aria-label="Steuerung">
        <span><b>WASD</b> GEHEN</span>
        <span><b>⇧</b> HUFSPRINT</span>
        <span><b>MAUS</b> BLICK</span>
        <span><b>RAD</b> ZOOM</span>
        <span><b>LEER</b> ZEICHEN</span>
        <span><b>R</b> NACHHALL</span>
      </div>

      <TouchControls inputState={inputState} />

      <footer className="game-footer">
        <span>Fiktionale Simulation · kein Echtgeld · lokaler Spielstand</span>
        <span><a href="/impressum.html">Impressum</a><a href="/datenschutz.html">Datenschutz</a></span>
      </footer>
    </div>
  )
}
