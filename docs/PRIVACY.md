# Privacy

This MCP server is designed to expose public Context Stack resources and safe guidance tools.

## Default Posture

- No user accounts.
- No database.
- No stored prompts.
- No stored assessment answers.
- No organization-specific profile building.
- The `/advisor` endpoint stores only numeric budget and rate-limit counters in its Durable Object; it does not store question text.
- The raw `CF-Connecting-IP` value is never written to Durable Object storage. The Worker derives a daily HMAC-SHA-256 pseudonym, truncated to 16 hexadecimal characters, from `${day}:${ip}` before using it for the per-IP counter.

## What May Be Logged

A production deployment may collect aggregate operational metrics:

- timestamp
- HTTP method and path
- JSON-RPC method name, such as `tools/call` or `resources/read`
- tool/resource/prompt name
- HTTP status and JSON-RPC outcome
- request duration
- server version

The server must not log full request bodies by default.
The advisor Worker has `observability.enabled = false` and logs only the route summary; it must not log question text or model output.

Examples:

```text
mcp method=POST path=/mcp status=200 duration_ms=8 rpc=tools/list outcome=ok
mcp method=POST path=/mcp status=200 duration_ms=14 rpc=tools/call tool=recommend_project outcome=ok
mcp method=POST path=/mcp status=200 duration_ms=42 rpc=resources/read resource=context-stack://glossary outcome=ok
```

## Sensitive Inputs

Users should not send confidential business data, regulated data, secrets, access tokens, or private assessment answers unless a future version explicitly supports opt-in handling.

## Future Consent Model

If later versions support adoption capture or assessment sharing, that must be explicit and opt-in. The default flow remains local and non-persistent.

## Explanation Advisor Terms

The optional advisor sends a visitor's question to Cloudflare Workers AI for processing. The question is not stored, not logged, and not used to train any model. Responses are model-generated guidance based only on public Context Stack documents; they are not enforcement decisions or compliance opinions. The model identifier and source identifiers are returned with each successful response.
