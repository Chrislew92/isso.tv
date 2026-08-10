import { useState } from 'react';

function App() {
  const [booting, setBooting] = useState(true);
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    if (password.toUpperCase() === 'ISSO.TV') {
      setBooting(false);
    } else {
      setError(true);
      setTimeout(() => setError(false), 500);
    }
  };

  if (booting) {
    return (
      <div className="login-screen" style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <div className="cyber-grid"></div>
        <h1 className="text-gradient" style={{ fontSize: '4rem', letterSpacing: '0.2em', textShadow: '0 0 20px var(--neon-pink-glow)' }}>ISSO.TV</h1>
        <p style={{ color: 'var(--neon-cyan)', letterSpacing: '0.4em', marginBottom: '3rem', fontSize: '0.9rem' }}>SYSTEM V2.0 // OFFLINE</p>
        
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center' }}>
          <input 
            type="text" 
            placeholder="ACCESS CODE" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ 
              background: 'rgba(0,0,0,0.5)', 
              border: `1px solid ${error ? 'var(--neon-pink)' : 'var(--border-cyan)'}`, 
              color: 'var(--neon-cyan)', 
              padding: '12px 20px', 
              fontSize: '1.2rem', 
              letterSpacing: '0.3em', 
              textAlign: 'center',
              outline: 'none',
              boxShadow: error ? '0 0 15px var(--neon-pink-glow)' : 'inset 0 0 10px rgba(0,240,255,0.1)',
              transition: 'all 0.3s'
            }} 
          />
          <button type="submit" className="cyber-button" style={{ width: '100%' }}>INITIALIZE</button>
        </form>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div className="cyber-grid"></div>
      
      <header className="glass-panel" style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h2 className="text-gradient" style={{ margin: 0, letterSpacing: '0.1em' }}>ISSO.TV OS</h2>
          <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--neon-cyan)', marginTop: '4px' }}>CONNECTION ESTABLISHED</p>
        </div>
        <button className="cyber-button" onClick={() => setBooting(true)}>DISCONNECT</button>
      </header>

      <main style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', flex: 1 }}>
        
        <section className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <h3 style={{ color: 'var(--neon-cyan)', borderBottom: '1px solid var(--border-cyan)', paddingBottom: '0.5rem', margin: 0 }}>Terminal</h3>
          <div style={{ flex: 1, background: 'rgba(0,0,0,0.5)', border: '1px solid var(--border-glass)', padding: '1rem', fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: 'var(--neon-yellow)' }}>
            <p>&gt; Initializing core systems...</p>
            <p>&gt; Modules loaded: 42</p>
            <p>&gt; System ready.</p>
            <p className="blink" style={{ animation: 'blink 1s step-end infinite' }}>_</p>
          </div>
        </section>

        <section className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <h3 style={{ color: 'var(--neon-pink)', borderBottom: '1px solid var(--neon-pink-glow)', paddingBottom: '0.5rem', margin: 0 }}>Actions</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <button className="cyber-button" style={{ borderColor: 'var(--neon-pink)', color: 'var(--neon-pink)' }}>Execute Protocol Alpha</button>
            <button className="cyber-button">Access Database</button>
            <button className="cyber-button" style={{ opacity: 0.5, cursor: 'not-allowed' }}>Restricted Area</button>
          </div>
        </section>

      </main>

      <footer className="glass-panel" style={{ marginTop: '2rem', padding: '1rem', textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
        ISSO.TV // V2.0 REACT REBUILD // CHRISTOPH LEWANDOWSKI 2026
      </footer>

      <style>{`
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
      `}</style>
    </div>
  );
}

export default App;
