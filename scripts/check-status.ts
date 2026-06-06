import fs from "fs";
import path from "path";
import {
  checkHttpStatus,
  checkGitHubStatus,
  calculateUptime,
} from "../src/lib/status-checker";
import type { StatusRecord } from "../src/lib/types";

const SERVICES_FILE = path.join(process.cwd(), "services.json");
const MAINTENANCE_FILE = path.join(process.cwd(), "maintenance.json");
const STATUS_OUTPUT = path.join(process.cwd(), "public", "status.json");
const HISTORY_FILE = path.join(process.cwd(), "public", "history.json");

async function main() {
  console.log("Starting status check...");

  if (!fs.existsSync(SERVICES_FILE)) {
    console.error("services.json not found");
    process.exit(1);
  }

  const servicesConfig = JSON.parse(fs.readFileSync(SERVICES_FILE, "utf-8"));
  const services = servicesConfig.services || [];

  let history: Record<string, StatusRecord[]> = {};
  if (fs.existsSync(HISTORY_FILE)) {
    history = JSON.parse(fs.readFileSync(HISTORY_FILE, "utf-8"));
  }

  const results = [];
  const timestamp = new Date().toISOString();

  for (const service of services) {
    console.log(`Checking ${service.name} (${service.id})...`);
    let statusRecord: StatusRecord;

    try {
      if (service.type === "github") {
        statusRecord = await checkGitHubStatus(
          service.id,
          service.owner || "",
          service.repo || "",
          process.env.GITHUB_TOKEN,
        );
      } else {
        statusRecord = await checkHttpStatus(
          service.id,
          service.url,
          service.timeout || 5000,
        );
      }
    } catch (error) {
      console.error(`Failed to check ${service.id}:`, error);
      statusRecord = {
        serviceId: service.id,
        status: "down",
        statusCode: 0,
        responseTime: 0,
        timestamp,
        lastChecked: timestamp,
        uptime: 0,
        error: error instanceof Error ? error.message : String(error),
      };
    }

    // Update history
    if (!history[service.id]) {
      history[service.id] = [];
    }
    history[service.id].push(statusRecord);

    // Keep only last 1000 for now to keep JSON small
    if (history[service.id].length > 1000) {
      history[service.id] = history[service.id].slice(-1000);
    }

    const uptime30d = calculateUptime(history[service.id], 30);

    results.push({
      service,
      currentStatus: statusRecord,
      uptime30d,
    });
  }

  // Write status.json
  const statusData = {
    success: true,
    timestamp,
    services: results,
    totalServices: results.length,
    allOperational: results.every((s) => s.currentStatus.status === "up"),
  };

  if (!fs.existsSync(path.dirname(STATUS_OUTPUT))) {
    fs.mkdirSync(path.dirname(STATUS_OUTPUT), { recursive: true });
  }

  fs.writeFileSync(STATUS_OUTPUT, JSON.stringify(statusData, null, 2));
  fs.writeFileSync(HISTORY_FILE, JSON.stringify(history, null, 2));

  // Also copy maintenance.json to public if it exists
  if (fs.existsSync(MAINTENANCE_FILE)) {
    const maintenanceData = JSON.parse(
      fs.readFileSync(MAINTENANCE_FILE, "utf-8"),
    );
    fs.writeFileSync(
      path.join(process.cwd(), "public", "maintenance.json"),
      JSON.stringify({ success: true, data: maintenanceData }, null, 2),
    );
  }

  console.log("Status check complete.");
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
