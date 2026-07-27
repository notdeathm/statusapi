"use client";

import { useState } from "react";
import Link from "next/link";
import Nav from "@/components/Nav";
import { BASE_PATH } from "@/lib/config";

const BASE_URL = `https://notdeathm.is-a.dev${BASE_PATH}`;

interface CodeBlockProps {
  lang: string;
  code: string;
}

function CodeBlock({ lang, code }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
      const ta = document.createElement("textarea");
      ta.value = code;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="code-block">
      <div className="code-block-header">
        <span className="code-block-lang">{lang}</span>
        <button
          className={`code-copy-btn${copied ? " copied" : ""}`}
          onClick={handleCopy}
          aria-label="Copy code"
        >
          {copied ? (
            <>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              Copied!
            </>
          ) : (
            <>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
              </svg>
              Copy
            </>
          )}
        </button>
      </div>
      <pre>{code}</pre>
    </div>
  );
}

const ENDPOINTS = [
  {
    id: "status",
    method: "GET",
    path: "/status.json",
    title: "Current Status",
    desc: "Returns the real-time status of all monitored services including response times, HTTP status codes, and overall system health.",
    tryUrl: `${BASE_URL}/status.json`,
    response: `{
  "success": true,
  "timestamp": "2026-07-22T18:00:00.000Z",
  "version": "3.0",
  "totalServices": 3,
  "allOperational": true,
  "anyDown": false,
  "anyDegraded": false,
  "summary": {
    "countsByStatus": { "up": 3, "degraded": 0, "down": 0 },
    "averageResponseTime": 145,
    "lastChecked": "2026-07-22T18:00:00.000Z"
  },
  "services": [
    {
      "service": {
        "id": "notdeath-website",
        "name": "NotDeath Website",
        "url": "https://notdeathm.is-a.dev",
        "type": "http"
      },
      "currentStatus": {
        "status": "up",
        "statusCode": 200,
        "responseTime": 142,
        "lastChecked": "2026-07-22T18:00:00.000Z",
        "error": null
      },
      "uptime30d": 99.98
    }
  ]
}`,
    fields: [
      ["success", "boolean", "Whether the check completed successfully"],
      ["timestamp", "string (ISO 8601)", "When this data was generated"],
      ["version", "string", "API version string"],
      ["totalServices", "number", "Total number of monitored services"],
      ["allOperational", "boolean", "True if all services are up or degraded"],
      ["anyDown", "boolean", "True if at least one service is down"],
      ["anyDegraded", "boolean", "True if at least one service is slow"],
      ["summary.countsByStatus", "object", "Count of services in each status state"],
      ["summary.averageResponseTime", "number (ms)", "Average response time across all services"],
      ["services[].currentStatus.status", "enum", "\"up\" | \"down\" | \"degraded\""],
      ["services[].currentStatus.statusCode", "number | null", "HTTP status code from last check"],
      ["services[].currentStatus.responseTime", "number (ms)", "Response time in milliseconds"],
      ["services[].currentStatus.error", "string | null", "Error message if the check failed"],
      ["services[].uptime30d", "number (%)", "30-day uptime percentage (0–100)"],
    ],
  },
  {
    id: "history",
    method: "GET",
    path: "/history.json",
    title: "30-Day History",
    desc: "Returns 30 days of daily aggregated history per service. Each day entry includes status, average response time, uptime percentage, and incident count.",
    tryUrl: `${BASE_URL}/history.json`,
    response: `{
  "success": true,
  "timestamp": "2026-07-22T18:00:00.000Z",
  "services": [
    {
      "serviceId": "notdeath-website",
      "serviceName": "NotDeath Website",
      "overallUptime30d": 99.98,
      "history": [
        {
          "date": "2026-07-01",
          "status": "up",
          "responseTime": 142,
          "avgResponseTime": 138,
          "uptime": 100,
          "upCount": 288,
          "totalCount": 288,
          "incidents": 0
        }
      ]
    }
  ]
}`,
    fields: [
      ["services[].serviceId", "string", "Unique identifier for the service"],
      ["services[].overallUptime30d", "number (%)", "30-day uptime percentage"],
      ["history[].date", "string (YYYY-MM-DD)", "The date of this history entry"],
      ["history[].status", "enum", "Final status of the day: \"up\" | \"down\" | \"degraded\""],
      ["history[].avgResponseTime", "number (ms)", "Rolling average response time for the day"],
      ["history[].uptime", "number (%)", "Uptime percentage for that day (0–100)"],
      ["history[].upCount", "number", "Number of successful checks that day"],
      ["history[].totalCount", "number", "Total number of checks performed that day"],
      ["history[].incidents", "number", "Number of outage events recorded that day"],
    ],
  },
  {
    id: "incidents",
    method: "GET",
    path: "/incidents.json",
    title: "Incidents",
    desc: "Returns all open and resolved incidents. Open incidents are actively ongoing. Closed incidents include resolution time and total duration.",
    tryUrl: `${BASE_URL}/incidents.json`,
    response: `{
  "success": true,
  "timestamp": "2026-07-22T18:00:00.000Z",
  "totalIncidents": 2,
  "openIncidents": [],
  "closedIncidents": [
    {
      "id": "notdeath-website-1719000000000",
      "serviceId": "notdeath-website",
      "serviceName": "NotDeath Website",
      "status": "down",
      "statusCode": 503,
      "startTime": "2026-07-01T12:00:00.000Z",
      "resolvedTime": "2026-07-01T12:45:00.000Z",
      "durationMs": 2700000,
      "resolvedStatus": "up",
      "error": null
    }
  ]
}`,
    fields: [
      ["openIncidents", "array", "Currently active incidents (service is still down)"],
      ["closedIncidents", "array", "Resolved incidents (up to 90 most recent)"],
      ["incidents[].id", "string", "Unique incident identifier"],
      ["incidents[].serviceId", "string", "ID of the affected service"],
      ["incidents[].status", "enum", "Status that triggered the incident"],
      ["incidents[].statusCode", "number | null", "HTTP status code at time of failure"],
      ["incidents[].startTime", "string (ISO 8601)", "When the outage was first detected"],
      ["incidents[].resolvedTime", "string | undefined", "When the service recovered"],
      ["incidents[].durationMs", "number | undefined", "Total outage duration in milliseconds"],
      ["incidents[].error", "string | null", "Raw error message from the probe"],
    ],
  },
  {
    id: "summary",
    method: "GET",
    path: "/api/v1/summary.json",
    title: "Summary (v1)",
    desc: "Lightweight versioned endpoint returning a compact health summary. Ideal for integrations, badges, and monitoring hooks.",
    tryUrl: `${BASE_URL}/api/v1/summary.json`,
    response: `{
  "success": true,
  "timestamp": "2026-07-22T18:00:00.000Z",
  "version": "3.0",
  "status": "operational",
  "summary": {
    "countsByStatus": { "up": 3, "degraded": 0, "down": 0 },
    "averageResponseTime": 145,
    "servicesHealthy": 3,
    "totalServices": 3,
    "uptimePercentage": 100
  }
}`,
    fields: [
      ["status", "enum", "Overall system status: \"operational\" | \"degraded\" | \"outage\""],
      ["summary.uptimePercentage", "number (%)", "% of services currently \"up\" (not degraded)"],
      ["summary.servicesHealthy", "number", "Count of services that are up or degraded"],
      ["summary.countsByStatus", "object", "Count of services by each status value"],
    ],
  },
  {
    id: "status-v1",
    method: "GET",
    path: "/api/v1/status.json",
    title: "Full Status (v1)",
    desc: "Same as the root status.json but under a stable versioned path. Use this for long-lived integrations to avoid breaking changes.",
    tryUrl: `${BASE_URL}/api/v1/status.json`,
    response: `// Same schema as /status.json
// See "Current Status" endpoint above for full response shape.`,
    fields: [],
  },
];

