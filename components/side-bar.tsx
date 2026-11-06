"use client";

import { useEffect } from "react";
import { FolderGit2, Menu, Ticket, Users, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const adminLinks = [
  { href: "/users", icon: Users, label: "مدیریت کاربران" },
  { href: "/tickets", icon: Ticket, label: "مدیریت تیکت‌ها" },
  { href: "/stocks", icon: FolderGit2, label: "مدیریت سهام" },
];

export default function SideBar() {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Lock body scroll while the mobile drawer is open
  useEffect(() => {
    document.body.style.overflow = sidebarOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [sidebarOpen]);

  // Close drawer on route change
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  // Close on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSidebarOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      {/* Mobile top bar with hamburger */}
      <div className="lg:hidden sticky top-0 z-50 flex items-center justify-between h-14 px-4 bg-card border-b border-border">
        <span className="text-sm font-semibold text-muted-foreground">
          پنل مدیریت
        </span>
        <button
          onClick={() => setSidebarOpen(true)}
          className="p-2 -mr-2 rounded-lg hover:bg-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          aria-label="باز کردن منو"
          aria-expanded={sidebarOpen}
          aria-controls="admin-sidebar"
        >
          <Menu size={22} />
        </button>
      </div>

      {/* Backdrop */}
      <div
        onClick={() => setSidebarOpen(false)}
        className={`
          fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden
          transition-opacity duration-200
          ${sidebarOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}
        `}
        aria-hidden="true"
      />

      {/* Sidebar */}
      <aside
        id="admin-sidebar"
        aria-label="منوی مدیریت"
        className={`
          fixed top-0 right-0 z-50 h-full w-64 bg-card border-l border-border
          flex flex-col
          transform transition-transform duration-300 ease-in-out
          lg:static lg:translate-x-0 lg:h-auto lg:z-auto
          ${sidebarOpen ? "translate-x-0" : "translate-x-full"}
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between h-14 px-4 border-b border-border shrink-0">
          <span className="font-semibold text-foreground">پنل مدیریت</span>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1.5 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            aria-label="بستن منو"
          >
            <X size={18} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {adminLinks.map((link) => {
            const isActive =
              pathname === link.href ||
              pathname?.startsWith(link.href + "/");
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={isActive ? "page" : undefined}
                className={`
                  relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm
                  transition-colors duration-150
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500
                  ${
                    isActive
                      ? "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400 font-medium"
                      : "text-gray-700 hover:bg-muted dark:text-gray-300"
                  }
                `}
              >
                {/* Active accent bar (right side for RTL) */}
                {isActive && (
                  <span className="absolute right-0 top-1/2 -translate-y-1/2 h-5 w-1 rounded-full bg-blue-600 dark:bg-blue-400" />
                )}
                <link.icon size={18} className="shrink-0" />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}