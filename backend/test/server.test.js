import assert from "node:assert/strict";
import test from "node:test";
import { createAppServer } from "../src/server.js";

test("server exposes health and choice APIs", async () => {
  const server = createAppServer();
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));

  try {
    const { port } = server.address();
    const baseUrl = `http://127.0.0.1:${port}`;

    const health = await fetch(`${baseUrl}/api/health`).then((response) =>
      response.json()
    );
    assert.equal(health.ok, true);

    const choice = await fetch(`${baseUrl}/api/choice`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        decisionId: "energy-crisis",
        choiceId: "ration-energy",
        stats: { happiness: 50, energy: 50, order: 50 }
      })
    }).then((response) => response.json());

    assert.deepEqual(choice.stats, {
      happiness: 40,
      energy: 76,
      order: 62
    });
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});
