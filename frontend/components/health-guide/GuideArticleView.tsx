import { forwardRef } from "react";
import { ArrowLeft, ArrowRight, Info, Siren, Stethoscope } from "lucide-react";

import {
  GUIDE_ARTICLES,
  articleHash,
  getCategory,
  type GuideArticle,
} from "./health-guide-data";
import { CATEGORY_TONES } from "./tones";

type GuideArticleViewProps = {
  article: GuideArticle;
  /** Link back to the list of topics. */
  backHref: string;
};

export const GuideArticleView = forwardRef<HTMLHeadingElement, GuideArticleViewProps>(
  function GuideArticleView({ article, backHref }, headingRef) {
    const category = getCategory(article.category);
    const tone = CATEGORY_TONES[article.category];
    const Icon = article.icon;
    const related = GUIDE_ARTICLES.filter(
      (a) => a.category === article.category && a.id !== article.id,
    ).slice(0, 3);
    const titleId = `article-${article.id}-title`;

    return (
      <article aria-labelledby={titleId} className="grid gap-10 lg:grid-cols-12 lg:gap-12">
        <div className="lg:col-span-8">
          <a
            href={backHref}
            className="inline-flex h-11 items-center gap-2 rounded-full pr-3 text-sm font-medium text-foreground/80 transition-colors hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            All health topics
          </a>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium uppercase tracking-[0.14em] ${tone.tag}`}
            >
              {category.letter}. {category.title}
            </span>
          </div>

          <div className="mt-6 flex items-start gap-5">
            <span className="hidden h-14 w-14 shrink-0 items-center justify-center rounded-full bg-secondary text-primary sm:flex">
              <Icon className="h-6 w-6" aria-hidden="true" strokeWidth={1.6} />
            </span>
            <h2
              id={titleId}
              ref={headingRef}
              tabIndex={-1}
              className="text-[clamp(2.1rem,4.4vw,3.4rem)] font-normal leading-[1.04] tracking-[-0.025em] text-foreground focus:outline-none"
            >
              {article.title}
            </h2>
          </div>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-foreground/80">{article.summary}</p>

          <div className="mt-10 space-y-10 border-t border-border pt-10">
            {article.sections.map((section) => (
              <section key={section.heading}>
                <h3 className="text-2xl tracking-[-0.01em] text-foreground">{section.heading}</h3>
                <ul className="mt-4 space-y-3">
                  {section.points.map((point) => (
                    <li key={point} className="flex gap-3 leading-relaxed text-foreground/85">
                      <span
                        className="mt-[0.6rem] h-1.5 w-1.5 shrink-0 rounded-full bg-primary"
                        aria-hidden="true"
                      />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>

          <section
            aria-labelledby={`${titleId}-doctor`}
            className="mt-12 rounded-lg border-l-2 border-sand-deep bg-sand/60 p-6 sm:p-7"
          >
            <h3
              id={`${titleId}-doctor`}
              className="flex items-center gap-2.5 text-xl tracking-[-0.01em] text-foreground"
            >
              <Stethoscope className="h-5 w-5 text-sand-deep" aria-hidden="true" />
              See a doctor if
            </h3>
            <ul className="mt-4 space-y-2.5">
              {article.seeDoctor.map((point) => (
                <li key={point} className="flex gap-3 leading-relaxed text-foreground/85">
                  <span className="mt-[0.6rem] h-1.5 w-1.5 shrink-0 rounded-full bg-sand-deep" aria-hidden="true" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </section>

          {article.emergency && article.emergency.length > 0 && (
            <section
              aria-labelledby={`${titleId}-emergency`}
              className="mt-5 rounded-lg border-l-2 border-destructive bg-destructive/5 p-6 sm:p-7"
            >
              <h3
                id={`${titleId}-emergency`}
                className="flex items-center gap-2.5 text-xl tracking-[-0.01em] text-destructive"
              >
                <Siren className="h-5 w-5" aria-hidden="true" />
                Get emergency help now if
              </h3>
              <ul className="mt-4 space-y-2.5">
                {article.emergency.map((point) => (
                  <li key={point} className="flex gap-3 leading-relaxed text-foreground">
                    <span className="mt-[0.6rem] h-1.5 w-1.5 shrink-0 rounded-full bg-destructive" aria-hidden="true" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-4 text-sm font-medium text-foreground">
                Contact your local emergency services or go to the nearest emergency department.
              </p>
            </section>
          )}

          <p className="mt-8 flex gap-3 text-sm leading-relaxed text-muted-foreground">
            <Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            General educational information only — not a diagnosis or a substitute for advice from a
            qualified healthcare professional.
          </p>
        </div>

        {related.length > 0 && (
          <aside aria-label="Related topics" className="lg:col-span-4">
            <div className="rounded-lg border border-border bg-card p-6 lg:sticky lg:top-24">
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                More in {category.title}
              </p>
              <ul className="mt-4 divide-y divide-border">
                {related.map((a) => (
                  <li key={a.id}>
                    <a
                      href={articleHash(a.id)}
                      className="group flex items-center justify-between gap-3 py-3.5 text-foreground transition-colors hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                    >
                      <span className="font-display text-lg leading-snug">{a.title}</span>
                      <ArrowRight
                        className="h-4 w-4 shrink-0 transition-transform group-hover:translate-x-0.5"
                        aria-hidden="true"
                      />
                    </a>
                  </li>
                ))}
              </ul>
              <a
                href={backHref}
                className="mt-4 inline-flex h-11 w-full items-center justify-center rounded-full border border-border text-sm font-medium text-foreground transition-colors hover:border-primary/40 hover:text-primary"
              >
                Browse all topics
              </a>
            </div>
          </aside>
        )}
      </article>
    );
  },
);
