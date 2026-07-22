#!/usr/bin/env node

/**
 * check-status.js  v4.0
 *
 * Reads services.json, pings every service, writes:
 *   public/status.json          – current live status with summary
 *   public/history.json         – rolling 30-day log
 *   public/incidents.json       – outage/incident timeline
 *   public/maintenance.json     – maintenance windows
 *   public/api/v1/status.json   – versioned status endpoint
 *   public/api/v1/summary.json  – health summary
 *
 * Features:
 *   - expectedStatusCode validation (optional per service)
 *   - expectedText content validation (optional per service)
 *   - Rich probe metadata (ok, statusCode, responseTime, attempts, error)
 *   - Human-readable errorReason auto-generated from error + statusCode
 *   - Summary metadata (counts by status, average response time, versioning)
 *   - Versioned API output under public/api/v1/
 *   - Retry on failure (15s delay) to filter transient blips
 *
 * Run via:  node scripts/check-status.js
 */

const fs = require("fs");
const path = require("path");

// ── Paths ────────────────────────────────────────────
const ROOT = path.resolve(__dirname, "..");
const SERVICES = path.join(ROOT, "services.json");
const PUBLIC = path.join(ROOT, "public");
const API_V1 = path.join(PUBLIC, "api", "v1");
const OUT_STATUS = path.join(PUBLIC, "status.json");
const OUT_HIST = path.join(PUBLIC, "history.json");
const OUT_INC = path.join(PUBLIC, "incidents.json");
const OUT_MAINT = path.join(PUBLIC, "maintenance.json");
const OUT_STATUS_V1 = path.join(API_V1, "status.json");
const OUT_SUMMARY_V1 = path.join(API_V1, "summary.json");
const MAINT_SRC = path.join(ROOT, "maintenance.json");
const HIST_STATE = path.join(PUBLIC, "_history_state.json");
const INC_STATE = path.join(PUBLIC, "_incidents_state.json");

fs.mkdirSync(PUBLIC, { recursive: true });
fs.mkdirSync(API_V1, { recursive: true });

// ── Thresholds ───────────────────────────────────────
const DEGRADED_MS = 2000; // response time above this → degraded

// ── Helpers ──────────────────────────────────────────
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Generate a human-readable error reason from raw probe data.
 * This is stored in status.json and shown in the UI's "Why not working" panel.
 */
function generateErrorReason(error, statusCode) {
  if (statusCode) {
    if (statusCode === 404) return "Page not found — the URL returned a 404 error.";
    if (statusCode === 500) return "Internal server error — the server encountered an unexpected condition.";
    if (statusCode === 502) return "Bad gateway — an upstream proxy received an invalid response.";
    if (statusCode === 503) return "Service unavailable — the server is temporarily unable to handle requests.";
    if (statusCode === 504) return "Gateway timeout — an upstream server failed to respond in time.";
    if (statusCode === 401) return "Unauthorized — the server requires authentication (HTTP 401).";
    if (statusCode === 403) return "Forbidden — access to this resource is denied (HTTP 403).";
    if (statusCode >= 400 && statusCode < 500) return `Client error — HTTP ${statusCode} response received from server.`;
    if (statusCode >= 500) return `Server error — HTTP ${statusCode} response received from server.`;
  }
  if (error) {
    const e = String(error).toLowerCase();
    if (error === "timeout" || e.includes("aborterror")) return "Connection timed out — the server did not respond within the timeout window.";
    if (e.includes("econnrefused")) return "Connection refused — the server actively rejected the TCP connection.";
    if (e.includes("enotfound") || e.includes("eai_noname")) return "DNS resolution failed — the hostname could not be resolved to an IP address.";
    if (e.includes("econnreset")) return "Connection reset — the server closed the connection unexpectedly.";
    if (e.includes("etimedout")) return "Connection timed out — the TCP connection attempt exceeded the time limit.";
    if (e.includes("cert") || e.includes("ssl") || e.includes("self signed") || e.includes("self-signed")) {
      return "SSL/TLS error — the certificate may be invalid, self-signed, or expired.";
    }
    if (e.includes("ehostunreach")) return "Host unreachable — no network route exists to the target server.";
    return `Network error: ${error}`;
  }
  return null;
}

async function fetchUrl(url, timeout = 10000) {
  const start = Date.now();
  try {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);

    const res = await fetch(url, {
      signal: controller.signal,
      headers: { "User-Agent": "StatusAPI-Bot/4.0" },
    });

    clearTimeout(id);
    const text = await res.text().catch(() => "");
    return {
      ok: true,
      statusCode: res.status,
      ms: Date.now() - start,
      body: text,
    };
  } catch (e) {
    const isTimeout = e.name === "AbortError";
    return {
      ok: false,
      statusCode: null,
      ms: isTimeout ? timeout : Date.now() - start,
      error: isTimeout ? "timeout" : e.message,
      body: "",
    };
  }
}

