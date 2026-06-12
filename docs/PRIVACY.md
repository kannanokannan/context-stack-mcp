# Privacy

This MCP server is designed to expose public Context Stack resources and safe guidance tools.

## Default Posture

- No user accounts.
- No database.
- No stored prompts.
- No stored assessment answers.
- No organization-specific profile building.

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
