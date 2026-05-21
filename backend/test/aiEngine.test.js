import assert from "node:assert/strict";
import test from "node:test";
import { initialStats, npcs, scenarios } from "../src/aiData.js";
import {
  applyChoice,
  applyDecision,
  buildNpcMessages,
  generateDynamicEvent,
  generateNpcReply,
  getRandomEvent,
  validateGeneratedEvent
} from "../src/aiEngine.js";

test("NPC data supports chat personas", () => {
  assert.equal(npcs.length, 5);

  for (const npc of npcs) {
    assert.ok(npc.id);
    assert.ok(npc.name);
    assert.ok(npc.role);
    assert.ok(npc.personality);
    assert.ok(npc.systemPrompt);
    assert.ok(npc.exampleResponse);
  }
});

test("scenarios expose two playable choices", () => {
  assert.equal(scenarios.length, 4);

  for (const scenario of scenarios) {
    assert.equal(scenario.choices.length, 2);

    for (const choice of scenario.choices) {
      assert.equal(typeof choice.effects.happiness, "number");
      assert.equal(typeof choice.effects.energy, "number");
      assert.equal(typeof choice.effects.order, "number");
    }
  }
});

test("applyChoice sums effects and clamps values", () => {
  assert.deepEqual(
    applyChoice(
      { happiness: 95, energy: 4, order: 50, freedom: 96, knowledge: 30, trust: 5 },
      { happiness: 20, energy: -10, order: 4, freedom: 10, knowledge: 8, trust: -12 }
    ),
    { happiness: 100, energy: 0, order: 54, freedom: 100, knowledge: 38, trust: 0 }
  );
});

test("applyDecision returns updated stats and narrative metadata", () => {
  const result = applyDecision(
    initialStats,
    "security-vs-freedom",
    "temporary-surveillance"
  );

  assert.equal(result.decision.id, "security-vs-freedom");
  assert.equal(result.choice.id, "temporary-surveillance");
  assert.deepEqual(result.stats, {
    happiness: 43,
    energy: 60,
    order: 82,
    freedom: 43,
    knowledge: 58,
    trust: 43
  });
  assert.equal(result.npc.id, "citizen-worker");
  assert.match(result.narrative, /Mira/);
});

test("getRandomEvent prioritizes low energy events", () => {
  const event = getRandomEvent({ happiness: 60, energy: 20, order: 70 }, () => 0);
  assert.equal(event.type, "energy");
});

test("buildNpcMessages creates OpenAI-style messages", () => {
  const messages = buildNpcMessages(
    "ai-governante",
    "Cosa facciamo?",
    { happiness: 55, energy: 60, order: 60 },
    { scenarioTitle: "Crisi energetica" },
    [
      { role: "user", content: "Prima abbiamo protetto la privacy." },
      { role: "assistant", content: "La fiducia civica e salita." },
      { role: "system", content: "Questo non deve passare." }
    ]
  );

  assert.equal(messages[0].role, "system");
  assert.equal(messages[1].role, "user");
  assert.equal(messages[2].role, "assistant");
  assert.equal(messages[3].role, "user");
  assert.match(messages[0].content, /Crisi energetica/);
  assert.match(messages[0].content, /felicita 55\/100/);
  assert.match(messages[0].content, /liberta 55\/100/);
  assert.match(messages[0].content, /fiducia 55\/100/);
  assert.doesNotMatch(messages[0].content, /undefined/);
  assert.equal(messages.some((message) => message.content.includes("Questo non deve passare")), false);
});

test("generateNpcReply works without OpenAI key", async () => {
  const result = await generateNpcReply({
    npcId: "tommaso-campanella",
    message: "Come governiamo?",
    stats: initialStats,
    history: [{ role: "user", content: "Ho promesso ascolto pubblico." }],
    openAiApiKey: ""
  });

  assert.equal(result.provider, "local");
  assert.ok(result.reply.length > 20);
  assert.match(result.reply, /Ricordo/);
});

test("generateDynamicEvent creates playable local events from city pressure", async () => {
  const result = await generateDynamicEvent({
    stats: { ...initialStats, energy: 18 },
    history: [{ role: "user", content: "Abbiamo dato priorita agli ospedali." }],
    openAiApiKey: ""
  });

  assert.equal(result.provider, "local");
  assert.equal(result.event.type, "energy");
  assert.equal(result.event.choices.length, 2);
  assert.equal(typeof result.event.choices[0].effects.trust, "number");
});

test("validateGeneratedEvent rejects malformed AI event payloads", () => {
  assert.equal(validateGeneratedEvent({ title: "Evento senza scelte" }), null);

  const valid = validateGeneratedEvent({
    id: "test-event",
    type: "knowledge",
    title: "Archivio pubblico instabile",
    description: "Le mura digitali chiedono una rettifica pubblica.",
    npcId: "tommaso-campanella",
    choices: [
      {
        id: "publish",
        text: "Pubblica tutto",
        consequence: "La citta discute apertamente.",
        effects: { happiness: 4, energy: -1, order: -3, freedom: 5, knowledge: 8, trust: 5 }
      },
      {
        id: "filter",
        text: "Filtra prima",
        consequence: "La citta resta calma.",
        effects: { happiness: -3, energy: 0, order: 6, freedom: -6, knowledge: -2, trust: -4 }
      }
    ]
  });

  assert.equal(valid.id, "test-event");
  assert.equal(valid.choices.length, 2);
});
