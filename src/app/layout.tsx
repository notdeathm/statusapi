import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Status API – Real-time Service Monitoring",
  description:
    "A serverless status page for monitoring the health of web services and GitHub repositories. Zero hosting costs, automated checks every 5 minutes.",
  keywords: "status, monitoring, uptime, services, dashboard, serverless, github pages",
  authors: [{ name: "notdeath" }],
  openGraph: {
    type: "website",
    url: "https://notdeathm.github.io/statusapi",
    title: "Status API – Real-time Service Monitoring",
    description:
      "Serverless status page for monitoring web services and GitHub repositories",
  },
  twitter: {
    card: "summary_large_image",
    title: "Status API – Real-time Service Monitoring",
    description:
      "Serverless status page for monitoring web services and GitHub repositories",
  },
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
