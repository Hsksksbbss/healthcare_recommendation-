import { SectionLabel } from "./SectionLabel";

export function Introduction() {
  return (
    <section aria-labelledby="intro-heading" className="border-t border-border bg-background py-16 lg:py-24">
      <div className="shell">
        <div className="reveal">
          <SectionLabel index="01">Introduction</SectionLabel>
        </div>

        <h2
          id="intro-heading"
          className="reveal mt-10 max-w-5xl text-[clamp(2rem,4.4vw,3.75rem)] font-light leading-[1.08] tracking-[-0.02em] text-foreground"
        >
          Health questions rarely arrive at a convenient moment. HealthCare AI helps you make sense
          of them — <em className="text-primary">calmly, clearly,</em> and with a better idea of
          what to do next.
        </h2>

        <div className="mt-12 grid gap-10 lg:mt-16 lg:grid-cols-12 lg:gap-10">
          <div className="reveal lg:col-span-6 lg:col-start-1">
            <div className="overflow-hidden rounded-md">
              <img
                src="/images/landing/consultation.jpg"
                alt="A doctor in green scrubs listening attentively to an older patient in a bright clinic"
                width={1400}
                height={933}
                loading="lazy"
                className="aspect-[4/3] w-full object-cover transition-transform duration-[1.2s] ease-out hover:scale-[1.03]"
              />
            </div>
          </div>

          <div className="reveal flex flex-col justify-end gap-8 lg:col-span-5 lg:col-start-8">
            <p className="text-lg leading-relaxed text-foreground/85">
              When something feels off, the first steps are often the hardest: knowing what a
              symptom might relate to, which kind of specialist to see, and how everyday choices
              like food and rest can help in the meantime.
            </p>
            <p className="leading-relaxed text-muted-foreground">
              HealthCare AI brings those steps together. Describe what you are experiencing, and
              receive general guidance in plain language — alongside nearby healthcare
              professionals, a practical meal plan and precautions worth knowing. It is designed to
              help you arrive at a conversation with a professional better prepared, not to replace
              one.
            </p>
            <dl className="grid grid-cols-2 gap-6 border-t border-border pt-8">
              <div>
                <dt className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                  Built for
                </dt>
                <dd className="mt-2 font-display text-xl text-foreground">
                  Everyday health questions
                </dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                  Designed to
                </dt>
                <dd className="mt-2 font-display text-xl text-foreground">
                  Support, not replace, care
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </section>
  );
}
