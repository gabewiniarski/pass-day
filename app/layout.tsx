import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import "./home.css";
import "./history-lens.css";
import "./pass-lens.css";

const roboto = localFont({
  src: [
    { path: "./fonts/Roboto-Regular.ttf", weight: "400", style: "normal" },
    { path: "./fonts/Roboto-Bold.ttf", weight: "700", style: "normal" },
  ],
  variable: "--font-roboto",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://passday.vercel.app"),
  title: "PASS DAY — Pick the best Orlando park day",
  description: "Crowd outlooks, Orlando weather, events, official park news and live waits for Universal Orlando and Walt Disney World.",
  applicationName: "PASS DAY",
  icons: {
    icon: [{ url: "/brand/passday-favicon-v2.png", type: "image/png", sizes: "512x512" }],
    shortcut: "/brand/passday-favicon-v2.png",
    apple: [{ url: "/brand/passday-favicon-v2.png", sizes: "512x512", type: "image/png" }],
  },
  openGraph: {
    title: "PASS DAY — Your Orlando theme park decision desk",
    description: "Choose a Universal or Disney park, then know when to go and what to expect.",
    type: "website",
    images: [{ url: "/og-v2.png", width: 1200, height: 630, alt: "PASS DAY Universal and Disney Orlando park planning dashboard" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "PASS DAY — Pick your best Orlando park day",
    description: "Universal and Disney crowd patterns, weather, live waits, events and park news in one dashboard.",
    images: ["/og-v2.png"],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body className={`${roboto.variable} ${roboto.className}`}>{children}</body>
    </html>
  );
}
