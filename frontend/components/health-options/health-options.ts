import { Apple, BookOpen, Stethoscope, type LucideIcon } from "lucide-react";

export type HealthOption = {
  id: "doctors" | "diet" | "guide";
  label: string;
  title: string;
  description: string;
  cta: string;
  href: string;
  /**
   * False while the destination page has not been built. The card then shows
   * "Coming soon" and its button is disabled. Flip to true once the page exists.
   */
  available: boolean;
  icon: LucideIcon;
};

export const HEALTH_OPTIONS: readonly HealthOption[] = [
  {
    id: "doctors",
    label: "Find Nearby Doctors",
    title: "Find Nearby Doctors",
    description: "Explore nearby doctors and healthcare facilities based on your medical needs.",
    cta: "Find Doctors",
    href: "/doctors",
    available: true,
    icon: Stethoscope,
  },
  {
    id: "diet",
    label: "Personalized Diet Plan",
    title: "Personalized Diet Plan",
    description:
      "Explore food recommendations and a balanced diet plan based on your health needs.",
    cta: "Explore Diet",
    href: "/diet",
    available: true,
    icon: Apple,
  },
  {
    id: "guide",
    label: "Health Guide",
    title: "Health Guide",
    description:
      "Learn about general health precautions, wellness guidance and helpful next steps.",
    cta: "View Health Guide",
    href: "/health-guide",
    available: true,
    icon: BookOpen,
  },
];
