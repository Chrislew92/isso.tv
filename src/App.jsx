import { lazy, Suspense, useCallback, useEffect, useMemo, useReducer, useState } from 'react'
import useVoicePlayer from './audio/useVoicePlayer.js'
import GameInterface from './components/GameInterface.jsx'
import Modal from './components/Modal.jsx'
import OpeningFilm from './components/OpeningFilm.jsx'
import { CART_STANCES, CONNECTION_CHOICES } from './game/canon.js'
import { clearRun, loadRun, saveRun } from './game/save.js'
import { createRun, runReducer } from './game/state.js'

const CART_AFTERMATH = {
  help_directly: 'Der Wagen steht wieder gerade. Der Arbeiter nickt, bevor beide weitergehen.',
  organize: 'Der Kioskbesitzer kommt mit raus. Hilfe kann auch organisiert werden.',
  wait: 'Du bleibst erreichbar. Nach einem Moment findet der Wagen zurück in die Spur.',
  continue_kindly: 'Du gehst weiter. Hinter dir rollt der Wagen wieder. Niemand stellt dir eine Rechnung.',
  silence: 'Du schaust hin, ohne den Moment an dich zu reißen. Der Hafen bewegt sich weiter.',
}

const RealtimeWorld = lazy(() => import('./components/RealtimeWorld.jsx'))

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

export default function App() {
  const [run, dispatch] = useReducer(runReducer, undefined, () => loadRun(createRun()))
  const [modal, setModal] = useState(null)
  const [opening, setOpening] = useState(true)
  const [prompt, setPrompt] = useState(null)
  const [ready, setReady] = useState(false)
  const [position, setPosition] = useState({ x: -0.8, z: -0.7, location: 'room' })
  const voice = useVoicePlayer()

  const paused = opening || run.phase !== 'free' || Boolean(modal)
  const filmEvents = useMemo(() => run.events.filter((event) => event.isRunFilmEligible), [run.events])

  const chooseConnection = useCallback(async (choice) => {
    dispatch({ type: 'CONNECTION_RESPONSE', choice: choice.id, aftermath: choice.aftermath })
    setModal(null)
    if (choice.id === 'morning') {
      await voice.play('de.room.connection.morning.353l.01')
      await voice.play('de.room.connection.morning.lotte.01')
    } else if (choice.id === 'signals') {
      await voice.play('de.room.connection.signals.353l.01')
      await voice.play('de.room.connection.signals.lotte.01')
    } else {
      await voice.play('de.room.connection.silence.lotte.01')
    }
  }, [voice.play])

  const chooseCart = useCallback((choice) => {
    dispatch({ type: 'CART_STANCE', stance: choice.id, aftermath: CART_AFTERMATH[choice.id] })
    setModal(null)
  }, [])

  useEffect(() => saveRun(run), [run])

  useEffect(() => {
    voice.setAmbienceZone(position.location)
  }, [position.location, voice.setAmbienceZone])

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === 'Escape') setModal(null)
      if (modal === 'connection') {
        const choice = CONNECTION_CHOICES.find((item) => item.key.toLowerCase() === event.key.toLowerCase())
        if (choice) chooseConnection(choice)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [modal])

  const handleInteract = useCallback((action) => {
    if (action === 'film' || action === 'memory' || action === 'reset') {
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
      voice.play('de.hallway.threshold.353l.01')
    }
    if (action === 'cart') {
      setModal('cart')
      voice.play('de.harbor.cart.353l.01')
    }
    if (action === 'station') {
      setModal('station')
      voice.play('de.station.platform.announcement.01')
    }
    if (action === 'signalwerk') {
      setModal('signalwerk')
      voice.play('de.signalwerk.lotte.01')
    }
  }, [chooseCart, chooseConnection, voice.play, voice.replay, voice.toggle])

  const handleWorldReady = useCallback(() => setReady(true), [])

  function resetRun() {
    voice.stop()
    clearRun()
    dispatch({ type: 'RESET' })
    setModal(null)
    setPrompt(null)
    setPosition({ x: -0.8, z: -0.7, location: 'room' })
    window.location.reload()
  }

  async function finishOpening({ canPlayAudio = false } = {}) {
    if (canPlayAudio) await voice.unlock()
    if (run.phase === 'mattress') dispatch({ type: 'MORNING_CHOICE', choice: 'stand' })
    setOpening(false)
    window.setTimeout(() => voice.play('de.room.wake.353l.01'), 620)
  }

  return (
    <main className={`app${ready ? ' app--ready' : ''}`}>
      <Suspense fallback={null}>
        <RealtimeWorld
          run={run}
          paused={paused}
          onInteract={handleInteract}
          onPrompt={setPrompt}
          onPosition={setPosition}
          onReady={handleWorldReady}
          onFootstep={voice.playFootstep}
          voiceState={voice.voiceState}
          voiceActive={voice.active}
        />
      </Suspense>

      {!ready && <div className="world-loader"><span>ISSO<span>.TV</span></span><small>STRAMMBURG WIRD GELADEN</small></div>}

      {opening ? (
        <OpeningFilm onFinish={finishOpening} onSoundEnabled={voice.unlock} />
      ) : (
        <GameInterface run={run} position={position} prompt={prompt} voice={voice} onAction={handleInteract} />
      )}

      {modal === 'film' && (
        <Modal title="Der Morgen fängt an." kicker="BILDFILM / PROLOG" onClose={() => setModal(null)} wide>
          <div className="film-frame">
            <video controls poster="/media/prolog-matratze.png" preload="metadata">
              <source src="/media/prolog-matratzenmorgen.mp4" type="video/mp4" />
              <track src="/media/prolog-de.srt" kind="subtitles" srcLang="de" label="Deutsch" default />
            </video>
          </div>
          <p className="modal-note">Der Film zeigt die Stimmung. Danach steuerst du denselben Morgen selbst.</p>
        </Modal>
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
          <button className="secondary-action" onClick={() => setModal('film')}>▶ PROLOG NOCH EINMAL SEHEN</button>
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
