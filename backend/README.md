# Calabria2100 AI Backend

Backend minimale per il cervello narrativo di Calabria2100.

Gestisce:

- NPC e personalita
- scenari decisionali
- eventi dinamici
- statistiche citta: `happiness`, `energy`, `order`
- chat NPC con API OpenAI se presente `OPENAI_API_KEY`
- fallback locale senza API key, utile per demo hackathon

## Stack

- Node.js >= 20
- zero dipendenze esterne
- server HTTP nativo
- formato moduli ES

## File

```text
backend/
  package.json
  README.md
  src/
    aiData.js      # NPC, scenari, eventi, stats iniziali
    aiEngine.js    # logica scelta, prompt, risposte AI/locali
    server.js      # API HTTP
  test/
    aiEngine.test.js
    server.test.js
```

## Avvio backend

Da root repo:

```bash
cd backend
npm test
npm run dev
```

Server default:

```text
http://localhost:8787
```

## Modalita AI

Senza API key:

```bash
npm run dev
```

Risposte generate localmente da `generateLocalNpcReply()`.

Con OpenAI:

```bash
OPENAI_API_KEY=sk-... npm run dev
```

Variabili opzionali:

```bash
PORT=8787
OPENAI_MODEL=gpt-4o-mini
```

## Collegamento frontend Vite

Nel frontend usare base URL:

```js
const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8787";
```

Consigliato creare `frontend/.env`:

```bash
VITE_API_URL=http://localhost:8787
```

Helper fetch:

```js
async function api(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options
  });

  if (!response.ok) {
    throw new Error(`API error ${response.status}`);
  }

  return response.json();
}
```

## Data model frontend

Stats:

```js
{
  happiness: 55,
  energy: 60,
  order: 60
}
```

NPC:

```js
{
  id: "ai-governante",
  name: "AI Governante",
  role: "Sistema di governo artificiale",
  personality: "...",
  systemPrompt: "...",
  exampleResponse: "..."
}
```

Scenario/evento:

```js
{
  id: "energy-crisis",
  title: "Crisi energetica",
  description: "...",
  npcId: "ai-governante",
  choices: [
    {
      id: "ration-energy",
      text: "Raziona l'energia in modo uguale per tutti",
      consequence: "...",
      effects: { happiness: -10, energy: 26, order: 12 }
    }
  ]
}
```

## Endpoint

### `GET /api/health`

Check server.

Response:

```json
{
  "ok": true,
  "service": "calabria2100-ai-backend",
  "aiProvider": "local"
}
```

### `GET /api/state`

Bootstrap frontend. Usa questo al caricamento app.

Response:

```json
{
  "stats": { "happiness": 55, "energy": 60, "order": 60 },
  "npcs": [],
  "scenarios": [],
  "dynamicEvents": []
}
```

Frontend:

```js
const state = await api("/api/state");
setStats(state.stats);
setNpcs(state.npcs);
setScenarios(state.scenarios);
```

### `GET /api/npcs`

Lista personaggi.

```js
const { npcs } = await api("/api/npcs");
```

### `GET /api/scenarios`

Lista scenari principali.

```js
const { scenarios } = await api("/api/scenarios");
```

### `POST /api/choice`

Applica scelta a stats.

Request:

```json
{
  "decisionId": "energy-crisis",
  "choiceId": "ration-energy",
  "stats": { "happiness": 50, "energy": 50, "order": 50 }
}
```

Response:

```json
{
  "decision": {},
  "choice": {},
  "stats": { "happiness": 40, "energy": 76, "order": 62 },
  "npc": {}
}
```

Frontend:

```js
async function choose(decisionId, choiceId, stats) {
  const result = await api("/api/choice", {
    method: "POST",
    body: JSON.stringify({ decisionId, choiceId, stats })
  });

  setStats(result.stats);
  setLastConsequence(result.choice.consequence);
  return result;
}
```

### `POST /api/event`

Genera evento dinamico in base a stats. Se `energy` bassa, privilegia eventi energia. Se `order` basso, eventi sociali.

Request:

