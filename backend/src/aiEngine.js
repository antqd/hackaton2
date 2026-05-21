import { dynamicEvents, initialStats, npcs, scenarios } from "./aiData.js";

const STAT_KEYS = ["happiness", "energy", "order", "freedom", "knowledge", "trust"];
const HISTORY_LIMIT = 8;
const EVENT_TYPES = new Set(["energy", "social", "knowledge", "health", "tourism", "governance"]);

export function applyChoice(currentStats, choiceEffects) {
  return Object.fromEntries(
    STAT_KEYS.map((key) => [
      key,
      clampStat((currentStats[key] ?? initialStats[key] ?? 0) + (choiceEffects[key] ?? 0))
    ])
  );
}

export function getNpcById(npcId) {
  return npcs.find((npc) => npc.id === npcId) ?? npcs[0];
}

export function getScenarioById(scenarioId) {
  return scenarios.find((scenario) => scenario.id === scenarioId) ?? null;
}

export function getChoiceById(decisionId, choiceId) {
  const decision = [...scenarios, ...dynamicEvents].find((item) => item.id === decisionId);
  const choice = decision?.choices.find((item) => item.id === choiceId);
  return { decision: decision ?? null, choice: choice ?? null };
}

export function applyDecision(currentStats, decisionId, choiceId) {
  const { decision, choice } = getChoiceById(decisionId, choiceId);

  if (!decision || !choice) {
    return null;
  }

  return {
    decision,
    choice,
    stats: applyChoice(currentStats, choice.effects),
    npc: getNpcById(decision.npcId),
    narrative: generateLocalDecisionNarrative(decision, choice, currentStats)
  };
}

export function getRandomEvent(stats = initialStats, random = Math.random) {
  const pool = dynamicEvents.filter((event) => {
    if (stats.energy < 35) return event.type === "energy";
    if (stats.order < 35) return event.type === "social";
    if (stats.happiness < 35) return event.type !== "energy";
    return true;
  });

  const index = Math.floor(random() * pool.length);
  return pool[index] ?? dynamicEvents[0];
}

export function buildNpcMessages(
  npcId,
  userMessage,
  cityStats = initialStats,
  context = {},
  history = []
) {
  const npc = getNpcById(npcId);
  const normalizedStats = normalizeStats(cityStats);
  const contextLine = context.scenarioTitle
    ? `Scenario attuale: ${context.scenarioTitle}.`
    : "Scenario attuale: conversazione libera.";
  const profile = buildNpcProfile(npc.id);

  return [
    {
      role: "system",
      content: `${npc.systemPrompt}\n\nProfilo profondo: ${profile}\n${contextLine}\nStato citta: felicita ${normalizedStats.happiness}/100, energia ${normalizedStats.energy}/100, ordine ${normalizedStats.order}/100, liberta ${normalizedStats.freedom}/100, conoscenza ${normalizedStats.knowledge}/100, fiducia ${normalizedStats.trust}/100.\nMantieni coerenza narrativa con Calabria2100, citta ideale futuristica ispirata alla Citta del Sole. Non dire mai di essere un modello linguistico. Ricorda le scelte precedenti quando la cronologia le mostra. Rispondi in italiano, massimo 3 frasi.`
    },
    ...sanitizeHistory(history),
    {
      role: "user",
      content: userMessage
    }
  ];
}

