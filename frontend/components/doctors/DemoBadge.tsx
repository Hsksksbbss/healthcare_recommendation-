type DemoBadgeProps = {
  className?: string;
  children?: string;
};

/** Marks placeholder content so it is never mistaken for real data. */
export function DemoBadge({ className = "", children = "Demo" }: DemoBadgeProps) {
  return (
    <span
      className={`inline-flex shrink-0 items-center rounded-full border border-sand-deep/60 bg-sand px-2.5 py-0.5 text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-foreground ${className}`}
    >
      {children}
    </span>
  );
}
