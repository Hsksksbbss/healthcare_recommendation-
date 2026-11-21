"use client";

import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Fraunces } from "next/font/google";
import { useHealthAssessment } from "../../components/health/HealthAssessmentContext";

const display = Fraunces({ subsets: ["latin"], display: "swap" });

/* ---------- Types ---------- */

type Severity = "mild" | "moderate" | "severe" | "";
type Status = "idle" | "submitting" | "submitted";

type FormValues = {
  age: string;
  gender: string;
  height: string;
  weight: string;
  conditions: string;
  noConditions: boolean;
  allergies: string;
  noAllergies: boolean;
  medications: string;
  noMedications: boolean;
  concern: string;
  duration: string;
  severity: Severity;
  additional: string;
};

type FieldName = keyof FormValues;
type FormErrors = Partial<Record<FieldName, string>>;

/* ---------- Constants ---------- */

const INITIAL_VALUES: FormValues = {
  age: "",
  gender: "",
  height: "",
  weight: "",
  conditions: "",
  noConditions: false,
  allergies: "",
  noAllergies: false,
  medications: "",
  noMedications: false,
  concern: "",
  duration: "",
  severity: "",
  additional: "",
};

const GENDER_OPTIONS = ["Female", "Male", "Non-binary", "Another identity", "Prefer not to say"];

const DURATION_OPTIONS = [
  "Less than a day",
  "1 to 3 days",
  "4 to 7 days",
  "1 to 4 weeks",
  "1 to 3 months",
  "More than 3 months",
];

const SEVERITY_OPTIONS: { value: Exclude<Severity, "">; label: string; hint: string }[] = [
  { value: "mild", label: "Mild", hint: "Noticeable, but easy to carry on with your day" },
  { value: "moderate", label: "Moderate", hint: "Getting in the way of daily activities" },
  { value: "severe", label: "Severe", hint: "Hard to manage or very worrying" },
];

// Maps each field to the element id that should receive focus when it has an error.
const FOCUS_ID: Record<FieldName, string> = {
  age: "age",
  gender: "gender",
  height: "height",
  weight: "weight",
  conditions: "conditions",
  noConditions: "noConditions",
  allergies: "allergies",
  noAllergies: "noAllergies",
  medications: "medications",
  noMedications: "noMedications",
  concern: "concern",
  duration: "duration",
  severity: "severity-mild",
  additional: "additional",
};

const FIELD_ORDER: FieldName[] = [
  "age", "gender", "height", "weight", "conditions", "allergies",
  "medications", "concern", "duration", "severity",
];

/* ---------- Validation ---------- */

function inRange(value: string, min: number, max: number): boolean {
  const n = Number(value);
  return value.trim() !== "" && Number.isFinite(n) && n >= min && n <= max;
}

function validate(v: FormValues): FormErrors {
  const e: FormErrors = {};

  if (!v.age.trim()) e.age = "Enter your age.";
  else if (!inRange(v.age, 1, 120) || !Number.isInteger(Number(v.age)))
    e.age = "Enter a whole number of years between 1 and 120.";

  if (!v.gender) e.gender = "Choose the option that fits you best.";

  if (!v.height.trim()) e.height = "Enter your height in centimetres.";
  else if (!inRange(v.height, 50, 250)) e.height = "Enter a height between 50 and 250 cm.";

  if (!v.weight.trim()) e.weight = "Enter your weight in kilograms.";
  else if (!inRange(v.weight, 2, 400)) e.weight = "Enter a weight between 2 and 400 kg.";

  if (!v.concern.trim()) e.concern = "Describe what you are experiencing so we can help.";
  else if (v.concern.trim().length < 10)
    e.concern = "Add a little more detail. A sentence or two is enough.";

  if (!v.duration) e.duration = "Choose how long this has been going on.";
  if (!v.severity) e.severity = "Choose how severe your symptoms feel.";

  return e;
}

/* ---------- Styling ---------- */

