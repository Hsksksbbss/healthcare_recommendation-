"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  Info,
  Loader2,
  RefreshCw,
  Search,
  SearchX,
  Siren,
  Stethoscope,
} from "lucide-react";

import { AppHeader } from "../doctors/AppHeader";
import {
  useHealthSession,
  type HealthAssessment,
  type HealthGuidance,
} from "../health/HealthAssessmentContext";
import { HealthOptionNav } from "../health-options/HealthOptionNav";
import { GuideArticleCard } from "./GuideArticleCard";
import { GuideArticleView } from "./GuideArticleView";
import { GuideCategoryCard } from "./GuideCategoryCard";
import {
  DEFAULT_GUIDE_FILTERS,
  GUIDE_ARTICLES,
  GUIDE_CATEGORIES,
  articleIdFromHash,
  filterArticles,
  getArticle,
  type GuideCategoryId,
  type GuideFilters,
} from "./health-guide-data";

const HEALTH_OPTIONS_HREF = "/health-options";
const TOPICS_ID = "topics";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

function isHealthGuidance(value: unknown): value is HealthGuidance {
  return (
    isRecord(value) &&
    typeof value.understanding === "string" &&
    typeof value.general_information === "string" &&
    isStringArray(value.practical_precautions) &&
    isStringArray(value.things_to_avoid) &&
    isStringArray(value.warning_signs) &&
    isStringArray(value.emergency_warning_signs) &&
    isStringArray(value.when_to_consult) &&
    isStringArray(value.doctor_questions) &&
    typeof value.urgent_action === "string" &&
    typeof value.is_emergency === "boolean" &&
    typeof value.educational_notice === "string"
  );
}

function readError(body: unknown): string {
  if (isRecord(body) && typeof body.detail === "string") return body.detail;
  return "We could not generate health guidance. Please try again.";
}

