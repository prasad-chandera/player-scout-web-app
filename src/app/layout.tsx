import type { Metadata } from "next";
import { Geist, Geist_Mono, Oswald } from "next/font/google";
import Link from "next/link";
import Logo from "@/components/Logo";
import ThemeToggle from "@/components/ThemeToggle";
import "./globals.css";

// Applied before first paint to prevent a flash of the wrong theme.
// Stored choice wins; otherwise the OS setting (via CSS) decides, so we leave
// data-theme unset in that case.
const THEME_INIT = `(function(){try{var t=localStorage.getItem("scoutiq-theme");if(t==="light"||t==="dark"){document.documentElement.dataset.theme=t;}}catch(e){}})();`;

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Condensed sporty display face for headings + big stat numbers.
const oswald = Oswald({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Player Scout — Moneyball for the IPL",
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
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} ${oswald.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT }} />
      </head>
      <body className="grain relative flex min-h-full flex-col">
        <header className="sticky top-0 z-20 border-b border-hairline bg-background/80 backdrop-blur-md">
          <div className="mx-auto flex max-w-6xl items-center gap-5 px-4 py-3">
            <Link href="/" className="group flex items-center gap-2">
              <Logo size={30} />
              <span className="font-display text-xl font-bold uppercase tracking-wide">
                Player <span className="text-series">Scout</span>
              </span>
            </Link>
            <nav className="flex gap-1 text-sm font-medium">
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
            <ThemeToggle />
          </div>
        </header>
        <main className="relative z-[1] mx-auto w-full max-w-6xl flex-1 px-4 py-10">{children}</main>
        <footer className="relative z-[1] mt-4 border-t border-hairline py-6 text-center text-xs text-ink-muted">
          <div className="seam mx-auto mb-4 max-w-6xl" />
          Hackathon demo · Ball-by-ball data ©{" "}
          <a href="https://cricsheet.org" className="text-ink-secondary underline hover:text-series">
            Cricsheet
          </a>{" "}
          (ODC-By) · Mock data shown until the backend is connected
        </footer>
      </body>
    </html>
  );
}
