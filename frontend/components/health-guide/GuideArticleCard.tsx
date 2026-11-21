import { ArrowRight } from "lucide-react";

import { articleHash, type GuideArticle } from "./health-guide-data";

export function GuideArticleCard({ article }: { article: GuideArticle }) {
  const Icon = article.icon;
  const headingId = `guide-card-${article.id}`;

  return (
    <article
      aria-labelledby={headingId}
      className="group relative flex h-full flex-col rounded-lg border border-border bg-card p-6 transition-[border-color,box-shadow,transform] duration-300 focus-within:border-primary/50 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-[0_20px_40px_-28px_oklch(0.29_0.05_160/0.45)] motion-reduce:hover:translate-y-0"
    >
      <span className="flex h-11 w-11 items-center justify-center rounded-full bg-secondary text-primary transition-colors duration-300 group-hover:bg-primary group-hover:text-primary-foreground">
        <Icon className="h-5 w-5" aria-hidden="true" strokeWidth={1.7} />
      </span>
      <h4
        id={headingId}
        className="mt-5 font-display text-xl leading-snug tracking-[-0.01em] text-foreground"
      >
        {article.title}
      </h4>
      <p className="mt-2 line-clamp-3 text-[0.95rem] leading-relaxed text-muted-foreground">
        {article.summary}
      </p>
      <a
        href={articleHash(article.id)}
        className="mt-auto inline-flex items-center gap-1.5 pt-5 text-sm font-medium text-primary after:absolute after:inset-0 after:rounded-lg focus-visible:outline-none"
      >
        Read article
        <span className="sr-only">: {article.title}</span>
        <ArrowRight
          className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5"
          aria-hidden="true"
        />
      </a>
    </article>
  );
}
