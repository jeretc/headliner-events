import type { Metadata, Viewport } from "next";
import { Archivo, Big_Shoulders } from "next/font/google";
import "./globals.css";

const cond = Big_Shoulders({
  variable: "--font-cond",
  subsets: ["latin"],
  weight: ["700", "800", "900"],
});

const body = Archivo({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "700", "800"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://headliner-events.vercel.app"),
  title: "Headliner: fame fills a poster, fit fills a festival",
  description:
    "An agent that tells event organizers who to book and who to sponsor, ranked by real cultural fit with the audience, with the evidence shown.",
  // Unlisted until the hackathon submission: remove this line (and the X-Robots-Tag header in next.config.ts) to allow indexing.
  robots: { index: false, follow: false },
  openGraph: {
    title: "Headliner",
    description: "Fame fills a poster. Fit fills a festival. Rank headliners and sponsors by real audience fit.",
    type: "website",
  },
  twitter: { card: "summary_large_image", title: "Headliner", description: "Fame fills a poster. Fit fills a festival." },
  appleWebApp: { capable: true, title: "Headliner", statusBarStyle: "black-translucent" },
};

export const viewport: Viewport = {
  themeColor: "#E8412A",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${cond.variable} ${body.variable} h-full antialiased`}>
      <body className="min-h-full">{children}</body>
    </html>
  );
}
