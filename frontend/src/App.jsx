import { useEffect, useMemo, useState } from 'react'
import './App.css'
import Experience from './components/Experience'
import HUD from './components/HUD'
import DialoguePanel from './components/DialoguePanel'
import {
  applyBackendChoice,
  fetchBackendState,
  fetchNpcReply,
} from './services/calabriaApi'
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
  freedom: 55,
  knowledge: 55,
  trust: 55,
}

const npcProfiles = {
  'AI Governante': 'Sistema centrale della citta: freddo, logico, preciso. Massimizza ordine ed efficienza.',
  'Young Activist': 'Studentessa critica e attivista. Difende liberta, diritti e umanita.',
  'Historical Elder': 'Memoria storica della Calabria. Saggio, nostalgico, diffidente verso il controllo AI.',
  'Tommaso Campanella': 'Filosofo utopico della Citta del Sole. Difende conoscenza, armonia sociale e bene comune.',
  'Young Technologist': 'Giovane sviluppatore pro-AI. Curioso, pragmatico, ottimista.',
  'AI Governor': 'Central governance intelligence. Optimizes order, energy and social stability.',
  'Campanella AI': 'Philosopher hologram rebuilt from writings, myth and civic memory.',
  Scientist: 'Models energy, agriculture and systemic risk across the solar network.',
  Citizen: 'Represents daily life inside the luminous residential rings.',
  Rebel: 'Challenges algorithmic rule and demands political agency.',
  Ecologist: 'Protects the living balance between city, food, water and energy.',
  'Energy Minister': 'Guardian of heliostatic towers, batteries and public power rights.',
  'Tourist AI Guide': 'Civic guide for travelers arriving from intelligent ports.',
  Simona: 'Cittadina futuristica di Calabria 2100. Guida locale tra porto, piazza solare e archivio AI.',
}

function App() {
  const [stats, setStats] = useState(initialStats)
  const [scenario, setScenario] = useState(scenarios[0])
  const [availableScenarios, setAvailableScenarios] = useState(scenarios)
  const [backendOnline, setBackendOnline] = useState(false)
  const [historyByNpc, setHistoryByNpc] = useState({})
  const [consequence, setConsequence] = useState(getOpeningMessage())
  const [selectedNpc, setSelectedNpc] = useState(null)
  const [playerPosition, setPlayerPosition] = useState({ x: -16, y: 2, z: -11 })
  const [signalLog, setSignalLog] = useState([
    'Entering Calabria 2100. Solar city mesh synchronized.',
    'Campanella archive awake below central plaza.',
  ])

  useEffect(() => {
    document.body.classList.toggle('ui-cursor', Boolean(selectedNpc))
    return () => document.body.classList.remove('ui-cursor')
  }, [selectedNpc])

  useEffect(() => {
    fetchBackendState()
      .then((data) => {
        setStats(data.stats)
        setAvailableScenarios(data.scenarios)
        setScenario(data.scenarios[0])
        setBackendOnline(true)
        pushLog('Backend AI connected. NPC memory active.')
      })
      .catch(() => {
        setBackendOnline(false)
        pushLog('Backend offline. Local simulation fallback active.')
      })
  }, [])

  const cityState = useMemo(() => {
    const average = Math.round((stats.happiness + stats.energy + stats.order) / 3)
    if (average >= 75) return 'Luminous equilibrium'
    if (average >= 55) return 'Fragile stability'
    return 'Systemic crisis'
  }, [stats])

  function pushLog(entry) {
    setSignalLog((current) => [entry, ...current].slice(0, 5))
  }

  async function handleDecision(decision) {
    if (backendOnline) {
      try {
        const result = await applyBackendChoice(stats, scenario.id, decision.id)
        const nextScenario = getNextScenario(result.decision.id)

        setStats(result.stats)
        setScenario(nextScenario)
        setConsequence(result.narrative || result.choice.description)
        pushLog(`Backend decision executed: ${decision.label}`)
        return
      } catch (error) {
        setBackendOnline(false)
        pushLog(`Backend decision fallback: ${error.message}`)
      }
    }

    const nextStats = clampStats(applyDecision(stats, decision))
    const nextScenario = getRandomScenario(scenario.id)
    const nextConsequence = getDecisionConsequence(decision, nextStats)

    setStats(nextStats)
    setScenario(nextScenario)
    setConsequence(nextConsequence)
    pushLog(`Decision executed: ${decision.label}`)
  }

  async function handleNpcSelect(npc) {
    document.exitPointerLock?.()
    const npcName = npc.name
    const npcId = npc.id
    const history = historyByNpc[npcId] ?? []

    if (backendOnline) {
      try {
        const result = await fetchNpcReply({
          npcId,
          npcName,
          stats,
          scenario,
          history,
        })

        setSelectedNpc({
          id: npcId,
          name: result.npc?.name ?? npcName,
          profile: result.npc?.personality ?? npcProfiles[npcName],
          message: result.reply,
          tone: result.provider,
        })
        setHistoryByNpc((current) => ({
          ...current,
          [npcId]: [
            ...history,
            { role: 'user', content: `Parlami del dilemma attuale come ${npcName}.` },
            { role: 'assistant', content: result.reply },
          ].slice(-8),
        }))
        setConsequence(`${result.npc?.name ?? npcName} ha risposto dal canale AI.`)
        pushLog(`${npcName} opened backend dialogue channel.`)
        return
      } catch (error) {
        setBackendOnline(false)
        pushLog(`Backend NPC fallback: ${error.message}`)
      }
    }

    const reply = createNpcReply(npcName, scenario, stats)
    const nextStats = clampStats({
      happiness: stats.happiness + reply.statShift.happiness,
      energy: stats.energy + reply.statShift.energy,
      order: stats.order + reply.statShift.order,
      freedom: stats.freedom,
      knowledge: stats.knowledge,
      trust: stats.trust,
    })

    setSelectedNpc({
      id: npcId,
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
    const nextScenario = getNextScenario(scenario.id)
    setScenario(nextScenario)
    setConsequence(`Terminale solare attivato. Nuovo dilemma emerso: ${nextScenario.title}.`)
    pushLog('AI terminal generated new political scenario.')
  }

  function handleWorldEvent(event) {
    pushLog(event)
  }

  function getNextScenario(currentId) {
    const available = availableScenarios.filter((item) => item.id !== currentId)
    return available[Math.floor(Math.random() * available.length)] ?? availableScenarios[0]
  }

  return (
    <main className="simulator-shell">
      <Experience
        activeNpc={selectedNpc?.id}
        onNpcSelect={handleNpcSelect}
        onTerminalActivate={handleTerminalActivate}
        onPlayerPosition={setPlayerPosition}
        onWorldEvent={handleWorldEvent}
        stats={stats}
      />

      <HUD
        cityState={cityState}
        consequence={consequence}
        onDecision={handleDecision}
        playerPosition={playerPosition}
        scenario={scenario}
        stats={stats}
      />

      {selectedNpc && (
        <DialoguePanel npc={selectedNpc} onClose={() => setSelectedNpc(null)} />
      )}
    </main>
  )
}

export default App
