import "./globals.css";
import type { Metadata, Viewport } from "next";
import { Manrope } from "next/font/google";

const ui = Manrope({ subsets: ["latin"], variable: "--font-ui" });
export const metadata: Metadata = { title: "WiFi Radar", description: "Discover and analyze nearby Wi-Fi networks.", manifest: "/manifest.json" };
export const viewport: Viewport = { themeColor: "#050914", width: "device-width", initialScale: 1 };

export default function Root({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body className={`${ui.variable} font-sans min-h-screen`}>{children}</body></html>;
}