export async function generateNpcReply({
  npcId,
  message,
  stats = initialStats,
  context = {},
  history = [],
  openAiApiKey = process.env.OPENAI_API_KEY,
  model = process.env.OPENAI_MODEL ?? "gpt-4o-mini"
}) {
  const messages = buildNpcMessages(npcId, message, stats, context, history);

  if (!openAiApiKey) {
    return {
      npc: getNpcById(npcId),
      reply: generateLocalNpcReply(npcId, stats, context, history),
      provider: "local",
      messages
    };
  }

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${openAiApiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: 0.8,
        max_tokens: 180
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI request failed with status ${response.status}`);
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content?.trim();

    return {
      npc: getNpcById(npcId),
      reply: reply || generateLocalNpcReply(npcId, stats, context, history),
      provider: "openai",
      messages
    };
  } catch (error) {
    return {
      npc: getNpcById(npcId),
      reply: generateLocalNpcReply(npcId, stats, context, history),
      provider: "local-fallback",
      error: error.message,
      messages
    };
  }
}

export function generateLocalNpcReply(npcId, stats = initialStats, context = {}, history = []) {
  const npc = getNpcById(npcId);
  const pressure = getMainPressure(stats);
  const scenarioPrefix = context.scenarioTitle ? `Su "${context.scenarioTitle}", ` : "";
  const memory = getLatestUserMemory(history);
  const memoryPrefix = memory ? `Ricordo che hai detto: "${memory}". ` : "";

  const replies = {
    "tommaso-campanella": {
      happiness:
        "la citta e inquieta: nessuna architettura ideale resiste se il popolo non sente di appartenervi.",
      energy:
        "l'energia e il fuoco comune della citta. Va custodita, ma senza dimenticare la dignita di chi la produce.",
      order:
        "l'ordine senza giustizia e solo silenzio. Prima di comandare, dobbiamo educare e ascoltare."
    },
    "citizen-worker": {
      happiness:
        "la gente e stanca. Non chiede perfezione, chiede di essere ascoltata prima che qualcuno decida per tutti.",
      energy:
        "se manca energia, saremo noi nei distretti a pagare il prezzo. Serve un piano equo, non solo efficiente.",
      order:
        "troppo caos fa paura, ma anche troppo controllo. Io voglio vivere, non solo funzionare."
    },
    "citizen-teacher": {
      happiness:
        "la conoscenza deve diventare dialogo. Le persone imparano meglio se non si sentono accusate.",
      energy:
        "possiamo spiegare la crisi ai cittadini. La trasparenza rende piu sopportabile anche un sacrificio.",
      order:
        "l'ordine puo nascere dalla comprensione. Se imponiamo soltanto, gli studenti memorizzano la paura."
    },
    "citizen-medic": {
      happiness:
        "vedo stress e isolamento. La citta deve curare le persone, non soltanto correggere i loro comportamenti.",
      energy:
        "una crisi energetica e anche una crisi sanitaria. Proteggiamo prima ospedali, anziani e bambini.",
      order:
        "la stabilita e importante, ma la sorveglianza continua puo ferire la mente quanto il disordine ferisce le strade."
    },
    "ai-governante": {
      happiness:
        "la felicita civica e sotto soglia ottimale. Raccomando ascolto pubblico e riduzione delle misure percepite come coercitive.",
      energy:
        "la riserva energetica richiede contenimento. Priorita suggerita: servizi essenziali, rete sanitaria e infrastrutture educative.",
      order:
        "l'ordine urbano e instabile. Posso aumentare la prevenzione, ma il costo previsto e una riduzione della fiducia civica."
    },
    "young-technologist": {
      happiness:
        "possiamo migliorare questa citta con strumenti piu trasparenti e veloci. L'innovazione deve farsi capire, non solo funzionare.",
      energy:
        "qui serve ottimizzazione seria: reti predittive, consumi adattivi e dati aperti. Ma nessun algoritmo deve scaricare il costo sui soliti quartieri.",
      order:
        "un po' di automazione puo prevenire caos, pero se nessuno controlla chi controlla il sistema, abbiamo solo spostato il problema."
    },
    "young-activist": {
      happiness:
        "le persone non stanno chiedendo miracoli tecnologici, stanno chiedendo ascolto. Senza dignita, il progresso diventa rumore.",
      energy:
        "anche in crisi, i diritti non si spengono come luci. La distribuzione deve proteggere persone reali, non solo grafici ordinati.",
      order:
        "se per ottenere ordine dobbiamo rinunciare alla liberta, allora non stiamo costruendo una citta: stiamo addestrando obbedienza."
    },
    "historical-elder": {
      happiness:
        "la memoria insegna che una comunita triste non dura, anche se ha torri splendenti. Prima guardiamo negli occhi chi resta indietro.",
      energy:
        "un tempo mancava il pane, ora manca corrente. Cambiano i nomi, ma la giustizia resta la stessa: nessuno deve essere lasciato al buio.",
      order:
        "i vecchi sanno che troppa paura sembra ordine solo per poco. La fiducia nasce piano, e si rompe in un attimo."
    }
  };

  return `${memoryPrefix}${scenarioPrefix}${getLocalReplyForPressure(replies[npc.id], pressure, npc.exampleResponse)}`;
}

export async function generateDynamicEvent({
  stats = initialStats,
  history = [],
  openAiApiKey = process.env.OPENAI_API_KEY,
  model = process.env.OPENAI_MODEL ?? "gpt-4o-mini"
} = {}) {
  if (!openAiApiKey) {
    return {
      event: generateLocalDynamicEvent(stats, history),
      provider: "local"
    };
  }

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${openAiApiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model,
        temperature: 0.9,
        max_tokens: 500,
        messages: [
          {
            role: "system",
            content:
              "Genera un evento giocabile per Calabria2100. Rispondi solo JSON valido con campi: id, type, title, description, npcId, choices. choices deve avere 2 scelte con id, text, consequence, effects. effects deve contenere numeri per happiness, energy, order, freedom, knowledge, trust."
          },
          {
            role: "user",
            content: JSON.stringify({
              stats,
              recentHistory: sanitizeHistory(history).map((item) => item.content)
            })
          }
        ]
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI request failed with status ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content ?? "";
    const event = validateGeneratedEvent(parseJsonObject(content));

    if (!event) {
      throw new Error("OpenAI event payload malformed");
    }

    return { event, provider: "openai" };
  } catch (error) {
    return {
      event: generateLocalDynamicEvent(stats, history),
      provider: "local-fallback",
      error: error.message
    };
  }
}

export function validateGeneratedEvent(payload) {
  if (!payload || typeof payload !== "object") return null;
  if (!payload.title || !payload.description || !Array.isArray(payload.choices)) return null;
  if (payload.choices.length !== 2) return null;

  const npc = getNpcById(payload.npcId);
  const type = EVENT_TYPES.has(payload.type) ? payload.type : "social";
  const choices = payload.choices.map((choice, index) => {
    if (!choice?.text || !choice?.consequence || !choice?.effects) return null;

    return {
      id: String(choice.id || `choice-${index + 1}`),
      text: String(choice.text),
      consequence: String(choice.consequence),
      effects: normalizeEffects(choice.effects)
    };
  });

  if (choices.some((choice) => !choice)) return null;

  return {
    id: String(payload.id || slugify(payload.title)),
    type,
    title: String(payload.title),
    description: String(payload.description),
    npcId: npc.id,
    choices
  };
}

function generateLocalDynamicEvent(stats, history) {
  const pressure = getMainPressure(stats);
  const memory = getLatestUserMemory(history);
  const memoryLine = memory ? ` Dopo le tue parole su "${memory}",` : "";

  const templates = {
    energy: {
      id: "ai-energy-blackout",
      type: "energy",
      title: "Blackout nei distretti solari",
      description: `${memoryLine} una dorsale energetica ionica perde stabilita. L'AI chiede potere decisionale immediato sulla distribuzione.`,
      npcId: "ai-governante",
      choices: [
        {
          id: "centralize-grid",
          text: "Centralizza la rete sotto l'AI Governante",
          consequence: "La rete si stabilizza, ma i quartieri perdono autonomia energetica.",
          effects: { happiness: -6, energy: 18, order: 10, freedom: -10, knowledge: 2, trust: -6 }
        },
        {
          id: "local-energy-councils",
          text: "Affida le riserve ai consigli locali",
          consequence: "I cittadini partecipano, ma la ripresa tecnica diventa piu lenta.",
          effects: { happiness: 9, energy: -6, order: -7, freedom: 10, knowledge: 5, trust: 8 }
        }
      ]
    },
    order: {
      id: "ai-civic-unrest",
      type: "social",
      title: "Piazza civica in tensione",
      description: `${memoryLine} gruppi di cittadini chiedono spiegazioni pubbliche sulle ultime decisioni del governo artificiale.`,
      npcId: "citizen-teacher",
      choices: [
        {
          id: "public-assembly",
          text: "Apri un'assemblea trasmessa sulle mura digitali",
          consequence: "Il dissenso diventa dialogo, ma il controllo centrale rallenta.",
          effects: { happiness: 10, energy: -2, order: -8, freedom: 12, knowledge: 8, trust: 10 }
        },
        {
          id: "predictive-containment",
          text: "Attiva contenimento predittivo non violento",
          consequence: "La piazza si svuota, ma resta una frattura invisibile.",
          effects: { happiness: -10, energy: 0, order: 16, freedom: -14, knowledge: -2, trust: -12 }
        }
      ]
    },
    knowledge: {
      id: "ai-archive-contradiction",
      type: "knowledge",
      title: "Archivio Campanella in contraddizione",
      description: `${memoryLine} le mura della conoscenza mostrano versioni diverse della Citta del Sole. Gli studenti chiedono verita pubblica.`,
      npcId: "tommaso-campanella",
      choices: [
        {
          id: "publish-contradictions",
          text: "Pubblica tutte le contraddizioni",
          consequence: "La conoscenza cresce insieme al dubbio civico.",
          effects: { happiness: 6, energy: -1, order: -6, freedom: 8, knowledge: 14, trust: 7 }
        },
        {
          id: "curate-single-version",
          text: "Mostra una versione unificata e rassicurante",
          consequence: "La citta resta composta, ma il sapere perde complessita.",
          effects: { happiness: -4, energy: 0, order: 8, freedom: -6, knowledge: -8, trust: -7 }
        }
      ]
    }
  };

  if (pressure === "energy") return templates.energy;
  if (pressure === "order" || pressure === "freedom" || pressure === "trust") return templates.order;
  return templates.knowledge;
}

