"use client";

import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Fraunces } from "next/font/google";
import {
  useHealthSession,
  type DietPreferences,
  type DietRecommendation,
  type HealthAssessment,
} from "../../components/health/HealthAssessmentContext";
import { HealthOptionNav } from "../../components/health-options/HealthOptionNav";

const display = Fraunces({ subsets: ["latin"], display: "swap" });

/* ---------- Types ---------- */

type Meal = {
  id: string;
  name: string;
  slot: string;
  time: string;
  items: { food: string; portion: string }[];
  portion?: string;
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
  plate: string[]; // colours used for the illustrated plate
};

type DietRecommendationResponse = DietRecommendation;
type Preferences = DietPreferences;
type DietPreference = DietPreferences["diet"];
type FoodBudget = DietPreferences["budget"];
type NutritionEstimate = DietRecommendation["daily_meal_schedule"]["estimated_daily_nutrition"];
type GeneratedMeal = DietRecommendation["daily_meal_schedule"]["breakfast"];

const DIET_OPTIONS: Exclude<DietPreference, "">[] = ["Vegetarian", "Eggetarian", "Non-vegetarian", "Vegan"];
const BUDGET_OPTIONS: { value: FoodBudget; label: string; description: string }[] = [
  { value: "low", label: "Low", description: "Affordable, commonly available ingredients." },
  { value: "moderate", label: "Moderate", description: "Balanced variety with reasonable costs." },
  { value: "high", label: "High", description: "More flexibility in ingredients and variety." },
];
const ACTIVITY_OPTIONS = ["Mostly sitting", "Lightly active", "Moderately active", "Very active"];
const MEAL_COUNT_OPTIONS = ["3 meals", "4 meals", "5 meals", "6 meals"];

/* ---------- Styling ---------- */

const focusRing = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C58B61]";
const inputBase =
  "block w-full rounded-lg border border-[#173F35]/20 bg-white px-4 py-3 text-[15px] text-[#26332E] placeholder:text-[#26332E]/40 outline-none transition-colors duration-200 motion-reduce:transition-none hover:border-[#173F35]/50 focus:border-[#173F35] focus:ring-4 focus:ring-[#173F35]/10";

/* ---------- Small helpers ---------- */

type IconName = "plus" | "user" | "chevron" | "back" | "alert" | "signout" | "clock";

function Icon({ name, className = "h-5 w-5" }: { name: IconName; className?: string }) {
  const paths: Record<IconName, ReactNode> = {
    plus: <path d="M12 5v14M5 12h14" />,
    user: (<><circle cx="12" cy="8" r="3.5" /><path d="M5 20c.6-3.6 3.4-5.5 7-5.5s6.4 1.9 7 5.5" /></>),
    chevron: <path d="M6 9l6 6 6-6" />,
    back: <path d="M15 5l-7 7 7 7" />,
    alert: (<><path d="M12 4l9 16H3L12 4z" /><path d="M12 10v4M12 17.2v.1" /></>),
    signout: (<><path d="M14 4h4a2 2 0 012 2v12a2 2 0 01-2 2h-4" /><path d="M10 16l-4-4 4-4M6 12h10" /></>),
    clock: (<><circle cx="12" cy="12" r="8.5" /><path d="M12 7.5V12l3 2" /></>),
  };
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {paths[name]}
    </svg>
  );
}

function Logo() {
  return (
    <Link href="/" className={`inline-flex items-center gap-3 rounded-md ${focusRing}`}>
      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#173F35] text-[#F5F0E6]">
        <Icon name="plus" />
      </span>
      <span className={`${display.className} text-xl font-medium tracking-tight text-[#173F35]`}>HealthCare AI</span>
    </Link>
  );
}

// Illustrated plate used until real food photography is added.
function PlateArt({ colors, label }: { colors: string[]; label: string }) {
  return (
    <svg viewBox="0 0 200 120" className="h-full w-full" role="img" aria-label={`Illustration for ${label}`}>
      <rect width="200" height="120" fill="#E8E4D9" />
      <circle cx="100" cy="62" r="46" fill="#FFFFFF" stroke="#173F35" strokeOpacity="0.2" />
      <circle cx="100" cy="62" r="36" fill="none" stroke="#173F35" strokeOpacity="0.12" />
      <circle cx="84" cy="56" r="13" fill={colors[0]} stroke="#173F35" strokeOpacity="0.25" />
      <circle cx="113" cy="52" r="11" fill={colors[1]} stroke="#173F35" strokeOpacity="0.25" />
      <circle cx="102" cy="76" r="12" fill={colors[2]} stroke="#173F35" strokeOpacity="0.25" />
    </svg>
  );
}

