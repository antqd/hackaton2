import { dynamicEvents, initialStats, npcs, scenarios } from "./aiData.js";

export function applyChoice(currentStats, choiceEffects) {
  return {
    happiness: clampStat((currentStats.happiness ?? 0) + (choiceEffects.happiness ?? 0)),
    energy: clampStat((currentStats.energy ?? 0) + (choiceEffects.energy ?? 0)),
    order: clampStat((currentStats.order ?? 0) + (choiceEffects.order ?? 0))
  };
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
    npc: getNpcById(decision.npcId)
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

export function buildNpcMessages(npcId, userMessage, cityStats = initialStats, context = {}) {
  const npc = getNpcById(npcId);
  const contextLine = context.scenarioTitle
    ? `Scenario attuale: ${context.scenarioTitle}.`
    : "Scenario attuale: conversazione libera.";

  return [
    {
      role: "system",
      content: `${npc.systemPrompt}\n\n${contextLine}\nStato citta: felicita ${cityStats.happiness}/100, energia ${cityStats.energy}/100, ordine ${cityStats.order}/100.\nMantieni coerenza narrativa con Calabria2100, citta ideale futuristica ispirata alla Citta del Sole.`
    },
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
  openAiApiKey = process.env.OPENAI_API_KEY,
  model = process.env.OPENAI_MODEL ?? "gpt-4o-mini"
}) {
  const messages = buildNpcMessages(npcId, message, stats, context);

  if (!openAiApiKey) {
    return {
      npc: getNpcById(npcId),
      reply: generateLocalNpcReply(npcId, stats, context),
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
      reply: reply || generateLocalNpcReply(npcId, stats, context),
      provider: "openai",
      messages
    };
  } catch (error) {
    return {
      npc: getNpcById(npcId),
      reply: generateLocalNpcReply(npcId, stats, context),
      provider: "local-fallback",
      error: error.message,
      messages
    };
  }
}

export function generateLocalNpcReply(npcId, stats = initialStats, context = {}) {
  const npc = getNpcById(npcId);
  const pressure = getMainPressure(stats);
  const scenarioPrefix = context.scenarioTitle ? `Su "${context.scenarioTitle}", ` : "";

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
    }
  };

  return `${scenarioPrefix}${replies[npc.id]?.[pressure] ?? npc.exampleResponse}`;
}

function clampStat(value) {
  return Math.max(0, Math.min(100, value));
}

function getMainPressure(stats) {
  return [
    ["happiness", stats.happiness],
    ["energy", stats.energy],
    ["order", stats.order]
  ].sort((a, b) => a[1] - b[1])[0][0];
}
