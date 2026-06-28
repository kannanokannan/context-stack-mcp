import { SERVER, findProject, findResource, glossary, projects, resources, stackOverview } from "../stack-catalog.js";

const JSON_RPC = "2.0";

export const tools = [
  {
    name: "get_stack_overview",
    title: "Get Stack Overview",
    description: "Return the Context Stack doctrine and project map.",
    inputSchema: {
      type: "object",
      additionalProperties: false,
      properties: {}
    }
  },
  {
    name: "get_project",
    title: "Get Project",
    description: "Return a project summary, layer, status, repository, and core documents.",
    inputSchema: {
      type: "object",
      required: ["project"],
      additionalProperties: false,
      properties: {
        project: {
          type: "string",
          description: "Project id or name: context-stack, contextops, contextboundary, sthala, or griha."
        }
      }
    }
  },
  {
    name: "recommend_project",
    title: "Recommend Project",
    description: "Recommend the best stack entry point for a user problem.",
    inputSchema: {
      type: "object",
      required: ["question"],
      additionalProperties: false,
      properties: {
        question: {
          type: "string",
          description: "Problem, goal, or governance question."
        },
        deliveryModel: {
          type: "string",
          description: "Optional delivery model such as AMS, Waterfall, Agile, product, or platform."
        }
      }
    }
  },
  {
    name: "get_glossary_term",
    title: "Get Glossary Term",
    description: "Look up a canonical stack term.",
    inputSchema: {
      type: "object",
      required: ["term"],
      additionalProperties: false,
      properties: {
        term: {
          type: "string",
          description: "Term to look up."
        }
      }
    }
  },
  {
    name: "list_stack_resources",
    title: "List Stack Resources",
    description: "Return MCP resource URIs exposed by this server.",
    inputSchema: {
      type: "object",
      additionalProperties: false,
      properties: {}
    }
  },
  {
    name: "update_file",
    title: "Update GitHub File",
    description: "Update an existing file in a kannanokannan GitHub repo using the Worker GITHUB_TOKEN secret.",
    inputSchema: {
      type: "object",
      required: ["repo", "path", "content", "message"],
      additionalProperties: false,
      properties: {
        repo: {
          type: "string",
          description: "Repository name under owner kannanokannan."
        },
        path: {
          type: "string",
          description: "File path inside the repository."
        },
        content: {
          type: "string",
          description: "Full replacement file content."
        },
        message: {
          type: "string",
          description: "Commit message for the file update."
        }
      }
    }
  },
  {
    name: "create_file",
    title: "Create GitHub File",
    description: "Create a new file in a kannanokannan GitHub repo using the Worker GITHUB_TOKEN secret.",
    inputSchema: {
      type: "object",
      required: ["repo", "path", "content", "message"],
      additionalProperties: false,
      properties: {
        repo: {
          type: "string",
          description: "Repository name under owner kannanokannan."
        },
        path: {
          type: "string",
          description: "New file path inside the repository."
        },
        content: {
          type: "string",
          description: "File content."
        },
        message: {
          type: "string",
          description: "Commit message for the file creation."
        }
      }
    }
  }
];

export const prompts = [
  {
    name: "choose_stack_entry_point",
    title: "Choose Stack Entry Point",
    description: "Help a user decide whether to start with ContextOps, ContextBoundary, Sthala, Griha, or the canonical context-stack repo.",
    arguments: [
      { name: "situation", description: "The user's situation or problem statement.", required: true }
    ]
  },
  {
    name: "run_contextops_assessment",
    title: "Run ContextOps Assessment",
    description: "Guide a user through the ContextOps self-assessment without storing answers.",
    arguments: [
      { name: "organization_context", description: "Optional organization or delivery context.", required: false }
    ]
  },
  {
    name: "classify_contextboundary_egress",
    title: "Classify ContextBoundary Egress",
    description: "Classify an AI data flow using ContextBoundary egress-tier terminology.",
    arguments: [
      { name: "data_flow", description: "The data flow to classify.", required: true }
    ]
  },
  {
    name: "map_sthala_deployment",
    title: "Map Sthala Deployment",
    description: "Map a governed runtime scenario to Sthala's narrate/compute split and six-layer pipeline.",
    arguments: [
      { name: "deployment", description: "The runtime or deployment scenario.", required: true }
    ]
  },
  {
    name: "build_ai_governance_adoption_plan",
    title: "Build AI Governance Adoption Plan",
    description: "Produce a first-pass adoption plan using the whole Context Stack.",
    arguments: [
      { name: "goal", description: "The user's adoption goal.", required: true }
    ]
  }
];