const inputBase =
  "block w-full rounded-lg border bg-white px-4 py-3 text-[15px] text-[#26332E] placeholder:text-[#26332E]/40 outline-none transition-colors duration-200 motion-reduce:transition-none hover:border-[#173F35]/50 focus:border-[#173F35] focus:ring-4 focus:ring-[#173F35]/10 disabled:cursor-not-allowed disabled:border-[#173F35]/10 disabled:bg-[#26332E]/5 disabled:text-[#26332E]/40 disabled:hover:border-[#173F35]/10";
const focusRing =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C58B61]";
const linkClass = `rounded text-[#173F35] underline decoration-[#C58B61] decoration-2 underline-offset-4 transition-colors hover:text-[#8F5A33] ${focusRing}`;

/* ---------- Small presentational helpers ---------- */

function Icon({ name, className = "h-5 w-5" }: { name: "plus" | "user" | "chevron" | "alert" | "check" | "lock" | "signout"; className?: string }) {
  const paths: Record<typeof name, ReactNode> = {
    plus: <path d="M12 5v14M5 12h14" />,
    user: (<><circle cx="12" cy="8" r="3.5" /><path d="M5 20c.6-3.6 3.4-5.5 7-5.5s6.4 1.9 7 5.5" /></>),
    chevron: <path d="M6 9l6 6 6-6" />,
    alert: (<><path d="M12 4l9 16H3L12 4z" /><path d="M12 10v4M12 17.2v.1" /></>),
    check: <path d="M5 12.5l4.5 4.5L19 7.5" />,
    lock: (<><rect x="5" y="11" width="14" height="9" rx="2" /><path d="M8 11V8a4 4 0 018 0v3" /></>),
    signout: (<><path d="M14 4h4a2 2 0 012 2v12a2 2 0 01-2 2h-4" /><path d="M10 16l-4-4 4-4M6 12h10" /></>),
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

function Section({ title, description, children }: { title: string; description: string; children: ReactNode }) {
  return (
    <section className="grid gap-6 border-t border-[#173F35]/15 py-10 lg:grid-cols-[17rem_1fr] lg:gap-12">
      <div>
        <h2 className={`${display.className} text-2xl font-normal tracking-tight text-[#173F35]`}>{title}</h2>
        <p className="mt-2 text-sm leading-relaxed text-[#26332E]/70">{description}</p>
      </div>
      <div>{children}</div>
    </section>
  );
}

function Field({
  id, label, error, hint, optional, children,
}: { id: string; label: string; error?: string; hint?: string; optional?: boolean; children: ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className="mb-2 flex items-baseline gap-2 text-sm font-medium text-[#173F35]">
        {label}
        {optional && <span className="text-xs font-normal text-[#26332E]/55">Optional</span>}
      </label>
      {children}
      {hint && !error && <p id={`${id}-hint`} className="mt-2 text-[13px] text-[#26332E]/60">{hint}</p>}
      {error && <p id={`${id}-error`} role="alert" className="mt-2 text-sm text-[#B4452F]">{error}</p>}
    </div>
  );
}

/* ---------- Page ---------- */

export default function DashboardPage() {
  const router = useRouter();
  const { setAssessment } = useHealthAssessment();
  const [values, setValues] = useState<FormValues>(INITIAL_VALUES);
  const [errors, setErrors] = useState<FormErrors>({});
  const [status, setStatus] = useState<Status>("idle");
  const [menuOpen, setMenuOpen] = useState<boolean>(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Close the user menu on outside click or Escape.
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

  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); }, []);

  function update<K extends FieldName>(key: K, value: FormValues[K]) {
    setValues((v) => ({ ...v, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
    if (status === "submitted") setStatus("idle");
  }

  // Toggling a "none" checkbox clears the related text so stale entries aren't kept.
  function toggleNone(flag: "noConditions" | "noAllergies" | "noMedications", text: "conditions" | "allergies" | "medications", checked: boolean) {
    setValues((v) => ({ ...v, [flag]: checked, [text]: checked ? "" : v[text] }));
    setErrors((prev) => ({ ...prev, [text]: undefined }));
    if (status === "submitted") setStatus("idle");
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status === "submitting") return;
    const found = validate(values);
    setErrors(found);
    const firstInvalid = FIELD_ORDER.find((f) => found[f]);
    if (firstInvalid) {
      setStatus("idle");
      document.getElementById(FOCUS_ID[firstInvalid])?.focus();
      return;
    }
    setAssessment({
      age: Number(values.age),
      gender: values.gender,
      height: Number(values.height),
      weight: Number(values.weight),
      existingMedicalConditions: values.noConditions ? undefined : values.conditions.trim() || undefined,
      allergies: values.noAllergies ? undefined : values.allergies.trim() || undefined,
      currentMedications: values.noMedications ? undefined : values.medications.trim() || undefined,
      healthConcern: values.concern.trim(),
      symptomDuration: values.duration,
      severity: values.severity as Exclude<Severity, "">,
      additional: values.additional.trim() || undefined,
    });
    setStatus("submitting");
    timerRef.current = setTimeout(() => {
      setStatus("submitted");
      router.push("/health-options");
    }, 1000);
  }

  function handleSignOut() {
    // Placeholder: real sign-out (clearing the session) will be added with the backend.
    router.push("/login");
  }

  const errorCount = Object.values(errors).filter(Boolean).length;
  const invalid = (f: FieldName) => Boolean(errors[f]);
  const border = (f: FieldName) => (errors[f] ? "border-[#B4452F]" : "border-[#173F35]/20");
  const describe = (f: FieldName, hint?: boolean) =>
    [errors[f] ? `${f}-error` : hint ? `${f}-hint` : ""].filter(Boolean).join(" ") || undefined;

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

  const noneCheckbox = (
    flag: "noConditions" | "noAllergies" | "noMedications",
    text: "conditions" | "allergies" | "medications",
    label: string,
  ) => (
    <label htmlFor={flag} className="mt-3 flex cursor-pointer items-center gap-3 text-sm text-[#26332E]/85">
      <input
        id={flag}
        type="checkbox"
        checked={values[flag]}
        onChange={(e) => toggleNone(flag, text, e.target.checked)}
        className={`h-4 w-4 cursor-pointer rounded border-[#173F35]/40 accent-[#173F35] ${focusRing}`}
      />
      {label}
    </label>
  );

  return (
    <div className="min-h-screen bg-[#F5F0E6] text-[#26332E]">
      {/* Navigation */}
      <header className="border-b border-[#173F35]/15 bg-[#F5F0E6]">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4 lg:px-10">
          <div className="flex items-center gap-10">
            <Logo />
            <nav aria-label="Main" className="hidden items-center gap-1 md:flex">
              {navLink("/dashboard", "Dashboard", true)}
              {navLink("#assessment", "Health Assessment")}
              {navLink("/profile", "Profile")}
            </nav>
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
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#DCEBE2] text-[#173F35]">
                  <Icon name="user" className="h-4 w-4" />
                </span>
                <span className="hidden sm:inline">My account</span>
                <Icon name="chevron" className={`h-4 w-4 transition-transform motion-reduce:transition-none ${menuOpen ? "rotate-180" : ""}`} />
              </button>
              {menuOpen && (
                <div role="menu" className="absolute right-0 z-20 mt-2 w-48 rounded-lg border border-[#173F35]/15 bg-white py-1 shadow-sm">
                  <Link role="menuitem" href="/profile" onClick={() => setMenuOpen(false)} className="block px-4 py-2.5 text-sm text-[#26332E] hover:bg-[#DCEBE2]/60 focus-visible:bg-[#DCEBE2]/60 focus-visible:outline-none">
                    Profile
                  </Link>
                  <button role="menuitem" type="button" onClick={handleSignOut} className="block w-full px-4 py-2.5 text-left text-sm text-[#26332E] hover:bg-[#DCEBE2]/60 focus-visible:bg-[#DCEBE2]/60 focus-visible:outline-none">
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
        <nav aria-label="Main (mobile)" className="flex gap-1 overflow-x-auto border-t border-[#173F35]/10 px-4 py-2 md:hidden">
          {navLink("/dashboard", "Dashboard", true)}
          {navLink("#assessment", "Health Assessment")}
          {navLink("/profile", "Profile")}
        </nav>
      </header>

      <main className="mx-auto max-w-6xl px-6 pb-20 pt-12 lg:px-10 lg:pt-16">
        {/* Welcome */}
        <div className="max-w-2xl">
          <h1 className={`${display.className} text-4xl font-normal leading-[1.1] tracking-tight text-[#173F35] sm:text-5xl lg:text-6xl`}>
            Let&rsquo;s understand your health.
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-[#26332E]/75">
            Tell us a little about yourself and what you&rsquo;ve been experiencing. We&rsquo;ll help you understand your next steps.
          </p>
        </div>

        <form id="assessment" onSubmit={handleSubmit} noValidate className="mt-12 scroll-mt-8 lg:mt-16">
          {errorCount > 0 && (
            <div role="alert" className="mb-8 rounded-lg border border-[#B4452F]/40 bg-white px-5 py-4 text-sm text-[#B4452F]">
              Please check {errorCount === 1 ? "one field" : `${errorCount} fields`} below before continuing.
            </div>
          )}

          {/* Personal information */}
          <Section title="About you" description="These basics help us give guidance that fits you.">
            <div className="grid gap-6 sm:grid-cols-2">
              <Field id="age" label="Age" error={errors.age}>
                <input id="age" type="number" inputMode="numeric" min={1} max={120} placeholder="Years" value={values.age}
                  onChange={(e) => update("age", e.target.value)} aria-invalid={invalid("age")} aria-describedby={describe("age")}
                  className={`${inputBase} ${border("age")}`} />
              </Field>
              <Field id="gender" label="Gender" error={errors.gender}>
                <select id="gender" value={values.gender} onChange={(e) => update("gender", e.target.value)}
                  aria-invalid={invalid("gender")} aria-describedby={describe("gender")}
                  className={`${inputBase} ${border("gender")} ${values.gender ? "" : "text-[#26332E]/40"}`}>
                  <option value="">Select</option>
                  {GENDER_OPTIONS.map((g) => <option key={g} value={g} className="text-[#26332E]">{g}</option>)}
                </select>
              </Field>
              <Field id="height" label="Height (cm)" error={errors.height}>
                <input id="height" type="number" inputMode="decimal" min={50} max={250} placeholder="e.g. 165" value={values.height}
                  onChange={(e) => update("height", e.target.value)} aria-invalid={invalid("height")} aria-describedby={describe("height")}
                  className={`${inputBase} ${border("height")}`} />
              </Field>
              <Field id="weight" label="Weight (kg)" error={errors.weight}>
                <input id="weight" type="number" inputMode="decimal" min={2} max={400} placeholder="e.g. 62" value={values.weight}
                  onChange={(e) => update("weight", e.target.value)} aria-invalid={invalid("weight")} aria-describedby={describe("weight")}
                  className={`${inputBase} ${border("weight")}`} />
              </Field>
            </div>
          </Section>

          {/* Medical background */}
          <Section title="Medical background" description="Anything that could affect your symptoms or treatment. If there is nothing to add, tick the box instead.">
            <div className="space-y-8">
              <Field id="conditions" label="Existing medical conditions" optional error={errors.conditions}>
                <textarea id="conditions" rows={3} disabled={values.noConditions} placeholder="e.g. asthma, type 2 diabetes"
                  value={values.conditions} onChange={(e) => update("conditions", e.target.value)}
                  aria-invalid={invalid("conditions")} aria-describedby={describe("conditions")}
                  className={`${inputBase} ${border("conditions")} resize-y`} />
                {noneCheckbox("noConditions", "conditions", "No known conditions")}
              </Field>
              <Field id="allergies" label="Known allergies" optional error={errors.allergies}>
                <textarea id="allergies" rows={3} disabled={values.noAllergies} placeholder="e.g. penicillin, peanuts, latex"
                  value={values.allergies} onChange={(e) => update("allergies", e.target.value)}
                  aria-invalid={invalid("allergies")} aria-describedby={describe("allergies")}
                  className={`${inputBase} ${border("allergies")} resize-y`} />
                {noneCheckbox("noAllergies", "allergies", "No known allergies")}
              </Field>
              <Field id="medications" label="Current medications" optional error={errors.medications}>
                <textarea id="medications" rows={3} disabled={values.noMedications} placeholder="Include doses if you know them"
                  value={values.medications} onChange={(e) => update("medications", e.target.value)}
                  aria-invalid={invalid("medications")} aria-describedby={describe("medications")}
                  className={`${inputBase} ${border("medications")} resize-y`} />
                {noneCheckbox("noMedications", "medications", "No current medications")}
              </Field>
            </div>
          </Section>

          {/* Health concern */}
          <Section title="Your health concern" description="This is the most important part. Write it the way you would tell a doctor.">
            <div className="rounded-xl border border-[#173F35]/15 bg-[#DCEBE2]/50 p-5 sm:p-8">
              <Field id="concern" label="Describe your health concern" error={errors.concern}>
                <textarea id="concern" rows={8}
                  placeholder="Tell us what you are experiencing, when it started, and how it affects you..."
                  value={values.concern} onChange={(e) => update("concern", e.target.value)}
                  aria-invalid={invalid("concern")} aria-describedby={describe("concern")}
                  className={`${inputBase} ${border("concern")} min-h-52 resize-y px-5 py-4 text-base leading-relaxed`} />
              </Field>

              <div className="mt-8 grid gap-6 sm:grid-cols-2">
                <Field id="duration" label="How long has this been going on?" error={errors.duration}>
                  <select id="duration" value={values.duration} onChange={(e) => update("duration", e.target.value)}
                    aria-invalid={invalid("duration")} aria-describedby={describe("duration")}
                    className={`${inputBase} ${border("duration")} ${values.duration ? "" : "text-[#26332E]/40"}`}>
                    <option value="">Select</option>
                    {DURATION_OPTIONS.map((d) => <option key={d} value={d} className="text-[#26332E]">{d}</option>)}
                  </select>
                </Field>

                <fieldset aria-describedby={describe("severity")}>
                  <legend className="mb-2 text-sm font-medium text-[#173F35]">How severe do the symptoms feel?</legend>
                  <div className="grid grid-cols-3 gap-2">
                    {SEVERITY_OPTIONS.map((o) => (
                      <label key={o.value} htmlFor={`severity-${o.value}`}
                        className={`relative flex cursor-pointer items-center justify-center rounded-lg border px-2 py-3 text-sm transition-colors motion-reduce:transition-none has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-[#C58B61] ${
                          values.severity === o.value
                            ? "border-[#173F35] bg-[#173F35] text-[#F5F0E6]"
                            : `${errors.severity ? "border-[#B4452F]" : "border-[#173F35]/20"} bg-white text-[#26332E] hover:border-[#173F35]/50`
                        }`}>
                        <input id={`severity-${o.value}`} type="radio" name="severity" value={o.value}
                          checked={values.severity === o.value} onChange={() => update("severity", o.value)}
                          className="sr-only" />
                        {o.label}
                      </label>
                    ))}
                  </div>
                  <p className="mt-2 min-h-5 text-[13px] text-[#26332E]/65">
                    {SEVERITY_OPTIONS.find((o) => o.value === values.severity)?.hint ?? ""}
                  </p>
                  {errors.severity && <p id="severity-error" role="alert" className="mt-1 text-sm text-[#B4452F]">{errors.severity}</p>}
                </fieldset>
              </div>

              {values.severity === "severe" && (
                <div role="note" className="mt-4 flex gap-3 rounded-lg border border-[#C58B61] bg-[#F5F0E6] p-4 text-sm leading-relaxed text-[#26332E]">
                  <Icon name="alert" className="mt-0.5 h-5 w-5 shrink-0 text-[#8F5A33]" />
                  <p>
                    If your symptoms feel severe or could be an emergency, don&rsquo;t wait. Contact your local emergency number or go to the nearest emergency department now.
                  </p>
                </div>
              )}

              <div className="mt-8">
                <Field id="additional" label="Anything else we should know?" optional>
                  <textarea id="additional" rows={3} placeholder="Recent travel, changes in routine, what you've already tried..."
                    value={values.additional} onChange={(e) => update("additional", e.target.value)}
                    className={`${inputBase} border-[#173F35]/20 resize-y`} />
                </Field>
              </div>
            </div>
          </Section>

          {/* Submit */}
          <div className="border-t border-[#173F35]/15 pt-10">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <p className="flex max-w-md items-start gap-3 text-sm leading-relaxed text-[#26332E]/70">
                <Icon name="lock" className="mt-0.5 h-4 w-4 shrink-0 text-[#173F35]" />
                This page is a prototype. Your answers stay in memory in this browser tab and are not persisted or sent anywhere until you explicitly generate a plan.
              </p>
              <button
                type="submit"
                disabled={status === "submitting"}
                className={`inline-flex min-w-64 items-center justify-center gap-3 rounded-lg bg-[#173F35] px-7 py-4 text-[15px] font-medium text-[#F5F0E6] transition-colors duration-200 motion-reduce:transition-none hover:bg-[#0F2D25] active:bg-[#0B231C] disabled:cursor-wait disabled:bg-[#173F35]/80 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#C58B61]`}
              >
                {status === "submitting" ? (
                  <>
                    <svg className="h-4 w-4 animate-spin motion-reduce:animate-none" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.3" strokeWidth="3" />
                      <path d="M21 12a9 9 0 00-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                    </svg>
                    Checking your details...
                  </>
                ) : (
                  "Continue to Health Assessment"
                )}
              </button>
            </div>

            <div role="status" aria-live="polite">
              {status === "submitted" && (
                <div className="mt-6 flex gap-3 rounded-lg border border-[#173F35]/20 bg-[#DCEBE2] p-4 text-sm leading-relaxed text-[#173F35]">
                  <Icon name="check" className="mt-0.5 h-5 w-5 shrink-0" />
                  <p>
                    Your details are complete and held in memory for this session. No assessment has been run or sent to the backend yet.
                  </p>
                </div>
              )}
            </div>
          </div>
        </form>

        {/* Safety notice */}
        <aside aria-labelledby="safety-title" className="mt-14 rounded-xl bg-[#173F35] p-6 text-[#F5F0E6] sm:p-8">
          <div className="flex gap-4">
            <Icon name="alert" className="mt-1 h-5 w-5 shrink-0 text-[#C58B61]" />
            <div>
              <h2 id="safety-title" className={`${display.className} text-xl font-normal`}>Please read: this is guidance, not a diagnosis</h2>
              <p className="mt-3 max-w-3xl text-sm leading-relaxed text-[#DCEBE2]/85">
                HealthCare AI provides general health guidance to help you understand your options. It is not a medical diagnosis and does not replace advice from a qualified healthcare professional.
              </p>
              <p className="mt-3 max-w-3xl text-sm leading-relaxed text-[#F5F0E6]">
                If you have severe symptoms or think you may be having a medical emergency, such as chest pain, difficulty breathing, signs of a stroke or heavy bleeding, contact your local emergency number or seek immediate medical attention.
              </p>
              <p className="mt-4 text-sm text-[#DCEBE2]/70">
                Read our <Link href="/privacy" className="underline decoration-[#C58B61] decoration-2 underline-offset-4 hover:text-[#F5F0E6]">Privacy Policy</Link>.
              </p>
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
}
