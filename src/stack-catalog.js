export const SERVER = {
  name: "context-stack-mcp",
  version: "0.1.0",
  protocolVersion: "2025-06-18",
  endpoint: "https://mcp.context-stack.org/mcp",
  doctrine: "Probabilistic intelligence must operate inside deterministic governance boundaries."
};

const gh = "https://github.com/kannanokannan";
const raw = "https://raw.githubusercontent.com/kannanokannan";

export const projects = [
  {
    id: "context-stack",
    name: "context-stack",
    layer: "canonical coordination",
    question: "What terms, decisions, and doctrine govern the stack?",
    status: "active",
    repo: `${gh}/context-stack`,
    summary: "Canonical coordination layer for stack terminology, locked decisions, and family doctrine.",
    docs: [
      { label: "README.md", url: `${gh}/context-stack/blob/main/README.md` },
      { label: "GLOSSARY.md", url: `${gh}/context-stack/blob/main/GLOSSARY.md` },
      { label: "DECISIONS.md", url: `${gh}/context-stack/blob/main/DECISIONS.md` },
      { label: "llms.txt", url: `${gh}/context-stack/blob/main/llms.txt` }
    ]
  },
  {
    id: "contextops",
    name: "ContextOps",
    layer: "organizational context governance",
    question: "How does an org govern its AI context?",
    status: "v0.1 active",
    repo: `${gh}/ContextOps`,
    summary: "Vendor-neutral framework for governing enterprise AI context across Capture, Curate, Supply, and Renew.",
    docs: [
      { label: "FRAMEWORK.md", url: `${gh}/ContextOps/blob/main/FRAMEWORK.md` },
      { label: "README.md", url: `${gh}/ContextOps/blob/main/README.md` },
      { label: "DOCUMENT_MAP.md", url: `${gh}/ContextOps/blob/main/DOCUMENT_MAP.md` },
      { label: "framework.yaml", url: `${gh}/ContextOps/blob/main/framework.yaml` },
      { label: "agent-instructions/README.md", url: `${gh}/ContextOps/blob/main/agent-instructions/README.md` }
    ]
  },
  {
    id: "contextboundary",
    name: "ContextBoundary",
    layer: "egress governance",
    question: "Where is data allowed to go?",
    status: "v0.1 active",
    repo: `${gh}/ContextBoundary`,
    summary: "Deployment-agnostic egress governance specification for AI data flows, jurisdiction, and vendor zones.",
    docs: [
      { label: "FRAMEWORK.md", url: `${gh}/ContextBoundary/blob/main/FRAMEWORK.md` },
      { label: "README.md", url: `${gh}/ContextBoundary/blob/main/README.md` },
      { label: "RATIONALE.md", url: `${gh}/ContextBoundary/blob/main/RATIONALE.md` },
      { label: "tier-classification.md", url: `${gh}/ContextBoundary/blob/main/tier-classification.md` },
      { label: "gdpr.md", url: `${gh}/ContextBoundary/blob/main/gdpr.md` },
      { label: "contextops-mapping.md", url: `${gh}/ContextBoundary/blob/main/contextops-mapping.md` }
    ]
  },
  {
    id: "sthala",
    name: "Sthala",
    layer: "governed runtime reference",
    question: "Where does the AI actually run?",
    status: "v0.1 Alpha",
    repo: `${gh}/Sthala`,
    summary: "Sovereign on-premise AI reference framework. LLMs narrate; deterministic code computes.",
    docs: [
      { label: "SPEC.md", url: `${gh}/Sthala/blob/main/SPEC.md` },
      { label: "AGENTS.md", url: `${gh}/Sthala/blob/main/AGENTS.md` },
      { label: "CLAUDE.md", url: `${gh}/Sthala/blob/main/CLAUDE.md` },
      { label: "README.md", url: `${gh}/Sthala/blob/main/README.md` }
    ]
  },
  {
    id: "griha",
    name: "Griha",
    layer: "product/adoption layer",
    question: "How does governed AI become a working product layer?",
    status: "proof of concept",
    repo: `${gh}/Griha`,
    summary: "Product layer above the governance projects. It inherits ContextOps, ContextBoundary, and Sthala principles.",
    docs: [
      { label: "README.md", url: `${gh}/Griha/blob/main/README.md` }
    ]
  }
];

