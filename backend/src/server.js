import { createServer } from "node:http";
import { dynamicEvents, initialStats, npcs, scenarios } from "./aiData.js";
import {
  applyDecision,
  buildNpcMessages,
  generateDynamicEvent,
  generateNpcReply
} from "./aiEngine.js";

const PORT = Number(process.env.PORT ?? 8787);

export function createAppServer() {
  return createServer(async (request, response) => {
    setCorsHeaders(response);

    if (request.method === "OPTIONS") {
      sendJson(response, 204, null);
      return;
    }

    try {
      const url = new URL(request.url, `http://${request.headers.host}`);

      if (request.method === "GET" && url.pathname === "/api/health") {
        sendJson(response, 200, {
          ok: true,
          service: "calabria2100-ai-backend",
          aiProvider: process.env.OPENAI_API_KEY ? "openai" : "local"
        });
        return;
      }

      if (request.method === "GET" && url.pathname === "/api/npcs") {
        sendJson(response, 200, { npcs });
        return;
      }

      if (request.method === "GET" && url.pathname === "/api/scenarios") {
        sendJson(response, 200, { scenarios });
        return;
      }

      if (request.method === "GET" && url.pathname === "/api/state") {
        sendJson(response, 200, {
          stats: initialStats,
          npcs,
          scenarios,
          dynamicEvents
        });
        return;
      }

      if (request.method === "POST" && url.pathname === "/api/choice") {
        const body = await readJson(request);
        const result = applyDecision(
          body.stats ?? initialStats,
          body.decisionId,
          body.choiceId
        );

        if (!result) {
          sendJson(response, 404, { error: "Decisione o scelta non trovata." });
          return;
        }

        sendJson(response, 200, result);
        return;
      }

      if (request.method === "POST" && url.pathname === "/api/event") {
        const body = await readJson(request);
        const result = await generateDynamicEvent({
          stats: body.stats ?? initialStats,
          history: body.history ?? []
        });
        sendJson(response, 200, result);
        return;
      }

      if (request.method === "POST" && url.pathname === "/api/chat") {
        const body = await readJson(request);

        if (!body.message || !body.npcId) {
          sendJson(response, 400, { error: "Campi richiesti: npcId, message." });
          return;
        }

        const result = await generateNpcReply({
          npcId: body.npcId,
          message: body.message,
          stats: body.stats ?? initialStats,
          context: body.context ?? {},
          history: body.history ?? []
        });

        sendJson(response, 200, result);
        return;
      }

      if (request.method === "POST" && url.pathname === "/api/debug/messages") {
        const body = await readJson(request);
        sendJson(response, 200, {
          messages: buildNpcMessages(
            body.npcId,
            body.message ?? "",
            body.stats ?? initialStats,
            body.context ?? {},
            body.history ?? []
          )
        });
        return;
      }

      sendJson(response, 404, { error: "Endpoint non trovato." });
    } catch (error) {
      sendJson(response, error.statusCode ?? 500, { error: error.message });
    }
  });
}

function setCorsHeaders(response) {
  response.setHeader("Access-Control-Allow-Origin", "*");
  response.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  response.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");
}

function sendJson(response, statusCode, payload) {
  response.statusCode = statusCode;

  if (payload === null) {
    response.end();
    return;
  }

  response.setHeader("Content-Type", "application/json");
  response.end(JSON.stringify(payload));
}

async function readJson(request) {
  const chunks = [];
  let size = 0;
  const maxBytes = 50 * 1024;

  for await (const chunk of request) {
    size += chunk.length;
    if (size > maxBytes) {
      const error = new Error("Payload troppo grande.");
      error.statusCode = 413;
      throw error;
    }
    chunks.push(chunk);
  }

  const rawBody = Buffer.concat(chunks).toString("utf8");
  try {
    return rawBody ? JSON.parse(rawBody) : {};
  } catch {
    const error = new Error("JSON non valido.");
    error.statusCode = 400;
    throw error;
  }
}

if (process.argv[1] === new URL(import.meta.url).pathname) {
  createAppServer().listen(PORT, () => {
    console.log(`Calabria2100 AI backend on http://localhost:${PORT}`);
  });
}
