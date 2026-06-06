# 🚀 Status API

A professional, lightweight, and **serverless** status page for monitoring your services. Designed to run entirely on **GitHub Pages** with zero hosting costs.

[![Check Status](https://github.com/notdeathm/statusapi/actions/workflows/check-status.yml/badge.svg)](https://github.com/notdeathm/statusapi/actions/workflows/check-status.yml)
[![Deploy to GitHub Pages](https://github.com/notdeathm/statusapi/actions/workflows/deploy.yml/badge.svg)](https://github.com/notdeathm/statusapi/actions/workflows/deploy.yml)

## ✨ Features

- **⚡ Static & Fast** - Built with Next.js 15 (React 19) and served as static HTML via GitHub Pages.
- **🤖 Automated Monitoring** - Background checks powered by GitHub Actions (every 5 minutes).
- **📊 30-Day History** - Track uptime trends and response times over the last month.
- **🛠️ Maintenance Mode** - Easy-to-manage maintenance windows via `maintenance.json`.
- **🌐 GitHub Integration** - Built-in support for monitoring GitHub repository health.
- **🔌 Static JSON API** - Every status check is exposed as a public JSON endpoint for integration.
- **🌓 Dark Mode** - Beautifully designed with Tailwind CSS, supporting system preferences.

## 📁 Configuration

### `services.json`
Add the services you want to monitor:
```json
{
  "services": [
    {
      "id": "my-site",
      "name": "My Website",
      "url": "https://example.com",
      "type": "http"
    },
    {
      "id": "my-repo",
      "name": "My Project",
      "owner": "username",
      "repo": "repository",
      "type": "github"
    }
  ]
}
```

### `maintenance.json`
Announce maintenance windows:
```json
{
  "services": {
    "my-site": {
      "isDown": true,
      "reason": "Scheduled database migration",
      "startTime": "2026-06-06T10:00:00Z",
      "estimatedDowntime": "2 hours"
    }
  }
}
```

## 🔌 API Integration

You can fetch status data directly from your GitHub Pages URL:

- `GET /status.json` - Current status of all services.
- `GET /history.json` - Detailed status history.
- `GET /maintenance.json` - Active maintenance information.

**Example Fetch:**
```javascript
const res = await fetch('https://notdeathm.github.io/statusapi/status.json');
const data = await res.json();
console.log(data.allOperational ? "All systems operational!" : "We have issues.");
```

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).
Made with ❤️ From Death
