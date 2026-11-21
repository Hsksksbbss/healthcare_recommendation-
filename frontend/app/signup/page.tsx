"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Fraunces } from "next/font/google";

const display = Fraunces({ subsets: ["latin"], display: "swap" });

type FieldName = "name" | "email" | "password" | "confirm" | "terms";
type FormValues = { name: string; email: string; password: string; confirm: string; terms: boolean };
type FormErrors = Partial<Record<FieldName, string>>;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const REQUIREMENTS: { id: string; label: string; test: (p: string) => boolean }[] = [
  { id: "length", label: "At least 8 characters", test: (p) => p.length >= 8 },
  { id: "case", label: "Upper and lower case letters", test: (p) => /[a-z]/.test(p) && /[A-Z]/.test(p) },
  { id: "number", label: "At least one number", test: (p) => /\d/.test(p) },
];

function validate(v: FormValues): FormErrors {
  const e: FormErrors = {};
  if (!v.name.trim()) e.name = "Enter your full name.";
  if (!v.email.trim()) e.email = "Enter your email address.";
  else if (!EMAIL_PATTERN.test(v.email.trim()))
    e.email = "That email doesn't look right. Check it for typos, like name@example.com.";
  if (!v.password) e.password = "Create a password.";
  else if (!REQUIREMENTS.every((r) => r.test(v.password)))
    e.password = "Your password doesn't meet all the requirements below yet.";
  if (!v.confirm) e.confirm = "Re-enter your password to confirm it.";
  else if (v.confirm !== v.password) e.confirm = "The passwords don't match. Try typing them again.";
  if (!v.terms) e.terms = "Please agree to the Terms and Privacy Policy to continue.";
  return e;
}

function Logo({ light = false }: { light?: boolean }) {
  return (
    <Link href="/" className="inline-flex items-center gap-3 rounded-md focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#C58B61]">
      <span
        className={`flex h-9 w-9 items-center justify-center rounded-full ${
          light ? "bg-[#F5F0E6] text-[#173F35]" : "bg-[#173F35] text-[#F5F0E6]"
        }`}
        aria-hidden="true"
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
          <path d="M12 5v14M5 12h14" />
        </svg>
      </span>
      <span className={`${display.className} text-xl font-medium tracking-tight ${light ? "text-[#F5F0E6]" : "text-[#173F35]"}`}>
        HealthCare AI
      </span>
    </Link>
  );
}

function EyeButton({ shown, onToggle, label }: { shown: boolean; onToggle: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={`${shown ? "Hide" : "Show"} ${label}`}
      aria-pressed={shown}
      className="absolute inset-y-0 right-0 flex w-12 items-center justify-center rounded-r-lg text-[#26332E]/60 transition-colors hover:text-[#173F35] focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[#C58B61]"
    >
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        {shown ? (
          <>
            <path d="M3 3l18 18" />
            <path d="M10.6 6.1A9.8 9.8 0 0112 6c5 0 8.5 4 9.5 6a12 12 0 01-2.6 3.3M6.4 7.6A12.3 12.3 0 002.5 12c1 2 4.5 6 9.5 6 1.5 0 2.8-.4 4-.9" />
            <path d="M9.9 9.9a3 3 0 004.2 4.2" />
          </>
        ) : (
          <>
            <path d="M2.5 12C3.5 10 7 6 12 6s8.5 4 9.5 6c-1 2-4.5 6-9.5 6S3.5 14 2.5 12z" />
            <circle cx="12" cy="12" r="3" />
          </>
        )}
      </svg>
    </button>
  );
}

const inputClass =
  "block w-full rounded-lg border bg-white px-4 py-3 text-[15px] text-[#26332E] placeholder:text-[#26332E]/40 outline-none transition-colors duration-200 motion-reduce:transition-none hover:border-[#173F35]/50 focus:border-[#173F35] focus:ring-4 focus:ring-[#173F35]/10";
const labelClass = "mb-2 block text-sm font-medium text-[#173F35]";
const linkClass =
  "rounded font-medium text-[#173F35] underline decoration-[#C58B61] decoration-2 underline-offset-4 transition-colors hover:text-[#8F5A33] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C58B61]";

