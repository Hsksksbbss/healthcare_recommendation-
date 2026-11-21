import type { ReactNode } from "react";

import { SectionLabel } from "./SectionLabel";

const specialties = ["General practice", "Cardiology", "Dermatology", "Pediatrics", "Orthopedics"];
const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const meals = ["Breakfast", "Lunch", "Snacks", "Dinner"];

function FeatureHeading({ index, title }: { index: string; title: ReactNode }) {
  return (
    <div className="flex items-baseline gap-4">
      <span className="font-display text-sm italic text-teal">{index}</span>
      <h3 className="text-[clamp(2rem,3.6vw,3rem)] font-light leading-[1.05] tracking-[-0.02em] text-foreground">
        {title}
      </h3>
    </div>
  );
}

function Point({ children }: { children: ReactNode }) {
  return (
    <li className="flex gap-4 border-t border-border py-4 text-foreground/85">
      <span aria-hidden="true" className="mt-2.5 h-1.5 w-1.5 shrink-0 rotate-45 bg-primary" />
      {children}
    </li>
  );
}

/** Abstract map composition — illustrative only, not real locations. */
function MapIllustration() {
  return (
    <svg
      viewBox="0 0 480 400"
      role="img"
      aria-label="Illustration of a neighbourhood map with healthcare locations marked"
      className="h-full w-full"
    >
      <rect width="480" height="400" fill="var(--sage)" />
      <g fill="var(--background)" opacity="0.55">
        <rect x="24" y="24" width="120" height="90" rx="4" />
        <rect x="168" y="24" width="150" height="90" rx="4" />
        <rect x="342" y="24" width="114" height="150" rx="4" />
        <rect x="24" y="138" width="80" height="120" rx="4" />
        <rect x="128" y="138" width="190" height="36" rx="4" />
        <rect x="128" y="198" width="100" height="178" rx="4" />
        <rect x="252" y="198" width="204" height="80" rx="4" />
        <rect x="24" y="282" width="80" height="94" rx="4" />
        <rect x="252" y="302" width="204" height="74" rx="4" />
      </g>
      <path
        d="M0 330 C120 300 200 360 300 290 S440 220 480 240"
        fill="none"
        stroke="var(--teal-soft)"
        strokeWidth="14"
      />
      <path
        d="M0 330 C120 300 200 360 300 290 S440 220 480 240"
        fill="none"
        stroke="var(--teal)"
        strokeWidth="1.5"
        strokeDasharray="4 6"
        opacity="0.6"
      />
      <circle cx="240" cy="186" r="10" fill="var(--teal)" className="animate-pulse-ring" />
      <circle
        cx="240"
        cy="186"
        r="7"
        fill="var(--teal)"
        stroke="var(--background)"
        strokeWidth="3"
      />
      {[
        [84, 70],
        [388, 108],
        [176, 250],
        [356, 238],
        [62, 318],
      ].map(([x, y]) => (
        <g key={`${x}-${y}`} transform={`translate(${x} ${y})`}>
          <path d="M0 0c-9-11-14-17-14-24a14 14 0 0 1 28 0c0 7-5 13-14 24Z" fill="var(--primary)" />
          <path d="M-1.5 -29h3v4h4v3h-4v4h-3v-4h-4v-3h4z" fill="var(--primary-foreground)" />
        </g>
      ))}
    </svg>
  );
}