function determineStatus(result, service) {
  if (!result.ok) return "down";

  // Check expected status code
  const expectedCode = service.expectedStatusCode || 200;
  if (result.statusCode !== null && result.statusCode !== expectedCode) {
    // Allow any 2xx if expectedStatusCode is 200 and code is in 2xx range
    if (expectedCode === 200 && result.statusCode >= 200 && result.statusCode < 300) {
      // still ok
    } else {
      return "down";
    }
  }

  // Check expected text if provided
  if (service.expectedText && result.ok) {
    if (!result.body.includes(service.expectedText)) return "down";
  }

  // Degraded for slow responses
  if (result.ok && result.statusCode >= 200 && result.statusCode < 400) {
    return result.ms >= DEGRADED_MS ? "degraded" : "up";
  }

  return "down";
}

async function checkHttp(service) {
  const result = await fetchUrl(service.url, service.timeout ?? 10000);
  const status = determineStatus(result, service);
  const errorReason = status === "down"
    ? generateErrorReason(result.error, result.statusCode)
    : null;

  return {
    serviceId: service.id,
    status,
    statusCode: result.statusCode,
    responseTime: result.ms,
    timestamp: new Date().toISOString(),
    lastChecked: new Date().toISOString(),
    uptime: status !== "down" ? 100 : 0,
    error: result.error || null,
    errorReason,
    probe: {
      ok: result.ok,
      statusCode: result.statusCode,
      responseTime: result.ms,
      attempts: 1,
      error: result.error || null,
      matchedExpectedText: service.expectedText
        ? result.body.includes(service.expectedText)
        : null,
    },
  };
}

async function checkGithub(service) {
  const apiUrl = `https://api.github.com/repos/${service.owner}/${service.repo}`;
  const result = await fetchUrl(apiUrl, service.timeout ?? 10000);
  const up = result.ok && result.statusCode === 200;
  const status = up ? (result.ms >= DEGRADED_MS ? "degraded" : "up") : "down";
  const errorReason = status === "down"
    ? generateErrorReason(result.error, result.statusCode)
    : null;

  return {
    serviceId: service.id,
    status,
    statusCode: result.statusCode,
    responseTime: result.ms,
    timestamp: new Date().toISOString(),
    lastChecked: new Date().toISOString(),
    uptime: up ? 100 : 0,
    error: result.error || null,
    errorReason,
    probe: {
      ok: result.ok,
      statusCode: result.statusCode,
      responseTime: result.ms,
      attempts: 1,
      error: result.error || null,
      matchedExpectedText: null,
    },
  };
}

async function checkService(service) {
  const doCheck = async () => {
    try {
      if (service.type === "github") return await checkGithub(service);
      return await checkHttp(service);
    } catch (e) {
      return {
        serviceId: service.id,
        status: "down",
        statusCode: null,
        responseTime: null,
        timestamp: new Date().toISOString(),
        lastChecked: new Date().toISOString(),
        uptime: 0,
        error: e.message,
        errorReason: generateErrorReason(e.message, null),
      };
    }
  };

  let result = await doCheck();

  // Retry once on down to filter transient failures
  if (result.status === "down") {
    process.stdout.write(`\n    [Retry] ${service.name} down. Waiting 15s to verify... `);
    await sleep(15000);
    result = await doCheck();
    if (result.status !== "down") {
      result.probe = { ...(result.probe ?? {}), attempts: 2 };
    }
  }

  return result;
}

// ── JSON helpers ─────────────────────────────────────
function loadJson(filePath, fallback = {}) {
  try {
    const content = fs.readFileSync(filePath, "utf8");
    if (content.includes("<<<<<<<") || content.includes(">>>>>>>")) {
      console.warn(`[WARN] Conflict markers in ${filePath}. Resetting.`);
      return fallback;
    }
    return JSON.parse(content);
  } catch {
    return fallback;
  }
}

function today() {
  return new Date().toISOString().split("T")[0];
}

// ── History management ────────────────────────────────
function loadHistoryState() {
  return loadJson(HIST_STATE, {});
}

function saveHistoryState(state) {
  fs.writeFileSync(HIST_STATE, JSON.stringify(state, null, 2));
}

