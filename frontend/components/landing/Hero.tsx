import { ArrowDown, ArrowRight } from "lucide-react";
import Link from "next/link";

import { PLACEHOLDER_LINKS } from "./links";

const offerings = [
  "Nearby doctor discovery",
  "Seven-day diet plans",
  "Precautions & warning signs",
];

export function Hero() {
  return (
    <section aria-labelledby="hero-heading" className="relative overflow-hidden bg-sage/45">
      <div className="shell grid gap-10 pb-16 pt-10 sm:pt-14 lg:grid-cols-12 lg:gap-10 lg:pb-20 lg:pt-14">
        <div className="flex flex-col justify-center lg:col-span-7 lg:pr-6">
          <p className="animate-rise text-xs font-medium uppercase tracking-[0.2em] text-primary">
            Your AI-powered personal health assistant
          </p>
          <h1
            id="hero-heading"
            className="animate-rise mt-6 text-[clamp(3.1rem,8.4vw,6.75rem)] font-normal leading-[0.94] tracking-[-0.035em] text-foreground [animation-delay:80ms]"
          >
            Your Health.
            <br />
            <em className="font-normal text-primary">Better Understood.</em>
          </h1>
          <p className="animate-rise mt-8 max-w-xl text-lg leading-relaxed text-muted-foreground [animation-delay:160ms] sm:text-xl">
            Understand your health concerns, discover nearby healthcare professionals and receive
            personalized health guidance — all in one place.
          </p>
          <div className="animate-rise mt-10 flex flex-col gap-3 [animation-delay:240ms] sm:flex-row sm:items-center sm:gap-4">
            <Link
              href={PLACEHOLDER_LINKS.getStarted}
              className="group inline-flex items-center justify-center gap-2 rounded-full bg-primary px-7 py-4 text-base font-medium text-primary-foreground transition-colors hover:bg-forest-deep"
            >
              Get Started
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
            <a
              href="#how-it-works"
              className="group inline-flex items-center justify-center gap-2 rounded-full border border-foreground/15 px-7 py-4 text-base font-medium text-foreground transition-colors hover:border-primary hover:text-primary"
            >
              Explore How It Works
              <ArrowDown className="h-4 w-4 transition-transform duration-300 group-hover:translate-y-0.5" />
            </a>
          </div>

          <ul className="animate-rise mt-14 grid gap-4 border-t border-border pt-6 text-sm text-muted-foreground [animation-delay:320ms] sm:grid-cols-3 sm:gap-6">
            {offerings.map((item) => (
              <li key={item} className="flex items-center gap-2.5">
                <span aria-hidden="true" className="h-1.5 w-1.5 rotate-45 bg-teal" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <figure className="animate-rise relative [animation-delay:200ms] lg:col-span-5">
          <div
            aria-hidden="true"
            className="absolute -right-16 bottom-16 left-1/3 top-16 hidden bg-sage lg:block xl:-right-28"
          />
          <div className="relative overflow-hidden rounded-t-[999px] rounded-b-md shadow-[0_20px_50px_rgba(23,63,53,0.12)]">
            <img
              src="/images/landing/hero.jpg"
              alt="A woman sitting by a sunlit window, calmly reading health information on her phone"
              width={1024}
              height={1536}
              fetchPriority="high"
              className="aspect-[4/5] w-full object-cover object-[50%_30%] lg:aspect-[4/4.8]"
            />
          </div>
          <figcaption className="relative mt-4 flex items-start justify-between gap-6 text-sm text-muted-foreground">
            <span className="font-display italic">Health guidance, written in plain language.</span>
            <span className="shrink-0 text-xs uppercase tracking-[0.18em]">Fig. 01</span>
          </figcaption>
        </figure>
      </div>
    </section>
  );
}