function SectionHeading({ title, intro }: { title: string; intro?: string }) {
  return (
    <div className="mb-8 max-w-2xl">
      <div className="flex flex-wrap items-center gap-3">
        <h2 className={`${display.className} text-3xl font-normal tracking-tight text-[#173F35]`}>{title}</h2>
      </div>
      {intro && <p className="mt-3 leading-relaxed text-[#26332E]/75">{intro}</p>}
    </div>
  );
}

const GENERATED_PLATE_COLORS = [
  ["#F5F0E6", "#DCEBE2", "#C58B61"],
  ["#DCEBE2", "#C58B61", "#F5F0E6"],
  ["#C58B61", "#DCEBE2", "#F5F0E6"],
];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isNutritionEstimate(value: unknown): value is NutritionEstimate {
  return (
    isRecord(value) &&
    typeof value.calories_kcal === "number" &&
    typeof value.protein_g === "number" &&
    typeof value.carbohydrates_g === "number" &&
    typeof value.fat_g === "number"
  );
}

function isGeneratedMeal(value: unknown): value is GeneratedMeal {
  return (
    isRecord(value) &&
    typeof value.name === "string" &&
    typeof value.portion === "string" &&
    isNutritionEstimate(value.estimated_nutrition)
  );
}

function isDietRecommendationResponse(value: unknown): value is DietRecommendationResponse {
  if (!isRecord(value) || !isRecord(value.daily_meal_schedule)) return false;
  const schedule = value.daily_meal_schedule;
  return (
    isGeneratedMeal(schedule.breakfast) &&
    isGeneratedMeal(schedule.lunch) &&
    isGeneratedMeal(schedule.dinner) &&
    Array.isArray(schedule.snacks) &&
    schedule.snacks.every(isGeneratedMeal) &&
    isNutritionEstimate(schedule.estimated_daily_nutrition) &&
    Array.isArray(value.foods_to_include) &&
    Array.isArray(value.foods_to_limit) &&
    value.foods_to_include.every((food) => typeof food === "string") &&
    value.foods_to_limit.every((food) => typeof food === "string") &&
    typeof value.hydration_guidance === "string" &&
    typeof value.professional_supervision_warning === "string" &&
    typeof value.estimated_values_notice === "string"
  );
}

function generatedMeal(
  meal: GeneratedMeal,
  id: string,
  slot: string,
  colors: string[],
): Meal {
  return {
    id,
    name: meal.name,
    slot,
    time: "",
    items: [],
    portion: meal.portion,
    kcal: meal.estimated_nutrition.calories_kcal,
    protein: meal.estimated_nutrition.protein_g,
    carbs: meal.estimated_nutrition.carbohydrates_g,
    fat: meal.estimated_nutrition.fat_g,
    plate: colors,
  };
}

function displayMeals(plan: DietRecommendationResponse): Meal[] {
  const schedule = plan.daily_meal_schedule;
  return [
    generatedMeal(schedule.breakfast, "breakfast", "Breakfast", GENERATED_PLATE_COLORS[0]),
    ...schedule.snacks.map((meal, index) =>
      generatedMeal(meal, `snack-${index + 1}`, `Snack ${index + 1}`, GENERATED_PLATE_COLORS[(index + 1) % GENERATED_PLATE_COLORS.length]),
    ),
    generatedMeal(schedule.lunch, "lunch", "Lunch", GENERATED_PLATE_COLORS[1]),
    generatedMeal(schedule.dinner, "dinner", "Dinner", GENERATED_PLATE_COLORS[2]),
  ];
}

function activityForRequest(value: string): "Low" | "Moderate" | "High" {
  if (value === "Very active") return "High";
  if (value === "Moderately active") return "Moderate";
  return "Low";
}

function allergiesForRequest(assessment: HealthAssessment, preferenceAllergies: string): string {
  const allergies = [assessment.allergies, preferenceAllergies.trim() || undefined].filter(Boolean);
  return allergies.length > 0 ? allergies.join(", ") : "No known allergies";
}

function errorMessage(body: unknown): string {
  if (isRecord(body) && typeof body.detail === "string") return body.detail;
  if (isRecord(body) && Array.isArray(body.detail)) {
    const messages = body.detail
      .filter(isRecord)
      .map((item) => (typeof item.msg === "string" ? item.msg : "Invalid request"))
      .filter(Boolean);
    if (messages.length > 0) return messages.join(" ");
  }
  return "We could not generate your diet plan. Please try again.";
}

/* ---------- Page ---------- */

