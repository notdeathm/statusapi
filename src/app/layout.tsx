import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Status API - Real-time Service Monitoring",
  description:
    "A serverless status page for monitoring the health of web services and GitHub repositories. Zero hosting costs, automated checks every 5 minutes.",
  keywords: "status, monitoring, uptime, services, dashboard, serverless, github pages",
  authors: [{ name: "notdeath" }],
  openGraph: {
    title: "Status API - Real-time Service Monitoring",
    description: "Serverless status page for monitoring web services and GitHub repositories",
    type: "website",
    url: "https://notdeathm.github.io/statusapi",
  },
  twitter: {
    card: "summary_large_image",
    title: "Status API - Real-time Service Monitoring",
    description: "Serverless status page for monitoring web services and GitHub repositories",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-screen flex flex-col bg-white dark:bg-slate-900">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
