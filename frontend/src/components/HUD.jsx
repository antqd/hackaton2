const statsConfig = [
  { key: 'happiness', label: 'Felicita', color: '#62c6ff' },
  { key: 'energy', label: 'Energia', color: '#f7c968' },
  { key: 'order', label: 'Ordine', color: '#7df3c6' },
]

function HUD({ cityState, consequence, onDecision, scenario, signalLog, stats }) {
  return (
    <section className="hud-root">
      <div className="hud-scanline" />

      <header className="hud-title">
        <p>Protocollo Campanella 2100</p>
        <h1>Citta del Sole AI</h1>
        <span>Click city to enter. WASD walk, mouse look, Shift sprint. Approach glowing citizens and hidden terminals.</span>
      </header>

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

      <article className="scenario-panel">
        <p className="panel-kicker">Live ethical dilemma</p>
        <h2>{scenario.title}</h2>
        <p>{scenario.description}</p>
        <div className="consequence">{consequence}</div>
        <div className="decision-grid">
          {scenario.decisions.map((decision) => (
            <button key={decision.id} onClick={() => onDecision(decision)} type="button">
              <strong>{decision.label}</strong>
              <span>{decision.description}</span>
            </button>
          ))}
        </div>
      </article>

      <aside className="log-panel">
        <p className="panel-kicker">City signal log</p>
        <ul>
          {signalLog.map((entry) => (
            <li key={entry}>{entry}</li>
          ))}
        </ul>
      </aside>

      <div className="interaction-hint">WASD move • mouse look • Shift sprint • click NPCs / terminals</div>
    </section>
  )
}

export default HUD
