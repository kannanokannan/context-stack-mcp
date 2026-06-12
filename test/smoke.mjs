import assert from "node:assert/strict";
import { handleJsonRpc } from "../src/mcp/handler.js";

const initialized = await handleJsonRpc({
  jsonrpc: "2.0",
  id: 1,
  method: "initialize",
  params: { protocolVersion: "2025-06-18" }
});
assert.equal(initialized.result.serverInfo.name, "context-stack-mcp");

const tools = await handleJsonRpc({ jsonrpc: "2.0", id: 2, method: "tools/list" });
assert.ok(tools.result.tools.some((tool) => tool.name === "recommend_project"));

const recommendation = await handleJsonRpc({
  jsonrpc: "2.0",
  id: 3,
  method: "tools/call",
  params: {
    name: "recommend_project",
    arguments: {
      question: "We need to govern context handover in AMS and stop stale runbooks reaching agents."
    }
  }
});
assert.match(recommendation.result.content[0].text, /ContextOps/);

const resources = await handleJsonRpc({ jsonrpc: "2.0", id: 4, method: "resources/list" });
assert.ok(resources.result.resources.some((resource) => resource.uri === "context-stack://glossary"));

const prompts = await handleJsonRpc({ jsonrpc: "2.0", id: 5, method: "prompts/list" });
assert.ok(prompts.result.prompts.some((prompt) => prompt.name === "classify_contextboundary_egress"));

console.log("Smoke test passed");