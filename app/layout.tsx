import type { Viewport } from "next";
import { Vazirmatn } from "next/font/google";
import "./globals.css";
import { TopBar } from "@/components/top-bar";
import { Footer } from "@/components/footer";
import { AuthProvider } from "@/lib/auth";
import SideBar from "@/components/side-bar";

const vazirmatn = Vazirmatn({
  variable: "--font-vazirmatn",
  subsets: ["arabic", "latin"],
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#ffffff",
  colorScheme: "light dark",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="fa"
      dir="rtl"
      className={`${vazirmatn.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col font-sans bg-app text-fg">
        <AuthProvider>
          <TopBar />
          {/* Two-column shell: sidebar + page content side by side */}
          <div className="flex-1 flex">
            <SideBar />
            <main className="flex-1 min-w-0 overflow-x-hidden">
              {children}
            </main>
          </div>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}