import assert from "node:assert/strict";
import { handleJsonRpc } from "../src/mcp/handler.js";

const modernMeta = {
  "io.modelcontextprotocol/protocolVersion": "2026-07-28",
  "io.modelcontextprotocol/clientInfo": { name: "context-stack-mcp-smoke", version: "0.1.0" },
  "io.modelcontextprotocol/clientCapabilities": {}
};

const discovered = await handleJsonRpc({
  jsonrpc: "2.0",
  id: "discover-1",
  method: "server/discover",
  params: { _meta: modernMeta }
}, {
  http: {
    protocolVersion: "2026-07-28",
    method: "server/discover"
  }
});
assert.equal(discovered.result.serverInfo.name, "context-stack-mcp");
assert.ok(discovered.result.supportedVersions.includes("2026-07-28"));
assert.ok(discovered.result.capabilities.tools);
assert.ok(discovered.result.capabilities.resources);

const initialized = await handleJsonRpc({
  jsonrpc: "2.0",
  id: 1,
  method: "initialize",
  params: { protocolVersion: "2025-06-18" }
});
assert.equal(initialized.result.serverInfo.name, "context-stack-mcp");
assert.equal(initialized.result.protocolVersion, "2025-06-18");

const tools = await handleJsonRpc({
  jsonrpc: "2.0",
  id: 2,
  method: "tools/list",
  params: { _meta: modernMeta }
}, {
  http: {
    protocolVersion: "2026-07-28",
    method: "tools/list"
  }
});
assert.ok(tools.result.tools.some((tool) => tool.name === "recommend_project"));
assert.ok(tools.result.tools.some((tool) => tool.name === "update_file"));
assert.ok(tools.result.tools.some((tool) => tool.name === "create_file"));
assert.equal(tools.result.cacheScope, "public");

const recommendation = await handleJsonRpc({
  jsonrpc: "2.0",
  id: 3,
  method: "tools/call",
  params: {
    name: "recommend_project",
    arguments: {
      question: "We need to govern context handover in AMS and stop stale runbooks reaching agents."
    },
    _meta: modernMeta
  }
}, {
  http: {
    protocolVersion: "2026-07-28",
    method: "tools/call",
    name: "recommend_project"
  }
});
assert.match(recommendation.result.content[0].text, /ContextOps/);

const resources = await handleJsonRpc({
  jsonrpc: "2.0",
  id: 4,
  method: "resources/list",
  params: { _meta: modernMeta }
});
assert.ok(resources.result.resources.some((resource) => resource.uri === "context-stack://glossary"));

const prompts = await handleJsonRpc({
  jsonrpc: "2.0",
  id: 5,
  method: "prompts/list",
  params: { _meta: modernMeta }
});
assert.ok(prompts.result.prompts.some((prompt) => prompt.name === "classify_contextboundary_egress"));

const unsupported = await handleJsonRpc({
  jsonrpc: "2.0",
  id: 6,
  method: "tools/list",
  params: {
    _meta: {
      ...modernMeta,
      "io.modelcontextprotocol/protocolVersion": "1900-01-01"
    }
  }
});
assert.equal(unsupported.error.code, -32022);

console.log("Smoke test passed");
