"use client";

import { useState } from "react";
import Link from "next/link";
import Nav from "@/components/Nav";

const BASE_URL = "https://notdeathm.github.io/statusapi";

type TabKey = "curl" | "wget" | "js" | "python";

interface EndpointProps {
  method?: string;
  path: string;
  description: string;
  tabs: { key: TabKey; label: string; code: string }[];
  responsePreview: string;
  note?: string;
}

function EndpointCard({
  method = "GET",
  path,
  description,
  tabs,
  responsePreview,
  note,
}: EndpointProps) {
  const [activeTab, setActiveTab] = useState<TabKey>(tabs[0].key);

  const activeCode = tabs.find((t) => t.key === activeTab)?.code ?? "";

  return (
    <div className="endpoint-card">
      <div className="endpoint-header">
        <span className="method-badge">{method}</span>
        <span className="endpoint-path">{path}</span>
        <span className="endpoint-desc">{description}</span>
      </div>

      <div className="endpoint-body">
        {note && (
          <p style={{ color: "var(--text-muted)", fontSize: 13, marginBottom: 14 }}>
            {note}
          </p>
        )}

        <div className="endpoint-section-title">Command</div>
        <div className="tab-group">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              className={`tab-btn${activeTab === tab.key ? " active" : ""}`}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="code-block">{activeCode}</div>

        <div className="endpoint-section-title">Response Preview</div>
        <pre className="code-block">{responsePreview}</pre>
      </div>
    </div>
  );
}

export default function ApiDocsPage() {
  return (
    <>
      <Nav />
      <main>
        <div className="container">
          <section className="api-page-hero">
            <Link href="/" className="back-link">
              ← Back to Dashboard
            </Link>
            <h1 className="api-page-title">API Reference</h1>
            <p className="api-page-desc">
              Integrate status data into your own tools using these static JSON endpoints.
              All endpoints are publicly accessible — no API key required.
            </p>
          </section>

          {/* Current Status */}
          <EndpointCard
            path={`${BASE_URL}/status.json`}
            description="Current status of all monitored services"
            note="Returns the real-time status, response times, and 30-day uptime for each service."
            tabs={[
              {
                key: "curl",
                label: "cURL",
                code: `curl -s ${BASE_URL}/status.json | jq .`,
              },
              {
                key: "wget",
                label: "wget",
                code: `wget -qO- ${BASE_URL}/status.json`,
              },
              {
                key: "js",
                label: "JavaScript",
                code: `const res = await fetch('${BASE_URL}/status.json');\nconst data = await res.json();\nconsole.log(data.allOperational ? 'All systems OK' : 'Issues detected');`,
              },
              {
                key: "python",
                label: "Python",
                code: `import httpx\ndata = httpx.get('${BASE_URL}/status.json').json()\nprint('All OK:', data['allOperational'])`,
              },
            ]}
            responsePreview={`{
  "success": true,
  "timestamp": "2026-06-07T01:55:50.820Z",
  "services": [
    {
      "service": {
        "id": "notdeath-website",
        "name": "NotDeath Website",
        "description": "Personal portfolio website",
        "url": "https://notdeath.vercel.app",
        "type": "http"
      },
      "currentStatus": {
        "serviceId": "notdeath-website",
        "status": "up",
        "statusCode": 200,
        "responseTime": 96,
        "timestamp": "2026-06-07T01:55:50.917Z",
        "uptime": 100
      },
      "uptime30d": 100
    }
  ],
  "totalServices": 3,
  "allOperational": true
}`}
          />

          {/* History */}
          <EndpointCard
            path={`${BASE_URL}/history.json`}
            description="30-day uptime history for all services"
            note="Contains day-by-day uptime history for the last 30 days. Useful for trend analysis."
            tabs={[
              {
                key: "curl",
                label: "cURL",
                code: `curl -s ${BASE_URL}/history.json | jq .`,
              },
              {
                key: "wget",
                label: "wget",
                code: `wget -qO- ${BASE_URL}/history.json`,
              },
              {
                key: "js",
                label: "JavaScript",
                code: `const res = await fetch('${BASE_URL}/history.json');\nconst data = await res.json();\ndata.services.forEach(s => console.log(s.serviceName, s.overallUptime30d + '%'));`,
              },
              {
                key: "python",
                label: "Python",
                code: `import httpx\ndata = httpx.get('${BASE_URL}/history.json').json()\nfor svc in data['services']:\n    print(svc['serviceName'], svc['overallUptime30d'])`,
              },
            ]}
            responsePreview={`{
  "success": true,
  "timestamp": "2026-06-07T01:55:50.820Z",
  "services": [
    {
      "serviceId": "notdeath-website",
      "serviceName": "NotDeath Website",
      "overallUptime30d": 99.9,
      "history": [
        {
          "date": "2026-06-06",
          "status": "up",
          "responseTime": 92,
          "uptime": 100,
          "incidents": 0
        }
      ]
    }
  ]
}`}
          />

          {/* Maintenance */}
          <EndpointCard
            path={`${BASE_URL}/maintenance.json`}
            description="Active maintenance windows"
            note="Contains any active or scheduled maintenance windows. Empty object means no maintenance is scheduled."
            tabs={[
              {
                key: "curl",
                label: "cURL",
                code: `curl -s ${BASE_URL}/maintenance.json | jq .`,
              },
              {
                key: "wget",
                label: "wget",
                code: `wget -qO- ${BASE_URL}/maintenance.json`,
              },
              {
                key: "js",
                label: "JavaScript",
                code: `const res = await fetch('${BASE_URL}/maintenance.json');\nconst data = await res.json();\nconst active = Object.entries(data.services)\n  .filter(([, v]) => v.isDown);\nconsole.log(active.length, 'services in maintenance');`,
              },
              {
                key: "python",
                label: "Python",
                code: `import httpx\ndata = httpx.get('${BASE_URL}/maintenance.json').json()\nfor id, info in data['services'].items():\n    if info['isDown']:\n        print(id, '-', info['reason'])`,
              },
            ]}
            responsePreview={`{
  "services": {
    "my-service": {
      "isDown": true,
      "reason": "Scheduled database migration",
      "startTime": "2026-06-06T10:00:00Z",
      "estimatedDowntime": "2 hours"
    }
  }
}`}
          />

          {/* Quick integration example */}
          <div className="section-card" style={{ marginBottom: 40 }}>
            <div className="section-card-title">Quick Integration Example</div>
            <p style={{ color: "var(--text-muted)", fontSize: 13, marginBottom: 14 }}>
              Embed a live status indicator in your own project:
            </p>
            <pre className="code-block">{`// Fetch and display current status
async function checkStatus() {
  const res = await fetch('${BASE_URL}/status.json');
  const data = await res.json();

  const badge = document.getElementById('status-badge');
  if (data.allOperational) {
    badge.textContent = '✓ All Systems Operational';
    badge.className = 'status-green';
  } else {
    const down = data.services.filter(s => s.currentStatus.status !== 'up');
    badge.textContent = \`⚠ \${down.length} service(s) affected\`;
    badge.className = 'status-red';
  }
}

checkStatus();`}</pre>
          </div>
        </div>
      </main>

      <footer>
        <div className="container">
          <div className="footer-inner">
            <span className="footer-text">
              © {new Date().getFullYear()} Status API · Made by{" "}
              <a href="https://notdeath.vercel.app" target="_blank" rel="noopener noreferrer">
                NotDeath
              </a>
              {" · "}
              <a href="https://github.com/notdeathm/statusapi" target="_blank" rel="noopener noreferrer">
                Open source
              </a>
            </span>
          </div>
        </div>
      </footer>
    </>
  );
}
