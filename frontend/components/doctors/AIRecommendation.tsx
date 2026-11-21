import { Sparkles } from "lucide-react";

type AIRecommendationProps = {
  /** Specialty suggested from the user's assessment, once the backend provides it */
  recommendedSpecialty: string | null;
  onApplySpecialty: (specialty: string) => void;
};

export function AIRecommendation({ recommendedSpecialty, onApplySpecialty }: AIRecommendationProps) {
  return (
    <section
      aria-labelledby="ai-heading"
      className="rounded-md border border-border bg-forest-deep p-6 text-forest-foreground"
    >
      <div className="flex items-center justify-between gap-3">
        <p className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-forest-muted">
          <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
          AI guidance
        </p>
      </div>
      <h2 id="ai-heading" className="mt-4 text-2xl tracking-tight">
        AI Specialty Recommendation
      </h2>

      <div className="mt-5 rounded-md border border-forest-line px-4 py-4">
        <p className="text-xs uppercase tracking-[0.14em] text-forest-muted">
          {recommendedSpecialty ? "Suggested specialty" : "No recommendation yet"}
        </p>
        <p className="mt-1 font-display text-2xl">
          {recommendedSpecialty ?? "Complete an assessment to get guidance"}
        </p>
        {recommendedSpecialty && (
          <button
            type="button"
            onClick={() => onApplySpecialty(recommendedSpecialty)}
            className="mt-4 inline-flex h-10 items-center rounded-full bg-forest-foreground px-5 text-sm font-medium text-forest-deep transition-colors hover:bg-sage"
          >
            Show {recommendedSpecialty}s
          </button>
        )}
      </div>

      <p className="mt-5 text-sm leading-relaxed text-forest-muted">
        Gemini can analyze your health assessment and suggest an appropriate medical specialty to
        use for the place search.
      </p>
      <p className="mt-3 text-sm leading-relaxed text-forest-foreground">
        This is general guidance, not a medical diagnosis. A qualified doctor should assess your
        symptoms.
      </p>
    </section>
  );
}