function updateHistory(state, serviceId, checkResult) {
  if (!state[serviceId]) state[serviceId] = [];

  const todayStr = today();
  let existing = state[serviceId].find((e) => e.date === todayStr);

  if (!existing) {
    existing = {
      date: todayStr,
      status: checkResult.status,
      responseTime: checkResult.responseTime ?? null,
      avgResponseTime: checkResult.responseTime ?? null,
      upCount: 0,
      totalCount: 0,
      incidents: 0,
    };
    state[serviceId].push(existing);
  }

  existing.totalCount += 1;
  const isUp = checkResult.status === "up" || checkResult.status === "degraded";
  if (isUp) existing.upCount += 1;
  else existing.incidents += 1;

  existing.status = checkResult.status;
  existing.responseTime = checkResult.responseTime ?? existing.responseTime;

  // Proper rolling average response time
  if (checkResult.responseTime != null) {
    const prevAvg = existing.avgResponseTime ?? checkResult.responseTime;
    const n = existing.totalCount;
    existing.avgResponseTime = Math.round(
      (prevAvg * (n - 1) + checkResult.responseTime) / n
    );
  }

  existing.uptime = Math.round((existing.upCount / existing.totalCount) * 100);

  // Keep only 30 days
  state[serviceId] = state[serviceId]
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-30);

  return state;
}

function calcUptime30d(history) {
  if (!history || history.length === 0) return 100;
  const recent = history.slice(-30);
  const totalUp = recent.reduce((acc, h) => acc + (h.upCount ?? 0), 0);
  const totalChecks = recent.reduce((acc, h) => acc + (h.totalCount ?? 0), 0);

  if (totalChecks === 0) {
    const avg = recent.reduce((acc, h) => acc + (h.uptime ?? 100), 0) / recent.length;
    return Math.round(avg * 100) / 100;
  }

  return Math.round((totalUp / totalChecks) * 10000) / 100;
}

// ── Incident management ───────────────────────────────
function loadIncidentState() {
  return loadJson(INC_STATE, { openIncidents: {}, closedIncidents: [] });
}

function saveIncidentState(state) {
  fs.writeFileSync(INC_STATE, JSON.stringify(state, null, 2));
}

function updateIncidents(incState, serviceId, serviceName, checkResult) {
  const now = new Date().toISOString();
  const isDown = checkResult.status === "down";
  const open = incState.openIncidents;

  if (isDown && !open[serviceId]) {
    open[serviceId] = {
      id: `${serviceId}-${Date.now()}`,
      serviceId,
      serviceName,
      status: checkResult.status,
      statusCode: checkResult.statusCode,
      startTime: now,
      lastSeenDown: now,
      error: checkResult.error ?? null,
      errorReason: checkResult.errorReason ?? null,
    };
    console.log(`  ⚠  Incident OPENED for ${serviceName}`);
  } else if (!isDown && open[serviceId]) {
    const incident = open[serviceId];
    const durationMs = new Date(now) - new Date(incident.startTime);
    incState.closedIncidents.unshift({
      ...incident,
      resolvedTime: now,
      durationMs,
      resolvedStatus: checkResult.status,
    });
    delete open[serviceId];
    incState.closedIncidents = incState.closedIncidents.slice(0, 90);
    console.log(`  ✓  Incident RESOLVED for ${serviceName}`);
  } else if (isDown && open[serviceId]) {
    open[serviceId].lastSeenDown = now;
    // Update errorReason if new info available
    if (checkResult.errorReason) {
      open[serviceId].errorReason = checkResult.errorReason;
    }
  }

  return incState;
}

