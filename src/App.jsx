import { lazy, Suspense, useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react'
import useVoicePlayer from './audio/useVoicePlayer.js'
import GameInterface from './components/GameInterface.jsx'
import Modal from './components/Modal.jsx'
import OpeningFilm from './components/OpeningFilm.jsx'
import { CART_STANCES, CONNECTION_CHOICES, WORLD_START } from './game/canon.js'
import { clearRun, loadRun, saveRun } from './game/save.js'
import { BUILD_GOALS, formatEuro, nextBuildGoal, totalWealth } from './game/economy.js'
import { loadSettings, saveSettings } from './game/settings.js'
import { createRun, runReducer } from './game/state.js'

const CART_AFTERMATH = {
  help_directly: 'Der Wagen steht wieder gerade. Der Arbeiter nickt, bevor beide weitergehen.',
  organize: 'Der Kioskbesitzer kommt mit raus. Hilfe kann auch organisiert werden.',
  wait: 'Du bleibst erreichbar. Nach einem Moment findet der Wagen zurück in die Spur.',
  continue_kindly: 'Du gehst weiter. Hinter dir rollt der Wagen wieder. Niemand stellt dir eine Rechnung.',
  silence: 'Du schaust hin, ohne den Moment an dich zu reißen. Der Hafen bewegt sich weiter.',
}

const RealtimeWorld = lazy(() => import('./components/RealtimeWorld.jsx'))

const CINEMATIC_STYLE = {
  wake_mattress: 'scope',
  donkey_connection_greeting: 'open',
  hallway_threshold: 'soft',
  cart_edge_situation: 'open',
  station_direction: 'scope',
  signalwerk_arrival: 'soft',
}

function ChoiceList({ choices, onChoose }) {
  return (
    <div className="choice-list">
      {choices.map((choice) => (
        <button key={choice.id} onClick={() => onChoose(choice)}>
          <span>{choice.icon ?? choice.key}</span>
          <p><b>{choice.label}</b><small>{choice.copy ?? choice.aftermath}</small></p>
        </button>
      ))}
    </div>
  )
}

function SettingRange({ label, copy, value, onChange }) {
  return (
    <label className="settings-range">
      <span><b>{label}</b><small>{copy}</small></span>
      <output>{Math.round(value * 100)}%</output>
      <input aria-label={label} type="range" min="0" max="1" step="0.05" value={value} onChange={(event) => onChange(Number(event.target.value))} />
    </label>
  )
}

export default function App() {
  const [run, dispatch] = useReducer(runReducer, undefined, () => loadRun(createRun()))
  const [modal, setModal] = useState(null)
  const [opening, setOpening] = useState(() => run.phase === 'mattress')
  const [cinematic, setCinematic] = useState(false)
  const [waking, setWaking] = useState(false)
  const [prompt, setPrompt] = useState(null)
  const [ready, setReady] = useState(false)
  const [position, setPosition] = useState(run.player ?? WORLD_START)
  const [interactionPulse, setInteractionPulse] = useState(null)
  const [settings, setSettings] = useState(loadSettings)
  const inputState = useRef({ x: 0, y: 0, sprint: false })
  const interactionSerial = useRef(0)
  const interactionTimer = useRef(0)
  const positionTimer = useRef(0)
  const voice = useVoicePlayer(settings.audio)

  const paused = opening || cinematic || waking || run.phase !== 'free' || Boolean(modal)
  const filmEvents = useMemo(() => run.events.filter((event) => event.isRunFilmEligible), [run.events])
  const wealth = totalWealth(run.economy)
  const buildGoal = nextBuildGoal(wealth)
  const cinematicStyle = opening || waking ? 'scope' : CINEMATIC_STYLE[filmEvents.at(-1)?.moment] ?? 'open'

  const chooseConnection = useCallback(async (choice) => {
    dispatch({ type: 'CONNECTION_RESPONSE', choice: choice.id, aftermath: choice.aftermath })
    setModal(null)
    voice.playWorldCue('connection')
    if (choice.id === 'morning') {
      await voice.play('de.room.connection.morning.353l.01')
      await voice.play('de.room.connection.morning.lotte.01')
    } else if (choice.id === 'signals') {
      await voice.play('de.room.connection.signals.353l.01')
      await voice.play('de.room.connection.signals.lotte.01')
    } else {
      await voice.play('de.room.connection.silence.lotte.01')
    }
  }, [voice.play, voice.playWorldCue])

  const chooseCart = useCallback((choice) => {
    dispatch({ type: 'CART_STANCE', stance: choice.id, aftermath: CART_AFTERMATH[choice.id] })
    setModal(null)
    voice.playWorldCue('cart')
  }, [voice.playWorldCue])

  useEffect(() => saveRun(run), [run])
  useEffect(() => { saveSettings(settings) }, [settings])

  useEffect(() => {
    voice.setAmbienceZone(position.location)
  }, [position.location, voice.setAmbienceZone])

  useEffect(() => () => {
    window.clearTimeout(positionTimer.current)
    window.clearTimeout(interactionTimer.current)
  }, [])

  useEffect(() => {
    if (!cinematic) return undefined
    const timer = window.setTimeout(() => setCinematic(false), 8000)
    return () => window.clearTimeout(timer)
  }, [cinematic])

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === 'Escape') { setModal(null); setCinematic(false) }
      if (modal === 'connection') {
        const choice = CONNECTION_CHOICES.find((item) => item.key.toLowerCase() === event.key.toLowerCase())
        if (choice) chooseConnection(choice)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [modal])

  const handleInteract = useCallback((action) => {
    const worldAction = action.split(':')[0]
    if (!action.endsWith(':silence') && ['connection', 'door', 'cart'].includes(worldAction)) {
      interactionSerial.current += 1
      setInteractionPulse({ id: worldAction, serial: interactionSerial.current })
      window.clearTimeout(interactionTimer.current)
      interactionTimer.current = window.setTimeout(() => setInteractionPulse(null), 1450)
    }
    if (action === 'film') {
      setModal(null)
      setCinematic((value) => !value)
      return
    }
    if (action === 'memory' || action === 'character' || action === 'economy' || action === 'settings' || action === 'reset') {
      setModal(action)
      return
    }

    if (action.endsWith(':silence')) {
      const target = action.split(':')[0]
      if (target === 'connection') chooseConnection(CONNECTION_CHOICES.find((choice) => choice.id === 'silence'))
      else if (target === 'cart') chooseCart(CART_STANCES.find((choice) => choice.id === 'silence'))
      else if (target === 'station') dispatch({ type: 'VISIT_STATION', stance: 'silence' })
      else if (target === 'signalwerk') dispatch({ type: 'VISIT_SIGNALWERK', stance: 'silence' })
      else dispatch({ type: 'SET_LAST_LINE', line: 'Du bleibst noch einen Moment. Die Tür läuft nicht weg.' })
      return
    }

    if (action === 'voice-toggle') {
      voice.toggle()
      return
    }
    if (action === 'voice-replay') {
      voice.replay()
      return
    }

    if (action === 'connection') {
      setModal('connection')
      voice.play('de.room.connection.lotte.01')
    }
    if (action === 'door') {
      dispatch({ type: 'OPEN_DOOR' })
      voice.playWorldCue('door')
      voice.play('de.hallway.threshold.353l.01')
    }
    if (action === 'cart') {
      setModal('cart')
      voice.play('de.harbor.cart.353l.01')
    }
    if (action === 'station') {
      setModal('station')
      voice.playWorldCue('station')
      voice.play('de.station.platform.announcement.01')
    }
    if (action === 'signalwerk') {
      setModal('signalwerk')
      voice.playWorldCue('signalwerk')
      voice.play('de.signalwerk.lotte.01')
    }
  }, [chooseCart, chooseConnection, voice.play, voice.playWorldCue, voice.replay, voice.toggle])

  const handleWorldReady = useCallback(() => setReady(true), [])
  const handlePosition = useCallback((next) => {
    setPosition(next)
    window.clearTimeout(positionTimer.current)
    positionTimer.current = window.setTimeout(() => dispatch({ type: 'SAVE_POSITION', position: next }), 420)
  }, [])

  function resetRun() {
    voice.stop()
    clearRun()
    dispatch({ type: 'RESET' })
    setModal(null)
    setPrompt(null)
    setPosition({ ...WORLD_START })
    window.location.reload()
  }

  async function startWake({ canPlayAudio = false } = {}) {
    if (canPlayAudio) await voice.unlock()
    setWaking(true)
    window.setTimeout(() => voice.play('de.room.wake.353l.01'), 620)
  }

  function finishOpening() {
    setOpening(false)
  }

  const finishWake = useCallback(() => {
    if (run.phase === 'mattress') dispatch({ type: 'MORNING_CHOICE', choice: 'stand' })
    setWaking(false)
  }, [run.phase])

  return (
    <main className={`app${ready ? ' app--ready' : ''}${opening || cinematic || waking ? ` app--cinematic app--cinematic-${cinematicStyle}` : ''}${settings.highContrast ? ' app--high-contrast' : ''} app--captions-${settings.subtitleSize}${settings.reducedMotion ? ' app--reduced-motion' : ''}`}>
      <Suspense fallback={null}>
        <RealtimeWorld
          run={run}
          paused={paused}
          wakeSequence={waking}
          cinematicMode={opening || cinematic}
          reducedMotion={settings.reducedMotion}
          initialPosition={run.player}
          inputState={inputState}
          interactionPulse={interactionPulse}
          onWakeComplete={finishWake}
          onInteract={handleInteract}
          onPrompt={setPrompt}
          onPosition={handlePosition}
          onReady={handleWorldReady}
          onFootstep={voice.playFootstep}
          cameraSensitivity={settings.cameraSensitivity}
          renderQuality={settings.renderQuality}
          voiceState={voice.voiceState}
          voiceActive={voice.active}
        />
      </Suspense>

      {!ready && <div className="world-loader"><span>ISSO<span>.TV</span></span><small>STRAMMBURG WIRD GELADEN</small></div>}

      {opening ? (
        <OpeningFilm onTransitionStart={startWake} onFinish={finishOpening} onSoundEnabled={voice.unlock} reducedMotion={settings.reducedMotion} />
      ) : (
        <GameInterface run={run} position={position} prompt={prompt} voice={voice} settings={settings} inputState={inputState} cinematic={cinematic} onAction={handleInteract} />
      )}

      {modal === 'connection' && (
        <Modal title="Donkey-Connection" kicker="LOTTE / VERBINDUNG AKTIV" onClose={() => setModal(null)}>
          <div className="dialog-line">
            <span className="dialog-avatar">L</span>
            <p>„Ich bin da. Du bestimmst, ob und wie wir anfangen.“</p>
          </div>
          <ChoiceList choices={CONNECTION_CHOICES} onChoose={chooseConnection} />
        </Modal>
      )}

      {modal === 'cart' && (
        <Modal title="Der Wagen kippt." kicker="PIER 17 / KEIN MORALTEST" onClose={() => setModal(null)}>
          <p className="modal-intro">Ein Rad hängt an der Bordsteinkante. Der Arbeiter hält dagegen. Fünf Haltungen, keine versteckte Punktzahl.</p>
          <ChoiceList choices={CART_STANCES} onChoose={chooseCart} />
        </Modal>
      )}

      {modal === 'station' && (
        <Modal title="Gleis 4 / Wiel" kicker="BAHNHOF / RICHTUNG" onClose={() => setModal(null)}>
          <p className="modal-intro">Der Zug nach Wiel fährt in neun Minuten. Ein offener Weg ist noch kein Auftrag.</p>
          <div className="choice-list choice-list--compact">
            <button onClick={() => { dispatch({ type: 'VISIT_STATION', stance: 'wait' }); setModal(null) }}><span>◷</span><p><b>Am Gleis bleiben</b><small>Die Richtung ansehen.</small></p></button>
            <button onClick={() => { dispatch({ type: 'VISIT_STATION', stance: 'continue_kindly' }); setModal(null) }}><span>→</span><p><b>Zurück zum Hafen</b><small>Wiel bleibt im Kopf.</small></p></button>
          </div>
        </Modal>
      )}

      {modal === 'signalwerk' && (
        <Modal title="Signalwerk / HQ1" kicker="EINE IDEE AUF DEM TISCH" onClose={() => setModal(null)}>
          <div className="dialog-line">
            <span className="dialog-avatar">L</span>
            <p>„Ich kann mitdenken. Nicht für dich leben.“</p>
          </div>
          <p className="modal-intro">Im Raum liegt ein Entwurf für EyTonLand. Noch kein Imperium, nur eine Seite Papier und ein brauchbarer nächster Schritt.</p>
          <div className="choice-list choice-list--compact">
            <button onClick={() => { dispatch({ type: 'VISIT_SIGNALWERK', stance: 'ask' }); setModal(null) }}><span>⌁</span><p><b>Gemeinsam ansehen</b><small>Eine Frage nach der anderen.</small></p></button>
            <button onClick={() => { dispatch({ type: 'VISIT_SIGNALWERK', stance: 'silence' }); setModal(null) }}><span>Q</span><p><b>Noch liegen lassen</b><small>Eine Idee darf unfertig bleiben.</small></p></button>
          </div>
        </Modal>
      )}

      {modal === 'memory' && (
        <Modal title="Dein Nachhall" kicker="NUR WAS WIRKLICH GESCHAH" onClose={() => setModal(null)} wide>
          {filmEvents.length === 0 ? (
            <p className="empty-memory">Noch keine Szene gespeichert. Der erste Schritt reicht.</p>
          ) : (
            <ol className="memory-list">
              {filmEvents.map((event, index) => (
                <li key={event.id}><span>{String(index + 1).padStart(2, '0')}</span><p><b>{event.label}</b><small>{event.visibleAftermath}</small></p></li>
              ))}
            </ol>
          )}
          <button className="secondary-action" onClick={() => { setModal(null); setCinematic(true) }}>▶ DEINEN 3D-FILM ANSEHEN</button>
        </Modal>
      )}

      {modal === 'character' && (
        <Modal title="Dein 353L" kicker="CHARAKTER / MASTER-LOOK" onClose={() => setModal(null)}>
          <div className="character-profile"><span className="character-profile__mark">353L</span><div><b>Worker Master V5</b><small>Der echte 3D-Master mit Hufen, Rig, Mimik und elf Bewegungsclips.</small></div></div>
          <p className="modal-intro">Ein Spiel, ein 353L, eine zusammenhängende Welt. Kleidung und persönliche Looks kommen später über echte 3D-Outfit-Slots.</p>
          <p className="modal-note">Keine getrennten Spielmodi und keine aufgeklebten Attrappen.</p>
        </Modal>
      )}

      {modal === 'economy' && (
        <Modal title={`Nächstes großes Ziel: ${buildGoal.label}`} kicker="ISSO.TV / AUFBAU" onClose={() => setModal(null)} wide>
          <div className="economy-alert"><b>START: ARM. PUNKT.</b><span>Neu in Strammburg · leerer Beutel · offene Stadt</span></div>
          <div className="economy-summary">
            <div><span>BARGELD</span><b>{formatEuro(run.economy.cash)}</b><small>was 353L gerade ausgeben kann</small></div>
            <div><span>BESITZ</span><b>{formatEuro(run.economy.assets)}</b><small>erspielte Dinge und Projekte</small></div>
            <div><span>GESAMT</span><b>{formatEuro(wealth)}</b><small>dein sichtbarer Aufbau</small></div>
          </div>
          <div className="goal-meter" aria-label={`${buildGoal.label}: ${Math.min(100, wealth / buildGoal.amount * 100).toFixed(1)} Prozent`}>
            <span style={{ width: `${Math.min(100, wealth / buildGoal.amount * 100)}%` }} />
          </div>
          <ol className="build-goals" aria-label="Aufbauziele">{BUILD_GOALS.map((goal) => <li key={goal.id} className={wealth >= goal.amount ? 'is-complete' : goal.id === buildGoal.id ? 'is-current' : ''}><span>{wealth >= goal.amount ? '✓' : '◇'}</span><b>{goal.label}</b><small>{formatEuro(goal.amount)}</small></li>)}</ol>
          <p className="economy-note">Jobs, Projekte, Handel und Entscheidungen füllen den Beutel. Was 353L gewinnt, muss in Strammburg tatsächlich erspielt werden.</p>
        </Modal>
      )}

      {modal === 'settings' && (
        <Modal title="Optionen" kicker="BLICK / BILD / LOKAL" onClose={() => setModal(null)}>
          <div className="settings-list">
            <div className="settings-camera">
              <span><b>↔ Kameratempo</b><small>Wie schnell sich dein Blick mit der Maus dreht.</small></span>
              <output>{Math.round(settings.cameraSensitivity * 100)}%</output>
              <div className="settings-camera__control">
                <button
                  type="button"
                  aria-label="Kameratempo langsamer"
                  onClick={() => setSettings((current) => ({ ...current, cameraSensitivity: Math.max(0.35, current.cameraSensitivity - 0.05) }))}
                >−</button>
                <input
                  aria-label="Kameratempo"
                  type="range"
                  min="0.35"
                  max="1.4"
                  step="0.05"
                  value={settings.cameraSensitivity}
                  onChange={(event) => setSettings((current) => ({ ...current, cameraSensitivity: Number(event.target.value) }))}
                />
                <button
                  type="button"
                  aria-label="Kameratempo schneller"
                  onClick={() => setSettings((current) => ({ ...current, cameraSensitivity: Math.min(1.4, current.cameraSensitivity + 0.05) }))}
                >+</button>
              </div>
            </div>
            <fieldset>
              <legend><b>◇ Grafikmodus</b><small>Auto passt die Auflösung während des Spiels an.</small></legend>
              <div className="settings-options">
                {[
                  ['auto', '◎ AUTO', 'passt sich an'],
                  ['high', '◆ HOCH', 'schärferes Bild'],
                  ['efficient', '◌ SPARSAM', 'ruhiger auf älteren PCs'],
                ].map(([id, label, copy]) => (
                  <button
                    key={id}
                    type="button"
                    className={settings.renderQuality === id ? 'is-active' : ''}
                    onClick={() => setSettings((current) => ({ ...current, renderQuality: id }))}
                  >
                    <b>{label}</b><small>{copy}</small>
                  </button>
                ))}
              </div>
            </fieldset>
            <fieldset>
              <legend><b>◖ Tonmischung</b><small>Stimme, Welt und Effekte bleiben getrennt regelbar.</small></legend>
              <div className="settings-audio">
                {[
                  ['master', 'Gesamt', 'Lautstärke des ganzen Spiels'],
                  ['voice', 'Stimmen', '353L, Lotte und Durchsagen'],
                  ['ambience', 'Atmosphäre', 'Regen, Räume und Hafen'],
                  ['effects', 'Effekte', 'Hufe, Türen und Signale'],
                ].map(([id, label, copy]) => (
                  <SettingRange key={id} label={label} copy={copy} value={settings.audio[id]} onChange={(value) => setSettings((current) => ({ ...current, audio: { ...current.audio, [id]: value } }))} />
                ))}
              </div>
            </fieldset>
            <fieldset>
              <legend><b>◇ Lesbarkeit & Bewegung</b><small>Alle wichtigen Inhalte funktionieren auch ohne Ton und Zeitdruck.</small></legend>
              <div className="settings-options settings-options--two">
                <button type="button" className={settings.subtitles ? 'is-active' : ''} aria-pressed={settings.subtitles} onClick={() => setSettings((current) => ({ ...current, subtitles: !current.subtitles }))}><b>CC UNTERTITEL</b><small>{settings.subtitles ? 'eingeschaltet' : 'ausgeschaltet'}</small></button>
                <button type="button" className={settings.highContrast ? 'is-active' : ''} aria-pressed={settings.highContrast} onClick={() => setSettings((current) => ({ ...current, highContrast: !current.highContrast }))}><b>◐ KONTRAST</b><small>{settings.highContrast ? 'verstärkt' : 'standard'}</small></button>
                <button type="button" className={settings.reducedMotion ? 'is-active' : ''} aria-pressed={settings.reducedMotion} onClick={() => setSettings((current) => ({ ...current, reducedMotion: !current.reducedMotion }))}><b>≈ RUHIGE KAMERA</b><small>{settings.reducedMotion ? 'aktiv' : 'filmisch'}</small></button>
              </div>
              <div className="settings-options settings-options--three">
                {['small', 'medium', 'large'].map((size) => <button key={size} type="button" className={settings.subtitleSize === size ? 'is-active' : ''} onClick={() => setSettings((current) => ({ ...current, subtitleSize: size }))}><b>{size === 'small' ? 'KLEIN' : size === 'large' ? 'GROSS' : 'MITTEL'}</b><small>Untertitel</small></button>)}
              </div>
            </fieldset>
          </div>
        </Modal>
      )}

      {modal === 'reset' && (
        <Modal title="Diesen Morgen neu beginnen?" kicker="V3 / LOKALER SPIELSTAND" onClose={() => setModal(null)}>
          <p className="modal-intro">Nur dein lokaler V3-Nachhall wird gelöscht. Danach liegst du wieder auf der Matratze.</p>
          <div className="confirm-row">
            <button className="secondary-action" onClick={() => setModal(null)}>ABBRECHEN</button>
            <button className="danger-action" onClick={resetRun}>MORGEN ZURÜCKSETZEN</button>
          </div>
        </Modal>
      )}
    </main>
  )
}
