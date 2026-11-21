"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, Menu, UserRound, X } from "lucide-react";
import Link from "next/link";

import { Logo } from "../landing/Logo";
import { APP_NAV_LINKS, PLACEHOLDER_LINKS } from "../landing/links";

type AppHeaderProps = {
  /** href of the page currently open, used to highlight the nav item */
  currentHref: string;
};

/** Header for signed-in app pages: logo, app navigation and an account menu. */
export function AppHeader({ currentHref }: AppHeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const accountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!accountOpen) return;
    const onPointer = (e: PointerEvent) => {
      if (accountRef.current && !accountRef.current.contains(e.target as Node)) {
        setAccountOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setAccountOpen(false);
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [accountOpen]);

  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMobileOpen(false);
    const onResize = () => window.innerWidth >= 1024 && setMobileOpen(false);
    window.addEventListener("keydown", onKey);
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", onResize);
    };
  }, [mobileOpen]);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-sm">
      <nav aria-label="App" className="shell flex h-[4.5rem] items-center justify-between gap-6">
        <Link
          href="/"
          className="rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
        >
          <Logo />
          <span className="sr-only">HealthCare AI home</span>
        </Link>

        <ul className="hidden items-center gap-1 lg:flex">
          {APP_NAV_LINKS.map((link) => {
            const current = link.href === currentHref;
            return (
              <li key={link.href}>
                <a
                  href={link.href}
                  aria-current={current ? "page" : undefined}
                  className={`relative rounded-sm px-3.5 py-2 text-[0.95rem] transition-colors ${
                    current ? "font-medium text-primary" : "text-foreground/80 hover:text-foreground"
                  }`}
                >
                  {link.label}
                  {current && (
                    <span className="absolute inset-x-3.5 -bottom-[1.15rem] h-0.5 bg-primary" />
                  )}
                </a>
              </li>
            );
          })}
        </ul>

        <div className="flex items-center gap-1">
          <div ref={accountRef} className="relative">
            <button
              type="button"
              onClick={() => setAccountOpen((v) => !v)}
              aria-expanded={accountOpen}
              aria-haspopup="menu"
              aria-controls="account-menu"
              className="inline-flex h-11 items-center gap-2 rounded-full border border-border bg-card pl-1.5 pr-3 text-sm text-foreground transition-colors hover:border-foreground/25"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
                <UserRound className="h-4 w-4" aria-hidden="true" />
              </span>
              <span className="hidden sm:inline">Guest</span>
              <ChevronDown className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
              <span className="sr-only">Account menu</span>
            </button>
            {accountOpen && (
              <div
                id="account-menu"
                role="menu"
                className="absolute right-0 top-[calc(100%+0.5rem)] w-60 rounded-md border border-border bg-popover p-2 shadow-[0_12px_32px_-16px_oklch(0.25_0.012_75/0.35)]"
              >
                <p className="px-3 pb-2 pt-1 text-xs text-muted-foreground">
                  You are browsing as a guest.
                </p>
                <a
                  role="menuitem"
                  href={PLACEHOLDER_LINKS.signIn}
                  className="block rounded-sm px-3 py-2 text-sm text-foreground hover:bg-muted"
                >
                  Sign In
                </a>
                <a
                  role="menuitem"
                  href={PLACEHOLDER_LINKS.getStarted}
                  className="block rounded-sm px-3 py-2 text-sm text-foreground hover:bg-muted"
                >
                  Create an account
                </a>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            aria-expanded={mobileOpen}
            aria-controls="app-mobile-menu"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            className="-mr-2 inline-flex h-11 w-11 items-center justify-center rounded-full text-foreground transition-colors hover:bg-muted lg:hidden"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      <div id="app-mobile-menu" hidden={!mobileOpen} className="border-t border-border lg:hidden">
        <ul className="shell flex flex-col py-3">
          {APP_NAV_LINKS.map((link) => {
            const current = link.href === currentHref;
            return (
              <li key={link.href}>
                <a
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  aria-current={current ? "page" : undefined}
                  className={`flex items-center justify-between rounded-sm py-3.5 text-lg ${
                    current ? "font-medium text-primary" : "text-foreground"
                  }`}
                >
                  {link.label}
                  {current && <span className="h-1.5 w-1.5 rounded-full bg-primary" />}
                </a>
              </li>
            );
          })}
        </ul>
      </div>
    </header>
  );
}
