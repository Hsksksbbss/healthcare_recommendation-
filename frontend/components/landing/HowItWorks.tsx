import { SectionLabel } from "./SectionLabel";

const steps = [
  {
    title: "Create Your Health Profile",
    body: "Share the basics that shape useful guidance — such as age, lifestyle, dietary preferences and any existing conditions you choose to include.",
  },
  {
    title: "Describe Your Health Concern",
    body: "Explain what you are experiencing in your own words. How long it has lasted, how it feels and anything that makes it better or worse.",
  },
  {
    title: "Get AI-Powered Guidance",
    body: "Receive a clear, structured overview of general information related to your concern, written to be read and understood without medical training.",
  },
  {
    title: "Explore Your Next Steps",
    body: "See relevant specialists near you, a seven-day meal plan and practical precautions — including the signs that mean you should seek care promptly.",
  },
];

export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      aria-labelledby="how-heading"
      className="bg-forest-deep py-16 text-forest-foreground lg:py-24"
    >
      <div className="shell grid gap-12 lg:grid-cols-12 lg:gap-10">
        <div className="lg:col-span-5">
          <div className="lg:sticky lg:top-32">
            <SectionLabel index="02" tone="dark">
              How it works
            </SectionLabel>
            <h2
              id="how-heading"
              className="mt-8 text-[clamp(2.4rem,4.6vw,4rem)] font-light leading-[1.02] tracking-[-0.025em]"
            >
              Four steps from a question to a <em className="text-sage">clearer path.</em>
            </h2>
            <p className="mt-8 max-w-md leading-relaxed text-forest-muted">
              No medical vocabulary required. Each step builds on the last, so the guidance you
              receive reflects the information you choose to share.
            </p>
          </div>
        </div>

        <ol className="relative lg:col-span-6 lg:col-start-7">
          <span
            aria-hidden="true"
            className="absolute bottom-10 left-[1.15rem] top-10 w-px bg-forest-line sm:left-[1.65rem]"
          />
          {steps.map((step, i) => (
            <li
              key={step.title}
              className="reveal group relative flex gap-6 pb-10 last:pb-0 sm:gap-10"
            >
              <span className="relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-forest-line bg-forest-deep font-display text-sm text-sage transition-colors duration-300 group-hover:border-sage group-hover:bg-sage group-hover:text-forest-deep sm:h-[3.3rem] sm:w-[3.3rem] sm:text-base">
                0{i + 1}
              </span>
              <div className="pt-1 sm:pt-2.5">
                <h3 className="text-2xl font-normal tracking-tight sm:text-[1.75rem]">
                  {step.title}
                </h3>
                <p className="mt-3 max-w-lg leading-relaxed text-forest-muted">{step.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
