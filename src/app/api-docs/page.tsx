"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, ChevronUp, Terminal, Globe, Code, Github, ExternalLink } from "lucide-react";

export default function ApiDocs() {
  const [openSection, setOpenSection] = useState<string | null>("status");

  const toggleSection = (id: string) => {
    setOpenSection(openSection === id ? null : id);
  };

  const sections = [
    {
      id: "status",
      title: "Current Status API",
      endpoint: "/status.json",
      description: "Get the real-time status of all monitored services.",
      commands: {
        curl: "curl -s https://notdeathm.github.io/statusapi/status.json | jq .",
        wget: "wget -qO- https://notdeathm.github.io/statusapi/status.json",
      },
      response: {
        success: true,
        timestamp: "2026-06-06T12:00:00Z",
        services: [
          {
            service: { id: "web-app", name: "Main Website", url: "..." },
            currentStatus: { status: "up", responseTime: 120 },
            uptime30d: 99.9,
          },
        ],
        allOperational: true,
      },
    },
    {
      id: "history",
      title: "Historical Data API",
      endpoint: "/history.json",
      description:
        "Access the last 1000 status checks for detailed uptime analysis.",
      commands: {
        curl: "curl -s https://notdeathm.github.io/statusapi/history.json | jq .",
        wget: "wget -qO- https://notdeathm.github.io/statusapi/history.json",
      },
      response: {
        "service-id": [
          { status: "up", responseTime: 115, timestamp: "..." },
          { status: "up", responseTime: 122, timestamp: "..." },
        ],
      },
    },
    {
      id: "maintenance",
      title: "Maintenance API",
      endpoint: "/maintenance.json",
      description:
        "Check for active maintenance windows or scheduled downtime.",
      commands: {
        curl: "curl -s https://notdeathm.github.io/statusapi/maintenance.json | jq .",
        wget: "wget -qO- https://notdeathm.github.io/statusapi/maintenance.json",
      },
      response: {
        success: true,
        data: {
          services: {
            "web-app": {
              isDown: true,
              reason: "Upgrading servers",
              startTime: "...",
              estimatedDowntime: "1 hour",
            },
          },
        },
      },
    },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 sm:py-12 text-slate-300">
      <div className="mb-8 sm:mb-12">
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">API Reference</h1>
        <p className="text-slate-400 text-base sm:text-lg">
          Integrate our status data into your own tools using these static JSON endpoints.
          All endpoints are publicly accessible — no API key required.
        </p>
        <div className="flex flex-wrap items-center gap-3 mt-6">
          <a
            href="https://github.com/notdeathm/statusapi"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-700 text-slate-300 hover:text-white hover:border-slate-500 transition-all text-sm"
          >
            <Github className="w-4 h-4" />
            View on GitHub
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      <div className="space-y-4">
        {sections.map((section) => (
          <div
            key={section.id}
            className="border border-slate-700 rounded-xl overflow-hidden bg-slate-800/30"
          >
            <button
              onClick={() => toggleSection(section.id)}
              className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-700/30 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <Globe className="w-5 h-5 text-blue-400" />
                </div>
                <div className="text-left">
                  <h3 className="text-lg font-semibold text-white">
                    {section.title}
                  </h3>
                  <code className="text-sm text-blue-400/80">
                    {section.endpoint}
                  </code>
                </div>
              </div>
              {openSection === section.id ? <ChevronUp /> : <ChevronDown />}
            </button>

            {openSection === section.id && (
              <div className="px-6 pb-6 pt-2 space-y-6 border-t border-slate-700/50">
                <p className="text-slate-400">{section.description}</p>

                <div className="space-y-4">
                  <div>
                    <h4 className="flex items-center gap-2 text-sm font-semibold text-white mb-3">
                      <Terminal className="w-4 h-4" /> Terminal Commands
                    </h4>
                    <div className="space-y-2">
                      <div className="bg-slate-950 p-3 rounded-lg border border-slate-700">
                        <p className="text-[10px] text-slate-500 mb-1 uppercase tracking-widest font-bold">
                          cURL
                        </p>
                        <code className="text-blue-300 text-xs break-all">
                          {section.commands.curl}
                        </code>
                      </div>
                      <div className="bg-slate-950 p-3 rounded-lg border border-slate-700">
                        <p className="text-[10px] text-slate-500 mb-1 uppercase tracking-widest font-bold">
                          wget
                        </p>
                        <code className="text-blue-300 text-xs break-all">
                          {section.commands.wget}
                        </code>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="flex items-center gap-2 text-sm font-semibold text-white mb-3">
                      <Code className="w-4 h-4" /> Response Preview
                    </h4>
                    <div className="bg-slate-950 p-4 rounded-lg border border-slate-700 overflow-x-auto">
                      <pre className="text-slate-300 text-xs leading-relaxed">
                        {JSON.stringify(section.response, null, 2)}
                      </pre>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-12 pt-8 border-t border-slate-800">
        <Link
          href="/"
          className="text-blue-400 hover:text-blue-300 font-medium flex items-center gap-2 transition-colors"
        >
          <span>&larr;</span> Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