export function Features() {
  return (
    <section id="features" aria-labelledby="features-heading" className="bg-sage/25 py-16 lg:py-24">
      <div className="shell">
        <div className="grid gap-8 lg:grid-cols-12 lg:items-end">
          <div className="reveal lg:col-span-7">
            <SectionLabel index="03">Features</SectionLabel>
            <h2
              id="features-heading"
              className="mt-8 text-[clamp(2.4rem,4.6vw,4rem)] font-light leading-[1.02] tracking-[-0.025em]"
            >
              Three ways to take an <em className="text-primary">informed next step.</em>
            </h2>
          </div>
          <p className="reveal max-w-md leading-relaxed text-muted-foreground lg:col-span-4 lg:col-start-9">
            Each service starts from the concern you describe, so the doctors, meals and precautions
            you see stay relevant to you.
          </p>
        </div>

        {/* 1 — Doctors: text left, map right */}
        <article
          id="feature-doctors"
          className="mt-14 grid scroll-mt-28 gap-10 lg:mt-20 lg:grid-cols-12 lg:gap-10"
        >
          <div className="reveal flex flex-col justify-center lg:col-span-5">
            <FeatureHeading index="i." title="Find Nearby Doctors" />
            <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
              Move from “who should I see?” to a short list of options close to home.
            </p>
            <ul className="mt-8 border-b border-border">
              <Point>Discover healthcare professionals and clinics near your location.</Point>
              <Point>Explore the medical specialties most relevant to your concern.</Point>
              <Point>Access location and contact information in one view.</Point>
            </ul>
          </div>
          <div className="reveal relative lg:col-span-6 lg:col-start-7">
            <div className="overflow-hidden rounded-md">
              <MapIllustration />
            </div>
            <ul className="mt-5 flex flex-wrap gap-2" aria-label="Example specialties">
              {specialties.map((s) => (
                <li
                  key={s}
                  className="rounded-full border border-border px-3.5 py-1.5 text-sm text-foreground/75 transition-colors hover:border-primary hover:text-primary"
                >
                  {s}
                </li>
              ))}
            </ul>
          </div>
        </article>

        {/* 2 — Diet: image left, weekly structure right */}
        <article
          id="feature-diet"
          className="mt-16 grid scroll-mt-28 gap-10 lg:mt-24 lg:grid-cols-12 lg:gap-10"
        >
          <div className="reveal order-2 lg:order-1 lg:col-span-5">
            <div className="overflow-hidden rounded-md">
              <img
                src="/images/landing/nutrition.jpg"
                alt="A balanced bowl of grains, lentils, leafy greens, roasted vegetables and avocado on a linen tablecloth"
                width={1145}
                height={1374}
                loading="lazy"
                className="aspect-[5/6] w-full object-cover transition-transform duration-[1.2s] ease-out hover:scale-[1.03]"
              />
            </div>
          </div>
          <div className="reveal order-1 flex flex-col justify-center lg:order-2 lg:col-span-6 lg:col-start-7">
            <FeatureHeading index="ii." title={
                <>
                  Personalized <span className="whitespace-nowrap">7-Day</span> Diet Plan
                </>
              } />
            <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
              A practical meal-planning guide for the week ahead, shaped by the health information
              you share.
            </p>
            <ul className="mt-8 border-b border-border">
              <Point>Receive a meal-planning guide based on relevant health information.</Point>
              <Point>Explore foods to include, and foods to limit or avoid.</Point>
              <Point>View breakfast, lunch, snacks and dinner for each day.</Point>
            </ul>

            <div
              className="mt-10 rounded-md bg-sand p-5 sm:p-6"
              aria-label="How a weekly plan is organised"
            >
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                How each week is organised
              </p>
              <div className="mt-4 grid grid-cols-7 gap-1.5">
                {days.map((d) => (
                  <span
                    key={d}
                    className="rounded-sm bg-background/70 py-2 text-center text-xs font-medium text-foreground/80 sm:text-sm"
                  >
                    {d}
                  </span>
                ))}
              </div>
              <div className="mt-4 grid grid-cols-2 gap-x-6 gap-y-2 sm:grid-cols-4">
                {meals.map((m) => (
                  <span key={m} className="font-display text-lg text-foreground">
                    {m}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </article>

        {/* 3 — Precautions: full-width typographic panel */}
        <article
          id="feature-precautions"
          className="reveal mt-16 scroll-mt-28 rounded-md bg-secondary px-6 py-12 sm:px-10 lg:mt-24 lg:px-16 lg:py-16"
        >
          <div className="grid gap-10 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <FeatureHeading index="iii." title="Health Precautions" />
              <p className="mt-6 max-w-md text-lg leading-relaxed text-secondary-foreground/80">
                Know what you can do yourself — and when it is time to involve a professional.
              </p>
            </div>
            <div className="grid gap-10 sm:grid-cols-3 lg:col-span-7">
              {[
                {
                  title: "Self-care guidance",
                  body: "Relevant, general self-care steps that may help you stay comfortable while you monitor how you feel.",
                },
                {
                  title: "Warning signs",
                  body: "Clear explanations of symptoms and changes that deserve closer attention.",
                },
                {
                  title: "When to seek care",
                  body: "Straightforward guidance on when professional medical attention is necessary — and how urgently.",
                },
              ].map((item, i) => (
                <div key={item.title} className="border-t-2 border-primary pt-5">
                  <span className="text-xs tracking-[0.18em] text-secondary-foreground/60">
                    0{i + 1}
                  </span>
                  <h4 className="mt-3 font-display text-xl text-secondary-foreground">
                    {item.title}
                  </h4>
                  <p className="mt-3 text-sm leading-relaxed text-secondary-foreground/80">
                    {item.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </article>
      </div>
    </section>
  );
}
