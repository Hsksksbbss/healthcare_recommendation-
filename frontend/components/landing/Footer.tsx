import Link from "next/link";

import { Logo } from "./Logo";
import { FEATURE_LINKS, PLACEHOLDER_LINKS, SECTION_LINKS } from "./links";

const linkClass = "text-forest-muted transition-colors hover:text-forest-foreground";

export function Footer() {
  return (
    <footer className="bg-forest-deep text-forest-foreground">
      <div className="shell grid gap-14 py-20 lg:grid-cols-12 lg:gap-10">
        <div className="lg:col-span-4">
          <Link href="/" aria-label="HealthCare AI home">
            <Logo inverted />
          </Link>
          <p className="mt-6 max-w-xs leading-relaxed text-forest-muted">
            An AI-powered personal health assistant that helps you understand health concerns, find
            nearby care and receive personalized guidance.
          </p>
        </div>

        <nav aria-label="Footer" className="grid grid-cols-2 gap-10 sm:grid-cols-4 lg:col-span-8">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-forest-foreground">Navigate</p>
            <ul className="mt-5 space-y-3 text-sm">
              {SECTION_LINKS.map((l) => (
                <li key={l.href}>
                  <a href={l.href} className={linkClass}>
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-forest-foreground">Features</p>
            <ul className="mt-5 space-y-3 text-sm">
              {FEATURE_LINKS.map((l) => (
                <li key={l.href}>
                  <a href={l.href} className={linkClass}>
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-forest-foreground">Legal</p>
            <ul className="mt-5 space-y-3 text-sm">
              <li>
                <a href={PLACEHOLDER_LINKS.privacy} className={linkClass}>
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href={PLACEHOLDER_LINKS.terms} className={linkClass}>
                  Terms and Conditions
                </a>
              </li>
            </ul>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-forest-foreground">Contact</p>
            {/* Placeholder: add the official contact channel once available. */}
            <p className="mt-5 text-sm leading-relaxed text-forest-muted">
              Contact details will be published here.
            </p>
          </div>
        </nav>
      </div>

      <div className="border-t border-forest-line">
        <div className="shell flex flex-col gap-3 py-6 text-xs text-forest-muted sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 HealthCare AI. All rights reserved.</p>
          <p>General guidance only — not a substitute for professional medical advice.</p>
        </div>
      </div>
    </footer>
  );
}
