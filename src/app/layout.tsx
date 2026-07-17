import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ScoutIQ — Moneyball for the IPL",
  description:
    "AI scouting assistant that finds undervalued domestic cricketers and explains why.",
};

const NAV = [
  { href: "/", label: "Scout" },
  { href: "/undervalued", label: "Undervalued" },
  { href: "/team-fit", label: "Team Fit" },
];

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <header className="sticky top-0 z-10 border-b border-hairline bg-background/90 backdrop-blur">
          <div className="mx-auto flex max-w-5xl items-center gap-6 px-4 py-3">
            <Link href="/" className="flex items-baseline gap-1 text-lg font-bold">
              Scout<span className="text-series">IQ</span>
            </Link>
            <nav className="flex gap-1 text-sm">
              {NAV.map((n) => (
                <Link
                  key={n.href}
                  href={n.href}
                  className="rounded-lg px-3 py-1.5 text-ink-secondary transition-colors hover:bg-surface hover:text-foreground"
                >
                  {n.label}
                </Link>
              ))}
            </nav>
          </div>
        </header>
        <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">{children}</main>
        <footer className="border-t border-hairline py-4 text-center text-xs text-ink-muted">
          Hackathon demo · Ball-by-ball data ©{" "}
          <a href="https://cricsheet.org" className="underline hover:text-ink-secondary">
            Cricsheet
          </a>{" "}
          (ODC-By) · Mock data shown until the backend is connected
        </footer>
      </body>
    </html>
  );
}