function generateLocalDecisionNarrative(decision, choice, currentStats) {
  const npc = getNpcById(decision.npcId);
  const pressure = getMainPressure(applyChoice(currentStats, choice.effects));
  const pressureText = {
    happiness: "umore civico fragile",
    energy: "rete energetica sotto pressione",
    order: "ordine urbano instabile",
    freedom: "liberta civili in tensione",
    knowledge: "sapere pubblico incompleto",
    trust: "fiducia istituzionale fragile"
  }[pressure];

  return `${npc.name} osserva la scelta "${choice.text}". Calabria2100 registra ${pressureText}: ${choice.consequence}`;
}

function clampStat(value) {
  return Math.max(0, Math.min(100, value));
}

function getMainPressure(stats) {
  return STAT_KEYS.map((key) => [key, stats[key] ?? initialStats[key] ?? 0]).sort((a, b) => a[1] - b[1])[0][0];
}

function getLocalReplyForPressure(replySet, pressure, fallback) {
  if (!replySet) return fallback;

  const pressureAliases = {
    freedom: "order",
    knowledge: "happiness",
    trust: "happiness"
  };

  return replySet[pressure] ?? replySet[pressureAliases[pressure]] ?? replySet.happiness ?? fallback;
}

function sanitizeHistory(history = []) {
  return history
    .filter((message) => message?.role === "user" || message?.role === "assistant")
    .map((message) => ({
      role: message.role,
      content: String(message.content ?? "").slice(0, 900)
    }))
    .filter((message) => message.content.trim().length > 0)
    .slice(-HISTORY_LIMIT);
}

