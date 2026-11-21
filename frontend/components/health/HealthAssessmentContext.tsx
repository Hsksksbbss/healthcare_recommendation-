"use client";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import type { DoctorListing } from "../doctors/demo-doctors";

export type HealthAssessment = {
  age: number;
  gender: string;
  height?: number;
  weight?: number;
  existingMedicalConditions?: string;
  allergies?: string;
  currentMedications?: string;
  healthConcern: string;
  symptomDuration: string;
  severity: "mild" | "moderate" | "severe";
  additional?: string;
};

export type DietPreferences = {
  diet: "Vegetarian" | "Eggetarian" | "Non-vegetarian" | "Vegan" | "";
  budget: "low" | "moderate" | "high";
  allergies: string;
  dislikes: string;
  activity: string;
  meals: string;
  goals: string;
};

export type DietRecommendation = {
  daily_meal_schedule: {
    breakfast: { name: string; portion: string; estimated_nutrition: NutritionEstimate };
    snacks: { name: string; portion: string; estimated_nutrition: NutritionEstimate }[];
    lunch: { name: string; portion: string; estimated_nutrition: NutritionEstimate };
    dinner: { name: string; portion: string; estimated_nutrition: NutritionEstimate };
    estimated_daily_nutrition: NutritionEstimate;
  };
  foods_to_include: string[];
  foods_to_limit: string[];
  hydration_guidance: string;
  professional_supervision_warning: string;
  estimated_values_notice: string;
};

type NutritionEstimate = {
  calories_kcal: number;
  protein_g: number;
  carbohydrates_g: number;
  fat_g: number;
};

export type HealthGuidance = {
  understanding: string;
  general_information: string;
  practical_precautions: string[];
  things_to_avoid: string[];
  warning_signs: string[];
  emergency_warning_signs: string[];
  when_to_consult: string[];
  doctor_questions: string[];
  urgent_action: string;
  is_emergency: boolean;
  educational_notice: string;
};

type HealthSessionContextValue = {
  assessment: HealthAssessment | null;
  setAssessment: (assessment: HealthAssessment) => void;
  clearAssessment: () => void;
  dietPreferences: DietPreferences;
  setDietPreferences: (preferences: DietPreferences) => void;
  dietPlan: DietRecommendation | null;
  setDietPlan: (plan: DietRecommendation | null) => void;
  healthGuidance: HealthGuidance | null;
  setHealthGuidance: (guidance: HealthGuidance | null) => void;
  doctorResults: DoctorListing[];
  setDoctorResults: (results: DoctorListing[]) => void;
  recommendedSpecialty: string | null;
  setRecommendedSpecialty: (specialty: string | null) => void;
};

const INITIAL_DIET_PREFERENCES: DietPreferences = {
  diet: "",
  budget: "moderate",
  allergies: "",
  dislikes: "",
  activity: "",
  meals: "",
  goals: "",
};

const HealthSessionContext = createContext<HealthSessionContextValue | undefined>(undefined);

export function HealthAssessmentProvider({ children }: { children: ReactNode }) {
  const [assessment, setAssessment] = useState<HealthAssessment | null>(null);
  const [dietPreferences, setDietPreferences] = useState(INITIAL_DIET_PREFERENCES);
  const [dietPlan, setDietPlan] = useState<DietRecommendation | null>(null);
  const [healthGuidance, setHealthGuidance] = useState<HealthGuidance | null>(null);
  const [doctorResults, setDoctorResults] = useState<DoctorListing[]>([]);
  const [recommendedSpecialty, setRecommendedSpecialty] = useState<string | null>(null);

  function submitAssessment(nextAssessment: HealthAssessment) {
    setAssessment(nextAssessment);
    setDietPlan(null);
    setHealthGuidance(null);
    setDoctorResults([]);
    setRecommendedSpecialty(null);
  }

  function clearAssessment() {
    setAssessment(null);
    setDietPlan(null);
    setHealthGuidance(null);
    setDoctorResults([]);
    setRecommendedSpecialty(null);
  }

  const value = useMemo(
    () => ({
      assessment,
      setAssessment: submitAssessment,
      clearAssessment,
      dietPreferences,
      setDietPreferences,
      dietPlan,
      setDietPlan,
      healthGuidance,
      setHealthGuidance,
      doctorResults,
      setDoctorResults,
      recommendedSpecialty,
      setRecommendedSpecialty,
    }),
    [assessment, dietPreferences, dietPlan, healthGuidance, doctorResults, recommendedSpecialty],
  );

  return <HealthSessionContext.Provider value={value}>{children}</HealthSessionContext.Provider>;
}

export function useHealthAssessment() {
  const context = useContext(HealthSessionContext);
  if (!context) {
    throw new Error("useHealthAssessment must be used within HealthAssessmentProvider");
  }
  return {
    assessment: context.assessment,
    setAssessment: context.setAssessment,
    clearAssessment: context.clearAssessment,
  };
}

export function useHealthSession() {
  const context = useContext(HealthSessionContext);
  if (!context) {
    throw new Error("useHealthSession must be used within HealthAssessmentProvider");
  }
  return context;
}
