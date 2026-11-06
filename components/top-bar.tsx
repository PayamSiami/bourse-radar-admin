"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FormEvent,
} from "react";

import { useAuth } from "@/lib/auth";
import { MenuIcon, SearchIcon, UserIcon } from "lucide-react";

const NAV_ITEMS = [
  { href: "/stocks", label: "سهام" },
  { href: "/sectors", label: "صنعت‌ها" },
  { href: "/suggestions", label: "پیشنهادها" },
] as const;

export function TopBar() {
  const router = useRouter();
  const pathname = usePathname();

  const [query, setQuery] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const searchRef = useRef<HTMLInputElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const { user, isAuthenticated, logout } = useAuth();

  const closeMenus = useCallback(() => {
    setMobileOpen(false);
    setUserMenuOpen(false);
  }, []);

  useEffect(() => {
    closeMenus();
  }, [pathname, closeMenus]);

  // Keyboard shortcuts + outside-click handling
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (
        (event.metaKey || event.ctrlKey) &&
        event.key.toLowerCase() === "k"
      ) {
        event.preventDefault();
        searchRef.current?.focus();
        searchRef.current?.select();
      }

      if (event.key === "Escape") {
        closeMenus();
        searchRef.current?.blur();
      }
    }

    function handlePointerDown(event: PointerEvent) {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node)
      ) {
        setUserMenuOpen(false);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    document.addEventListener("pointerdown", handlePointerDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [closeMenus]);

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const value = query.trim();
    if (!value) {
      searchRef.current?.focus();
      return;
    }

    closeMenus();
    router.push(`/stocks?q=${encodeURIComponent(value)}`);
  }

  async function handleLogout() {
    try {
      await logout();
      closeMenus();
      router.push("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  }

  const displayName = user?.displayName || "کاربر";
  const avatarLetter = (user?.displayName || user?.email || "U")
    .charAt(0)
    .toUpperCase();

  return (
    <header className="sticky top-0 z-50 border-b border-app/80 bg-app/85 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-2 px-4 sm:gap-4 sm:px-6">
        {/* ── Logo ── */}
        <Link
          href="/"
          onClick={closeMenus}
          aria-label="بورس رادار — صفحه اصلی"
          className="group flex shrink-0 items-center gap-2.5 rounded-xl p-1 transition hover:bg-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
        >
          <div className="relative h-9 w-9 sm:h-10 sm:w-10">
            <Image
              src="/logo.webp"
              alt=""
              fill
              priority
              sizes="40px"
              className="object-contain transition-transform group-hover:scale-105"
            />
          </div>

          <div className="hidden sm:block">
            <div className="text-[13px] font-bold leading-tight text-fg">
              بورس{" "}
              <span className="text-brand-600 dark:text-brand-400">
                رادار
              </span>
            </div>
            <div className="mt-0.5 text-[9px] leading-tight text-muted">
              تحلیل بنیادی بورس تهران
            </div>
          </div>
        </Link>

        {/* ── Search ── */}
        <form
          onSubmit={handleSearch}
          role="search"
          className="relative mx-auto min-w-0 max-w-2xl flex-1"
        >
          <SearchIcon className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />

          <input
            ref={searchRef}
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="جستجوی نماد یا نام شرکت..."
            aria-label="جستجوی نماد یا نام شرکت"
            className="h-10 w-full rounded-xl border border-app bg-surface pr-10 pl-24 text-sm text-fg transition placeholder:text-muted/60 hover:border-app/80 focus:border-brand-500/60 focus:bg-app focus:outline-none focus:ring-2 focus:ring-brand-500/15 sm:pl-28"
          />

          {/* Clear button */}
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                searchRef.current?.focus();
              }}
              aria-label="پاک کردن جستجو"
              className="absolute left-2 top-1/2 grid h-6 w-6 -translate-y-1/2 place-items-center rounded-md text-muted transition hover:bg-surface-2 hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
            >
              <CloseIcon className="h-3.5 w-3.5" />
            </button>
          )}

          {/* Shortcut hint OR submit */}
          {!query ? (
            <kbd className="pointer-events-none absolute left-3 top-1/2 hidden -translate-y-1/2 select-none items-center gap-0.5 rounded-md border border-app bg-surface-2 px-1.5 py-0.5 text-[9px] font-medium text-muted md:flex">
              <span className="text-[11px]">⌘</span>K
            </kbd>
          ) : (
            <button
              type="submit"
              aria-label="جستجو"
              className="absolute left-2 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-lg bg-brand-500 text-white transition hover:bg-brand-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
            >
              <SearchIcon className="h-3.5 w-3.5" />
            </button>
          )}
        </form>

        {/* ── Desktop navigation ── */}
        <nav
          aria-label="ناوبری اصلی"
          className="hidden shrink-0 items-center gap-0.5 lg:flex"
        >
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.href}
              href={item.href}
              active={
                pathname === item.href ||
                pathname.startsWith(`${item.href}/`)
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* ── Actions ── */}
        <div className="flex shrink-0 items-center gap-1.5">
          {isAuthenticated ? (
            <div ref={userMenuRef} className="relative">
              <button
                type="button"
                onClick={() => setUserMenuOpen((open) => !open)}
                aria-label="منوی کاربر"
                aria-expanded={userMenuOpen}
                aria-haspopup="menu"
                className="flex items-center gap-2 rounded-xl border border-app bg-surface px-1.5 py-1.5 transition hover:bg-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 sm:px-2.5"
              >
                {user?.avatarUrl ? (
                  <Image
                    src={user.avatarUrl}
                    alt=""
                    width={32}
                    height={32}
                    className="h-8 w-8 rounded-full object-cover"
                  />
                ) : (
                  <div
                    aria-hidden="true"
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-linear-to-br from-brand-400 to-emerald-400 text-sm font-semibold text-white"
                  >
                    {avatarLetter}
                  </div>
                )}

                <span className="hidden max-w-28 truncate text-sm font-medium text-fg sm:block">
                  {displayName}
                </span>

                <ChevronIcon
                  className={`h-4 w-4 text-muted transition-transform duration-200 ${userMenuOpen ? "rotate-180" : ""
                    }`}
                />
              </button>

              {userMenuOpen && (
                <div
                  role="menu"
                  className="absolute left-0 top-full z-50 mt-2 w-52 overflow-hidden rounded-xl border border-app bg-surface py-1 shadow-xl ring-1 ring-black/5 dark:ring-white/5"
                >
                  <div className="border-b border-app px-4 py-2.5">
                    <div className="truncate text-sm font-semibold text-fg">
                      {displayName}
                    </div>
                    {user?.email && (
                      <div className="mt-0.5 truncate text-xs text-muted">
                        {user.email}
                      </div>
                    )}
                  </div>

                  <Link
                    href="/profile"
                    role="menuitem"
                    onClick={closeMenus}
                    className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-fg transition hover:bg-surface-2 focus-visible:bg-surface-2 focus-visible:outline-none"
                  >
                    <UserIcon className="h-4 w-4 text-muted" />
                    پروفایل من
                  </Link>
                  <Link
                    href="/tickets"
                    role="menuitem"
                    onClick={closeMenus}
                    className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-fg transition hover:bg-surface-2 focus-visible:bg-surface-2 focus-visible:outline-none"
                  >
                    <TicketIcon className="h-4 w-4 text-muted" />
                    تیکت‌های من
                  </Link>

                  <div className="my-1 border-t border-app" />

                  <button
                    type="button"
                    role="menuitem"
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2.5 px-4 py-2.5 text-right text-sm text-red-600 transition hover:bg-red-500/10 focus-visible:bg-red-500/10 focus-visible:outline-none dark:text-red-400"
                  >
                    <LogoutIcon className="h-4 w-4" />
                    خروج از حساب
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/login"
              onClick={closeMenus}
              className="whitespace-nowrap rounded-xl bg-brand-600 px-3.5 py-2 text-xs font-semibold transition hover:bg-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 sm:px-4 sm:text-sm"
            >
              ورود / ثبت‌نام
            </Link>
          )}

          {/* Mobile menu button */}
          <button
            type="button"
            onClick={() => setMobileOpen((open) => !open)}
            aria-label={mobileOpen ? "بستن منو" : "باز کردن منو"}
            aria-expanded={mobileOpen}
            aria-controls="mobile-navigation"
            className="grid h-9 w-9 place-items-center rounded-xl border border-app bg-surface text-muted transition hover:bg-surface-2 hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 lg:hidden"
          >
            {mobileOpen ? (
              <CloseIcon className="h-4 w-4" />
            ) : (
              <MenuIcon className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>

      {/* ── Mobile navigation ── */}
      {mobileOpen && (
        <nav
          id="mobile-navigation"
          aria-label="ناوبری موبایل"
          className="border-t border-app bg-app/95 px-4 py-2 backdrop-blur-xl lg:hidden sm:px-6"
        >
          <div className="mx-auto flex max-w-7xl flex-col gap-0.5">
            {NAV_ITEMS.map((item) => {
              const active =
                pathname === item.href ||
                pathname.startsWith(`${item.href}/`);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={closeMenus}
                  aria-current={active ? "page" : undefined}
                  className={`flex items-center justify-between rounded-xl px-3 py-2.5 text-sm transition ${active
                      ? "bg-brand-500/10 font-semibold text-brand-600 dark:text-brand-400"
                      : "text-muted hover:bg-surface-2 hover:text-fg"
                    }`}
                >
                  <span>{item.label}</span>
                  {active && <span aria-hidden="true">←</span>}
                </Link>
              );
            })}
          </div>
        </nav>
      )}
    </header>
  );
}

function NavLink({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`relative rounded-lg px-3 py-2 text-xs font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 ${active
          ? "text-fg"
          : "text-muted hover:bg-surface-2 hover:text-fg"
        }`}
    >
      {children}
      {active && (
        <span
          aria-hidden="true"
          className="absolute bottom-0.5 left-1/2 h-0.5 w-4 -translate-x-1/2 rounded-full bg-brand-500"
        />
      )}
    </Link>
  );
}

/* ── Icons ── */
function CloseIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}

function ChevronIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}
function TicketIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 9a3 3 0 0 0 0 6v3a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1v-3a3 3 0 0 0 0-6V6a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1z" />
      <path d="M13 5v2M13 17v2M13 11v2" />
    </svg>
  );
}

function LogoutIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <path d="m16 17 5-5-5-5" />
      <path d="M21 12H9" />
    </svg>
  );
}

export default TopBar;