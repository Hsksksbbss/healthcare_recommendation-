"use client";

import { useEffect, useState } from "react";
import { ArrowRight, Menu, X } from "lucide-react";
import Link from "next/link";

import { Logo } from "./Logo";
import { PLACEHOLDER_LINKS, SECTION_LINKS } from "./links";

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    const onResize = () => window.innerWidth >= 1024 && setOpen(false);
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    window.addEventListener("resize", onResize);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", onResize);
    };
  }, [open]);

  const close = () => setOpen(false);

  return (
    <>
      <header
        className={`sticky top-0 z-50 transition-[background-color,border-color,box-shadow] duration-300 ${
          scrolled || open
            ? "border-b border-border bg-background/95 backdrop-blur-sm"
            : "border-b border-transparent bg-background"
        }`}
      >
        <nav aria-label="Main" className="shell flex h-[4.5rem] items-center justify-between gap-6">
          <Link
            href="/"
            onClick={close}
            className="rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
          >
            <Logo />
            <span className="sr-only">HealthCare AI home</span>
          </Link>

          <ul className="hidden items-center gap-1 lg:flex">
            {SECTION_LINKS.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className="group relative rounded-sm px-3.5 py-2 text-[0.95rem] text-foreground/80 transition-colors hover:text-foreground"
                >
                  {link.label}
                  <span className="absolute inset-x-3.5 bottom-1 h-px origin-left scale-x-0 bg-primary transition-transform duration-300 group-hover:scale-x-100" />
                </a>
              </li>
            ))}
          </ul>

          <div className="hidden items-center gap-2 lg:flex">
            <Link
              href={PLACEHOLDER_LINKS.signIn}
              className="rounded-sm px-4 py-2 text-[0.95rem] font-medium text-foreground transition-colors hover:text-primary"
            >
              Sign In
            </Link>
            <Link
              href={PLACEHOLDER_LINKS.getStarted}
              className="group inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-[0.95rem] font-medium text-primary-foreground transition-colors hover:bg-forest-deep"
            >
              Get Started
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
            </Link>
          </div>

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? "Close menu" : "Open menu"}
            className="-mr-2 inline-flex h-11 w-11 items-center justify-center rounded-full text-foreground transition-colors hover:bg-muted lg:hidden"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </nav>
      </header>

      <div
        id="mobile-menu"
        hidden={!open}
        className="fixed inset-x-0 top-[4.5rem] bottom-0 z-40 overflow-y-auto bg-background lg:hidden"
      >
        <div className="shell flex min-h-full flex-col pb-10 pt-6">
          <ul className="flex flex-col">
            {SECTION_LINKS.map((link, i) => (
              <li key={link.href} className="border-b border-border">
                <a
                  href={link.href}
                  onClick={close}
                  className="flex items-baseline justify-between py-5 font-display text-3xl tracking-tight text-foreground transition-colors hover:text-primary"
                >
                  {link.label}
                  <span className="font-sans text-xs tracking-[0.18em] text-muted-foreground">
                    0{i + 1}
                  </span>
                </a>
              </li>
            ))}
          </ul>
          <div className="mt-auto flex flex-col gap-3 pt-10 sm:flex-row">
            <Link
              href={PLACEHOLDER_LINKS.getStarted}
              onClick={close}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-primary px-6 py-3.5 font-medium text-primary-foreground"
            >
              Get Started <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href={PLACEHOLDER_LINKS.signIn}
              onClick={close}
              className="inline-flex flex-1 items-center justify-center rounded-full border border-foreground/20 px-6 py-3.5 font-medium text-foreground"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