export async function handleJsonRpc(payload, context = {}) {
  if (Array.isArray(payload)) {
    const responses = [];
    for (const item of payload) {
      const response = await handleSingle(item, context);
      if (response) responses.push(response);
    }
    return responses.length ? responses : null;
  }

  return handleSingle(payload, context);
}

async function handleSingle(request, context) {
  if (!request || request.jsonrpc !== JSON_RPC || typeof request.method !== "string") {
    return rpcError(request?.id ?? null, -32600, "Invalid JSON-RPC request.");
  }

  const id = Object.prototype.hasOwnProperty.call(request, "id") ? request.id : undefined;
  const isNotification = id === undefined;

  try {
    const result = await routeMethod(request.method, request.params ?? {}, context);
    if (isNotification) return null;
    return { jsonrpc: JSON_RPC, id, result };
  } catch (error) {
    if (isNotification) return null;
    return rpcError(id, error.code ?? -32603, error.message ?? "Internal error.", error.data);
  }
}

async function routeMethod(method, params, context) {
  switch (method) {
    case "initialize":
      return {
        protocolVersion: params.protocolVersion ?? SERVER.protocolVersion,
        capabilities: {
          resources: {},
          prompts: {},
          tools: {}
        },
        serverInfo: {
          name: SERVER.name,
          version: SERVER.version
        },
        instructions: "Use this read-only server to discover the Context Stack, choose the right project, and retrieve canonical governance resources. Do not send confidential assessment answers unless the user explicitly asks to include them."
      };

    case "notifications/initialized":
      return {};

    case "ping":
      return {};

    case "resources/list":
      return {
        resources: resources.map((resource) => ({
          uri: resource.uri,
          name: resource.name,
          title: resource.title,
          description: resource.description,
          mimeType: resource.mimeType
        }))
      };

    case "resources/read":
      return readResource(params);

    case "tools/list":
      return { tools };

    case "tools/call":
      return callTool(params, context);

    case "prompts/list":
      return { prompts };

    case "prompts/get":
      return getPrompt(params);

    default:
      throw methodNotFound(method);
  }
}

async function readResource(params) {
  const resource = findResource(params.uri);
  if (!resource) throw invalidParams(`Unknown resource URI: ${params.uri}`);

  const text = resource.text ?? await fetchText(resource.sourceUrl);
  return {
    contents: [
      {
        uri: resource.uri,
        mimeType: resource.mimeType,
        text
      }
    ]
  };
}

async function callTool(params, context = {}) {
  const name = params.name;
  const args = params.arguments ?? {};

  switch (name) {
    case "get_stack_overview":
      return textResult(stackOverview());

    case "get_project":
      return textResult(formatProject(args.project));

    case "recommend_project":
      return textResult(recommendProject(args.question, args.deliveryModel));

    case "get_glossary_term":
      return textResult(getGlossaryTerm(args.term));

    case "list_stack_resources":
      return textResult(resources.map((resource) => `- ${resource.uri}: ${resource.title}`).join("\n"));

    case "update_file":
      return textResult(await writeGitHubFile(args, context, { mode: "update" }));

    case "create_file":
      return textResult(await writeGitHubFile(args, context, { mode: "create" }));

    default:
      throw invalidParams(`Unknown tool: ${name}`);
  }
}