export const resources = [
  {
    uri: "context-stack://overview",
    name: "stack-overview",
    title: "Context Stack Overview",
    description: "Canonical overview of the Context Stack and project relationships.",
    mimeType: "text/markdown",
    text: stackOverview()
  },
  {
    uri: "context-stack://glossary",
    name: "glossary",
    title: "Canonical Glossary",
    description: "Single source of truth for terminology across the stack.",
    mimeType: "text/markdown",
    sourceUrl: `${raw}/context-stack/main/GLOSSARY.md`
  },
  {
    uri: "context-stack://decisions",
    name: "decisions",
    title: "Locked Decisions",
    description: "Cross-project decisions that should not be contradicted.",
    mimeType: "text/markdown",
    sourceUrl: `${raw}/context-stack/main/DECISIONS.md`
  },
  {
    uri: "context-stack://contextops/framework",
    name: "contextops-framework",
    title: "ContextOps Framework",
    description: "Core ContextOps framework specification.",
    mimeType: "text/markdown",
    sourceUrl: `${raw}/ContextOps/main/FRAMEWORK.md`
  },
  {
    uri: "context-stack://contextops/manifest",
    name: "contextops-manifest",
    title: "ContextOps Machine-Readable Manifest",
    description: "Structured model for ContextOps stages, practices, roles, and maturity levels.",
    mimeType: "application/yaml",
    sourceUrl: `${raw}/ContextOps/main/framework.yaml`
  },
  {
    uri: "context-stack://contextboundary/framework",
    name: "contextboundary-framework",
    title: "ContextBoundary Framework",
    description: "Core ContextBoundary specification.",
    mimeType: "text/markdown",
    sourceUrl: `${raw}/ContextBoundary/main/FRAMEWORK.md`
  },
  {
    uri: "context-stack://contextboundary/rationale",
    name: "contextboundary-rationale",
    title: "ContextBoundary Rationale",
    description: "Sovereignty gap, CLOUD Act, regulatory timing, and design decisions.",
    mimeType: "text/markdown",
    sourceUrl: `${raw}/ContextBoundary/main/RATIONALE.md`
  },
  {
    uri: "context-stack://sthala/spec",
    name: "sthala-spec",
    title: "Sthala Specification",
    description: "Architecture and six-layer pipeline specification.",
    mimeType: "text/markdown",
    sourceUrl: `${raw}/Sthala/main/SPEC.md`
  },
  {
    uri: "context-stack://griha/readme",
    name: "griha-readme",
    title: "Griha README",
    description: "Product/adoption layer overview.",
    mimeType: "text/markdown",
    sourceUrl: `${raw}/Griha/main/README.md`
  }
];

export const glossary = [
  { term: "Context Stack", definition: "The sibling open-source projects together: ContextOps, ContextBoundary, Sthala, plus Griha as the product layer." },
  { term: "ContextOps", definition: "Organizational context governance for enterprise AI systems." },
  { term: "ContextBoundary", definition: "Deployment-agnostic egress governance for AI data flows." },
  { term: "Sthala", definition: "A governed runtime reference where LLMs narrate and deterministic code computes." },
  { term: "Griha", definition: "Product/adoption layer that inherits stack governance principles." },
  { term: "Egress Tier", definition: "Classification of where data is permitted to flow. Use Egress Tier, never Privacy Tier." },
  { term: "Spine", definition: "ContextOps lifecycle: Capture, Curate, Supply, Renew." },
  { term: "Triad", definition: "ContextOps pillars: People, Process, Context." },
  { term: "Narrate/Compute Split", definition: "LLMs handle interpretation and narration; deterministic code owns computation and side effects." }
];

export function findProject(idOrName) {
  if (!idOrName) return undefined;
  const needle = String(idOrName).toLowerCase().replace(/[^a-z0-9]/g, "");
  return projects.find((project) => {
    const id = project.id.toLowerCase().replace(/[^a-z0-9]/g, "");
    const name = project.name.toLowerCase().replace(/[^a-z0-9]/g, "");
    return id === needle || name === needle;
  });
}

export function findResource(uri) {
  return resources.find((resource) => resource.uri === uri);
}

export function stackOverview() {
  const rows = projects
    .map((project) => `- ${project.name}: ${project.question} Layer: ${project.layer}. Status: ${project.status}. Repo: ${project.repo}`)
    .join("\n");

  return `# Context Stack\n\n> ${SERVER.doctrine}\n\nThe Context Stack is an open-source AI governance stack under github.com/kannanokannan. It separates interpretation from authority: intelligence proposes, governance validates, execution authorizes.\n\n${rows}\n`;
}