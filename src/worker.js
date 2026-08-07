import { SERVER } from "./stack-catalog.js";
import { handleJsonRpc, httpStatusForResponse } from "./mcp/handler.js";
import { handleAdvisorRequest } from "./advisor.js";
import { AdvisorBudget } from "./advisor-budget.js";

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const requestStart = Date.now();
    let requestSummary = "";

    try {
      if (request.method === "OPTIONS") {
        return withCors(new Response(null, { status: 204 }));
      }

      if (request.method === "POST" && url.pathname === "/advisor") {
        requestSummary = "route=advisor";
        const salt = typeof env?.ADVISOR_IP_SALT === "string" ? env.ADVISOR_IP_SALT : "";
        if (!salt) {
          requestSummary = "route=advisor misconfigured";
          return jsonResponse({
            ok: false,
            error: { code: "advisor_misconfigured", message: "Advisor IP salt is not configured." }
          }, { status: 503 });
        }
        let hashedIp;
        try {
          hashedIp = await hashAdvisorIp(request.headers.get("cf-connecting-ip") ?? "anonymous", salt, dayKey());
        } catch {
          requestSummary = "route=advisor misconfigured";
          return jsonResponse({
            ok: false,
            error: { code: "advisor_misconfigured", message: "Advisor IP salt is not usable." }
          }, { status: 503 });
        }
        return withCors(await handleAdvisorRequest(request, env, {
          ip: hashedIp
        }));
      }

      if (request.method === "GET" && (url.pathname === "/" || url.pathname === "/health")) {
        requestSummary = "route=health";
        return jsonResponse({
          status: "ok",
          name: SERVER.name,
          version: SERVER.version,
          doctrine: SERVER.doctrine,
          mcp: "/mcp"
        });
      }

      if (request.method === "GET" && url.pathname === "/mcp") {
        requestSummary = "route=mcp-metadata";
        return jsonResponse({
          name: SERVER.name,
          version: SERVER.version,
          protocolVersion: SERVER.protocolVersion,
          transport: "streamable-http-json-rpc",
          note: "Send JSON-RPC POST requests to this endpoint."
        });
      }

      if (url.pathname !== "/mcp") {
        requestSummary = "route=not-found";
        return jsonResponse({ error: "Not found" }, { status: 404 });
      }

      if (request.method !== "POST") {
        requestSummary = "route=mcp method-not-allowed";
        return jsonResponse({ error: "Method not allowed" }, { status: 405 });
      }

      const body = await readBody(request);
      const payload = body.trim() ? JSON.parse(body) : null;
      requestSummary = summarizeRpcPayload(payload);
      const response = await handleJsonRpc(payload, { env, http: httpMetadata(request.headers) });
      requestSummary = `${requestSummary} outcome=${summarizeRpcResponse(response)}`;

      if (response === null) {
        return withCors(new Response(null, { status: 204 }));
      }

      return jsonResponse(response, { status: httpStatusForResponse(response) });
    } catch (error) {
      requestSummary ||= "rpc=parse-error";
      return jsonResponse({
        jsonrpc: "2.0",
        id: null,
        error: {
          code: -32700,
          message: error.message ?? "Parse error"
        }
      }, { status: 400 });
    } finally {
      logRequest(request, url, Date.now() - requestStart, requestSummary);
    }
  }
};

async function readBody(request) {
  const body = await request.text();
  if (body.length > 1_000_000) {
    throw new Error("Request body too large");
  }
  return body;
}

function jsonResponse(body, init = {}) {
  return withCors(new Response(JSON.stringify(body, null, 2), {
    status: init.status ?? 200,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      ...(init.headers ?? {})
    }
  }));
}

function withCors(response) {
  const headers = new Headers(response.headers);
  headers.set("access-control-allow-origin", "*");
  headers.set("access-control-allow-methods", "GET,POST,OPTIONS");
  headers.set("access-control-allow-headers", "authorization, content-type, mcp-method, mcp-name, mcp-protocol-version, mcp-session-id");
  headers.set("access-control-expose-headers", "mcp-protocol-version");
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers
  });
}

function httpMetadata(headers) {
  return {
    protocolVersion: headers.get("mcp-protocol-version") ?? undefined,
    method: headers.get("mcp-method") ?? undefined,
    name: headers.get("mcp-name") ?? undefined
  };
}

function logRequest(request, url, durationMs, summary) {
  const kind = url.pathname === "/mcp" ? "mcp" : "http";
  const parts = [
    `${new Date().toISOString()}`,
    kind,
    `method=${request.method}`,
    `path=${safeLogValue(url.pathname)}`,
    `duration_ms=${durationMs}`
  ];

  if (summary) parts.push(summary);
  console.log(parts.join(" "));
}

function summarizeRpcPayload(payload) {
  if (Array.isArray(payload)) {
    const methods = payload
      .map((item) => item?.method)
      .filter(Boolean)
      .map(safeLogValue)
      .slice(0, 6)
      .join(",");
    return `rpc=batch count=${payload.length}${methods ? ` methods=${methods}` : ""}`;
  }

  if (!payload || typeof payload !== "object") {
    return "rpc=empty";
  }

  const method = safeLogValue(payload.method ?? "unknown");
  const detail = rpcDetail(method, payload.params ?? {});
  return `rpc=${method}${detail ? ` ${detail}` : ""}`;
}

function rpcDetail(method, params) {
  if (method === "tools/call" && params.name) {
    return `tool=${safeLogValue(params.name)}`;
  }

  if (method === "resources/read" && params.uri) {
    return `resource=${safeLogValue(params.uri)}`;
  }

  if (method === "prompts/get" && params.name) {
    return `prompt=${safeLogValue(params.name)}`;
  }

  return "";
}

function summarizeRpcResponse(response) {
  if (response === null) {
    return "notification";
  }

  if (Array.isArray(response)) {
    return response.some((item) => item?.error) ? "error" : "ok";
  }

  return response?.error ? "error" : "ok";
}

function safeLogValue(value) {
  return String(value)
    .replace(/[^a-zA-Z0-9_:/.-]/g, "_")
    .slice(0, 160);
}

function dayKey(now = Date.now()) {
  return new Date(now).toISOString().slice(0, 10);
}

async function hashAdvisorIp(ip, salt, day) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(salt),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(`${day}:${ip}`));
  return Array.from(new Uint8Array(signature), (byte) => byte.toString(16).padStart(2, "0")).join("").slice(0, 16);
}

export { AdvisorBudget };
