import { useMemo, useState } from 'react'
import './App.css'
import WorldScene from './components/WorldScene'
import HUD from './components/HUD'
import DialoguePanel from './components/DialoguePanel'
import {
  applyDecision,
  clampStats,
  createNpcReply,
  getDecisionConsequence,
  getOpeningMessage,
  getRandomScenario,
  scenarios,
} from './services/fakeAI'

const initialStats = {
  happiness: 68,
  energy: 74,
  order: 61,
}

const npcProfiles = {
  'AI Governor': 'Central governance intelligence. Optimizes order, energy and social stability.',
  'Campanella AI': 'Philosopher hologram rebuilt from writings, myth and civic memory.',
  Scientist: 'Models energy, agriculture and systemic risk across the solar network.',
  Citizen: 'Represents daily life inside the luminous residential rings.',
  Rebel: 'Challenges algorithmic rule and demands political agency.',
  Ecologist: 'Protects the living balance between city, food, water and energy.',
  'Energy Minister': 'Guardian of heliostatic towers, batteries and public power rights.',
  'Tourist AI Guide': 'Civic guide for travelers arriving from intelligent ports.',
}

function App() {
  const [stats, setStats] = useState(initialStats)
  const [scenario, setScenario] = useState(scenarios[0])
  const [consequence, setConsequence] = useState(getOpeningMessage())
  const [selectedNpc, setSelectedNpc] = useState(null)
  const [signalLog, setSignalLog] = useState([
    'Entering Calabria 2100. Solar city mesh synchronized.',
    'Campanella archive awake below central plaza.',
  ])

  const cityState = useMemo(() => {
    const average = Math.round((stats.happiness + stats.energy + stats.order) / 3)
    if (average >= 75) return 'Luminous equilibrium'
    if (average >= 55) return 'Fragile stability'
    return 'Systemic crisis'
  }, [stats])

  function pushLog(entry) {
    setSignalLog((current) => [entry, ...current].slice(0, 5))
  }

  function handleDecision(decision) {
    const nextStats = clampStats(applyDecision(stats, decision))
    const nextScenario = getRandomScenario(scenario.id)
    const nextConsequence = getDecisionConsequence(decision, nextStats)

    setStats(nextStats)
    setScenario(nextScenario)
    setConsequence(nextConsequence)
    pushLog(`Decision executed: ${decision.label}`)
  }

  function handleNpcSelect(npcName) {
    const reply = createNpcReply(npcName, scenario, stats)
    const nextStats = clampStats({
      happiness: stats.happiness + reply.statShift.happiness,
      energy: stats.energy + reply.statShift.energy,
      order: stats.order + reply.statShift.order,
    })

    setSelectedNpc({
      name: npcName,
      profile: npcProfiles[npcName],
      message: reply.text,
      tone: reply.tone,
    })
    setStats(nextStats)
    setConsequence(reply.consequence)
    pushLog(`${npcName} opened dialogue channel.`)
  }

  function handleTerminalActivate() {
    const nextScenario = getRandomScenario(scenario.id)
    setScenario(nextScenario)
    setConsequence(`Terminale solare attivato. Nuovo dilemma emerso: ${nextScenario.title}.`)
    pushLog('AI terminal generated new political scenario.')
  }

  function handleWorldEvent(event) {
    pushLog(event)
  }

  return (
    <main className="simulator-shell">
      <WorldScene
        activeNpc={selectedNpc?.name}
        onNpcSelect={handleNpcSelect}
        onTerminalActivate={handleTerminalActivate}
        onWorldEvent={handleWorldEvent}
        stats={stats}
      />

      <HUD
        cityState={cityState}
        consequence={consequence}
        onDecision={handleDecision}
        scenario={scenario}
        signalLog={signalLog}
        stats={stats}
      />

      {selectedNpc && (
        <DialoguePanel npc={selectedNpc} onClose={() => setSelectedNpc(null)} />
      )}
    </main>
  )
}

export default App
