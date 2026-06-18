#!/usr/bin/env node

/**
 * check-status.js
 *
 * Reads services.json, pings every service, writes:
 *   public/status.json
 *   public/history.json  (rolling 30-day log)
 *
 * Run via:  node scripts/check-status.js
 */

const fs = require("fs");
const path = require("path");
const http = require("http");
const https = require("https");

// ── Paths ────────────────────────────────────────────
const ROOT = path.resolve(__dirname, "..");
const SERVICES = path.join(ROOT, "services.json");
const PUBLIC = path.join(ROOT, "public");
const OUT_STATUS = path.join(PUBLIC, "status.json");
const OUT_HIST = path.join(PUBLIC, "history.json");
const OUT_MAINT = path.join(PUBLIC, "maintenance.json");
const MAINT_SRC = path.join(ROOT, "maintenance.json");
const HIST_STATE = path.join(PUBLIC, "_history_state.json");

fs.mkdirSync(PUBLIC, { recursive: true });

// ── Helpers ──────────────────────────────────────────
function fetchUrl(url, timeout = 8000) {
  return new Promise((resolve) => {
    const start = Date.now();
    const mod = url.startsWith("https") ? https : http;
    const options = {
      timeout,
      headers: {
        "User-Agent": "StatusAPI-Bot/1.0",
      },
    };
    const req = mod.get(url, options, (res) => {
      res.resume();
      resolve({ ok: true, statusCode: res.statusCode, ms: Date.now() - start });
    });
    req.on("error", (e) =>
      resolve({
        ok: false,
        statusCode: null,
        ms: Date.now() - start,
        error: e.message,
      }),
    );
    req.on("timeout", () => {
      req.destroy();
      resolve({ ok: false, statusCode: null, ms: timeout, error: "timeout" });
    });
  });
}

async function checkHttp(service) {
  const result = await fetchUrl(service.url, service.timeout ?? 8000);
  const up = result.ok && result.statusCode >= 200 && result.statusCode < 400;
  return {
    serviceId: service.id,
    status: up ? "up" : "down",
    statusCode: result.statusCode,
    responseTime: result.ms,
    timestamp: new Date().toISOString(),
    lastChecked: new Date().toISOString(),
    uptime: up ? 100 : 0,
    error: result.error,
  };
}

async function checkGithub(service) {
  const apiUrl = `https://api.github.com/repos/${service.owner}/${service.repo}`;
  const result = await fetchUrl(apiUrl, service.timeout ?? 8000);
  const up = result.ok && result.statusCode === 200;
  return {
    serviceId: service.id,
    status: up ? "up" : "down",
    statusCode: result.statusCode,
    responseTime: result.ms,
    timestamp: new Date().toISOString(),
    lastChecked: new Date().toISOString(),
    uptime: up ? 100 : 0,
    error: result.error,
  };
}

async function checkService(service) {
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
    };
  }
}

// ── History management ────────────────────────────────
function loadJson(filePath, fallback = {}) {
  try {
    const content = fs.readFileSync(filePath, "utf8");
    // Simple check for git conflict markers
    if (content.includes("<<<<<<<") || content.includes(">>>>>>>")) {
      console.warn(
        `[WARN] Conflict markers detected in ${filePath}. Resetting.`,
      );
      return fallback;
    }
    return JSON.parse(content);
  } catch {
    return fallback;
  }
}

function loadHistoryState() {
  return loadJson(HIST_STATE, {});
}

function saveHistoryState(state) {
  fs.writeFileSync(HIST_STATE, JSON.stringify(state, null, 2));
}

function today() {
  return new Date().toISOString().split("T")[0];
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
      upCount: 0,
      totalCount: 0,
      incidents: 0,
    };
    state[serviceId].push(existing);
  }

  existing.totalCount += 1;
  if (checkResult.status === "up") {
    existing.upCount += 1;
  } else {
    existing.incidents += 1;
  }

  existing.status = checkResult.status;
  existing.responseTime = checkResult.responseTime ?? existing.responseTime;
  // Calculate percentage
  existing.uptime = Math.round((existing.upCount / existing.totalCount) * 100);

  // Keep only 90 days of detailed state
  state[serviceId] = state[serviceId]
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-90);

  return state;
}

function calcUptime30d(history) {
  if (!history || history.length === 0) return 100;
  // Use last 30 entries
  const recent = history.slice(-30);
  const totalUp = recent.reduce((acc, h) => acc + (h.upCount ?? 0), 0);
  const totalChecks = recent.reduce((acc, h) => acc + (h.totalCount ?? 0), 0);

  if (totalChecks === 0) {
    // Fallback for old data format
    const avg = recent.reduce((acc, h) => acc + h.uptime, 0) / recent.length;
    return Math.round(avg * 100) / 100;
  }

  return Math.round((totalUp / totalChecks) * 10000) / 100;
}

// ── Main ─────────────────────────────────────────────
async function main() {
  const { services } = loadJson(SERVICES, { services: [] });
  const histState = loadHistoryState();
  const now = new Date().toISOString();

  console.log(`[${now}] Checking ${services.length} services…`);

  const results = [];
  for (const service of services) {
    process.stdout.write(`  → ${service.name} (${service.type})… `);
    const checkResult = await checkService(service);
    updateHistory(histState, service.id, checkResult);

    const serviceHistory = histState[service.id] ?? [];
    const uptime30d = calcUptime30d(serviceHistory);

    results.push({ service, currentStatus: checkResult, uptime30d });
    console.log(
      checkResult.status === "up"
        ? `\x1b[32mup\x1b[0m (${checkResult.responseTime}ms)`
        : `\x1b[31m${checkResult.status}\x1b[0m`,
    );
  }

  const allOperational = results.every((r) => r.currentStatus.status === "up");

  if (!allOperational) {
    const failingServices = results
      .filter((r) => r.currentStatus.status !== "up")
      .map((r) => r.service.name)
      .join(", ");

    if (process.env.GITHUB_OUTPUT) {
      const fs = require("fs");
      fs.appendFileSync(process.env.GITHUB_OUTPUT, `outage_detected=true\n`);
      fs.appendFileSync(
        process.env.GITHUB_OUTPUT,
        `failing_services=${failingServices}\n`,
      );
    }
  }

  // status.json
  const statusData = {
    success: true,
    timestamp: now,
    services: results,
    totalServices: results.length,
    allOperational,
  };
  fs.writeFileSync(OUT_STATUS, JSON.stringify(statusData, null, 2));

  // history.json
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

  // maintenance.json — copy from root config
  const maintSrc = fs.existsSync(MAINT_SRC)
    ? fs.readFileSync(MAINT_SRC, "utf8")
    : '{"services":{}}';
  fs.writeFileSync(OUT_MAINT, maintSrc);

  saveHistoryState(histState);

  console.log(
    `\n✓ Done. Status: ${allOperational ? "\x1b[32mAll Operational\x1b[0m" : "\x1b[31mIssues Detected\x1b[0m"}`,
  );
  console.log(`  Written: ${OUT_STATUS}`);
  console.log(`  Written: ${OUT_HIST}`);
  console.log(`  Written: ${OUT_MAINT}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
