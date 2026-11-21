import Link from "next/link";

type HealthOptionNavProps = {
  current: "diet" | "doctors" | "guide";
};

const OPTIONS = [
  { id: "diet", label: "Diet Plan", href: "/diet" },
  { id: "doctors", label: "Find Doctors", href: "/doctors" },
  { id: "guide", label: "Health Guidance", href: "/health-guide" },
] as const;

export function HealthOptionNav({ current }: HealthOptionNavProps) {
  return (
    <nav
      aria-label="Health options"
      className="shell border-b border-border bg-background py-4"
    >
      <div className="grid gap-2 sm:grid-cols-3">
        {OPTIONS.map((option) => (
          <Link
            key={option.id}
            href={option.href}
            aria-current={current === option.id ? "page" : undefined}
            className={`rounded-full px-4 py-3 text-center text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring ${
              current === option.id
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground hover:bg-primary/15"
            }`}
          >
            {option.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
