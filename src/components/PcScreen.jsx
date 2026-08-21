import { useEffect, useState } from 'react'

/*
 * DE-BIOS — der Rechner von 353L in Strammburg.
 *
 * Der Monitor strahlt ISSO.TV aus (der Schriftzug aus dem ersten isso.tv).
 * Setzt sich 353L hin, bootet DE-BIOS: der komplette Desktop laeuft im iframe
 * (public/os/index.html?boot=desktop) - haushalt.exe, NETZWERK, STROHHALM usw.
 * Der Bildschirm leuchtet cyan und bringt Farbe in die graue Welt.
 */
export default function PcScreen({ onClose }) {
  const [phase, setPhase] = useState('boot') // boot -> desktop
  useEffect(() => {
    const t = setTimeout(() => setPhase('desktop'), 1400)
    const onKey = (e) => { if (e.key === 'Escape') onClose?.() }
    window.addEventListener('keydown', onKey)
    return () => { clearTimeout(t); window.removeEventListener('keydown', onKey) }
  }, [onClose])

  return (
    <div className="pc-screen" role="dialog" aria-modal="true" aria-label="DE-BIOS">
      <div className="pc-screen__glow" aria-hidden="true" />
      <div className="pc-screen__bezel">
        <div className="pc-screen__monitor">
          <div className={`pc-boot${phase === 'desktop' ? ' pc-boot--gone' : ''}`} aria-hidden={phase === 'desktop'}>
            <span className="pc-boot__mark">ISSO.TV</span>
            <span className="pc-boot__sub">DE-BIOS // WIRD GESTARTET</span>
          </div>
          {phase === 'desktop' && (
            <iframe
              className="pc-frame"
              title="DE-BIOS"
              src="/os/index.html?boot=desktop"
              allow="autoplay"
            />
          )}
        </div>
      </div>
      <button className="pc-screen__leave" onClick={onClose}>◀ Aufstehen · weg vom Rechner</button>
    </div>
  )
}
