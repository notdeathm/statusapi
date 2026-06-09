"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Nav() {
  const pathname = usePathname();

  return (
    <nav>
      <div className="container">
        <div className="nav-inner">
          <Link href="/" className="nav-logo">
            <div className="nav-logo-mark">S</div>
            <div>
              <div className="nav-title">Status</div>
              <div className="nav-sub">by NotDeath</div>
            </div>
          </Link>

          <div className="nav-links">
            <div className="nav-live-badge">
              <span className="nav-live-dot"></span>
              LIVE
            </div>
            <Link
              href="/"
              className={`nav-link${pathname === "/" || pathname === "/statusapi" || pathname === "/statusapi/" ? " active" : ""}`}
            >
              Dashboard
            </Link>
            <Link
              href="/api-docs"
              className={`nav-link${pathname?.includes("api-docs") ? " active" : ""}`}
            >
              API Docs
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
