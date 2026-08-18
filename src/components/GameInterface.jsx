import { BUILD, PLACES, formatWorldTime } from '../game/canon.js'
import MiniMap from './MiniMap.jsx'

export default function GameInterface({ run, position, prompt, voice, onAction }) {
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
          <span>REGEN / 9°</span>
        </div>
        <nav aria-label="Spielmenü">
          <button onClick={() => onAction('film')}>▶ FILM</button>
          <button onClick={() => onAction('memory')}>◫ NACHHALL <i>{run.events.length}</i></button>
          <button onClick={() => onAction('voice-toggle')} title="Gesprochene Dialoge ein- oder ausschalten">{voice.enabled ? '◖ STIMME AN' : '○ STIMME AUS'}</button>
          <button onClick={() => onAction('reset')}>↻ RESET</button>
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

      {voice.caption && (
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

      <footer className="game-footer">
        <span>Fiktionale Simulation · kein Echtgeld · lokaler Spielstand</span>
        <span><a href="/impressum.html">Impressum</a><a href="/datenschutz.html">Datenschutz</a></span>
      </footer>
    </div>
  )
}
