"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavProps {
  overallStatus?: "operational" | "degraded" | "outage" | "loading";
}

const STATUS_LABELS = {
  operational: "All Systems Operational",
  degraded: "Partial Degradation",
  outage: "Service Outage",
  loading: "Checking…",
};

export default function Nav({ overallStatus = "loading" }: NavProps) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/statusapi" || href === "/") {
      return pathname === "/statusapi" || pathname === "/" || pathname === "";
    }
    return pathname.startsWith(href);
  };

  return (
    <nav>
      <div className="container">
        <div className="nav-inner">
          {/* Logo */}
          <Link href="/" className="nav-logo">
            <div className="nav-logo-mark">S</div>
            <div className="nav-logo-text">
              <div className="nav-title">StatusAPI</div>
              <div className="nav-sub">notdeath.is-a.dev</div>
            </div>
          </Link>

          {/* Center links */}
          <div className="nav-center">
            <Link
              href="/"
              className={`nav-link${isActive("/statusapi") || isActive("/") ? " active" : ""}`}
            >
              Dashboard
            </Link>
            <Link
              href="/incidents"
              className={`nav-link${isActive("/incidents") ? " active" : ""}`}
            >
              Incidents
            </Link>
            <Link
              href="/api-docs"
              className={`nav-link${isActive("/api-docs") ? " active" : ""}`}
            >
              API Docs
            </Link>
          </div>

          {/* Right: live status pill + GitHub */}
          <div className="nav-right">
            <div className={`nav-status-pill ${overallStatus}`}>
              <span className="nav-status-dot" />
              {STATUS_LABELS[overallStatus]}
            </div>
            <a
              href="https://github.com/notdeathm/statusapi"
              target="_blank"
              rel="noopener noreferrer"
              className="btn"
              style={{ padding: "5px 10px", fontSize: 11 }}
              aria-label="View source on GitHub"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.44 9.8 8.2 11.38.6.11.82-.26.82-.58v-2.03c-3.34.72-4.04-1.61-4.04-1.61-.55-1.39-1.34-1.76-1.34-1.76-1.09-.75.08-.73.08-.73 1.2.08 1.84 1.24 1.84 1.24 1.07 1.83 2.8 1.3 3.49 1 .11-.78.42-1.3.76-1.6-2.66-.3-5.46-1.33-5.46-5.93 0-1.31.47-2.38 1.24-3.22-.12-.3-.54-1.52.12-3.18 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 0 1 3-.4c1.02 0 2.04.13 3 .4 2.28-1.55 3.29-1.23 3.29-1.23.66 1.66.24 2.88.12 3.18.77.84 1.24 1.91 1.24 3.22 0 4.61-2.81 5.63-5.48 5.92.43.37.81 1.1.81 2.22v3.29c0 .32.21.7.82.58C20.56 21.8 24 17.3 24 12c0-6.63-5.37-12-12-12z" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </nav>
  );
}
