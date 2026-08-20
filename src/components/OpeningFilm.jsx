import { useCallback, useEffect, useState } from 'react'

export default function OpeningFilm({ onTransitionStart, onFinish, onSoundEnabled, reducedMotion = false }) {
  const [muted, setMuted] = useState(true)
  const [exiting, setExiting] = useState(false)

  function enableSound() {
    setMuted(false)
    onSoundEnabled?.()
  }

  const beginExit = useCallback(() => {
    if (exiting) return
    setExiting(true)
    onTransitionStart?.({ canPlayAudio: !muted })
    window.setTimeout(() => onFinish?.(), reducedMotion ? 80 : 1050)
  }, [exiting, muted, onFinish, onTransitionStart, reducedMotion])

  useEffect(() => {
    const timer = window.setTimeout(beginExit, 7200)
    return () => window.clearTimeout(timer)
  }, [beginExit])

  return (
    <section className={`opening-film${exiting ? ' opening-film--exiting' : ''}`} aria-label="ISSO.TV Prolog in derselben 3D-Spielwelt">
      <div className="opening-film__grade" />
      <header>
        <span className="logo-mark">ISSO<span>.TV</span></span>
        <small>EIN FILM WIRD ZUM SPIEL</small>
      </header>
      <div className="opening-film__title">
        <p className="eyebrow">PROLOG / STRAMMBURG / 2033</p>
        <h1>Der Morgen<br />fängt an.</h1>
        <p>Danach übernimmst du 353L genau hier.</p>
      </div>
      <div className="opening-film__actions">
        {muted && <button onClick={enableSound}>◖ TON EINSCHALTEN</button>}
        <button onClick={beginExit}>FILM ÜBERSPRINGEN →</button>
      </div>
    </section>
  )
}
