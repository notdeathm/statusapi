import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "StatusAPI – Real-time Service Monitoring",
  description:
    "Real-time service status page for notdeath's projects. Monitor uptime, response times, and incidents across all services — updated every 5 minutes.",
  keywords:
    "status, uptime, monitoring, notdeath, services, incidents, response time, statusapi",
  authors: [{ name: "notdeath", url: "https://notdeathm.is-a.dev" }],
  openGraph: {
    type: "website",
    url: "https://notdeathm.is-a.dev/statusapi/",
    title: "StatusAPI – Real-time Service Monitoring",
    description:
      "Monitor uptime, response times, and incidents for all notdeath services. Updated every 5 minutes.",
    siteName: "StatusAPI",
  },
  twitter: {
    card: "summary",
    title: "StatusAPI – Real-time Service Monitoring",
    description:
      "Real-time status and uptime monitoring for notdeath's web services.",
  },
  icons: {
    icon: [{ url: "/statusapi/favicon.png", type: "image/png" }],
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "https://notdeathm.is-a.dev/statusapi/",
  },
};

export const viewport: Viewport = {
  themeColor: "#07080d",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