```json
{
  "stats": { "happiness": 55, "energy": 25, "order": 60 }
}
```

Response:

```json
{
  "event": {
    "id": "solar-failure",
    "type": "energy",
    "title": "Guasto ai collettori solari",
    "description": "...",
    "npcId": "citizen-worker",
    "choices": []
  }
}
```

Frontend:

```js
async function generateEvent(stats) {
  const { event } = await api("/api/event", {
    method: "POST",
    body: JSON.stringify({ stats })
  });

  setCurrentScenario(event);
}
```

### `POST /api/chat`

Chat con NPC.

Request:

```json
{
  "npcId": "ai-governante",
  "message": "Come gestiamo la crisi energetica?",
  "stats": { "happiness": 55, "energy": 25, "order": 60 },
  "context": {
    "scenarioTitle": "Crisi energetica"
  }
}
```

Response:

```json
{
  "npc": {},
  "reply": "Su \"Crisi energetica\", la riserva energetica richiede contenimento...",
  "provider": "local",
  "messages": []
}
```

`provider` valori:

- `local`: nessuna API key, fallback locale
- `openai`: risposta OpenAI
- `local-fallback`: OpenAI fallita, fallback locale

Frontend:

```js
async function sendNpcMessage(npcId, message, stats, scenarioTitle) {
  const result = await api("/api/chat", {
    method: "POST",
    body: JSON.stringify({
      npcId,
      message,
      stats,
      context: { scenarioTitle }
    })
  });

  setMessages((items) => [
    ...items,
    { role: "user", content: message },
    { role: "assistant", npcId, content: result.reply }
  ]);

  return result;
}
```

### `POST /api/debug/messages`

Debug prompt OpenAI-style. Utile per vedere cosa mandiamo al modello.

Request:

```json
{
  "npcId": "tommaso-campanella",
  "message": "Cosa significa bene comune?",
  "stats": { "happiness": 55, "energy": 60, "order": 60 },
  "context": { "scenarioTitle": "Sicurezza vs liberta" }
}
```

Response:

```json
{
  "messages": [
    { "role": "system", "content": "..." },
    { "role": "user", "content": "..." }
  ]
}
```

## Flusso frontend consigliato

1. App mount: `GET /api/state`
2. Mostra primo scenario da `scenarios[0]`
3. Utente sceglie opzione: `POST /api/choice`
4. Aggiorna stats con `result.stats`
5. Mostra `result.choice.consequence`
6. Ogni 1-2 turni: `POST /api/event`
7. Chat NPC sempre via `POST /api/chat`

## Esempio React minimo

```jsx
import { useEffect, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8787";

async function api(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options
  });

  if (!response.ok) throw new Error(`API error ${response.status}`);
  return response.json();
}

export function useCalabriaAi() {
  const [stats, setStats] = useState(null);
  const [npcs, setNpcs] = useState([]);
  const [scenarios, setScenarios] = useState([]);

  useEffect(() => {
    api("/api/state").then((data) => {
      setStats(data.stats);
      setNpcs(data.npcs);
      setScenarios(data.scenarios);
    });
  }, []);

  async function applyChoice(decisionId, choiceId) {
    const result = await api("/api/choice", {
      method: "POST",
      body: JSON.stringify({ decisionId, choiceId, stats })
    });
    setStats(result.stats);
    return result;
  }

  async function chat(npcId, message, scenarioTitle) {
    return api("/api/chat", {
      method: "POST",
      body: JSON.stringify({
        npcId,
        message,
        stats,
        context: { scenarioTitle }
      })
    });
  }

  return { stats, npcs, scenarios, applyChoice, chat };
}
```

## Test

```bash
cd backend
npm test
```

Copertura:

- data shape NPC/scenari
- clamp stats `0..100`
- applicazione scelta
- generazione eventi dinamici
- costruzione prompt OpenAI-style
- fallback chat locale
- endpoint HTTP principali

## Note sicurezza

Non mettere `OPENAI_API_KEY` nel frontend.

Per demo rapida:

- frontend chiama backend
- backend legge `OPENAI_API_KEY`
- se key assente, backend risponde comunque con fallback locale
