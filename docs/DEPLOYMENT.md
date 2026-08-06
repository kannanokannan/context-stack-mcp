# Deployment

The intended public endpoint is:

```text
https://mcp.context-stack.org/mcp
```

## Cloudflare Workers

The production runtime is Cloudflare Workers. Keep the public MCP endpoint unchanged:

```text
https://mcp.context-stack.org/mcp
```

Health endpoint:

```text
https://mcp.context-stack.org/health
```

## v0.1 Runtime Requirements

- Cloudflare Workers runtime
- HTTP POST support
- Workers AI binding using the configured advisor model
- Durable Object binding for numeric advisor budget and rate-limit counters only
- Outbound HTTPS access to `raw.githubusercontent.com` for resource reads
- Outbound HTTPS access to `api.github.com` for explicit write tools
- No content storage required; the advisor budget Durable Object stores numeric counters only

## Worker Secrets

| Secret | Purpose |
|--------|---------|
| `GITHUB_TOKEN` | GitHub PAT used by `update_file` and `create_file` |

Set the secret with:

```bash
wrangler secret put GITHUB_TOKEN
```

Do not commit the token or place it in `wrangler.toml`.

## Deploy

```bash
npm test
wrangler deploy
```

Live tool-list check:

```bash
curl -X POST https://mcp.context-stack.org/mcp \
  -H "content-type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}'
```

## Production Controls

Before public deployment:

- Add rate limiting at the edge.
- Keep request-body logging disabled and set `observability.enabled = false`.
- Keep the advisor daily Neuron budget and per-IP/global request limits configured.
- Log only aggregate method counts unless a user explicitly opts in.
- Add uptime monitoring for `/health`.
- Confirm `resources/read` can fetch canonical raw GitHub files.
- Confirm write tools fail closed when `GITHUB_TOKEN` is missing.