// ── Main ─────────────────────────────────────────────
async function main() {
  const { services } = loadJson(SERVICES, { services: [] });
  const histState = loadHistoryState();
  const incState = loadIncidentState();
  const now = new Date().toISOString();

  console.log(`\n[${now}] Checking ${services.length} services…`);
  console.log("─".repeat(50));

  const results = [];
  for (const service of services) {
    process.stdout.write(`  → ${service.name.padEnd(30)} `);
    const checkResult = await checkService(service);
    updateHistory(histState, service.id, checkResult);
    updateIncidents(incState, service.id, service.name, checkResult);

    const serviceHistory = histState[service.id] ?? [];
    const uptime30d = calcUptime30d(serviceHistory);

    results.push({ service, currentStatus: checkResult, uptime30d });

    const color =
      checkResult.status === "up"
        ? "\x1b[32m"
        : checkResult.status === "degraded"
        ? "\x1b[33m"
        : "\x1b[31m";
    const rt = checkResult.responseTime != null ? ` (${checkResult.responseTime}ms)` : "";
    const reason = checkResult.errorReason ? ` — ${checkResult.errorReason.split("—")[0].trim()}` : "";
    console.log(`${color}${checkResult.status}\x1b[0m${rt}${reason}`);
  }

  console.log("─".repeat(50));

  const allOperational = results.every(
    (r) => r.currentStatus.status === "up" || r.currentStatus.status === "degraded"
  );
  const anyDown = results.some((r) => r.currentStatus.status === "down");
  const anyDegraded = results.some((r) => r.currentStatus.status === "degraded");

  // GitHub Actions outputs
  if (process.env.GITHUB_OUTPUT) {
    const failingServices = results
      .filter((r) => r.currentStatus.status === "down")
      .map((r) => r.service.name)
      .join(", ");
    const degradedServices = results
      .filter((r) => r.currentStatus.status === "degraded")
      .map((r) => r.service.name)
      .join(", ");

    fs.appendFileSync(process.env.GITHUB_OUTPUT, `outage_detected=${anyDown}\n`);
    fs.appendFileSync(process.env.GITHUB_OUTPUT, `degraded_detected=${anyDegraded}\n`);
    fs.appendFileSync(process.env.GITHUB_OUTPUT, `failing_services=${failingServices}\n`);
    fs.appendFileSync(process.env.GITHUB_OUTPUT, `degraded_services=${degradedServices}\n`);
  }

  // ── Write status.json ─────────────────────────────
  const countsByStatus = {
    up: results.filter((r) => r.currentStatus.status === "up").length,
    degraded: results.filter((r) => r.currentStatus.status === "degraded").length,
    down: results.filter((r) => r.currentStatus.status === "down").length,
    maintenance: 0,
  };

  const avgResponseTime = Math.round(
    results.reduce((sum, r) => sum + (r.currentStatus.responseTime || 0), 0) /
      (results.filter((r) => r.currentStatus.responseTime != null).length || 1)
  );

  const statusData = {
    success: true,
    timestamp: now,
    version: "4.0",
    services: results,
    totalServices: results.length,
    allOperational,
    anyDown,
    anyDegraded,
    summary: {
      countsByStatus,
      averageResponseTime: avgResponseTime,
      lastChecked: now,
      servicesHealthy: countsByStatus.up + countsByStatus.degraded,
    },
  };
  fs.writeFileSync(OUT_STATUS, JSON.stringify(statusData, null, 2));
  fs.writeFileSync(OUT_STATUS_V1, JSON.stringify(statusData, null, 2));

  // ── Write api/v1/summary.json ─────────────────────
  const summaryData = {
    success: true,
    timestamp: now,
    version: "4.0",
    status: anyDown ? "outage" : anyDegraded ? "degraded" : "operational",
    summary: {
      countsByStatus,
      averageResponseTime: avgResponseTime,
      servicesHealthy: countsByStatus.up + countsByStatus.degraded,
      totalServices: results.length,
      uptimePercentage:
        results.length > 0
          ? Math.round(((countsByStatus.up + countsByStatus.degraded) / results.length) * 10000) / 100
          : 100,
    },
  };
  fs.writeFileSync(OUT_SUMMARY_V1, JSON.stringify(summaryData, null, 2));

  // ── Write history.json ────────────────────────────
  const historyData = {
    success: true,
    timestamp: now,
    services: results.map((r) => ({
      serviceId: r.service.id,
      serviceName: r.service.name,
      overallUptime30d: r.uptime30d,
      history: histState[r.service.id] ?? [],
    })),
  };
  fs.writeFileSync(OUT_HIST, JSON.stringify(historyData, null, 2));

  // ── Write incidents.json ──────────────────────────
  const incidentsData = {
    success: true,
    timestamp: now,
    openIncidents: Object.values(incState.openIncidents),
    closedIncidents: incState.closedIncidents,
    totalIncidents:
      Object.values(incState.openIncidents).length + incState.closedIncidents.length,
  };
  fs.writeFileSync(OUT_INC, JSON.stringify(incidentsData, null, 2));

  // ── Write maintenance.json ────────────────────────
  const maintSrc = fs.existsSync(MAINT_SRC)
    ? fs.readFileSync(MAINT_SRC, "utf8")
    : '{"services":{}}';
  fs.writeFileSync(OUT_MAINT, maintSrc);

  // ── Save state ────────────────────────────────────
  saveHistoryState(histState);
  saveIncidentState(incState);

  const overall = anyDown
    ? "\x1b[31mOutage Detected\x1b[0m"
    : anyDegraded
    ? "\x1b[33mDegraded\x1b[0m"
    : "\x1b[32mAll Operational\x1b[0m";

  console.log(`\n✓ Done. Status: ${overall}`);
  console.log(`  Written: public/status.json`);
  console.log(`  Written: public/history.json`);
  console.log(`  Written: public/incidents.json`);
  console.log(`  Written: public/maintenance.json`);
  console.log(`  Written: public/api/v1/status.json`);
  console.log(`  Written: public/api/v1/summary.json`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
