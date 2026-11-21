import { SectionLabel } from "./SectionLabel";

const reasons = [
  {
    title: "Personalized health information",
    body: "Guidance reflects the profile and concern you share, rather than a one-size-fits-all article.",
  },
  {
    title: "Easy-to-understand guidance",
    body: "Plain language, clear structure and no assumed medical knowledge.",
  },
  {
    title: "Convenient doctor discovery",
    body: "Relevant specialists and clinics near you, without switching between search tools.",
  },
  {
    title: "A simple, accessible experience",
    body: "Calm, readable screens designed for every age and comfort level with technology.",
  },
  {
    title: "Health information in one place",
    body: "Your concern, guidance, meal plan and nearby care, gathered together.",
  },
];

export function WhyChooseUs() {
  return (
    <section
      id="about"
      aria-labelledby="why-heading"
      className="border-t border-border bg-sand/45 py-16 lg:py-24"
    >
      <div className="shell grid gap-16 lg:grid-cols-12 lg:gap-10">
        <div className="reveal lg:col-span-4">
          <SectionLabel index="04">Why HealthCare AI</SectionLabel>
          <h2
            id="why-heading"
            className="mt-8 text-[clamp(2.4rem,4.2vw,3.6rem)] font-light leading-[1.04] tracking-[-0.025em]"
          >
            Built around clarity, <em className="text-primary">not complexity.</em>
          </h2>
          <p className="mt-8 leading-relaxed text-muted-foreground">
            Health information online is often scattered, alarming or difficult to apply. HealthCare
            AI is designed to feel like the opposite: organised, measured and personal.
          </p>
        </div>

        <ol className="lg:col-span-7 lg:col-start-6">
          {reasons.map((r, i) => (
            <li
              key={r.title}
              className="reveal group grid grid-cols-[3rem_1fr] gap-x-4 border-t border-border py-6 last:border-b sm:grid-cols-[3rem_1.25fr_1fr] sm:gap-x-8"
            >
              <span className="font-display text-sm italic text-teal">0{i + 1}</span>
              <h3 className="font-display text-2xl font-normal leading-tight tracking-tight text-foreground transition-colors duration-300 group-hover:text-primary sm:text-[1.7rem]">
                {r.title}
              </h3>
              <p className="col-start-2 mt-3 leading-relaxed text-muted-foreground sm:col-start-3 sm:mt-1">
                {r.body}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
