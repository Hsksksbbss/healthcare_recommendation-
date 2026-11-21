import type { Metadata } from "next";

import { HealthOptionsPage } from "@/components/health-options/HealthOptionsPage";

export const metadata: Metadata = {
  title: "Choose Your Health Support — HealthCare AI",
  description:
    "Pick the support you want to explore next: find nearby doctors, a personalized diet plan or a general health guide.",
};

export default function Page() {
  return <HealthOptionsPage />;
}
