import type { Metadata, Viewport } from "next";
import { Vazirmatn } from "next/font/google";
import { Suspense } from "react";

import { TopBar } from "@/components/top-bar";
import { Footer } from "@/components/footer";
import { AuthProvider } from "@/lib/auth";

import "./globals.css";
import SideBar from "@/components/side-bar";

const vazirmatn = Vazirmatn({
  variable: "--font-vazirmatn",
  subsets: ["arabic", "latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: { default: "رادار بورس", template: "%s | رادار بورس" },
  description: "تحلیل و برآورد شاخص‌های بازار سرمایه ایران",
  applicationName: "Bourse Radar",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  // maximumScale intentionally omitted — pinching must remain enabled (WCAG 1.4.4)
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0b0b0b" },
  ],
  colorScheme: "light dark",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="fa"
      dir="rtl"
      className={`${vazirmatn.variable} h-full`}
      suppressHydrationWarning
    >
      <body className="min-h-dvh flex flex-col font-sans antialiased bg-app text-fg">
        <AuthProvider>
          <div className="flex-1 flex max-w-7xl mx-auto">
            <main id="main-content" className="flex-1 min-w-0">
              {children}
            </main>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}