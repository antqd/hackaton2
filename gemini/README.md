# Citta del Sole AI Simulator - Gemini NPC Service

Questa cartella contiene il servizio di integrazione con Gemini API per generare risposte dinamiche degli NPC nella demo React/Vite.

Il file principale e:

```txt
geminiService.js
```

## Obiettivo

Il servizio espone una funzione:

```js
generateNpcResponse({ npc, scenario, userMessage, stats })
```

La funzione genera una risposta in italiano per un NPC, rispettando queste regole:

- parla nel personaggio dell'NPC
- cita lo scenario attuale
- considera felicita, energia e ordine
- restituisce massimo 5 righe
- non modifica mai le statistiche
- usa un fallback locale se Gemini non risponde

## Installazione

Dal progetto frontend:

```bash
cd Calabria2100/frontend
npm install @google/genai
```

## Variabili ambiente

Creare un file `.env` dentro `Calabria2100/frontend`:

```env
VITE_GEMINI_API_KEY=la_tua_api_key_gemini
VITE_GEMINI_MODEL=gemini-2.5-flash
```

`VITE_GEMINI_MODEL` e opzionale. Se non viene impostato, il servizio usa:

```txt
gemini-2.5-flash
```

## Esempio di utilizzo in App.jsx

Da `Calabria2100/frontend/src/App.jsx`:

```jsx
import { useState } from "react";
import { generateNpcResponse } from "../../GEMINI/geminiService.js";

function App() {
  const [npcResponse, setNpcResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleAskNpc() {
    setIsLoading(true);

    const response = await generateNpcResponse({
      npc: {
        nome: "Elena",
        ruolo: "custode del quartiere solare",
        personalita: "prudente, empatica, concreta",
      },
      scenario: "Piazza Centrale dopo un blackout energetico",
      userMessage: "Come stanno reagendo i cittadini?",
      stats: {
        felicita: 62,
        energia: 38,
        ordine: 71,
      },
    });

    setNpcResponse(response);
    setIsLoading(false);
  }

  return (
    <main>
      <button type="button" onClick={handleAskNpc} disabled={isLoading}>
        {isLoading ? "Generazione..." : "Chiedi all'NPC"}
      </button>

      {npcResponse && <p>{npcResponse}</p>}
    </main>
  );
}

export default App;
```

## Struttura input

### npc

Puo essere una stringa:

```js
npc: "Elena"
```

Oppure un oggetto:

```js
npc: {
  nome: "Elena",
  ruolo: "custode del quartiere solare",
  personalita: "prudente, empatica, concreta",
}
```

Il servizio supporta anche chiavi in inglese come `name`, `role`, `personality`, `description` e `style`.

### scenario

Puo essere una stringa:

```js
scenario: "Piazza Centrale dopo un blackout energetico"
```

Oppure un oggetto con campi come:

```js
scenario: {
  nome: "Blackout energetico",
  descrizione: "La citta deve gestire un calo improvviso di energia.",
}
```

### stats

Le statistiche vengono solo lette, mai modificate:

```js
stats: {
  felicita: 62,
  energia: 38,
  ordine: 71,
}
```

Il servizio supporta anche:

```js
stats: {
  happiness: 62,
  energy: 38,
  order: 71,
}
```

## Fallback

Se Gemini non funziona, per esempio per API key mancante, errore di rete o risposta vuota, la funzione restituisce una risposta predefinita in italiano.

Il fallback include:

- nome dell'NPC
- scenario attuale
- felicita
- energia
- ordine

## Nota importante per Vite

Il servizio si trova fuori da `frontend/src`, quindi l'import:

```js
import { generateNpcResponse } from "../../GEMINI/geminiService.js";
```

potrebbe richiedere una configurazione Vite se il dev server blocca gli import fuori dalla root del frontend.

Per una demo hackathon si puo mantenere questa struttura. In una versione production-ready e consigliabile spostare la chiamata Gemini su backend, per evitare di esporre la API key nel browser.

