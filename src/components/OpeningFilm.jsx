import { useEffect, useRef, useState } from 'react'

export default function OpeningFilm({ onFinish }) {
  const videoRef = useRef(null)
  const [muted, setMuted] = useState(true)
  const [started, setStarted] = useState(false)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    video.play().then(() => setStarted(true)).catch(() => setStarted(false))
  }, [])

  function enableSound() {
    const video = videoRef.current
    if (!video) return
    video.muted = false
    setMuted(false)
    video.play().then(() => setStarted(true)).catch(() => {})
  }

  return (
    <section className="opening-film" aria-label="ISSO.TV Prolog">
      <video
        ref={videoRef}
        autoPlay
        muted={muted}
        playsInline
        poster="/media/prolog-matratze.png"
        preload="auto"
        onPlay={() => setStarted(true)}
        onEnded={onFinish}
      >
        <source src="/media/prolog-matratzenmorgen.mp4" type="video/mp4" />
        <track src="/media/prolog-de.srt" kind="subtitles" srcLang="de" label="Deutsch" default />
      </video>
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
        {!started && <button onClick={() => videoRef.current?.play()}>▶ FILM STARTEN</button>}
        <button onClick={onFinish}>FILM ÜBERSPRINGEN →</button>
      </div>
    </section>
  )
}
