import http from "node:http";
import { SERVER } from "./stack-catalog.js";
import { handleJsonRpc } from "./mcp/handler.js";

const port = Number(process.env.PORT ?? 8787);
const host = process.env.HOST ?? "127.0.0.1";

const server = http.createServer(async (req, res) => {
  setCors(res);

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  const url = new URL(req.url ?? "/", `http://${req.headers.host ?? `${host}:${port}`}`);
  const requestStart = Date.now();
  let requestSummary = "";

  res.on("finish", () => {
    logRequest(req, url, res.statusCode, Date.now() - requestStart, requestSummary);
  });

  if (req.method === "GET" && (url.pathname === "/" || url.pathname === "/health")) {
    requestSummary = "route=health";
    sendJson(res, 200, {
      status: "ok",
      name: SERVER.name,
      version: SERVER.version,
      doctrine: SERVER.doctrine,
      mcp: "/mcp"
    });
    return;
  }

  if (req.method === "GET" && url.pathname === "/mcp") {
    requestSummary = "route=mcp-metadata";
    sendJson(res, 200, {
      name: SERVER.name,
      version: SERVER.version,
      protocolVersion: SERVER.protocolVersion,
      transport: "streamable-http-json-rpc",
      note: "Send JSON-RPC POST requests to this endpoint."
    });
    return;
  }

  if (url.pathname !== "/mcp") {
    requestSummary = "route=not-found";
    sendJson(res, 404, { error: "Not found" });
    return;
  }

  if (req.method !== "POST") {
    requestSummary = "route=mcp method-not-allowed";
    sendJson(res, 405, { error: "Method not allowed" });
    return;
  }

  try {
    const body = await readBody(req);
    const payload = body.trim() ? JSON.parse(body) : null;
    requestSummary = summarizeRpcPayload(payload);
    const response = await handleJsonRpc(payload);
    requestSummary = `${requestSummary} outcome=${summarizeRpcResponse(response)}`;

    if (response === null) {
      res.writeHead(204);
      res.end();
      return;
    }

    sendJson(res, 200, response);
  } catch (error) {
    requestSummary ||= "rpc=parse-error";
    sendJson(res, 400, {
      jsonrpc: "2.0",
      id: null,
      error: {
        code: -32700,
        message: error.message ?? "Parse error"
      }
    });
  }
});

server.listen(port, host, () => {
  console.log(`${SERVER.name} ${SERVER.version} listening on http://${host}:${port}/mcp`);
});

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.setEncoding("utf8");
    req.on("data", (chunk) => {
      body += chunk;
      if (body.length > 1_000_000) {
        req.destroy(new Error("Request body too large"));
      }
    });
    req.on("end", () => resolve(body));
    req.on("error", reject);
  });
}

function sendJson(res, status, body) {
  const data = JSON.stringify(body, null, 2);
  res.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store"
  });
  res.end(data);
}

function logRequest(req, url, status, durationMs, summary) {
  const kind = url.pathname === "/mcp" ? "mcp" : "http";
  const parts = [
    `${new Date().toISOString()}`,
    kind,
    `method=${req.method}`,
    `path=${safeLogValue(url.pathname)}`,
    `status=${status}`,
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

function setCors(res) {
  res.setHeader("access-control-allow-origin", "*");
  res.setHeader("access-control-allow-methods", "GET,POST,OPTIONS");
  res.setHeader("access-control-allow-headers", "content-type, mcp-session-id, mcp-protocol-version");
  res.setHeader("access-control-expose-headers", "mcp-session-id");
}
