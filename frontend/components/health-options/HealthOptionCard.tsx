import { ArrowRight, Clock } from "lucide-react";
import Link from "next/link";

import type { HealthOption } from "./health-options";

type HealthOptionCardProps = {
  option: HealthOption;
  index: number;
};

const numerals = ["i.", "ii.", "iii.", "iv.", "v."];

export function HealthOptionCard({ option, index }: HealthOptionCardProps) {
  const Icon = option.icon;
  const headingId = `option-${option.id}-title`;
  const noteId = `option-${option.id}-note`;

  return (
    <article
      aria-labelledby={headingId}
      className={`group relative flex h-full flex-col rounded-lg border bg-card p-7 transition-[border-color,box-shadow,transform] duration-300 sm:p-8 ${
        option.available
          ? "border-border hover:-translate-y-1 hover:border-primary/40 hover:shadow-[0_24px_48px_-28px_oklch(0.29_0.05_160/0.45)] motion-reduce:hover:translate-y-0"
          : "border-border/80"
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <span
          className={`flex h-14 w-14 items-center justify-center rounded-full transition-colors duration-300 ${
            option.available
              ? "bg-secondary text-primary group-hover:bg-primary group-hover:text-primary-foreground"
              : "bg-muted text-muted-foreground"
          }`}
        >
          <Icon className="h-6 w-6" aria-hidden="true" strokeWidth={1.6} />
        </span>
        <span className="font-display text-sm italic text-sand-deep">{numerals[index]}</span>
      </div>

      <h2
        id={headingId}
        className="mt-8 text-[1.65rem] font-normal leading-[1.1] tracking-[-0.015em] text-foreground"
      >
        {option.title}
      </h2>
      <p className="mt-3 leading-relaxed text-muted-foreground">{option.description}</p>

      <div className="mt-auto pt-8">
        {option.available ? (
          <Link
            href={option.href}
            className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-primary px-6 text-[0.95rem] font-medium text-primary-foreground transition-colors hover:bg-forest-deep focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            {option.cta}
            <ArrowRight
              className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5"
              aria-hidden="true"
            />
          </Link>
        ) : (
          <>
            <button
              type="button"
              disabled
              aria-describedby={noteId}
              className="inline-flex h-12 w-full cursor-not-allowed items-center justify-center gap-2 rounded-full border border-border bg-muted px-6 text-[0.95rem] font-medium text-muted-foreground"
            >
              {option.cta}
            </button>
            <p
              id={noteId}
              className="mt-3 flex items-center justify-center gap-1.5 text-sm text-muted-foreground"
            >
              <Clock className="h-3.5 w-3.5" aria-hidden="true" />
              Coming soon — this page isn't available yet.
            </p>
          </>
        )}
      </div>
    </article>
  );
}
