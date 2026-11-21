"use client";

import { ArrowLeft, Info } from "lucide-react";

import { AppHeader } from "../doctors/AppHeader";
import { useHealthSession } from "../health/HealthAssessmentContext";
import { PLACEHOLDER_LINKS } from "../landing/links";
import { HealthOptionCard } from "./HealthOptionCard";
import { HEALTH_OPTIONS } from "./health-options";

export function HealthOptionsPage() {
  const { assessment } = useHealthSession();

  return (
    <div className="min-h-screen bg-background">
      <AppHeader currentHref={PLACEHOLDER_LINKS.healthAssessment} />

      <main id="main" className="shell pb-24 pt-8 sm:pt-10">
        <a
          href={PLACEHOLDER_LINKS.dashboard}
          className="inline-flex h-11 items-center gap-2 rounded-full pr-3 text-sm font-medium text-foreground/80 transition-colors hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to Dashboard
        </a>

        <section aria-labelledby="health-options-heading" className="mt-8 sm:mt-12">
          <div className="max-w-3xl">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-primary">
              Health Guidance Options
            </p>
            <h1
              id="health-options-heading"
              className="mt-5 text-[clamp(2.4rem,5vw,4.25rem)] font-light leading-[1.02] tracking-[-0.025em] text-foreground"
            >
              How Can We Help You <em className="text-primary">Today?</em>
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-muted-foreground">
              Choose the health support you would like to explore based on your health concerns.
            </p>
          </div>

          <ul className="mt-12 grid gap-5 md:grid-cols-2 lg:mt-16 lg:grid-cols-3 lg:gap-6">
            {HEALTH_OPTIONS.map((option, i) => (
              <li key={option.id} className={i === 2 ? "md:col-span-2 lg:col-span-1" : undefined}>
                <HealthOptionCard option={option} index={i} />
              </li>
            ))}
          </ul>
        </section>

        <aside
          aria-label="About this guidance"
          className="mt-12 flex gap-4 rounded-lg border border-border bg-muted/60 p-5 sm:p-6"
        >
          <Info className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
          <div className="space-y-2 text-sm leading-relaxed text-foreground/80">
            <p>
              {assessment ? (
                <>
                  These options use your latest submitted assessment when a personalized result is
                  requested. Nothing here is a medical diagnosis.
                </>
              ) : (
                <>
                  Complete the health assessment first so these options can use your health
                  information. Nothing here is a medical diagnosis.
                </>
              )}
            </p>
            <p>
              If you have severe, sudden or worsening symptoms, contact a doctor or your local
              emergency services right away.
            </p>
          </div>
        </aside>
      </main>
    </div>
  );
}