const CURL_EXAMPLES = [
  {
    title: "Get current status",
    code: `curl -s "${BASE_URL}/status.json" | jq '.services[] | {name: .service.name, status: .currentStatus.status, responseTime: .currentStatus.responseTime}'`,
  },
  {
    title: "Check if any service is down",
    code: `curl -s "${BASE_URL}/api/v1/summary.json" | jq '.status'`,
  },
  {
    title: "Get 30d uptime for all services",
    code: `curl -s "${BASE_URL}/history.json" | jq '.services[] | {name: .serviceName, uptime: .overallUptime30d}'`,
  },
  {
    title: "List open incidents",
    code: `curl -s "${BASE_URL}/incidents.json" | jq '.openIncidents'`,
  },
];

const JS_EXAMPLE = `// Fetch overall system status
const res = await fetch("${BASE_URL}/api/v1/summary.json");
const data = await res.json();

if (data.status === "operational") {
  console.log("✅ All systems operational");
} else if (data.status === "degraded") {
  console.log("⚠️  Partial degradation");
} else {
  console.log("🚨 Service outage detected");
}

// Get individual service response times
const status = await fetch("${BASE_URL}/status.json").then(r => r.json());
status.services.forEach(({ service, currentStatus }) => {
  console.log(\`\${service.name}: \${currentStatus.responseTime}ms (\${currentStatus.status})\`);
});`;

