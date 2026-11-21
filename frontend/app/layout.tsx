import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import { HealthAssessmentProvider } from "../components/health/HealthAssessmentContext";
import "./globals.css";

const inter = Inter({
  variable: "--font-body",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-heading",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "HealthCare AI | Your Personal Health Assistant",
  description: "A personal AI health assistant for organizing questions, finding care resources, and building healthier routines.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${outfit.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <HealthAssessmentProvider>{children}</HealthAssessmentProvider>
      </body>
    </html>
  );
}