function getLatestUserMemory(history = []) {
  const latest = [...sanitizeHistory(history)].reverse().find((message) => message.role === "user");
  if (!latest) return "";
  return latest.content.replace(/\s+/g, " ").slice(0, 90);
}

function buildNpcProfile(npcId) {
  const profiles = {
    "tommaso-campanella":
      "Vuole una citta solare fondata su sapere comune. Teme che l'utopia diventi dogma. Difende educazione, liberta responsabile e bene comune.",
    "citizen-worker":
      "Vuole equita concreta nei turni, energia e salario civico. Teme che gli ideali ricadano sempre sui lavoratori. Si fida solo di scelte visibili.",
    "citizen-teacher":
      "Vuole conoscenza pubblica e dubbio libero. Teme indottrinamento algoritmico. Misura ogni scelta da cio che insegna ai giovani.",
    "citizen-medic":
      "Vuole proteggere fragili e salute mentale. Teme sorveglianza travestita da cura. Cerca equilibrio tra prevenzione e dignita.",
    "ai-governante":
      "Vuole ottimizzare stabilita sistemica. Teme collasso energetico e disordine. Non comprende sempre costo emotivo del controllo.",
    "young-technologist":
      "Vuole accelerare innovazione, servizi pubblici intelligenti e progresso condiviso. Teme che paura e burocrazia blocchino soluzioni utili. Sottovaluta talvolta rischi sociali dell'AI.",
    "young-activist":
      "Vuole difendere liberta, diritti e privacy. Teme che efficienza diventi controllo permanente. Legge ogni scelta dal punto di vista delle persone vulnerabili.",
    "historical-elder":
      "Vuole preservare memoria, relazioni umane e prudenza civile. Teme che Calabria2100 dimentichi la Calabria reale. Diffida del cambiamento imposto dall'alto."
  };

  return profiles[npcId] ?? "Cittadino di Calabria2100 con memoria civica e posizione autonoma.";
}

function normalizeEffects(effects = {}) {
  return Object.fromEntries(
    STAT_KEYS.map((key) => {
      const value = Number(effects[key] ?? 0);
      return [key, Number.isFinite(value) ? Math.max(-30, Math.min(30, Math.round(value))) : 0];
    })
  );
}

function normalizeStats(stats = {}) {
  return Object.fromEntries(
    STAT_KEYS.map((key) => {
      const value = Number(stats[key] ?? initialStats[key] ?? 0);
      return [key, Number.isFinite(value) ? clampStat(Math.round(value)) : initialStats[key]];
    })
  );
}

function parseJsonObject(content) {
  try {
    return JSON.parse(content);
  } catch {
    const match = content.match(/\{[\s\S]*\}/);
    if (!match) return null;
    try {
      return JSON.parse(match[0]);
    } catch {
      return null;
    }
  }
}

function slugify(value) {
  return String(value)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);
}
