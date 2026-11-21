import { FAQ } from "./FAQ";
import { Features } from "./Features";
import { FinalCTA } from "./FinalCTA";
import { Footer } from "./Footer";
import { HealthSafety } from "./HealthSafety";
import { Hero } from "./Hero";
import { HowItWorks } from "./HowItWorks";
import { Introduction } from "./Introduction";
import { Navbar } from "./Navbar";
import { WhyChooseUs } from "./WhyChooseUs";

/** Full HealthCare AI landing page. Render this from the app's home route. */
export function LandingPage() {
  return (
    <div id="top" className="min-h-screen bg-background text-foreground">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-full focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground"
      >
        Skip to content
      </a>
      <Navbar />
      <main id="main">
        <Hero />
        <Introduction />
        <HowItWorks />
        <Features />
        <WhyChooseUs />
        <HealthSafety />
        <FAQ />
        <FinalCTA />
      </main>
      <Footer />
    </div>
  );
}
