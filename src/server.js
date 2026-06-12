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

  if (req.method === "GET" && (url.pathname === "/" || url.pathname === "/health")) {
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
    sendJson(res, 404, { error: "Not found" });
    return;
  }

  if (req.method !== "POST") {
    sendJson(res, 405, { error: "Method not allowed" });
    return;
  }

  try {
    const body = await readBody(req);
    const payload = body.trim() ? JSON.parse(body) : null;
    const response = await handleJsonRpc(payload);

    if (response === null) {
      res.writeHead(204);
      res.end();
      return;
    }

    sendJson(res, 200, response);
  } catch (error) {
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

function setCors(res) {
  res.setHeader("access-control-allow-origin", "*");
  res.setHeader("access-control-allow-methods", "GET,POST,OPTIONS");
  res.setHeader("access-control-allow-headers", "content-type, mcp-session-id, mcp-protocol-version");
  res.setHeader("access-control-expose-headers", "mcp-session-id");
}