export default function Modal({ title, kicker, children, onClose, wide = false }) {
  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={(event) => {
      if (event.target === event.currentTarget && onClose) onClose()
    }}>
      <section className={`modal-card${wide ? ' modal-card--wide' : ''}`} role="dialog" aria-modal="true" aria-label={title}>
        <header>
          <div>
            {kicker && <p className="eyebrow">{kicker}</p>}
            <h2>{title}</h2>
          </div>
          {onClose && <button className="icon-button" onClick={onClose} aria-label="Fenster schließen">×</button>}
        </header>
        {children}
      </section>
    </div>
  )
}
