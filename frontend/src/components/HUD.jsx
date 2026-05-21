import { useEffect, useState } from 'react'

const statsConfig = [
  { key: 'happiness', label: 'Felicita', color: '#62c6ff' },
  { key: 'energy', label: 'Energia', color: '#f7c968' },
  { key: 'order', label: 'Ordine', color: '#7df3c6' },
]

function HUD({ cityState, consequence, onDecision, playerPosition, scenario, stats }) {
  const [missionOpen, setMissionOpen] = useState(false)

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key.toLowerCase() === 'q') {
        document.exitPointerLock?.()
        setMissionOpen((current) => !current)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <section className="hud-root">
      <div className="hud-scanline" />

      <header className="hud-title">
        <p>Protocollo Campanella 2100</p>
        <h1>Citta del Sole AI</h1>
        <span>Click city to enter first-person. WASD move, mouse look, Shift sprint. Look at an NPC and press E.</span>
      </header>

      <aside className="debug-panel">
        <p className="panel-kicker">Debug position</p>
        <span>X {formatCoord(playerPosition.x)}</span>
        <span>Y {formatCoord(playerPosition.y)}</span>
        <span>Z {formatCoord(playerPosition.z)}</span>
      </aside>

      <aside className="stats-panel">
        <div className="city-state">
          <span>City status</span>
          <strong>{cityState}</strong>
        </div>
        {statsConfig.map((stat) => (
          <div className="stat-line" key={stat.key}>
            <div className="stat-copy">
              <span>{stat.label}</span>
              <strong>{stats[stat.key]}%</strong>
            </div>
            <div className="bar-track">
              <div
                className="bar-fill"
                style={{ '--accent': stat.color, width: `${stats[stat.key]}%` }}
              />
            </div>
          </div>
        ))}
      </aside>

      <article className={`scenario-panel ${missionOpen ? 'open' : 'collapsed'}`}>
        <p className="panel-kicker">Live ethical dilemma</p>
        <div className="mission-head">
          <h2>{scenario.title}</h2>
          <button
            onClick={() => {
              document.exitPointerLock?.()
              setMissionOpen((current) => !current)
            }}
            type="button"
          >
            {missionOpen ? 'Close Q' : 'Open Q'}
          </button>
        </div>
        {missionOpen ? (
          <>
            <p>{scenario.description}</p>
            <div className="consequence">{consequence}</div>
            <div className="decision-grid">
              {scenario.decisions.map((decision) => (
                <button key={decision.id} onClick={() => onDecision(decision)} type="button">
                  <strong>{decision.label}</strong>
                  <span>{decision.description}</span>
                  <DecisionPreview decision={decision} stats={stats} />
                </button>
              ))}
            </div>
          </>
        ) : (
          <p className="mission-collapsed-copy">Press Q to open mission choices.</p>
        )}
      </article>

      <div className="interaction-hint">First-person mode • WASD move • mouse look • Shift sprint • Look at an NPC and press E</div>
    </section>
  )
}

function DecisionPreview({ decision, stats }) {
  return (
    <div className="decision-preview">
      {statsConfig.map((stat) => {
        const nextValue = clamp(stats[stat.key] + decision.shift[stat.key])
        const delta = nextValue - stats[stat.key]

        return (
          <small className={delta >= 0 ? 'positive' : 'negative'} key={stat.key}>
            {stat.label}: {stats[stat.key]} → {nextValue} ({delta >= 0 ? '+' : ''}
            {delta})
          </small>
        )
      })}
    </div>
  )
}

function clamp(value) {
  return Math.max(0, Math.min(100, Math.round(value)))
}

function formatCoord(value) {
  return Number(value ?? 0).toFixed(2)
}

export default HUD
