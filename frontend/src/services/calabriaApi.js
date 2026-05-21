const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8787'

export async function fetchBackendState() {
  const data = await api('/api/state')

  return {
    ...data,
    scenarios: data.scenarios.map(fromBackendScenario),
  }
}

export async function applyBackendChoice(stats, scenarioId, choiceId) {
  const result = await api('/api/choice', {
    method: 'POST',
    body: JSON.stringify({
      decisionId: scenarioId,
      choiceId,
      stats,
    }),
  })

  return {
    ...result,
    decision: fromBackendScenario(result.decision),
    choice: fromBackendChoice(result.choice),
  }
}

export async function fetchNpcReply({ npcId, npcName, stats, scenario, history }) {
  return api('/api/chat', {
    method: 'POST',
    body: JSON.stringify({
      npcId,
      message: `Parlami del dilemma attuale come ${npcName}.`,
      stats,
      context: { scenarioTitle: scenario?.title },
      history,
    }),
  })
}

function fromBackendScenario(scenario) {
  return {
    id: scenario.id,
    title: scenario.title,
    description: scenario.description,
    npcId: scenario.npcId,
    decisions: scenario.choices.map(fromBackendChoice),
  }
}

function fromBackendChoice(choice) {
  return {
    id: choice.id,
    label: choice.text,
    description: choice.consequence,
    shift: choice.effects,
  }
}

async function api(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })

  if (!response.ok) {
    throw new Error(`API error ${response.status}`)
  }

  return response.json()
}
