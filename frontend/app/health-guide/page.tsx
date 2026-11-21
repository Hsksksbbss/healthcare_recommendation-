import type { Metadata } from "next";

import { HealthGuidePage } from "@/components/health-guide/HealthGuidePage";

export const metadata: Metadata = {
  title: "Health Guide — HealthCare AI",
  description:
    "Plain-language guidance on common conditions, healthy habits, first aid and when to see a doctor. General information, not a diagnosis.",
};

export default function Page() {
  return <HealthGuidePage />;
}
