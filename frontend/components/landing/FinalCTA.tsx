import { ArrowRight } from "lucide-react";
import Link from "next/link";

import { LogoMark } from "./Logo";
import { PLACEHOLDER_LINKS } from "./links";

export function FinalCTA() {
  return (
    <section id="get-started" aria-labelledby="cta-heading" className="bg-sand/35 pb-16 pt-4 lg:pb-24">
      <div className="shell">
        <div className="reveal relative overflow-hidden rounded-md bg-primary px-6 py-12 text-primary-foreground shadow-[0_20px_50px_rgba(23,63,53,0.16)] sm:px-12 lg:px-20 lg:py-16">
          <LogoMark
            inverted
            className="pointer-events-none absolute -bottom-24 -right-20 h-[26rem] w-[26rem] opacity-[0.07]"
          />
          <div className="relative grid gap-10 lg:grid-cols-12 lg:items-end">
            <h2
              id="cta-heading"
              className="text-[clamp(2.4rem,5.2vw,4.6rem)] font-light leading-[1.02] tracking-[-0.025em] lg:col-span-8"
            >
              Take a More Informed Step <em className="text-sage">Towards Your Health.</em>
            </h2>
            <div className="lg:col-span-4">
              <p className="leading-relaxed text-primary-foreground/80">
                Create your health profile, describe what is on your mind and see your guidance,
                nearby care and meal plan come together in one place.
              </p>
              <Link
                href={PLACEHOLDER_LINKS.getStarted}
                className="group mt-8 inline-flex items-center gap-2 rounded-full bg-background px-8 py-4 text-base font-medium text-primary transition-colors hover:bg-sage"
              >
                Get Started
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
