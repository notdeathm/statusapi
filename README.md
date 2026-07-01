# 🚀 Status API

A professional, high-performance, **serverless** status page for monitoring your infrastructure. Runs entirely on **GitHub Pages** with zero hosting costs and automated updates via **GitHub Actions**.

[![Check Status](https://github.com/notdeathm/statusapi/actions/workflows/check-status.yml/badge.svg)](https://github.com/notdeathm/statusapi/actions/workflows/check-status.yml)
[![Deployment](https://github.com/notdeathm/statusapi/actions/workflows/deploy.yml/badge.svg)](https://github.com/notdeathm/statusapi/actions/workflows/deploy.yml)
[![Uptime](https://img.shields.io/endpoint?url=https://notdeathm.github.io/statusapi/status.json&style=flat-square&label=uptime)](https://notdeathm.github.io/statusapi/)

---

## ✨ Core Features

- ⚡ **Ultra-Fast & Static** — Built with Next.js 15, optimized for static export and instant loading.
- 🤖 **Automated Heartbeats** — GitHub Actions performs health checks every 5 minutes (configurable).
- 📊 **Dynamic 30/90-Day History** — Visual uptime bars and historical performance tracking.
- 🛠️ **Live Maintenance Mode** — Easily announce scheduled downtime via a simple JSON config.
- 🌑 **Modern Dark UI** — A sleek, terminal-inspired interface with real-time animations and pulsing status indicators.
- 🔌 **Public JSON API** — Public endpoints for current status, history, and maintenance windows.
- 📦 **Zero Database** — Uses flat JSON files updated by a background runner. No DB, no complex setup.

---

## 🛠️ Recent Fixes (June 2026)

We've recently upgraded the core runner to address several stability issues:
- **Fixed GitHub API Errors**: Added proper `User-Agent` headers to satisfy GitHub's API requirements (previously causing 403 errors).
- **Improved Uptime Logic**: Redesigned the uptime calculation to track check counts accurately, preventing skewed percentage data.
- **Enhanced Reliability**: Added automated conflict resolution in GitHub Actions (`git pull --rebase`) to prevent merge conflicts in status data files.
- **Robust JSON Handling**: The runner now gracefully handles corrupted data files and git conflict markers.

---

## 🏗️ How It Works

This project leverages a **Serverless-to-Static** architecture:

1. **The Runner**: A Node.js script (`scripts/check-status.js`) runs on a GitHub Actions cron job.
2. **The Check**: It pings your services, calculates response times, and updates a rolling history.
3. **The Data**: The results are saved as static JSON files in the `public/` folder.
4. **The Deployment**: A second GitHub Action builds the Next.js app and deploys the static files to GitHub Pages.
5. **The Frontend**: The Next.js dashboard fetches these JSON files every 60 seconds (live refresh) to show real-time status.

---

## 📁 Configuration Deep Dive

### `services.json` — Monitoring targets

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | ✓ | Slug used for history tracking (do not change once set). |
| `name` | string | ✓ | Display name shown on the dashboard. |
| `description` | string | | Subtext describing the service. |
| `url` | string | ✓ | The endpoint to ping. |
| `type` | `http` \| `github` | ✓ | Monitoring logic to use. |
| `timeout` | number | | Max wait time in ms (default: 10000). |

### 🛡️ Network Probe & Verification Protocol
To ensure high accuracy and avoid false positives:
- **Operational Condition**: Connection succeeds and returns an HTTP status code between `200` and `399`.
- **Failure Condition**: Connection times out (>10s), DNS fails, TCP is refused, or HTTP status is `>= 400`.
- **Verification Protocol**: If a failure condition is met, the system waits **exactly 15 seconds** and retries the connection. Only if the second check also fails is the service marked as offline.
## 📧 Email Notifications

The system is configured to send automatic alerts whenever a service outage is detected. 

### To enable this, you must add the following secrets to your GitHub Repository:

1. Go to **Settings → Secrets and variables → Actions**.
2. Add the following **New repository secrets**:
    - `MAIL_SERVER`: Your SMTP server (e.g., `smtp.gmail.com`).
    - `MAIL_PORT`: Your SMTP port (usually `465` or `587`).
    - `MAIL_USERNAME`: Your email address or SMTP username.
    - `MAIL_PASSWORD`: Your email password or App Password.

---

## 🔌 API Reference

Integrate your status into other apps using these static JSON endpoints:

| Endpoint | Purpose |
|----------|---------|
| `GET /status.json` | Latest heartbeat results for all services. |
| `GET /history.json` | Detailed history data. |
| `GET /maintenance.json` | Active and upcoming maintenance windows. |

## 📄 License

Distributed under the **MIT License**. See `LICENSE` for more information.

Developed with ❤️ by [NotDeath](https://notdeath.vercel.app).
