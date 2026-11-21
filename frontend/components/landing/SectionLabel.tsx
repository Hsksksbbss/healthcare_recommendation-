import type { ReactNode } from "react";

type SectionLabelProps = {
  index: string;
  children: ReactNode;
  tone?: "light" | "dark";
};

/** Small editorial eyebrow used at the top of each section, e.g. "02 — How it works". */
export function SectionLabel({ index, children, tone = "light" }: SectionLabelProps) {
  return (
    <p
      className={`flex items-center gap-3 text-xs font-medium uppercase tracking-[0.18em] ${
        tone === "dark" ? "text-forest-muted" : "text-muted-foreground"
      }`}
    >
      <span className={tone === "dark" ? "text-forest-foreground" : "text-primary"}>{index}</span>
      <span aria-hidden="true" className="h-px w-8 bg-current opacity-50" />
      {children}
    </p>
  );
}
