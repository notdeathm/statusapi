#!/usr/bin/env node

/**
 * seed-history.js
 *
 * Generates 30 days of realistic synthetic history for all services defined in services.json.
 * Preserves any existing real history — only fills in MISSING days.
 *
 * Run once: node scripts/seed-history.js
 */

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const SERVICES_FILE = path.join(ROOT, "services.json");
const PUBLIC = path.join(ROOT, "public");
const HIST_STATE = path.join(PUBLIC, "_history_state.json");
const OUT_HIST = path.join(PUBLIC, "history.json");

fs.mkdirSync(PUBLIC, { recursive: true });

function loadJson(filePath, fallback = {}) {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch {
    return fallback;
  }
}

function randomBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Realistic response time ranges per service type
const RT_RANGES = {
  http: { min: 80, max: 600 },
  github: { min: 100, max: 400 },
};

// Simulate realistic uptime with occasional blips
function generateDayStatus(seed) {
  const rand = Math.random();
  // ~95% chance of being fully operational
  if (rand > 0.05) return "up";
  // ~3% degraded
  if (rand > 0.02) return "degraded";
  // ~2% down
  return "down";
}

function generateDayHistory(serviceType, existingDates) {
  const entries = [];
  const now = new Date();

  // Generate for last 30 days
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];

    // Skip if we already have data for this day
    if (existingDates.has(dateStr)) continue;

    const status = generateDayStatus(i);
    const range = RT_RANGES[serviceType] || RT_RANGES.http;
    const baseRt = randomBetween(range.min, range.max);
    const avgRt = status === "degraded"
      ? randomBetween(2000, 4000)
      : status === "down"
      ? randomBetween(8000, 10000)
      : baseRt;

    // Simulate check counts (288 checks/day = every 5 min)
    const totalCount = randomBetween(250, 288);
    const downCount = status === "down"
      ? randomBetween(1, Math.floor(totalCount * 0.3))
      : status === "degraded"
      ? 0
      : 0;
    const upCount = totalCount - downCount;
    const uptime = Math.round((upCount / totalCount) * 100);

    entries.push({
      date: dateStr,
      status: uptime < 50 ? "down" : status,
      responseTime: status === "down" ? null : baseRt,
      avgResponseTime: status === "down" ? null : avgRt,
      upCount,
      totalCount,
      incidents: downCount > 0 ? 1 : 0,
      uptime,
    });
  }

  return entries;
}

function calcUptime30d(history) {
  if (!history || history.length === 0) return 100;
  const recent = history.slice(-30);
  const totalUp = recent.reduce((acc, h) => acc + (h.upCount ?? 0), 0);
  const totalChecks = recent.reduce((acc, h) => acc + (h.totalCount ?? 0), 0);
  if (totalChecks === 0) return 100;
  return Math.round((totalUp / totalChecks) * 10000) / 100;
}

function main() {
  const { services } = loadJson(SERVICES_FILE, { services: [] });
  const histState = loadJson(HIST_STATE, {});

  console.log(`\nSeeding 30-day history for ${services.length} services…`);
  console.log("─".repeat(50));

  for (const service of services) {
    const existing = histState[service.id] ?? [];
    const existingDates = new Set(existing.map((e) => e.date));
    const missingCount = 30 - existingDates.size;

    if (missingCount <= 0) {
      console.log(`  ✓ ${service.name.padEnd(30)} already has 30 days of data`);
      continue;
    }

    const newEntries = generateDayHistory(service.type ?? "http", existingDates);
    const merged = [...existing, ...newEntries]
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-30);

    histState[service.id] = merged;
    console.log(`  + ${service.name.padEnd(30)} seeded ${newEntries.length} days (${merged.length} total)`);
  }

  // Write updated history state
  fs.writeFileSync(HIST_STATE, JSON.stringify(histState, null, 2));

  // Write history.json
  const now = new Date().toISOString();
  const historyData = {
    success: true,
    timestamp: now,
    services: services.map((s) => {
      const history = histState[s.id] ?? [];
      return {
        serviceId: s.id,
        serviceName: s.name,
        overallUptime30d: calcUptime30d(history),
        history,
      };
    }),
  };
  fs.writeFileSync(OUT_HIST, JSON.stringify(historyData, null, 2));

  console.log("─".repeat(50));
  console.log(`\n✓ Done! Written:`);
  console.log(`  public/_history_state.json`);
  console.log(`  public/history.json`);
  console.log(`\nCommit these files to make the history visible on your status page.`);
}

main();
