# 🚀 Status API

A professional, high-performance, **serverless** status page for monitoring your infrastructure. Runs entirely on **GitHub Pages** with zero hosting costs and automated updates via **GitHub Actions**.

![Status Dashboard](https://raw.githubusercontent.com/notdeathm/statusapi/main/public/preview.png)

## ✨ Core Features

- ⚡ **Ultra-Fast & Static** — Built with Next.js 15, optimized for static export and instant loading.
- 🤖 **Automated Heartbeats** — GitHub Actions performs health checks every 5 minutes (configurable).
- 📊 **Dynamic 30-Day History** — Visual uptime bars and historical performance tracking.
- 🛠️ **Live Maintenance Mode** — Easily announce scheduled downtime via a simple JSON config.
- 🌑 **Modern Dark UI** — A sleek, terminal-inspired interface with real-time animations and pulsing status indicators.
- 🔌 **Public JSON API** — Public endpoints for current status, history, and maintenance windows.
- 📦 **Zero Database** — Uses flat JSON files updated by a background runner. No DB, no complex setup.

---

## 🛠️ How It Works

This project leverages a **Serverless-to-Static** architecture:

1. **The Runner**: A Node.js script (`scripts/check-status.js`) runs on a GitHub Actions cron job.
2. **The Check**: It pings your services, calculates response times, and updates a rolling 30-day history.
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
| `timeout` | number | | Max wait time in ms (default: 8000). |

### `maintenance.json` — Announcing downtime

To put a service into maintenance mode, add its ID to the services object:

```json
{
  "services": {
    "main-api": {
      "isDown": true,
      "reason": "Upgrading database to v16",
      "startTime": "2026-06-10T14:00:00Z",
      "estimatedDowntime": "30 minutes"
    }
  }
}
```

---

## 📧 Email Notifications

The system is configured to send automatic alerts to `notdeath@duck.com` whenever a service outage is detected. 

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
| `GET /history.json` | Detailed 30-day history data. |
| `GET /maintenance.json` | Active and upcoming maintenance windows. |

---

## 👨‍💻 Local Development

```bash
npm run dev         # Launch the dashboard at localhost:3000
npm run check-status # Manually trigger a health check and update JSON files
npm run build       # Generate a production static export
```

---

## 📄 License

<<<<<<< Updated upstream
This project is open-source and available under the [MIT License](LICENSE).
Made with ❤️ From Death
=======
Distributed under the **MIT License**. See `LICENSE` for more information.

Developed with ❤️ by [NotDeath](https://notdeath.vercel.app).
>>>>>>> Stashed changes
