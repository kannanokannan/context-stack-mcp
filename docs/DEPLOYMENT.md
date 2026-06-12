# Deployment

The intended public endpoint is:

```text
https://mcp.context-stack.org/mcp
```

## DNS Plan

Do not point `mcp.context-stack.org` to GitHub Pages.

Use it only after a runtime host exists. The likely path is:

```text
mcp.context-stack.org -> runtime host -> /mcp
```

Runtime host options:

- Cloudflare Worker
- Render
- Railway
- Fly.io
- Vercel serverless function

## v0.1 Runtime Requirements

- Node.js 20 or later
- HTTP POST support
- Outbound HTTPS access to `raw.githubusercontent.com` for resource reads
- No persistent storage required

## Environment Variables

| Variable | Default | Purpose |
|----------|---------|---------|
| `HOST` | `127.0.0.1` | Local bind host |
| `PORT` | `8787` | Local bind port |

Hosted providers usually set `PORT`. In that case, set `HOST=0.0.0.0`.

## Suggested First Deploy

For the first public version, use a simple Node host before optimizing for edge runtime. The server is stateless, so moving to Cloudflare Worker later is straightforward but should be tested separately.

## Production Controls

Before public deployment:

- Add rate limiting at the edge.
- Keep request-body logging disabled.
- Log only aggregate method counts unless a user explicitly opts in.
- Add uptime monitoring for `/health`.
- Confirm `resources/read` can fetch canonical raw GitHub files.
- Add `mcp.context-stack.org` DNS only after the runtime URL is known.