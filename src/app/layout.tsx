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
  title: "Headliner",
  description: "Who to book. Who to sponsor. Backed by evidence.",
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
