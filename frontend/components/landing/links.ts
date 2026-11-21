/**
 * Navigation targets for the HealthCare AI landing page.
 *
 * Section anchors scroll within the landing page.
 * PLACEHOLDER_LINKS includes routes for screens that are already available and
 * placeholders for legal pages that are not implemented yet.
 */
export const SECTION_LINKS = [
  { label: "Home", href: "#top" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Features", href: "#features" },
  { label: "About", href: "#about" },
  { label: "FAQ", href: "#faq" },
] as const;

export const FEATURE_LINKS = [
  { label: "Find Nearby Doctors", href: "/doctors" },
  { label: "7-Day Diet Plan", href: "#feature-diet" },
  { label: "Health Precautions", href: "#feature-precautions" },
] as const;

export const PLACEHOLDER_LINKS = {
  signIn: "/login",
  getStarted: "/signup",
  dashboard: "/dashboard",
  healthAssessment: "/dashboard",
  /** TODO: replace with the privacy policy page */
  privacy: "#privacy-policy",
  /** TODO: replace with the terms and conditions page */
  terms: "#terms",
} as const;

/** Navigation shared by signed-in app pages. */
export const APP_NAV_LINKS = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Health Assessment", href: "/dashboard#assessment" },
  { label: "Find Doctors", href: "/doctors" },
  { label: "Profile", href: "/profile" },
] as const;
