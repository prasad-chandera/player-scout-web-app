import type { Metadata } from "next";
import { Geist, Geist_Mono, Oswald } from "next/font/google";
import { Footer } from "@/components/layouts/Footer";
import { Header } from "@/components/layouts/Header";
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
        <Header />
        <main className="relative z-[1] mx-auto w-full max-w-6xl flex-1 px-4 py-10">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