export function HealthGuidePage() {
  const { assessment, healthGuidance, setHealthGuidance } = useHealthSession();
  const [filters, setFilters] = useState<GuideFilters>(DEFAULT_GUIDE_FILTERS);
  // The open article lives in the address bar hash (#topic-fever) so it can be
  // shared and the browser Back button closes it.
  const [openId, setOpenId] = useState<string | null>(null);
  const openIdRef = useRef<string | null>(null);
  const scrollTo = useRef<"article" | "topics" | null>(null);
  const articleHeadingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const sync = () => {
      const id = articleIdFromHash(window.location.hash);
      if (id === openIdRef.current) return;
      scrollTo.current = id ? "article" : "topics";
      openIdRef.current = id;
      setOpenId(id);
    };
    sync();
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, []);

  useEffect(() => {
    const target = scrollTo.current;
    scrollTo.current = null;
    if (target === "article") {
      window.scrollTo({ top: 0, behavior: "auto" });
      articleHeadingRef.current?.focus({ preventScroll: true });
    } else if (target === "topics") {
      document.getElementById(TOPICS_ID)?.scrollIntoView({ block: "start", behavior: "auto" });
    }
  }, [openId]);

  const openArticle = openId ? getArticle(openId) : undefined;

  return (
    <div className="min-h-screen bg-background">
      <AppHeader currentHref="/health-guide" />
      <HealthOptionNav current="guide" />

      <main id="main" className="pb-0">
        <div className="shell pt-8 sm:pt-10">
          <a
            href={HEALTH_OPTIONS_HREF}
            className="inline-flex h-11 items-center gap-2 rounded-full pr-3 text-sm font-medium text-foreground/80 transition-colors hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back to Health Options
          </a>
        </div>

        <PersonalizedGuidanceSection
          assessment={assessment}
          guidance={healthGuidance}
          setGuidance={setHealthGuidance}
        />

        {openArticle ? (
          <div className="shell pb-24 pt-6">
            <GuideArticleView
              ref={articleHeadingRef}
              article={openArticle}
              backHref={`#${TOPICS_ID}`}
            />
          </div>
        ) : (
          <GuideBrowser filters={filters} setFilters={setFilters} />
        )}

        <section aria-label="About this guide" className="border-t border-border bg-sand/50">
          <div className="shell flex gap-4 py-10">
            <Info className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
            <div className="max-w-3xl space-y-2 text-sm leading-relaxed text-foreground/85">
              <p>
                <strong className="font-semibold">Medical disclaimer.</strong> The Health Guide offers
                general educational information. It is not a medical diagnosis and does not replace
                advice, examination or treatment from a qualified healthcare professional.
              </p>
              <p>
                These articles were written for this prototype and have not yet been reviewed by a
                medical professional. They do not recommend medicines or doses — always ask a doctor
                or pharmacist, and never stop or change a prescribed medicine without their advice.
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

function PersonalizedGuidanceSection({
  assessment,
  guidance,
  setGuidance,
}: {
  assessment: HealthAssessment | null;
  guidance: HealthGuidance | null;
  setGuidance: (guidance: HealthGuidance | null) => void;
}) {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">(
    guidance ? "success" : "idle",
  );
  const [error, setError] = useState("");

  useEffect(() => {
    setStatus(guidance ? "success" : "idle");
    setError("");
  }, [assessment, guidance]);

  if (!assessment) {
    return (
      <section aria-labelledby="personalized-guidance-heading" className="shell mt-8 sm:mt-10">
        <div className="rounded-lg border border-sand-deep/50 bg-sand/60 p-6 sm:p-8">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-sand-deep">Personalized guidance</p>
          <h1 id="personalized-guidance-heading" className="mt-3 text-3xl tracking-tight text-foreground">
            Guidance Based on Your Health
          </h1>
          <p className="mt-3 max-w-2xl leading-relaxed text-foreground/80">
            Complete the health assessment to see guidance related to the concern you submitted.
            General Health Guide topics remain available below.
          </p>
          <a
            href="/dashboard#assessment"
            className="mt-5 inline-flex h-11 items-center rounded-full bg-primary px-5 text-sm font-medium text-primary-foreground transition-colors hover:bg-forest-deep"
          >
            Complete health assessment
          </a>
        </div>
      </section>
    );
  }

  async function generateGuidance() {
    setStatus("loading");
    setError("");

    try {
      const response = await fetch("http://127.0.0.1:8000/api/health/generate-guidance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          age: assessment.age,
          gender: assessment.gender || null,
          health_concern: assessment.healthConcern,
          symptom_duration: assessment.symptomDuration,
          severity: assessment.severity,
          existing_medical_conditions: assessment.existingMedicalConditions ?? null,
          allergies: assessment.allergies ?? null,
          current_medications: assessment.currentMedications ?? null,
          additional: assessment.additional ?? null,
        }),
      });
      const body: unknown = await response.json().catch(() => null);
      if (!response.ok) throw new Error(readError(body));
      if (!isHealthGuidance(body)) {
        throw new Error("The guidance service returned an unexpected response.");
      }
      setGuidance(body);
      setStatus("success");
    } catch (caught) {
      setGuidance(null);
      setError(caught instanceof Error ? caught.message : "We could not generate health guidance.");
      setStatus("error");
    }
  }

  return (
    <section aria-labelledby="personalized-guidance-heading" className="shell mt-8 sm:mt-10">
      <div className="rounded-lg border border-primary/30 bg-sage/60 p-6 sm:p-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:justify-between">
          <div className="max-w-3xl">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-primary">
              Personalized guidance
            </p>
            <h1 id="personalized-guidance-heading" className="mt-3 text-3xl tracking-tight text-foreground sm:text-4xl">
              Guidance Based on Your Health
            </h1>
            <p className="mt-3 text-sm text-muted-foreground">
              Your assessment is ready. Generate educational guidance only when you are ready to
              review it.
            </p>
          </div>
          <Stethoscope className="hidden h-8 w-8 shrink-0 text-primary lg:block" aria-hidden="true" />
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
          <button
            type="button"
            onClick={() => void generateGuidance()}
            disabled={status === "loading"}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-primary px-6 text-sm font-medium text-primary-foreground transition-colors hover:bg-forest-deep disabled:cursor-wait disabled:opacity-70"
          >
            {status === "loading" ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
            {status === "loading"
              ? "Generating guidance..."
              : guidance
                ? "Regenerate Guidance"
                : "Generate My Health Guidance"}
          </button>
          {status === "loading" && (
            <p role="status" className="text-sm text-muted-foreground">
              Reviewing your assessment safely...
            </p>
          )}
        </div>

        {status === "error" && (
          <p role="alert" className="mt-5 rounded-md border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm leading-relaxed text-foreground">
            {error}
          </p>
        )}

        {guidance && (
          <div className="mt-8 space-y-6">
            {guidance.is_emergency && (
              <section
                aria-labelledby="generated-emergency-heading"
                className="rounded-md border-l-4 border-destructive bg-destructive/10 p-5 sm:p-6"
              >
                <h2 id="generated-emergency-heading" className="flex items-center gap-2.5 text-xl text-destructive">
                  <Siren className="h-5 w-5" aria-hidden="true" />
                  Seek urgent medical help now
                </h2>
                <p className="mt-3 leading-relaxed text-foreground">{guidance.urgent_action}</p>
                <GuidanceList items={guidance.emergency_warning_signs} />
              </section>
            )}

            <div className="grid gap-5 lg:grid-cols-2">
              <GuidanceCard title="Understanding your reported concern">
                <p>{guidance.understanding}</p>
              </GuidanceCard>
              <GuidanceCard title="General information">
                <p>{guidance.general_information}</p>
              </GuidanceCard>
              <GuidanceCard title="Practical precautions">
                <GuidanceList items={guidance.practical_precautions} />
              </GuidanceCard>
              <GuidanceCard title="Things to avoid">
                <GuidanceList items={guidance.things_to_avoid} />
              </GuidanceCard>
              <GuidanceCard title="Warning signs">
                <GuidanceList items={guidance.warning_signs} />
              </GuidanceCard>
              {!guidance.is_emergency && (
                <GuidanceCard title="Emergency warning signs">
                  <GuidanceList items={guidance.emergency_warning_signs} />
                </GuidanceCard>
              )}
              <GuidanceCard title="When to consult a healthcare professional">
                <GuidanceList items={guidance.when_to_consult} />
              </GuidanceCard>
              <GuidanceCard title="Questions to discuss with a doctor">
                <GuidanceList items={guidance.doctor_questions} />
              </GuidanceCard>
            </div>

            <p className="flex gap-3 text-sm leading-relaxed text-muted-foreground">
              <Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              {guidance.educational_notice}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

function GuidanceCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-md border border-border bg-card p-5 sm:p-6">
      <h2 className="text-xl tracking-tight text-foreground">{title}</h2>
      <div className="mt-3 leading-relaxed text-foreground/85">{children}</div>
    </section>
  );
}

function GuidanceList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-2.5">
      {items.map((item) => (
        <li key={item} className="flex gap-3">
          <span className="mt-[0.6rem] h-1.5 w-1.5 shrink-0 rounded-full bg-primary" aria-hidden="true" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function GuideBrowser({
  filters,
  setFilters,
}: {
  filters: GuideFilters;
  setFilters: (update: (f: GuideFilters) => GuideFilters) => void;
}) {
  const results = useMemo(() => filterArticles(GUIDE_ARTICLES, filters), [filters]);
  const queryMatches = useMemo(
    () => filterArticles(GUIDE_ARTICLES, { ...filters, category: "all" }),
    [filters],
  );
  const countFor = (id: GuideCategoryId) => queryMatches.filter((a) => a.category === id).length;
  const isFiltered = filters.query.trim() !== "" || filters.category !== "all";

  const setCategory = (category: GuideFilters["category"]) =>
    setFilters((f) => ({ ...f, category }));
  const clear = () => setFilters(() => DEFAULT_GUIDE_FILTERS);

  const selectFromCard = (id: GuideCategoryId) => {
    setFilters((f) => ({ ...f, category: f.category === id ? "all" : id }));
    document.getElementById(TOPICS_ID)?.scrollIntoView({ block: "start" });
  };

  const groups = GUIDE_CATEGORIES.map((category) => ({
    category,
    articles: results.filter((a) => a.category === category.id),
  })).filter((g) => g.articles.length > 0);

  return (
    <>
      <section aria-labelledby="guide-heading" className="shell pt-8 sm:pt-12">
        <div className="grid gap-8 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-7">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-primary">Health Guide</p>
            <h1
              id="guide-heading"
              className="mt-5 text-[clamp(2.4rem,5vw,4.25rem)] font-light leading-[1.02] tracking-[-0.025em] text-foreground"
            >
              Simple Guidance for <em className="text-primary">Everyday Health</em>
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-muted-foreground">
              Clear, general information on common conditions, healthy habits, first aid and when
              to see a doctor — written in plain language.
            </p>
          </div>

          <aside
            aria-label="Emergency notice"
            className="flex gap-3 border-l-2 border-destructive bg-destructive/5 px-5 py-4 lg:col-span-5"
          >
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" aria-hidden="true" />
            <p className="text-sm leading-relaxed text-foreground">
              <strong className="font-semibold">Emergency?</strong> Chest pain, difficulty
              breathing, sudden weakness, heavy bleeding or loss of consciousness need help now.
              Contact your local emergency services immediately.{" "}
              <a
                href="#topic-emergency-warning-signs"
                className="font-medium text-destructive underline underline-offset-2"
              >
                See emergency warning signs
              </a>
            </p>
          </aside>
        </div>
      </section>

      <section aria-labelledby="categories-heading" className="shell mt-12 lg:mt-16">
        <h2 id="categories-heading" className="sr-only">
          Health guide categories
        </h2>
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
          {GUIDE_CATEGORIES.map((category) => (
            <li key={category.id}>
              <GuideCategoryCard
                category={category}
                topicCount={GUIDE_ARTICLES.filter((a) => a.category === category.id).length}
                selected={filters.category === category.id}
                onSelect={() => selectFromCard(category.id)}
              />
            </li>
          ))}
        </ul>
      </section>

      <section
        id={TOPICS_ID}
        aria-labelledby="topics-heading"
        className="shell scroll-mt-24 pb-24 pt-14 lg:pt-20"
      >
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h2 id="topics-heading" className="text-[clamp(1.8rem,3vw,2.5rem)] font-normal tracking-[-0.02em]">
            Health topics
          </h2>
          <p aria-live="polite" className="text-sm text-muted-foreground">
            Showing {results.length} of {GUIDE_ARTICLES.length} topics
          </p>
        </div>

        <div className="mt-6 rounded-md border border-border bg-card p-4 sm:p-5">
          <div className="relative">
            <label htmlFor="guide-search" className="sr-only">
              Search health topics
            </label>
            <Search
              className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <input
              id="guide-search"
              type="search"
              placeholder="Search topics, e.g. fever, sleep, burns"
              value={filters.query}
              onChange={(e) => {
                const query = e.target.value;
                setFilters((f) => ({ ...f, query }));
              }}
              className="h-12 w-full rounded-full border border-input bg-background pl-10 pr-4 text-[0.95rem] text-foreground placeholder:text-muted-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            />
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2" role="group" aria-label="Filter by category">
            <FilterChip
              label="All topics"
              count={queryMatches.length}
              selected={filters.category === "all"}
              onClick={() => setCategory("all")}
            />
            {GUIDE_CATEGORIES.map((c) => (
              <FilterChip
                key={c.id}
                label={c.title}
                count={countFor(c.id)}
                selected={filters.category === c.id}
                onClick={() => setCategory(c.id)}
              />
            ))}
            {isFiltered && (
              <button
                type="button"
                onClick={clear}
                className="ml-auto inline-flex h-9 items-center gap-1.5 rounded-full px-3 text-sm font-medium text-primary transition-colors hover:bg-secondary"
              >
                <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
                Clear
              </button>
            )}
          </div>
        </div>

        {groups.length === 0 ? (
          <div className="mt-10 flex flex-col items-center rounded-lg border border-dashed border-border px-6 py-14 text-center">
            <SearchX className="h-8 w-8 text-muted-foreground" aria-hidden="true" />
            <p className="mt-4 font-display text-2xl text-foreground">No topics found</p>
            <p className="mt-2 max-w-md text-muted-foreground">
              Nothing matches
              {filters.query.trim() ? <> “{filters.query.trim()}”</> : null}
              {filters.category !== "all" ? " in this category" : null}. Try another word or show
              all topics.
            </p>
            <button
              type="button"
              onClick={clear}
              className="mt-6 inline-flex h-11 items-center rounded-full bg-primary px-6 text-sm font-medium text-primary-foreground transition-colors hover:bg-forest-deep"
            >
              Show all topics
            </button>
          </div>
        ) : (
          <div className="mt-10 space-y-14">
            {groups.map(({ category, articles }) => (
              <section key={category.id} aria-labelledby={`group-${category.id}`}>
                <h3
                  id={`group-${category.id}`}
                  className="flex items-baseline gap-3 border-b border-border pb-3 text-2xl tracking-[-0.01em] text-foreground"
                >
                  <span className="font-display text-lg italic text-sand-deep">{category.letter}.</span>
                  {category.title}
                </h3>
                <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">
                  {articles.map((article) => (
                    <li key={article.id}>
                      <GuideArticleCard article={article} />
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        )}
      </section>
    </>
  );
}

function FilterChip({
  label,
  count,
  selected,
  onClick,
}: {
  label: string;
  count: number;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`inline-flex h-10 items-center gap-2 rounded-full border px-4 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring ${
        selected
          ? "border-primary bg-primary font-medium text-primary-foreground"
          : "border-border bg-background text-foreground hover:border-primary/40"
      }`}
    >
      {label}
      <span
        className={`rounded-full px-1.5 text-xs tabular-nums ${
          selected ? "bg-primary-foreground/20" : "bg-muted text-muted-foreground"
        }`}
      >
        {count}
      </span>
    </button>
  );
}
