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
- method name, such as `tools/call` or `resources/read`
- tool/resource/prompt name
- success or failure
- server version

Do not log full request bodies by default.

## Sensitive Inputs

Users should not send confidential business data, regulated data, secrets, access tokens, or private assessment answers unless a future version explicitly supports opt-in handling.

## Future Consent Model

If later versions support adoption capture or assessment sharing, that must be explicit and opt-in. The default flow remains local and non-persistent.