import { GoogleGenAI } from "@google/genai";

const MODEL = import.meta.env?.VITE_GEMINI_MODEL || "gemini-2.5-flash";
const API_KEY = import.meta.env?.VITE_GEMINI_API_KEY;

let geminiClient;

function getGeminiClient() {
  if (!API_KEY) {
    throw new Error("Missing VITE_GEMINI_API_KEY");
  }

  if (!geminiClient) {
    geminiClient = new GoogleGenAI({ apiKey: API_KEY });
  }

  return geminiClient;
}

function getNpcName(npc) {
  if (typeof npc === "string") return npc;
  return npc?.name || npc?.nome || "NPC";
}

function getNpcDescription(npc) {
  if (!npc || typeof npc === "string") return "abitante della Citta del Sole";

  return [
    npc.role || npc.ruolo,
    npc.personality || npc.personalita,
    npc.description || npc.descrizione,
    npc.style || npc.stile,
  ]
    .filter(Boolean)
    .join(", ");
}

function getScenarioText(scenario) {
  if (typeof scenario === "string") return scenario;

  return (
    scenario?.name ||
    scenario?.nome ||
    scenario?.title ||
    scenario?.titolo ||
    scenario?.description ||
    scenario?.descrizione ||
    "scenario attuale della Citta del Sole"
  );
}

function getStat(stats, keys) {
  const foundKey = keys.find((key) => stats?.[key] !== undefined);
  return foundKey ? stats[foundKey] : "non disponibile";
}

function getReadableStats(stats = {}) {
  return {
    felicita: getStat(stats, ["felicita", "felicit\u00e0", "happiness"]),
    energia: getStat(stats, ["energia", "energy"]),
    ordine: getStat(stats, ["ordine", "order"]),
  };
}

function limitToFiveLines(text) {
  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(0, 5)
    .join("\n");
}

function buildPrompt({ npc, scenario, userMessage, stats }) {
  const npcName = getNpcName(npc);
  const npcDescription = getNpcDescription(npc);
  const scenarioText = getScenarioText(scenario);
  const readableStats = getReadableStats(stats);

  return `
NPC: ${npcName}
Descrizione NPC: ${npcDescription || "nessuna descrizione disponibile"}
Scenario attuale: ${scenarioText}
Statistiche della citta:
- felicita: ${readableStats.felicita}
- energia: ${readableStats.energia}
- ordine: ${readableStats.ordine}
Messaggio del giocatore: ${userMessage || "Il giocatore osserva la situazione."}

Rispondi in italiano come se fossi ${npcName}.
Devi citare lo scenario attuale.
Considera felicita, energia e ordine nel tono della risposta.
Non modificare, non ricalcolare e non restituire nuove statistiche.
Massimo 5 righe.
`.trim();
}

function fallbackNpcResponse({ npc, scenario, stats }) {
  const npcName = getNpcName(npc);
  const scenarioText = getScenarioText(scenario);
  const readableStats = getReadableStats(stats);

  return limitToFiveLines(
    `${npcName}: Nel contesto "${scenarioText}", resto vigile anche se la mia voce digitale oggi vacilla.
Felicita ${readableStats.felicita}, energia ${readableStats.energia}, ordine ${readableStats.ordine}: li tengo presenti prima di parlare.`
  );
}

export async function generateNpcResponse({
  npc,
  scenario,
  userMessage,
  stats,
} = {}) {
  try {
    const ai = getGeminiClient();
    const response = await ai.models.generateContent({
      model: MODEL,
      contents: buildPrompt({ npc, scenario, userMessage, stats }),
      config: {
        systemInstruction:
          "Sei il motore di dialogo di Citta del Sole AI Simulator. Rispondi sempre in italiano, massimo 5 righe, restando nel personaggio dell'NPC. Cita lo scenario attuale, considera felicita, energia e ordine, e non modificare mai le statistiche.",
        temperature: 0.8,
        maxOutputTokens: 180,
      },
    });

    const responseText =
      typeof response.text === "function" ? await response.text() : response.text;
    const cleanText = limitToFiveLines(String(responseText || "").trim());

    return cleanText || fallbackNpcResponse({ npc, scenario, stats });
  } catch (error) {
    console.warn("Gemini NPC response fallback:", error);
    return fallbackNpcResponse({ npc, scenario, stats });
  }
}

export default generateNpcResponse;
