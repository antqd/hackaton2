import assert from "node:assert/strict";
import test from "node:test";
import { initialStats, npcs, scenarios } from "../src/aiData.js";
import {
  applyChoice,
  applyDecision,
  buildNpcMessages,
  generateNpcReply,
  getRandomEvent
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
      { happiness: 95, energy: 4, order: 50 },
      { happiness: 20, energy: -10, order: 4 }
    ),
    { happiness: 100, energy: 0, order: 54 }
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
  assert.deepEqual(result.stats, { happiness: 43, energy: 60, order: 82 });
  assert.equal(result.npc.id, "citizen-worker");
});

test("getRandomEvent prioritizes low energy events", () => {
  const event = getRandomEvent({ happiness: 60, energy: 20, order: 70 }, () => 0);
  assert.equal(event.type, "energy");
});

test("buildNpcMessages creates OpenAI-style messages", () => {
  const messages = buildNpcMessages(
    "ai-governante",
    "Cosa facciamo?",
    initialStats,
    { scenarioTitle: "Crisi energetica" }
  );

  assert.equal(messages[0].role, "system");
  assert.equal(messages[1].role, "user");
  assert.match(messages[0].content, /Crisi energetica/);
  assert.match(messages[0].content, /felicita 55\/100/);
});

test("generateNpcReply works without OpenAI key", async () => {
  const result = await generateNpcReply({
    npcId: "tommaso-campanella",
    message: "Come governiamo?",
    stats: initialStats,
    openAiApiKey: ""
  });

  assert.equal(result.provider, "local");
  assert.ok(result.reply.length > 20);
});
