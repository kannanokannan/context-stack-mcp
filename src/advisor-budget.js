export const DEFAULT_ADVISOR_LIMITS = Object.freeze({
  dailyNeurons: 10_000,
  perIpRequests: 20,
  globalRequests: 100
});

function dayKey(now = Date.now()) {
  return new Date(now).toISOString().slice(0, 10);
}

function numeric(value, fallback) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

export function advisorLimits(env = {}) {
  return {
    dailyNeurons: numeric(env.ADVISOR_DAILY_NEURONS, DEFAULT_ADVISOR_LIMITS.dailyNeurons),
    perIpRequests: numeric(env.ADVISOR_PER_IP_REQUESTS, DEFAULT_ADVISOR_LIMITS.perIpRequests),
    globalRequests: numeric(env.ADVISOR_GLOBAL_REQUESTS, DEFAULT_ADVISOR_LIMITS.globalRequests)
  };
}

export class AdvisorBudget {
  constructor(state) {
    this.state = state;
  }

  async fetch(request) {
    if (request.method !== "POST") return Response.json({ ok: false, reason: "method_not_allowed" }, { status: 405 });

    const input = await request.json();
    const limits = {
      dailyNeurons: numeric(input.limits?.dailyNeurons, DEFAULT_ADVISOR_LIMITS.dailyNeurons),
      perIpRequests: numeric(input.limits?.perIpRequests, DEFAULT_ADVISOR_LIMITS.perIpRequests),
      globalRequests: numeric(input.limits?.globalRequests, DEFAULT_ADVISOR_LIMITS.globalRequests)
    };
    const day = String(input.day ?? dayKey());
    const ip = String(input.ip ?? "anonymous").slice(0, 160);
    const estimatedNeurons = Math.max(1, Math.ceil(Number(input.estimatedNeurons) || 0));
    const savedDay = await this.state.storage.get("day");
    if (savedDay !== day) {
      await this.state.storage.deleteAll();
      await this.state.storage.put("day", day);
    }
    const neurons = Number(await this.state.storage.get("neurons")) || 0;
    const requests = Number(await this.state.storage.get("requests")) || 0;
    const ipRequests = Number(await this.state.storage.get(`ip:${ip}`)) || 0;

    if (requests >= limits.globalRequests) {
      return Response.json({ ok: false, reason: "rate_limited_global" }, { status: 429 });
    }
    if (ipRequests >= limits.perIpRequests) {
      return Response.json({ ok: false, reason: "rate_limited_ip" }, { status: 429 });
    }
    if (neurons + estimatedNeurons > limits.dailyNeurons) {
      return Response.json({ ok: false, reason: "budget_exhausted" }, { status: 429 });
    }

    const nextNeurons = neurons + estimatedNeurons;
    const nextRequests = requests + 1;
    const nextIpRequests = ipRequests + 1;
    await Promise.all([
      this.state.storage.put("neurons", nextNeurons),
      this.state.storage.put("requests", nextRequests),
      this.state.storage.put(`ip:${ip}`, nextIpRequests)
    ]);
    return Response.json({
      ok: true,
      remainingNeurons: limits.dailyNeurons - nextNeurons,
      remainingIpRequests: limits.perIpRequests - nextIpRequests
    });
  }
}

export function createInMemoryBudget(limits = DEFAULT_ADVISOR_LIMITS) {
  let state = { day: dayKey(), neurons: 0, requests: 0, ipRequests: {} };

  return {
    async reserve({ ip = "anonymous", estimatedNeurons = 1, now = Date.now() }) {
      const day = dayKey(now);
      if (state.day !== day) state = { day, neurons: 0, requests: 0, ipRequests: {} };
      const ipRequests = Number(state.ipRequests[ip] ?? 0);
      if (state.requests >= limits.globalRequests) return { ok: false, reason: "rate_limited_global" };
      if (ipRequests >= limits.perIpRequests) return { ok: false, reason: "rate_limited_ip" };
      if (state.neurons + estimatedNeurons > limits.dailyNeurons) return { ok: false, reason: "budget_exhausted" };
      state.neurons += Math.ceil(estimatedNeurons);
      state.requests += 1;
      state.ipRequests[ip] = ipRequests + 1;
      return { ok: true, remainingNeurons: limits.dailyNeurons - state.neurons };
    },
    snapshot() {
      return structuredClone(state);
    }
  };
}

export async function reserveAdvisorBudget(env, request, estimatedNeurons, options = {}) {
  const limits = options.limits ?? advisorLimits(env);
  const ip = options.ip ?? "anonymous";
  const now = options.now ?? Date.now();

  if (options.budget?.reserve) {
    return options.budget.reserve({ ip, estimatedNeurons, now });
  }

  if (!env?.ADVISOR_BUDGET) {
    return { ok: false, reason: "budget_unavailable" };
  }

  const id = env.ADVISOR_BUDGET.idFromName("global");
  const stub = env.ADVISOR_BUDGET.get(id);
  const response = await stub.fetch("https://advisor-budget/reserve", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      day: dayKey(now),
      ip,
      estimatedNeurons,
      limits
    })
  });
  return response.json();
}