const SECTIONS = [
  { id: "overview", label: "Overview" },
  { id: "authentication", label: "Authentication" },
  { id: "rate-limits", label: "Rate Limits" },
  { id: "endpoints", label: "Endpoints" },
  { id: "status", label: "  Current Status" },
  { id: "history", label: "  30-Day History" },
  { id: "incidents", label: "  Incidents" },
  { id: "summary", label: "  Summary (v1)" },
  { id: "status-v1", label: "  Full Status (v1)" },
  { id: "examples", label: "Examples" },
  { id: "status-codes", label: "Status Values" },
];

export default function ApiDocsPage() {
  return (
    <>
      <Nav />
      <div className="api-docs">
        <div className="container">
          <div className="api-docs-layout">

            {/* ── Sidebar ──────────────────────────────── */}
            <aside className="api-docs-sidebar">
              <nav className="api-docs-nav" aria-label="API documentation navigation">
                {SECTIONS.map((s) => (
                  <a
                    key={s.id}
                    href={`#${s.id}`}
                    className="api-docs-nav-link"
                    style={s.label.startsWith("  ") ? { paddingLeft: 20, fontSize: 11, opacity: 0.85 } : {}}
                  >
                    {s.label.trim()}
                  </a>
                ))}
              </nav>
            </aside>

            {/* ── Main content ─────────────────────────── */}
            <div className="api-docs-content">

              {/* Overview */}
              <section className="api-section" id="overview">
                <h1 className="api-section-title">API Reference</h1>
                <p className="api-section-desc">
                  StatusAPI provides a set of public, read-only JSON endpoints that expose real-time and
                  historical uptime data for all monitored services. Data is refreshed automatically
                  every 5 minutes via GitHub Actions and served as static files from GitHub Pages.
                </p>
                <div className="code-block">
                  <div className="code-block-header">
                    <span className="code-block-lang">Base URL</span>
                  </div>
                  <pre>{BASE_URL}</pre>
                </div>
                <p className="api-section-desc" style={{ marginTop: 16 }}>
                  All endpoints return <code style={{ fontFamily: "var(--mono)", color: "var(--accent-light)", fontSize: 12 }}>application/json</code> and
                  support HTTPS. No authentication is required. Data is cached by GitHub Pages CDN.
                </p>
              </section>

              {/* Authentication */}
              <section className="api-section" id="authentication">
                <h2 className="api-section-title">Authentication</h2>
                <p className="api-section-desc">
                  All endpoints are completely public and require no API key or authentication token.
                  Simply make a GET request to any endpoint.
                </p>
                <div style={{
                  background: "var(--green-bg)",
                  border: "1px solid var(--green-border)",
                  borderRadius: "var(--radius-lg)",
                  padding: "14px 18px",
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 10,
                }}>
                  <span style={{ fontSize: 16 }}>🔓</span>
                  <div>
                    <div style={{ fontFamily: "var(--mono)", fontSize: 11, fontWeight: 600, color: "var(--green-bright)", letterSpacing: "0.04em", textTransform: "uppercase", marginBottom: 4 }}>
                      Public API
                    </div>
                    <div style={{ fontSize: 13, color: "var(--text-secondary)" }}>
                      No API key required. All endpoints are freely accessible over HTTPS.
                    </div>
                  </div>
                </div>
              </section>

              {/* Rate Limits */}
              <section className="api-section" id="rate-limits">
                <h2 className="api-section-title">Rate Limits</h2>
                <p className="api-section-desc">
                  Since all data is served as static JSON files via GitHub Pages CDN, there are no
                  custom rate limits enforced by this API. However, please be mindful of GitHub's
                  standard limits and avoid hammering the endpoints unnecessarily.
                </p>
                <div style={{ overflowX: "auto" }}>
                  <table className="response-table" style={{ background: "var(--bg-card)", borderRadius: "var(--radius-lg)", overflow: "hidden", border: "1px solid var(--border)" }}>
                    <thead>
                      <tr>
                        <th>Parameter</th>
                        <th>Value</th>
                        <th>Notes</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>Data refresh rate</td>
                        <td style={{ color: "var(--accent-light)", fontFamily: "var(--mono)" }}>Every 5 minutes</td>
                        <td>Via GitHub Actions cron job</td>
                      </tr>
                      <tr>
                        <td>Recommended poll interval</td>
                        <td style={{ color: "var(--accent-light)", fontFamily: "var(--mono)" }}>≥ 60 seconds</td>
                        <td>Data won't change more often than 5 min</td>
                      </tr>
                      <tr>
                        <td>Protocol</td>
                        <td style={{ color: "var(--accent-light)", fontFamily: "var(--mono)" }}>HTTPS only</td>
                        <td>TLS 1.2+ enforced by GitHub Pages</td>
                      </tr>
                      <tr>
                        <td>Cache-Control</td>
                        <td style={{ color: "var(--accent-light)", fontFamily: "var(--mono)" }}>GitHub CDN</td>
                        <td>Add <code style={{ fontFamily: "var(--mono)", fontSize: 11 }}>?t=timestamp</code> to bust cache</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </section>

              {/* Endpoints */}
              <section className="api-section" id="endpoints">
                <h2 className="api-section-title">Endpoints</h2>
                <p className="api-section-desc">
                  All endpoints are read-only GET requests. Responses are UTF-8 encoded JSON.
                </p>
              </section>

              {/* Individual endpoints */}
              {ENDPOINTS.map((ep) => (
                <section className="api-section" id={ep.id} key={ep.id}>
                  <div className="api-endpoint">
                    <div className="api-endpoint-header">
                      <span className={`api-method ${ep.method.toLowerCase()}`}>{ep.method}</span>
                      <span className="api-path">{ep.path}</span>
                      <a
                        href={ep.tryUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="api-endpoint-try"
                      >
                        Try it →
                      </a>
                    </div>
                    <div className="api-endpoint-body">
                      <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 8, color: "var(--text)" }}>
                        {ep.title}
                      </h3>
                      <p className="api-endpoint-desc">{ep.desc}</p>

                      <div className="api-params-title">Response</div>
                      <CodeBlock lang="JSON" code={ep.response} />

                      {ep.fields.length > 0 && (
                        <>
                          <div className="api-params-title" style={{ marginTop: 16 }}>Response Fields</div>
                          <div style={{ overflowX: "auto" }}>
                            <table className="response-table" style={{ background: "var(--bg-card)", borderRadius: "var(--radius-lg)", overflow: "hidden", border: "1px solid var(--border)" }}>
                              <thead>
                                <tr>
                                  <th>Field</th>
                                  <th>Type</th>
                                  <th>Description</th>
                                </tr>
                              </thead>
                              <tbody>
                                {ep.fields.map(([name, type, desc]) => (
                                  <tr key={name}>
                                    <td><code style={{ fontFamily: "var(--mono)", fontSize: 11 }}>{name}</code></td>
                                    <td>{type}</td>
                                    <td>{desc}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </section>
              ))}

              {/* Examples */}
              <section className="api-section" id="examples">
                <h2 className="api-section-title">Examples</h2>
                <p className="api-section-desc">
                  Ready-to-use code examples for common integrations.
                </p>

                <div style={{ marginBottom: 24 }}>
                  <div className="api-params-title">cURL</div>
                  {CURL_EXAMPLES.map((ex) => (
                    <div key={ex.title} style={{ marginBottom: 12 }}>
                      <div style={{ fontSize: 12, color: "var(--text-secondary)", marginBottom: 6 }}>
                        {ex.title}
                      </div>
                      <CodeBlock lang="BASH" code={ex.code} />
                    </div>
                  ))}
                </div>

                <div>
                  <div className="api-params-title">JavaScript / TypeScript</div>
                  <CodeBlock lang="JavaScript" code={JS_EXAMPLE} />
                </div>
              </section>

              {/* Status values */}
              <section className="api-section" id="status-codes">
                <h2 className="api-section-title">Status Values</h2>
                <p className="api-section-desc">
                  Services and incidents use a fixed set of status strings.
                </p>
                <div style={{ overflowX: "auto" }}>
                  <table className="response-table" style={{ background: "var(--bg-card)", borderRadius: "var(--radius-lg)", overflow: "hidden", border: "1px solid var(--border)" }}>
                    <thead>
                      <tr>
                        <th>Value</th>
                        <th>Meaning</th>
                        <th>Trigger condition</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>
                          <span className="status-badge up" style={{ fontSize: 10, padding: "3px 10px" }}>
                            <span className="status-badge-dot" />up
                          </span>
                        </td>
                        <td>Operational</td>
                        <td>HTTP 200 in under 2,000ms</td>
                      </tr>
                      <tr>
                        <td>
                          <span className="status-badge degraded" style={{ fontSize: 10, padding: "3px 10px" }}>
                            <span className="status-badge-dot" />degraded
                          </span>
                        </td>
                        <td>Degraded performance</td>
                        <td>HTTP 200 but response ≥ 2,000ms</td>
                      </tr>
                      <tr>
                        <td>
                          <span className="status-badge down" style={{ fontSize: 10, padding: "3px 10px" }}>
                            <span className="status-badge-dot" />down
                          </span>
                        </td>
                        <td>Outage</td>
                        <td>Non-2xx status, timeout, or connection error (confirmed by retry)</td>
                      </tr>
                      <tr>
                        <td>
                          <span className="status-badge maintenance" style={{ fontSize: 10, padding: "3px 10px" }}>
                            <span className="status-badge-dot" />maintenance
                          </span>
                        </td>
                        <td>Maintenance window</td>
                        <td>Manually set in maintenance.json</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </section>

            </div>
          </div>
        </div>
      </div>

      <footer>
        <div className="container">
          <div className="footer-inner">
            <span className="footer-text">
              © {new Date().getFullYear()} StatusAPI · Built by{" "}
              <a href="https://notdeathm.is-a.dev" target="_blank" rel="noopener noreferrer">
                NotDeath
              </a>
            </span>
            <div className="footer-links">
              <a href="https://github.com/notdeathm/statusapi" target="_blank" rel="noopener noreferrer">GitHub</a>
              <Link href="/">Dashboard</Link>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
