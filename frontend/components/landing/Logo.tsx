type LogoProps = {
  className?: string;
  /** Use on dark backgrounds */
  inverted?: boolean;
};

/** HealthCare AI mark: a medical cross formed from four leaf petals. */
export function LogoMark({ className, inverted = false }: LogoProps) {
  const vertical = inverted ? "var(--forest-foreground)" : "var(--primary)";
  const horizontal = inverted ? "var(--sage-deep)" : "var(--teal)";
  const petal = "M16 2.5c3.1 3.6 3.6 8.6 0 13.5-3.6-4.9-3.1-9.9 0-13.5Z";
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true" className={className}>
      <path d={petal} fill={vertical} />
      <path d={petal} fill={vertical} transform="rotate(180 16 16)" />
      <path d={petal} fill={horizontal} transform="rotate(90 16 16)" />
      <path d={petal} fill={horizontal} transform="rotate(270 16 16)" />
    </svg>
  );
}

export function Logo({ className = "", inverted = false }: LogoProps) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <LogoMark className="h-7 w-7 shrink-0" inverted={inverted} />
      <span
        className={`font-display text-[1.35rem] leading-none tracking-tight ${
          inverted ? "text-forest-foreground" : "text-foreground"
        }`}
      >
        HealthCare<span className={inverted ? "text-forest-muted" : "text-primary"}> AI</span>
      </span>
    </span>
  );
}