async function writeGitHubFile(args, context, options) {
  const repo = validateRepo(args.repo);
  const path = validatePath(args.path);
  const content = validateString(args.content, "content");
  const message = validateString(args.message, "message");
  const token = context?.env?.GITHUB_TOKEN;

  if (!token) {
    throw invalidParams("GITHUB_TOKEN Worker secret is not configured.");
  }

  const owner = "kannanokannan";
  const fileUrl = `https://api.github.com/repos/${owner}/${encodeURIComponent(repo)}/contents/${encodeGitHubPath(path)}`;
  const current = await fetchGitHubFile(fileUrl, token);

  if (options.mode === "create" && current.exists) {
    throw invalidParams(`File already exists: ${repo}/${path}`);
  }

  if (options.mode === "update" && !current.exists) {
    throw invalidParams(`File does not exist: ${repo}/${path}`);
  }

  const payload = {
    message,
    content: utf8ToBase64(content),
    ...(options.mode === "update" ? { sha: current.sha } : {})
  };

  const response = await fetch(fileUrl, {
    method: "PUT",
    headers: githubHeaders(token),
    body: JSON.stringify(payload)
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw invalidParams(`GitHub ${options.mode} failed for ${repo}/${path}: ${data.message ?? response.status}`);
  }

  const commitSha = data.commit?.sha ?? "unknown";
  const commitUrl = data.commit?.html_url ?? `https://github.com/${owner}/${repo}/commit/${commitSha}`;
  const htmlUrl = data.content?.html_url ?? `https://github.com/${owner}/${repo}/blob/main/${path}`;
  return `${options.mode === "create" ? "Created" : "Updated"} ${owner}/${repo}/${path}\nCommit: ${commitSha}\nCommit URL: ${commitUrl}\nFile URL: ${htmlUrl}`;
}

async function fetchGitHubFile(fileUrl, token) {
  const response = await fetch(fileUrl, {
    headers: githubHeaders(token)
  });

  if (response.status === 404) {
    return { exists: false };
  }

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw invalidParams(`Could not read current GitHub file state: ${data.message ?? response.status}`);
  }

  return { exists: true, sha: data.sha };
}

function githubHeaders(token) {
  return {
    "accept": "application/vnd.github+json",
    "authorization": `Bearer ${token}`,
    "content-type": "application/json",
    "user-agent": `${SERVER.name}/${SERVER.version}`,
    "x-github-api-version": "2022-11-28"
  };
}

function validateRepo(repo) {
  const value = validateString(repo, "repo").trim();
  if (!/^[A-Za-z0-9._-]+$/.test(value)) {
    throw invalidParams("repo must be a repository name under owner kannanokannan.");
  }
  return value;
}

function validatePath(path) {
  const value = validateString(path, "path").replace(/\\/g, "/").replace(/^\/+/, "");
  const parts = value.split("/");
  if (!value || parts.some((part) => !part || part === "." || part === "..")) {
    throw invalidParams("path must be a repository-relative file path.");
  }
  return value;
}

function validateString(value, name) {
  if (typeof value !== "string" || !value.trim()) {
    throw invalidParams(`${name} must be a non-empty string.`);
  }
  return value;
}

function encodeGitHubPath(path) {
  return path.split("/").map(encodeURIComponent).join("/");
}

function utf8ToBase64(text) {
  const bytes = new TextEncoder().encode(text);
  let binary = "";
  const chunkSize = 0x8000;
  for (let index = 0; index < bytes.length; index += chunkSize) {
    const chunk = bytes.subarray(index, index + chunkSize);
    binary += String.fromCharCode(...chunk);
  }
  return btoa(binary);
}

function getPrompt(params) {
  const prompt = prompts.find((item) => item.name === params.name);
  if (!prompt) throw invalidParams(`Unknown prompt: ${params.name}`);

  const args = params.arguments ?? {};
  const text = promptText(prompt.name, args);

  return {
    description: prompt.description,
    messages: [
      {
        role: "user",
        content: {
          type: "text",
          text
        }
      }
    ]
  };
}

function promptText(name, args) {
  switch (name) {
    case "choose_stack_entry_point":
      return `Use the Context Stack doctrine to choose the correct starting project. Situation:\n\n${args.situation ?? "Not provided"}\n\nReturn: recommended project, why, first document to read, and next action.`;

    case "run_contextops_assessment":
      return `Guide a ContextOps self-assessment. Keep it conversational. Do not store answers. Use ContextOps maturity, Spine, roles, and named practices. Organization context:\n\n${args.organization_context ?? "Not provided"}`;

    case "classify_contextboundary_egress":
      return `Classify this AI data flow using ContextBoundary. Use Egress Tier terminology only. Explain whether data may leave the boundary, under what conditions, and what human approval or audit trail is needed. Data flow:\n\n${args.data_flow ?? "Not provided"}`;

    case "map_sthala_deployment":
      return `Map this runtime scenario to Sthala's six-layer pipeline and narrate/compute split. Identify where deterministic code must own computation and where ContextBoundary egress rules apply. Deployment:\n\n${args.deployment ?? "Not provided"}`;

    case "build_ai_governance_adoption_plan":
      return `Build a first-pass adoption plan using the Context Stack. Start with the user's goal, pick the right project sequence, identify controls, and keep the plan framework-level. Goal:\n\n${args.goal ?? "Not provided"}`;

    default:
      return "Use the Context Stack doctrine and canonical terminology.";
  }
}

