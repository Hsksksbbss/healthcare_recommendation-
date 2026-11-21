"use client";

import { useId, useState } from "react";
import { Plus } from "lucide-react";

import { SectionLabel } from "./SectionLabel";

const faqs = [
  {
    q: "What is HealthCare AI?",
    a: "HealthCare AI is an AI-powered personal health assistant. It helps you understand a health concern in plain language, discover nearby healthcare professionals, and receive a personalized seven-day diet plan and relevant precautions — all in one place.",
  },
  {
    q: "How does the health assessment work?",
    a: "You start by creating a health profile and describing your concern in your own words. HealthCare AI then organises general information related to what you have shared into clear, structured guidance, along with suggested next steps. It is an informational tool, not a clinical assessment or diagnosis.",
  },
  {
    q: "How are diet recommendations generated?",
    a: "Diet plans are generated using the health information and preferences you choose to share, combined with general nutrition principles. Each plan suggests foods to include and foods to limit or avoid, across breakfast, lunch, snacks and dinner. If you have a medical condition, allergy or specific dietary needs, review any plan with a doctor or registered dietitian.",
  },
  {
    q: "Can I find doctors near me?",
    a: "Yes. With your permission to use your location, HealthCare AI is designed to show healthcare professionals and clinics nearby, along with relevant specialties and their location and contact information.",
  },
  {
    q: "Does HealthCare AI replace a doctor?",
    a: "No. HealthCare AI provides general guidance only and does not diagnose conditions or prescribe treatment. It is designed to help you take a more informed next step — which, in many cases, is speaking with a qualified healthcare professional. For serious or sudden symptoms, seek medical attention immediately.",
  },
  {
    q: "Is my health information secure?",
    a: "Protecting your health information is a core design priority. You decide what to share, and full details of how information is collected, stored and protected will be set out in our Privacy Policy.",
  },
];

export function FAQ() {
  const [open, setOpen] = useState<number | null>(0);
  const baseId = useId();

  return (
    <section id="faq" aria-labelledby="faq-heading" className="bg-background py-16 lg:py-24">
      <div className="shell grid gap-14 lg:grid-cols-12 lg:gap-10">
        <div className="reveal lg:col-span-4">
          <SectionLabel index="06">FAQ</SectionLabel>
          <h2
            id="faq-heading"
            className="mt-8 text-[clamp(2.4rem,4.2vw,3.6rem)] font-light leading-[1.04] tracking-[-0.025em]"
          >
            Questions, <em className="text-primary">answered.</em>
          </h2>
          <p className="mt-6 max-w-sm leading-relaxed text-muted-foreground">
            What to expect from HealthCare AI, how it works and where its limits are.
          </p>
        </div>

        <div className="lg:col-span-7 lg:col-start-6">
          <ul className="border-b border-border">
            {faqs.map((item, i) => {
              const isOpen = open === i;
              const buttonId = `${baseId}-q-${i}`;
              const panelId = `${baseId}-a-${i}`;
              return (
                <li key={item.q} className="border-t border-border">
                  <h3 className="font-sans">
                    <button
                      id={buttonId}
                      type="button"
                      aria-expanded={isOpen}
                      aria-controls={panelId}
                      onClick={() => setOpen(isOpen ? null : i)}
                      className="group flex w-full items-center justify-between gap-6 py-6 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                    >
                      <span
                        className={`font-display text-xl leading-snug tracking-tight transition-colors sm:text-2xl ${
                          isOpen ? "text-primary" : "text-foreground group-hover:text-primary"
                        }`}
                      >
                        {item.q}
                      </span>
                      <span
                        aria-hidden="true"
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border transition-all duration-300 ${
                          isOpen
                            ? "rotate-45 border-primary bg-primary text-primary-foreground"
                            : "border-border text-foreground group-hover:border-primary"
                        }`}
                      >
                        <Plus className="h-4 w-4" />
                      </span>
                    </button>
                  </h3>
                  <div
                    id={panelId}
                    role="region"
                    aria-labelledby={buttonId}
                    className={`grid transition-[grid-template-rows] duration-300 ease-out ${
                      isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                    }`}
                  >
                    <div className="overflow-hidden" inert={!isOpen}>
                      <p className="max-w-2xl pb-7 pr-12 leading-relaxed text-muted-foreground">
                        {item.a}
                      </p>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}