export default function SignupPage() {
  const router = useRouter();
  const [values, setValues] = useState<FormValues>({ name: "", email: "", password: "", confirm: "", terms: false });
  const [errors, setErrors] = useState<FormErrors>({});
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirm, setShowConfirm] = useState<boolean>(false);
  const [submitted, setSubmitted] = useState<boolean>(false);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setValues((v) => ({ ...v, [name]: type === "checkbox" ? checked : value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
    setSubmitted(false);
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const found = validate(values);
    setErrors(found);
    if (Object.keys(found).length > 0) {
      setSubmitted(false);
      return;
    }

    // Prototype only: no account is created or stored.
    setSubmitted(true);
    window.setTimeout(() => router.push("/login"), 900);
  };

  const borderFor = (f: FieldName) => (errors[f] ? "border-[#B4452F]" : "border-[#173F35]/20");
  const fieldError = (f: FieldName) =>
    errors[f] ? (
      <p id={`${f}-error`} role="alert" className="mt-2 text-sm text-[#B4452F]">
        {errors[f]}
      </p>
    ) : null;
  const describe = (f: FieldName, extra?: string) =>
    [errors[f] ? `${f}-error` : "", extra ?? ""].filter(Boolean).join(" ") || undefined;

  return (
    <main className="grid min-h-screen bg-[#F5F0E6] text-[#26332E] lg:grid-cols-[1fr_1.05fr]">
      {/* Visual panel */}
      <aside className="relative hidden flex-col justify-between overflow-hidden bg-[#173F35] p-12 text-[#F5F0E6] lg:flex xl:p-16">
        <Logo light />

        <svg
          className="pointer-events-none absolute -left-28 top-1/4 h-[36rem] w-[36rem] text-[#DCEBE2]/10"
          viewBox="0 0 200 200"
          fill="none"
          stroke="currentColor"
          strokeWidth="0.6"
          aria-hidden="true"
        >
          {[92, 76, 60, 44, 28].map((r) => (
            <circle key={r} cx="100" cy="100" r={r} />
          ))}
          <path d="M100 8v184M8 100h184" />
        </svg>

        <div className="relative max-w-lg">
          <h2 className={`${display.className} text-4xl font-light leading-[1.15] tracking-tight xl:text-5xl`}>
            Understand your health, in your own words.
          </h2>
          <ul className="mt-10 space-y-6 text-[#DCEBE2]/85">
            {[
              ["Bring it all together", "Keep your records, reports and questions in one calm, organised place."],
              ["Get clear explanations", "Ask in plain language and receive answers you can take to your doctor."],
              ["Stay in control", "You choose what is stored and who sees it. Delete it any time."],
            ].map(([title, text]) => (
              <li key={title} className="flex gap-4 border-t border-[#DCEBE2]/20 pt-5">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#C58B61]" />
                <span>
                  <span className={`${display.className} block text-lg text-[#F5F0E6]`}>{title}</span>
                  <span className="mt-1 block text-sm leading-relaxed">{text}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-xs text-[#DCEBE2]/60">
          HealthCare AI offers information and support. It does not replace professional medical advice.
        </p>
      </aside>

      {/* Form panel */}
      <section className="flex flex-col px-6 py-8 sm:px-12 lg:px-16 xl:px-24">
        <div className="lg:hidden">
          <Logo />
        </div>

        <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-10">
          <h1 className={`${display.className} text-4xl font-normal tracking-tight text-[#173F35] sm:text-5xl`}>
            Start your health journey.
          </h1>
          <p className="mt-3 text-base leading-relaxed text-[#26332E]/75">
            Create a free account to organise your health information and get clear, AI-assisted guidance.
          </p>

          <form onSubmit={handleSubmit} noValidate className="mt-9 space-y-5">
            <div>
              <label htmlFor="name" className={labelClass}>Full name</label>
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                placeholder="Your full name"
                value={values.name}
                onChange={handleChange}
                aria-invalid={Boolean(errors.name)}
                aria-describedby={describe("name")}
                className={`${inputClass} ${borderFor("name")}`}
              />
              {fieldError("name")}
            </div>

            <div>
              <label htmlFor="email" className={labelClass}>Email address</label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                inputMode="email"
                placeholder="name@example.com"
                value={values.email}
                onChange={handleChange}
                aria-invalid={Boolean(errors.email)}
                aria-describedby={describe("email")}
                className={`${inputClass} ${borderFor("email")}`}
              />
              {fieldError("email")}
            </div>

            <div>
              <label htmlFor="password" className={labelClass}>Password</label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="Create a password"
                  value={values.password}
                  onChange={handleChange}
                  aria-invalid={Boolean(errors.password)}
                  aria-describedby={describe("password", "password-rules")}
                  className={`${inputClass} ${borderFor("password")} pr-12`}
                />
                <EyeButton shown={showPassword} onToggle={() => setShowPassword((s) => !s)} label="password" />
              </div>
              {fieldError("password")}
              <ul id="password-rules" className="mt-3 grid gap-1.5 text-[13px] sm:grid-cols-2">
                {REQUIREMENTS.map((r) => {
                  const met = r.test(values.password);
                  return (
                    <li key={r.id} className={`flex items-center gap-2 transition-colors duration-200 ${met ? "text-[#173F35]" : "text-[#26332E]/60"}`}>
                      <span
                        className={`flex h-4 w-4 items-center justify-center rounded-full border transition-colors duration-200 ${
                          met ? "border-[#173F35] bg-[#173F35] text-[#F5F0E6]" : "border-[#26332E]/30"
                        }`}
                        aria-hidden="true"
                      >
                        {met && (
                          <svg viewBox="0 0 12 12" className="h-2.5 w-2.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M2.5 6.5l2.2 2L9.5 3.5" />
                          </svg>
                        )}
                      </span>
                      {r.label}
                      <span className="sr-only">{met ? " (met)" : " (not met yet)"}</span>
                    </li>
                  );
                })}
              </ul>
            </div>

            <div>
              <label htmlFor="confirm" className={labelClass}>Confirm password</label>
              <div className="relative">
                <input
                  id="confirm"
                  name="confirm"
                  type={showConfirm ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="Re-enter your password"
                  value={values.confirm}
                  onChange={handleChange}
                  aria-invalid={Boolean(errors.confirm)}
                  aria-describedby={describe("confirm")}
                  className={`${inputClass} ${borderFor("confirm")} pr-12`}
                />
                <EyeButton shown={showConfirm} onToggle={() => setShowConfirm((s) => !s)} label="confirmation password" />
              </div>
              {fieldError("confirm")}
            </div>

            <div>
              <label htmlFor="terms" className="flex cursor-pointer items-start gap-3 text-sm leading-relaxed text-[#26332E]/85">
                <input
                  id="terms"
                  name="terms"
                  type="checkbox"
                  checked={values.terms}
                  onChange={handleChange}
                  aria-invalid={Boolean(errors.terms)}
                  aria-describedby={describe("terms")}
                  className="mt-1 h-4 w-4 shrink-0 cursor-pointer rounded border-[#173F35]/40 accent-[#173F35] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C58B61]"
                />
                <span>
                  I agree to the{" "}
                  <Link href="/terms" className={linkClass}>Terms of Service</Link> and{" "}
                  <Link href="/privacy" className={linkClass}>Privacy Policy</Link>.
                </span>
              </label>
              {fieldError("terms")}
            </div>

            <button
              type="submit"
              className="w-full rounded-lg bg-[#173F35] px-5 py-3.5 text-[15px] font-medium text-[#F5F0E6] transition-colors duration-200 motion-reduce:transition-none hover:bg-[#0F2D25] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#C58B61] active:bg-[#0B231C]"
            >
              Create account
            </button>

            {submitted && (
              <p role="status" className="rounded-lg border border-[#173F35]/20 bg-[#DCEBE2] px-4 py-3 text-sm text-[#173F35]">
                Your details look good. Account creation will be connected to the secure backend soon.
              </p>
            )}
          </form>

          <p className="mt-7 text-sm text-[#26332E]/80">
            Already have an account?{" "}
            <Link href="/login" className={linkClass}>Sign in</Link>
          </p>

          <p className="mt-8 flex items-start gap-3 border-t border-[#173F35]/15 pt-5 text-xs leading-relaxed text-[#26332E]/70">
            <svg viewBox="0 0 24 24" className="mt-0.5 h-4 w-4 shrink-0 text-[#173F35]" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect x="5" y="11" width="14" height="9" rx="2" />
              <path d="M8 11V8a4 4 0 018 0v3" />
            </svg>
            Your health information is private and encrypted. We never sell your data.
          </p>
        </div>
      </section>
    </main>
  );
}