function formatProject(projectName) {
  const project = findProject(projectName);
  if (!project) {
    return `Unknown project: ${projectName}\n\nKnown projects: ${projects.map((item) => item.name).join(", ")}`;
  }

  const docs = project.docs.map((doc) => `- ${doc.label}: ${doc.url}`).join("\n");
  return `# ${project.name}\n\nQuestion: ${project.question}\nLayer: ${project.layer}\nStatus: ${project.status}\nRepository: ${project.repo}\n\n${project.summary}\n\nCore documents:\n${docs}\n`;
}

function recommendProject(question = "", deliveryModel = "") {
  const text = `${question} ${deliveryModel}`.toLowerCase();
  const picks = [];

  if (matches(text, ["context", "ownership", "owner", "curate", "supply", "renew", "maturity", "operating model", "ams", "waterfall", "agile", "handover"])) {
    picks.push("ContextOps");
  }
  if (matches(text, ["egress", "boundary", "data flow", "jurisdiction", "gdpr", "cloud act", "vendor", "tier", "sovereign", "pii", "regulated"])) {
    picks.push("ContextBoundary");
  }
  if (matches(text, ["runtime", "run", "on-prem", "airgap", "airgapped", "hardware", "deploy", "compute", "narrate", "pipeline"])) {
    picks.push("Sthala");
  }
  if (matches(text, ["product", "home", "edge", "app", "prototype", "device", "approval gate"])) {
    picks.push("Griha");
  }

  const unique = [...new Set(picks)];
  const primary = unique[0] ?? "context-stack";
  const project = findProject(primary) ?? findProject("context-stack");

  const sequence = unique.length ? unique.join(" -> ") : "context-stack -> ContextOps or ContextBoundary after discovery";
  return `Recommended starting point: ${project.name}\n\nWhy: ${project.summary}\n\nSuggested sequence: ${sequence}\n\nFirst read: ${project.docs[0]?.url ?? project.repo}\n\nRule: keep probabilistic interpretation inside deterministic governance boundaries.`;
}

function getGlossaryTerm(term = "") {
  const needle = term.toLowerCase().trim();
  const exact = glossary.find((item) => item.term.toLowerCase() === needle);
  if (exact) return `${exact.term}: ${exact.definition}`;

  const partial = glossary.filter((item) => item.term.toLowerCase().includes(needle) || item.definition.toLowerCase().includes(needle));
  if (partial.length) {
    return partial.map((item) => `${item.term}: ${item.definition}`).join("\n");
  }

  return `No local glossary match for "${term}". Read context-stack://glossary for the full canonical glossary.`;
}

function matches(text, needles) {
  return needles.some((needle) => text.includes(needle));
}

async function fetchText(url) {
  if (!url) return "No source URL configured.";
  const response = await fetch(url, {
    headers: {
      "accept": "text/plain,text/markdown,*/*",
      "user-agent": `${SERVER.name}/${SERVER.version}`
    }
  });

  if (!response.ok) {
    throw invalidParams(`Could not fetch resource source: ${url} (${response.status})`);
  }

  return response.text();
}

function textResult(text) {
  return {
    content: [
      {
        type: "text",
        text
      }
    ],
    isError: false
  };
}

function rpcError(id, code, message, data) {
  return {
    jsonrpc: JSON_RPC,
    id,
    error: {
      code,
      message,
      ...(data === undefined ? {} : { data })
    }
  };
}

function methodNotFound(method) {
  const error = new Error(`Method not found: ${method}`);
  error.code = -32601;
  return error;
}

function invalidParams(message) {
  const error = new Error(message);
  error.code = -32602;
  return error;
}
