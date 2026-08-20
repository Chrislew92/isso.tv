import { useEffect, useId, useRef } from 'react'

export default function Modal({ title, kicker, children, onClose, wide = false }) {
  const titleId = useId()
  const card = useRef(null)
  const close = useRef(onClose)
  close.current = onClose

  useEffect(() => {
    const previous = document.activeElement
    const focusable = () => [...card.current.querySelectorAll('button, a, input, select, textarea, [tabindex]:not([tabindex="-1"])')]
    ;(focusable()[0] ?? card.current)?.focus()
    const trap = (event) => {
      if (event.key === 'Escape') close.current?.()
      if (event.key !== 'Tab') return
      const items = focusable()
      if (!items.length) return
      const first = items[0]
      const last = items.at(-1)
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus() }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus() }
    }
    document.addEventListener('keydown', trap)
    return () => {
      document.removeEventListener('keydown', trap)
      previous?.focus?.()
    }
  }, [])

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={(event) => {
      if (event.target === event.currentTarget && onClose) onClose()
    }}>
      <section ref={card} className={`modal-card${wide ? ' modal-card--wide' : ''}`} role="dialog" aria-modal="true" aria-labelledby={titleId} tabIndex="-1">
        <header>
          <div>
            {kicker && <p className="eyebrow">{kicker}</p>}
            <h2 id={titleId}>{title}</h2>
          </div>
          {onClose && <button className="icon-button" onClick={onClose} aria-label="Fenster schließen">×</button>}
        </header>
        {children}
      </section>
    </div>
  )
}
