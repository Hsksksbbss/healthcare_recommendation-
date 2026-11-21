import type { Metadata } from "next";

import { DoctorsPage } from "@/components/doctors/DoctorsPage";

export const metadata: Metadata = {
  title: "Find Doctors Near You — HealthCare AI",
  description:
    "Search nearby doctors and clinics by specialty, distance and rating, with AI guidance on which specialist to consult.",
};

export default function Page() {
  // Pass recommendedSpecialty once the health assessment backend provides one.
  return <DoctorsPage />;
}
