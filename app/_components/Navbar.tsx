"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

type NavItem = { href: string; en: string; ar: string };

const NAV: NavItem[] = [
  { href: "/", en: "Live Prices", ar: "الأسعار" },
  // { href: "/calculator", en: "Calculator", ar: "حاسبة الذهب" },
  // { href: "/buy-vs-sell", en: "Buy vs Sell", ar: "البيع والشراء" },
  { href: "/dashboard", en: "API", ar: "API" },
];

export function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-30 border-b border-[var(--border)] bg-[var(--background)]/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-5">
        <Link
          href="/"
          className="flex items-center gap-2 text-sm font-semibold"
          onClick={() => setOpen(false)}
        >
          <span
            aria-hidden
            className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-[var(--gold)] to-[#a8801b] text-[12px] font-bold text-[#1a1408] shadow-[0_0_12px_rgba(232,185,55,0.35)]"
          >
            EG
          </span>
          <span className="flex flex-col leading-tight">
            <span className="text-[var(--gold-soft)]">Gold · Egypt</span>
            <span
              className="text-[10px] font-normal text-[var(--foreground)]/55"
              dir="rtl"
            >
              أسعار الذهب
            </span>
          </span>
        </Link>

        <ul className="hidden items-center gap-1 sm:flex">
          {NAV.map((item) => (
            <li key={item.href}>
              <NavLink item={item} active={isActive(pathname, item.href)} />
            </li>
          ))}
        </ul>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-label="Toggle menu"
          className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-md border border-[var(--border)] bg-[var(--surface-2)] text-[var(--gold-soft)] sm:hidden"
        >
          <span className="sr-only">Menu</span>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            {open ? (
              <>
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </>
            ) : (
              <>
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </>
            )}
          </svg>
        </button>
      </div>

      {open ? (
        <div className="border-t border-[var(--border)] bg-[var(--surface)]/80 sm:hidden">
          <ul className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-3">
            {NAV.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={`flex items-center justify-between rounded-md px-3 py-2 text-sm transition ${
                    isActive(pathname, item.href)
                      ? "bg-[var(--gold)]/10 text-[var(--gold)]"
                      : "text-[var(--foreground)]/80 hover:bg-[var(--surface-2)]"
                  }`}
                >
                  <span>{item.en}</span>
                  <span
                    dir="rtl"
                    className="text-[11px] text-[var(--foreground)]/50"
                  >
                    {item.ar}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </nav>
  );
}

function NavLink({ item, active }: { item: NavItem; active: boolean }) {
  return (
    <Link
      href={item.href}
      className={`group relative inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-sm transition ${
        active
          ? "text-[var(--gold)]"
          : "text-[var(--foreground)]/75 hover:text-[var(--gold-soft)]"
      }`}
    >
      <span>{item.en}</span>
      <span
        dir="rtl"
        className="text-[10px] text-[var(--foreground)]/45 group-hover:text-[var(--foreground)]/65"
      >
        {item.ar}
      </span>
      {active ? (
        <span className="absolute inset-x-2 -bottom-[14px] h-[2px] rounded-full bg-[var(--gold)]" />
      ) : null}
    </Link>
  );
}

function isActive(pathname: string | null, href: string) {
  if (!pathname) return false;
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}
