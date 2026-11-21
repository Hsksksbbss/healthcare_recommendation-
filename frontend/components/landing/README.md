# HealthCare AI — landing page components

Plain React + Tailwind CSS. No router, Vite, or environment-variable APIs, so the
folder can be dropped into a Next.js App Router project unchanged.

## Files to copy into Next.js

| From this project | To the Next.js project |
| --- | --- |
| `src/components/landing/*` (this folder) | `components/landing/` |
| `public/images/landing/*` | `public/images/landing/` |
| `public/favicon.svg` (optional) | `app/icon.svg` |
| Design tokens + utilities in `src/styles.css` (`:root`, `@theme inline`, `@layer base`, `@utility shell / animate-rise / reveal / animate-pulse-ring`) | `app/globals.css` (Tailwind v4) |

Dependency: `lucide-react` (icons).

## Next.js page

```tsx
// app/page.tsx
import type { Metadata } from "next";
import { LandingPage } from "@/components/landing/LandingPage";

export const metadata: Metadata = {
  title: "HealthCare AI — Your Health. Better Understood.",
  description:
    "Understand your health concerns, discover nearby healthcare professionals and receive personalized diet plans and precautions — all in one place.",
};

export default function Page() {
  return <LandingPage />;
}
```

Fonts: load **Fraunces** (headings) and **Instrument Sans** (body), e.g. with
`next/font/google`, and keep the `--font-display` / `--font-sans` tokens pointing at them.

## Client components

Only `Navbar.tsx` (mobile menu, scroll state) and `FAQ.tsx` (accordion) carry
`"use client"`. Everything else is a server-compatible component.

## Placeholder links

`links.ts` → `PLACEHOLDER_LINKS` holds Sign In, Get Started, Privacy Policy and
Terms targets. Replace those values with real routes when the screens exist.
The footer contact column is also a placeholder until official details are available.