export default function DietPage() {
  const router = useRouter();
  const {
    assessment,
    dietPreferences,
    setDietPreferences,
    dietPlan,
    setDietPlan,
  } = useHealthSession();
  const [menuOpen, setMenuOpen] = useState<boolean>(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const [prefs, setPrefs] = useState<Preferences>(dietPreferences);
  const [prefError, setPrefError] = useState<string>("");
  const [prefSaved, setPrefSaved] = useState<boolean>(false);
  const [generationError, setGenerationError] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  useEffect(() => {
    if (!menuOpen) return;
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMenuOpen(false);
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  const meals = dietPlan ? displayMeals(dietPlan) : [];
  const totals = dietPlan
    ? {
        kcal: dietPlan.daily_meal_schedule.estimated_daily_nutrition.calories_kcal,
        protein: dietPlan.daily_meal_schedule.estimated_daily_nutrition.protein_g,
        carbs: dietPlan.daily_meal_schedule.estimated_daily_nutrition.carbohydrates_g,
        fat: dietPlan.daily_meal_schedule.estimated_daily_nutrition.fat_g,
      }
    : null;
  const includeItems = dietPlan
    ? dietPlan.foods_to_include.map((food) => ({ title: food, note: "", examples: "" }))
    : [];
  const limitItems = dietPlan
    ? dietPlan.foods_to_limit.map((food) => ({ title: food, note: "", examples: "" }))
    : [];

  function setPref<K extends keyof Preferences>(key: K, value: Preferences[K]) {
    const next = { ...prefs, [key]: value };
    setPrefs(next);
    setDietPreferences(next);
    setPrefSaved(false);
    if (key === "diet") setPrefError("");
  }

  function handleSavePreferences(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!prefs.diet) {
      setPrefError("Choose a dietary preference so we know what suits you.");
      document.getElementById("diet-vegetarian")?.focus();
      return;
    }
    // Preferences stay in the in-memory health session until the page is refreshed.
    setPrefSaved(true);
  }

  async function handleGenerateDiet() {
    setGenerationError("");

    if (!assessment) {
      setGenerationError("Please complete the health assessment before generating a diet plan.");
      return;
    }
    if (!prefs.diet) {
      setGenerationError("Choose a dietary preference before generating your plan.");
      document.getElementById("diet-vegetarian")?.focus();
      return;
    }
    if (!prefs.activity || !prefs.meals) {
      setGenerationError("Choose your activity level and meals per day before generating your plan.");
      return;
    }
    if (!prefs.goals.trim()) {
      setGenerationError("Add a dietary goal so the plan can be tailored responsibly.");
      document.getElementById("goals")?.focus();
      return;
    }

    const healthConcerns = [
      assessment.healthConcern,
      `Duration: ${assessment.symptomDuration}`,
      `Severity: ${assessment.severity}`,
      assessment.additional,
    ].filter(Boolean).join(". ");

    const requestBody = {
      age: assessment.age,
      gender: assessment.gender,
      existing_medical_conditions: assessment.existingMedicalConditions ?? null,
      food_allergies: allergiesForRequest(assessment, prefs.allergies),
      current_medications: assessment.currentMedications ?? null,
      health_concerns: healthConcerns,
      dietary_preference: prefs.diet,
      foods_disliked: prefs.dislikes.trim() || null,
      daily_activity_level: activityForRequest(prefs.activity),
      number_of_meals_per_day: Number.parseInt(prefs.meals, 10),
      dietary_goals: prefs.goals.trim(),
      food_budget: prefs.budget,
    };

    setIsGenerating(true);
    try {
      const response = await fetch("http://127.0.0.1:8000/api/diet/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });
      const body: unknown = await response.json().catch(() => null);
      if (!response.ok) throw new Error(errorMessage(body));
      if (!isDietRecommendationResponse(body)) {
        throw new Error("The diet service returned an unexpected response.");
      }
      setDietPlan(body);
    } catch (error) {
      setGenerationError(error instanceof Error ? error.message : "We could not generate your diet plan. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  }

  function handleSignOut() {
    // Placeholder: real sign-out will be added with the backend.
    router.push("/login");
  }

  const navLink = (href: string, label: string, current = false) => (
    <Link
      href={href}
      aria-current={current ? "page" : undefined}
      className={`whitespace-nowrap rounded-md px-3 py-2 text-sm transition-colors ${focusRing} ${
        current ? "bg-[#DCEBE2] font-medium text-[#173F35]" : "text-[#26332E]/75 hover:text-[#173F35]"
      }`}
    >
      {label}
    </Link>
  );

  const navItems = (
    <>
      {navLink("/dashboard", "Dashboard")}
      {navLink("/dashboard", "Health Assessment")}
      {navLink("/doctors", "Find Doctors")}
      {navLink("/diet", "Diet Plan", true)}
    </>
  );

  return (
    <div className="min-h-screen bg-[#F5F0E6] text-[#26332E]">
      {/* Header */}
      <header className="border-b border-[#173F35]/15 bg-[#F5F0E6]">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4 lg:px-10">
          <div className="flex items-center gap-10">
            <Logo />
            <nav aria-label="Main" className="hidden items-center gap-1 md:flex">{navItems}</nav>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={() => setMenuOpen((o) => !o)}
                aria-haspopup="menu"
                aria-expanded={menuOpen}
                className={`flex items-center gap-2 rounded-full border border-[#173F35]/20 py-1.5 pl-1.5 pr-3 text-sm text-[#173F35] transition-colors hover:border-[#173F35]/50 ${focusRing}`}
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#DCEBE2]">
                  <Icon name="user" className="h-4 w-4" />
                </span>
                <span className="hidden sm:inline">My account</span>
                <Icon name="chevron" className={`h-4 w-4 transition-transform motion-reduce:transition-none ${menuOpen ? "rotate-180" : ""}`} />
              </button>
              {menuOpen && (
                <div role="menu" className="absolute right-0 z-20 mt-2 w-48 rounded-lg border border-[#173F35]/15 bg-white py-1 shadow-sm">
                  <Link role="menuitem" href="/profile" onClick={() => setMenuOpen(false)} className="block px-4 py-2.5 text-sm hover:bg-[#DCEBE2]/60 focus-visible:bg-[#DCEBE2]/60 focus-visible:outline-none">
                    Profile
                  </Link>
                  <button role="menuitem" type="button" onClick={handleSignOut} className="block w-full px-4 py-2.5 text-left text-sm hover:bg-[#DCEBE2]/60 focus-visible:bg-[#DCEBE2]/60 focus-visible:outline-none">
                    Sign out
                  </button>
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={handleSignOut}
              className={`hidden items-center gap-2 rounded-lg bg-[#173F35] px-4 py-2 text-sm font-medium text-[#F5F0E6] transition-colors hover:bg-[#0F2D25] sm:inline-flex ${focusRing}`}
            >
              <Icon name="signout" className="h-4 w-4" />
              Sign out
            </button>
          </div>
        </div>
        <nav aria-label="Main (mobile)" className="flex gap-1 overflow-x-auto border-t border-[#173F35]/10 px-4 py-2 md:hidden">{navItems}</nav>
      </header>
      <HealthOptionNav current="diet" />

      <main className="mx-auto max-w-6xl px-6 pb-20 pt-8 lg:px-10">
        <Link href="/health-options" className={`inline-flex items-center gap-1.5 rounded-md py-1 text-sm text-[#173F35] hover:text-[#8F5A33] ${focusRing}`}>
          <Icon name="back" className="h-4 w-4" />
          Back to Health Options
        </Link>

        {/* Title + overview */}
        <div className="mt-8 grid gap-10 lg:grid-cols-[1.1fr_1fr] lg:items-end lg:gap-16">
          <div>
            <h1 className={`${display.className} text-4xl font-normal leading-[1.1] tracking-tight text-[#173F35] sm:text-5xl lg:text-6xl`}>
              Your Personalized Diet Plan
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-[#26332E]/75">
              Explore balanced food choices and practical nutrition guidance designed around your health needs.
            </p>
          </div>
          <div role="note" className="rounded-lg border border-[#C58B61]/60 bg-white px-5 py-4 text-sm leading-relaxed">
            {dietPlan ? (
              <>
                <span className="mr-2 inline-flex items-center rounded-full border border-[#173F35]/30 bg-[#DCEBE2] px-2 py-0.5 text-[11px] font-semibold tracking-wide text-[#173F35]">
                  AI-GENERATED GUIDANCE
                </span>
                This plan is based on the information you provided. It is general guidance, not a medical prescription.
              </>
            ) : (
              "No personalized plan has been generated yet. Complete your preferences and choose Generate My Diet Plan to request guidance."
            )}
          </div>
        </div>

        {/* Personalization */}
        <section aria-labelledby="personal-title" className="mt-16 border-t border-[#173F35]/15 pt-12">
          <div className="grid gap-10 lg:grid-cols-[17rem_1fr] lg:gap-14">
            <div>
              <h2 id="personal-title" className={`${display.className} text-3xl font-normal tracking-tight text-[#173F35]`}>
                Make Your Diet More Personal
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-[#26332E]/70">
                Share your preferences so future plans fit your tastes, routine and any allergies.
              </p>
            </div>

            <form onSubmit={handleSavePreferences} noValidate className="rounded-xl border border-[#173F35]/15 bg-white p-6 sm:p-8">
              <fieldset aria-describedby={prefError ? "diet-error" : undefined}>
                <legend className="mb-3 text-sm font-medium text-[#173F35]">Dietary preference</legend>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {DIET_OPTIONS.map((o) => (
                    <label
                      key={o}
                      htmlFor={`diet-${o.toLowerCase()}`}
                      className={`flex cursor-pointer items-center justify-center rounded-lg border px-2 py-3 text-center text-sm transition-colors motion-reduce:transition-none has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-[#C58B61] ${
                        prefs.diet === o
                          ? "border-[#173F35] bg-[#173F35] text-[#F5F0E6]"
                          : `${prefError ? "border-[#B4452F]" : "border-[#173F35]/20"} hover:border-[#173F35]/50`
                      }`}
                    >
                      <input id={`diet-${o.toLowerCase()}`} type="radio" name="diet" value={o} checked={prefs.diet === o} onChange={() => setPref("diet", o)} className="sr-only" />
                      {o}
                    </label>
                  ))}
                </div>
                {prefError && <p id="diet-error" role="alert" className="mt-2 text-sm text-[#B4452F]">{prefError}</p>}
              </fieldset>

              <div className="mt-6 grid gap-6 sm:grid-cols-2">
                <div>
                  <label htmlFor="allergies" className="mb-2 block text-sm font-medium text-[#173F35]">Food allergies</label>
                  <input id="allergies" type="text" placeholder="e.g. peanuts, shellfish" value={prefs.allergies} onChange={(e) => setPref("allergies", e.target.value)} className={inputBase} />
                </div>
                <div>
                  <label htmlFor="dislikes" className="mb-2 block text-sm font-medium text-[#173F35]">Foods you dislike</label>
                  <input id="dislikes" type="text" placeholder="e.g. bitter gourd, mushrooms" value={prefs.dislikes} onChange={(e) => setPref("dislikes", e.target.value)} className={inputBase} />
                </div>
                <div>
                  <label htmlFor="activity" className="mb-2 block text-sm font-medium text-[#173F35]">Daily activity level</label>
                  <select id="activity" value={prefs.activity} onChange={(e) => setPref("activity", e.target.value)} className={`${inputBase} ${prefs.activity ? "" : "text-[#26332E]/40"}`}>
                    <option value="">Select</option>
                    {ACTIVITY_OPTIONS.map((a) => <option key={a} value={a} className="text-[#26332E]">{a}</option>)}
                  </select>
                </div>
                <div>
                  <label htmlFor="meals" className="mb-2 block text-sm font-medium text-[#173F35]">Meals per day</label>
                  <select id="meals" value={prefs.meals} onChange={(e) => setPref("meals", e.target.value)} className={`${inputBase} ${prefs.meals ? "" : "text-[#26332E]/40"}`}>
                    <option value="">Select</option>
                    {MEAL_COUNT_OPTIONS.map((a) => <option key={a} value={a} className="text-[#26332E]">{a}</option>)}
                  </select>
                </div>
              </div>

              <div className="mt-6">
                <label htmlFor="goals" className="mb-2 flex items-baseline gap-2 text-sm font-medium text-[#173F35]">
                  Dietary goals <span className="text-xs font-normal text-[#26332E]/55">Optional</span>
                </label>
                <textarea id="goals" rows={3} placeholder="e.g. more energy through the day, eating more vegetables" value={prefs.goals} onChange={(e) => setPref("goals", e.target.value)} className={`${inputBase} resize-y`} />
              </div>

              <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="max-w-sm text-[13px] leading-relaxed text-[#26332E]/65">
                  Your choices are not stored in your browser. They are sent only when you choose Generate My Diet Plan.
                </p>
                <button type="submit" className="rounded-lg bg-[#173F35] px-7 py-3.5 text-[15px] font-medium text-[#F5F0E6] transition-colors hover:bg-[#0F2D25] active:bg-[#0B231C] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#C58B61]">
                  Save Preferences
                </button>
              </div>
              <div role="status" aria-live="polite">
                {prefSaved && (
                  <p className="mt-5 rounded-lg border border-[#173F35]/20 bg-[#DCEBE2] px-4 py-3 text-sm text-[#173F35]">
                    This is a prototype. Your preferences were not saved. Saving will be available once the secure backend is connected.
                  </p>
                )}
              </div>
            </form>
          </div>
        </section>

        {/* Food budget */}
        <section aria-labelledby="budget-title" className="mt-16 border-t border-[#173F35]/15 pt-12">
          <div className="grid gap-8 lg:grid-cols-[17rem_1fr] lg:gap-14">
            <div>
              <h2 id="budget-title" className={`${display.className} text-3xl font-normal tracking-tight text-[#173F35]`}>
                Your Food Budget
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-[#26332E]/70">
                This affects ingredient choices and variety, not nutritional safety. No exact prices are assumed.
              </p>
            </div>
            <fieldset>
              <legend className="sr-only">Choose your food budget</legend>
              <div className="grid gap-3 md:grid-cols-3">
                {BUDGET_OPTIONS.map((option) => (
                  <label
                    key={option.value}
                    htmlFor={`budget-${option.value}`}
                    className={`flex cursor-pointer flex-col rounded-lg border p-4 transition-colors motion-reduce:transition-none has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-[#C58B61] ${
                      prefs.budget === option.value
                        ? "border-[#173F35] bg-[#173F35] text-[#F5F0E6]"
                        : "border-[#173F35]/20 bg-white hover:border-[#173F35]/50"
                    }`}
                  >
                    <span className="flex items-center gap-2 text-sm font-medium">
                      <input
                        id={`budget-${option.value}`}
                        type="radio"
                        name="food-budget"
                        value={option.value}
                        checked={prefs.budget === option.value}
                        onChange={() => setPref("budget", option.value)}
                        className="accent-[#173F35]"
                      />
                      {option.label}
                    </span>
                    <span className={`mt-2 text-sm leading-relaxed ${prefs.budget === option.value ? "text-[#DCEBE2]/90" : "text-[#26332E]/70"}`}>
                      {option.description}
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>
          </div>
        </section>

        {/* AI nutrition assistant */}
        <section aria-labelledby="ai-title" className="mt-16 overflow-hidden rounded-xl bg-[#173F35] text-[#F5F0E6]">
          <div className="grid gap-8 p-8 sm:p-12 lg:grid-cols-[1.3fr_1fr] lg:items-center lg:gap-14">
            <div>
              <h2 id="ai-title" className={`${display.className} text-3xl font-light tracking-tight sm:text-4xl`}>AI Nutrition Assistant</h2>
              <p className="mt-4 max-w-xl leading-relaxed text-[#DCEBE2]/85">
                {dietPlan
                  ? "This plan was generated from your health assessment and dietary preferences. It offers general guidance and does not replace a dietitian or qualified healthcare professional."
                  : "Generate a plan from your health assessment and dietary preferences. It will offer general guidance and will not replace a dietitian."}
              </p>
              {dietPlan && (
                <div className="mt-6 space-y-3 text-sm leading-relaxed text-[#DCEBE2]/90">
                  <p><strong className="font-medium text-[#F5F0E6]">Hydration guidance:</strong> {dietPlan.hydration_guidance}</p>
                  <p><strong className="font-medium text-[#F5F0E6]">Safety:</strong> {dietPlan.professional_supervision_warning}</p>
                </div>
              )}
            </div>
            <div>
              {!assessment && (
                <p className="mb-4 rounded-lg border border-[#DCEBE2]/30 px-4 py-3 text-sm leading-relaxed text-[#DCEBE2]">
                  Your health assessment is not available in this browser tab. Please complete it again before generating a plan.
                </p>
              )}
              <button
                type="button"
                onClick={handleGenerateDiet}
                disabled={isGenerating}
                className="w-full rounded-lg bg-[#F5F0E6] px-7 py-4 text-[15px] font-medium text-[#173F35] transition-colors hover:bg-white disabled:cursor-wait disabled:opacity-70 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#C58B61]"
              >
                {isGenerating ? "Generating your plan..." : dietPlan ? "Generate Again" : "Generate My Diet Plan"}
              </button>
              <div role="status" aria-live="polite">
                {generationError && (
                  <p className="mt-4 rounded-lg border border-[#C58B61]/70 px-4 py-3 text-sm leading-relaxed text-[#F5F0E6]">{generationError}</p>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Daily nutrition overview */}
        <section aria-labelledby="overview-title" className="mt-14 border-t border-[#173F35]/15 pt-12">
          <SectionHeading
            title="Daily nutrition overview"
            intro={dietPlan ? "Estimated daily nutrition from the generated guidance. Values are approximate, not medically calculated." : "Your calories and macronutrients will appear here after you generate your personalized plan."}
          />
          <h3 id="overview-title" className="sr-only">{dietPlan ? "Generated nutrition summary" : "Nutrition summary awaiting generation"}</h3>
          {dietPlan && totals ? (
            <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-[#173F35]/15 bg-[#173F35]/15 lg:grid-cols-4">
              {[
                { label: "Calories", value: totals.kcal.toLocaleString("en-IN"), unit: "kcal" },
                { label: "Protein", value: String(totals.protein), unit: "g" },
                { label: "Carbohydrates", value: String(totals.carbs), unit: "g" },
                { label: "Fats", value: String(totals.fat), unit: "g" },
              ].map((s) => (
                <div key={s.label} className="bg-white p-5 sm:p-6">
                  <dt className="text-sm text-[#26332E]/70">{s.label}</dt>
                  <dd className={`${display.className} mt-2 text-3xl text-[#173F35]`}>
                    {s.value}
                    <span className="ml-1 text-base text-[#26332E]/60">{s.unit}</span>
                  </dd>
                </div>
              ))}
            </dl>
          ) : (
            <div className="rounded-xl border border-dashed border-[#173F35]/25 bg-white p-8 text-center text-sm leading-relaxed text-[#26332E]/70">
              Your personalized nutrition summary will appear here after you generate your plan.
            </div>
          )}

          <h3 className={`${display.className} mt-12 text-xl text-[#173F35]`}>Daily meal schedule</h3>
          {dietPlan ? (
            <ol className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              {meals.map((m) => (
                <li key={m.id}>
                  <a href={`#meal-${m.id}`} className={`block h-full rounded-lg border border-[#173F35]/15 bg-[#E8E4D9]/60 p-4 transition-colors hover:border-[#173F35]/40 hover:bg-[#E8E4D9] ${focusRing}`}>
                    {m.time && (
                      <span className="flex items-center gap-1.5 text-sm text-[#8F5A33]">
                        <Icon name="clock" className="h-4 w-4" />
                        {m.time}
                      </span>
                    )}
                    <span className="mt-2 block text-sm font-medium text-[#173F35]">{m.slot}</span>
                  </a>
                </li>
              ))}
            </ol>
          ) : (
            <p className="mt-5 rounded-lg border border-dashed border-[#173F35]/25 bg-[#E8E4D9]/60 p-5 text-sm text-[#26332E]/70">
              Generate your plan to see your breakfast, snacks, lunch and dinner schedule.
            </p>
          )}
        </section>

        {/* Daily meal plan */}
        <section aria-labelledby="meals-title" className="mt-16 border-t border-[#173F35]/15 pt-12">
          <SectionHeading
            title="Daily meal plan"
            intro={dietPlan ? "Meals from the generated guidance. Nutrition values are approximate estimates." : "Your personalized meals will appear here after you generate your plan."}
          />
          <h3 id="meals-title" className="sr-only">{dietPlan ? "Generated meals" : "Meals awaiting generation"}</h3>
          {dietPlan ? (
            <ul className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {meals.map((m) => (
                <li key={m.id} id={`meal-${m.id}`} className="scroll-mt-6">
                <article className="group flex h-full flex-col overflow-hidden rounded-xl border border-[#173F35]/15 bg-white transition duration-200 motion-reduce:transition-none hover:-translate-y-0.5 motion-reduce:hover:translate-y-0 hover:border-[#173F35]/40">
                  <div className="relative aspect-[5/3] border-b border-[#173F35]/10">
                    <PlateArt colors={m.plate} label={m.name} />
                  </div>
                  <div className="flex flex-1 flex-col p-5">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-[#8F5A33]">{m.slot}</span>
                      {m.time && (
                        <span className="flex items-center gap-1.5 text-[#26332E]/65">
                          <Icon name="clock" className="h-4 w-4" />
                          {m.time}
                        </span>
                      )}
                    </div>
                    <h4 className={`${display.className} mt-2 text-xl text-[#173F35]`}>{m.name}</h4>
                    <ul className="mt-4 space-y-2 text-sm">
                      {m.items.map((it) => (
                        <li key={it.food} className="flex justify-between gap-4 border-b border-dashed border-[#173F35]/15 pb-2 last:border-0">
                          <span>{it.food}</span>
                          <span className="shrink-0 text-[#26332E]/60">{it.portion}</span>
                        </li>
                      ))}
                      {dietPlan && m.items.length === 0 && (
                        <li className="flex justify-between gap-4 border-b border-dashed border-[#173F35]/15 pb-2">
                          <span>Portion</span>
                          <span className="shrink-0 text-[#26332E]/60">{m.portion}</span>
                        </li>
                      )}
                    </ul>
                    <dl className="mt-auto grid grid-cols-4 gap-2 pt-5 text-center text-xs">
                      {[
                        ["kcal", m.kcal],
                        ["Protein", `${m.protein}g`],
                        ["Carbs", `${m.carbs}g`],
                        ["Fat", `${m.fat}g`],
                      ].map(([k, v]) => (
                        <div key={String(k)} className="rounded-md bg-[#DCEBE2]/60 px-1 py-2">
                          <dd className="text-sm font-medium text-[#173F35]">{v}</dd>
                          <dt className="text-[#26332E]/65">{k}</dt>
                        </div>
                      ))}
                    </dl>
                    <p className="mt-3 text-[11px] text-[#26332E]/55">
                      {dietPlan.estimated_values_notice}
                    </p>
                  </div>
                </article>
                </li>
              ))}
            </ul>
          ) : (
            <div className="rounded-xl border border-dashed border-[#173F35]/25 bg-white p-8 text-center text-sm leading-relaxed text-[#26332E]/70">
              No personalized meals are available yet. Complete your preferences and choose Generate My Diet Plan.
            </div>
          )}
        </section>

        {/* Foods to include */}
        <section aria-labelledby="include-title" className="mt-16 border-t border-[#173F35]/15 pt-12">
          <SectionHeading
            title="Foods to include"
            intro={dietPlan ? "Foods suggested by the generated guidance. Check every item against your allergies and professional advice." : "General food groups that support a balanced diet for most people."}
          />
          <h3 id="include-title" className="sr-only">Recommended food categories</h3>
          {dietPlan ? (
            <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {includeItems.map((c) => (
                <li key={c.title} className="rounded-xl border border-[#173F35]/15 bg-[#DCEBE2]/50 p-6 transition-colors hover:border-[#173F35]/40">
                  <h4 className={`${display.className} text-xl text-[#173F35]`}>{c.title}</h4>
                  {c.note && <p className="mt-2 text-sm leading-relaxed text-[#26332E]/75">{c.note}</p>}
                  {c.examples && <p className="mt-4 border-t border-[#173F35]/15 pt-4 text-sm text-[#173F35]">{c.examples}</p>}
                </li>
              ))}
            </ul>
          ) : (
            <p className="rounded-lg border border-dashed border-[#173F35]/25 bg-[#DCEBE2]/40 p-5 text-sm text-[#26332E]/70">
              Foods to include will appear after your personalized plan is generated.
            </p>
          )}
        </section>

        {/* Foods to limit */}
        <section aria-labelledby="limit-title" className="mt-16 border-t border-[#173F35]/15 pt-12">
          <SectionHeading
            title="Foods to enjoy less often"
            intro="No food is off-limits for everyone. What suits you depends on your own health needs, so treat these as general examples and check with a professional if you have a medical condition."
          />
          <h3 id="limit-title" className="sr-only">Foods to limit</h3>
          {dietPlan ? (
            <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {limitItems.map((c) => (
                <li key={c.title} className="rounded-xl border border-[#173F35]/15 bg-[#E8E4D9]/60 p-5">
                  <h4 className="font-medium text-[#173F35]">{c.title}</h4>
                  {c.note && <p className="mt-2 text-sm leading-relaxed text-[#26332E]/75">{c.note}</p>}
                </li>
              ))}
            </ul>
          ) : (
            <p className="rounded-lg border border-dashed border-[#173F35]/25 bg-[#E8E4D9]/60 p-5 text-sm text-[#26332E]/70">
              Foods to limit will appear after your personalized plan is generated.
            </p>
          )}
        </section>

        {/* Safety */}
        <aside aria-labelledby="safety-title" className="mt-10 rounded-xl border border-[#C58B61]/60 bg-white p-6 sm:p-8">
          <div className="flex gap-4">
            <Icon name="alert" className="mt-1 h-5 w-5 shrink-0 text-[#8F5A33]" />
            <div className="text-sm leading-relaxed text-[#26332E]/85">
              <h2 id="safety-title" className={`${display.className} text-xl text-[#173F35]`}>Safety and medical disclaimer</h2>
              <p className="mt-3 max-w-3xl">
                The sample diet shown here is for education only. It is not a personalised medical prescription, and it does not diagnose or treat any condition. It does not include supplements or medicines.
              </p>
              <p className="mt-3 max-w-3xl">
                Always avoid foods you are allergic to and follow any dietary restrictions from your doctor. If you have diabetes, kidney disease, are pregnant or breastfeeding, or have any other medical dietary need, please speak to a qualified healthcare professional or registered dietitian before changing how you eat. Healthy eating should never mean skipping meals or cutting calories sharply.
              </p>
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
}
