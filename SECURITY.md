# Security

## Supported Version

| Version | Supported |
|---------|-----------|
| 0.1.x | Yes |

## Reporting Issues

Open a GitHub issue with a concise description and reproduction steps. Do not include secrets, regulated data, or private organization data in public issues.

## Security Posture

- Read-only MCP surface.
- No side-effect tools.
- No secret handling.
- No credential proxying.
- No database.
- No default request-body logging.

## Production Hardening Checklist

Before public deployment:

- Add edge rate limiting.
- Restrict maximum request body size.
- Keep dependency set small.
- Pin runtime version.
- Monitor failed JSON-RPC calls.
- Review CORS policy for the selected host.
- Validate DNS and HTTPS before publishing the endpoint in stack repos.