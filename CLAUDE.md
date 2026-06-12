# Agent Instructions

This repository implements the MCP endpoint for the Context Stack.

## Canonical Reference

Before introducing any new term: check https://github.com/kannanokannan/context-stack/blob/main/GLOSSARY.md

Before making any cross-project decision: check https://github.com/kannanokannan/context-stack/blob/main/DECISIONS.md

Terminology defined in GLOSSARY.md overrides any local usage in this repo.

## Doctrine

Probabilistic intelligence must operate inside deterministic governance boundaries.

## Constraints

- Keep the MCP server read-only unless the maintainer explicitly asks for side-effect tools.
- Do not store prompts, assessment answers, or organization data by default.
- Do not add vendor-specific assumptions.
- Use "Egress Tier", never "Privacy Tier".
- Keep ContextBoundary deployment-agnostic.
- Keep Sthala as a governed runtime reference, not the scope of ContextBoundary.
- Keep Griha as the product/adoption layer above the governance projects.
- Prefer small, inspectable code over framework-heavy abstractions.

## Public Endpoint

The intended endpoint is:

```text
https://mcp.context-stack.org/mcp
```

Do not publish this endpoint in other repos until DNS, runtime hosting, and HTTPS are verified.