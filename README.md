# context-stack-mcp

Cloudflare Worker MCP endpoint for the Context Stack: ContextOps, ContextBoundary, Sthala, Griha, and the canonical context-stack doctrine.

> Probabilistic intelligence must operate inside deterministic governance boundaries.

This server lets AI clients discover the stack, read canonical resources, choose the correct project entry point, generate first-pass governance guidance, and perform explicit GitHub file writes through Worker secrets.

## Status

v0.1 is live at:

```text
https://mcp.context-stack.org/mcp
```

Health endpoint:

```text
https://mcp.context-stack.org/health
```

## What It Exposes

### Resources

- `context-stack://overview`
- `context-stack://glossary`
- `context-stack://decisions`
- `context-stack://contextops/framework`
- `context-stack://contextops/manifest`
- `context-stack://contextboundary/framework`
- `context-stack://contextboundary/rationale`
- `context-stack://sthala/spec`
- `context-stack://griha/readme`

### Tools

- `get_stack_overview`
- `get_project`
- `recommend_project`
- `get_glossary_term`
- `list_stack_resources`
- `update_file`
- `create_file`

### Prompts

- `choose_stack_entry_point`
- `run_contextops_assessment`
- `classify_contextboundary_egress`
- `map_sthala_deployment`
- `build_ai_governance_adoption_plan`

## Local Run

Requires Node.js 20 or later and Wrangler.

```bash
npm test
npm start
```

Health check:

```bash
curl http://127.0.0.1:8787/health
```

MCP 2026-07-28 discovery call:

```bash
curl -X POST http://127.0.0.1:8787/mcp \
  -H "content-type: application/json" \
  -H "MCP-Protocol-Version: 2026-07-28" \
  -H "Mcp-Method: server/discover" \
  -d '{"jsonrpc":"2.0","id":"discover-1","method":"server/discover","params":{"_meta":{"io.modelcontextprotocol/protocolVersion":"2026-07-28","io.modelcontextprotocol/clientInfo":{"name":"curl","version":"1.0.0"},"io.modelcontextprotocol/clientCapabilities":{}}}}'
```

Legacy MCP initialize call remains supported during client cutover:

```bash
curl -X POST http://127.0.0.1:8787/mcp \
  -H "content-type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2025-06-18"}}'
```

Tool call:

```bash
curl -X POST http://127.0.0.1:8787/mcp \
  -H "content-type: application/json" \
  -d '{"jsonrpc":"2.0","id":2,"method":"tools/call","params":{"name":"recommend_project","arguments":{"question":"We need to govern data egress from an AI agent."}}}'
```

Live tool list:

```bash
curl -X POST https://mcp.context-stack.org/mcp \
  -H "content-type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}'
```

Live project recommendation:

```bash
curl -X POST https://mcp.context-stack.org/mcp \
  -H "content-type: application/json" \
  -d '{"jsonrpc":"2.0","id":2,"method":"tools/call","params":{"name":"recommend_project","arguments":{"question":"We need to assess stale context after AMS handover."}}}'
```

## Design Choices

- Read tools are source-routed through the canonical stack catalog.
- Write tools require the `GITHUB_TOKEN` Worker secret.
- No database.
- No stored user prompts, assessment answers, or organization data.
- Resources point to canonical GitHub project files.
- GitHub write tools target owner `kannanokannan` and require explicit repo, path, content, and commit message arguments.
- The server does not replace any stack repo. It routes agents to the correct source.
- The server is for discovery and decision support, not policy enforcement.

## Privacy-Safe Logging

The server logs method-level operational metadata only:

```text
mcp method=POST path=/mcp status=200 duration_ms=8 rpc=tools/list outcome=ok
mcp method=POST path=/mcp status=200 duration_ms=14 rpc=tools/call tool=recommend_project outcome=ok
mcp method=POST path=/mcp status=200 duration_ms=42 rpc=resources/read resource=context-stack://glossary outcome=ok
```

It does not log prompts, tool arguments, assessment answers, or organization-specific content.

## Project Map

| Project | Layer | Question |
|---------|-------|----------|
| context-stack | Canonical coordination | What terms, decisions, and doctrine govern the stack? |
| ContextOps | Organizational context governance | How does an org govern its AI context? |
| ContextBoundary | Egress governance | Where is data allowed to go? |
| Sthala | Governed runtime reference | Where does the AI actually run? |
| Griha | Product/adoption layer | How does governed AI become a working product layer? |

## Deployment

See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md).

## Privacy

See [docs/PRIVACY.md](docs/PRIVACY.md).

## License

Apache 2.0.
