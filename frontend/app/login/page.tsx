"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Fraunces } from "next/font/google";

const display = Fraunces({ subsets: ["latin"], display: "swap" });

type FormValues = { email: string; password: string; remember: boolean };
type FormErrors = Partial<Record<"email" | "password", string>>;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function validate(values: FormValues): FormErrors {
  const errors: FormErrors = {};
  if (!values.email.trim()) errors.email = "Enter your email address.";
  else if (!EMAIL_PATTERN.test(values.email.trim()))
    errors.email = "That email doesn't look right. Check it for typos, like name@example.com.";
  if (!values.password) errors.password = "Enter your password.";
  return errors;
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

const inputClass =
  "block w-full rounded-lg border bg-white px-4 py-3 text-[15px] text-[#26332E] placeholder:text-[#26332E]/40 outline-none transition-colors duration-200 motion-reduce:transition-none hover:border-[#173F35]/50 focus:border-[#173F35] focus:ring-4 focus:ring-[#173F35]/10";

export default function LoginPage() {
  const router = useRouter();
  const [values, setValues] = useState<FormValues>({ email: "", password: "", remember: false });
  const [errors, setErrors] = useState<FormErrors>({});
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [submitted, setSubmitted] = useState<boolean>(false);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setValues((v) => ({ ...v, [name]: type === "checkbox" ? checked : value }));
    if (name === "email" || name === "password") {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
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

    // Prototype only: no credentials are verified or stored.
    router.push("/dashboard");
  };

  const borderFor = (hasError: boolean) => (hasError ? "border-[#B4452F]" : "border-[#173F35]/20");

  return (
    <main className="grid min-h-screen bg-[#F5F0E6] text-[#26332E] lg:grid-cols-[1.05fr_1fr]">
      {/* Visual panel */}
      <aside className="relative hidden flex-col justify-between overflow-hidden bg-[#173F35] p-12 text-[#F5F0E6] lg:flex xl:p-16">
        <Logo light />

        <svg
          className="pointer-events-none absolute -right-24 top-1/3 h-[34rem] w-[34rem] text-[#DCEBE2]/10"
          viewBox="0 0 200 200"
          fill="none"
          stroke="currentColor"
          strokeWidth="0.6"
          aria-hidden="true"
        >
          {[90, 74, 58, 42, 26].map((r) => (
            <circle key={r} cx="100" cy="100" r={r} />
          ))}
          <path d="M100 10v180M10 100h180" />
        </svg>

        <div className="relative max-w-lg">
          <h2 className={`${display.className} text-4xl font-light leading-[1.15] tracking-tight xl:text-5xl`}>
            Care that remembers where you left off.
          </h2>
          <p className="mt-6 max-w-md text-base leading-relaxed text-[#DCEBE2]/80">
            Your records, questions and care plans are waiting for you, organised and easy to pick up again.
          </p>
        </div>

        <ul className="relative grid gap-4 border-t border-[#DCEBE2]/20 pt-8 text-sm text-[#DCEBE2]/85 xl:grid-cols-2">
          <li className="flex items-start gap-3">
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#C58B61]" />
            Your health data is encrypted in transit and at rest.
          </li>
          <li className="flex items-start gap-3">
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#C58B61]" />
            We never sell your personal information.
          </li>
        </ul>
      </aside>

      {/* Form panel */}
      <section className="flex flex-col px-6 py-8 sm:px-12 lg:px-16 xl:px-24">
        <div className="lg:hidden">
          <Logo />
        </div>

        <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-12">
          <h1 className={`${display.className} text-4xl font-normal tracking-tight text-[#173F35] sm:text-5xl`}>
            Welcome back.
          </h1>
          <p className="mt-3 text-base text-[#26332E]/75">Your health journey continues here.</p>

          <form onSubmit={handleSubmit} noValidate className="mt-10 space-y-6">
            <div>
              <label htmlFor="email" className="mb-2 block text-sm font-medium text-[#173F35]">
                Email address
              </label>
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
                aria-describedby={errors.email ? "email-error" : undefined}
                className={`${inputClass} ${borderFor(Boolean(errors.email))}`}
              />
              {errors.email && (
                <p id="email-error" role="alert" className="mt-2 text-sm text-[#B4452F]">
                  {errors.email}
                </p>
              )}
            </div>

            <div>
              <div className="mb-2 flex items-baseline justify-between">
                <label htmlFor="password" className="text-sm font-medium text-[#173F35]">
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="rounded text-sm text-[#173F35] underline decoration-[#C58B61] decoration-2 underline-offset-4 transition-colors hover:text-[#8F5A33] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C58B61]"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  value={values.password}
                  onChange={handleChange}
                  aria-invalid={Boolean(errors.password)}
                  aria-describedby={errors.password ? "password-error" : undefined}
                  className={`${inputClass} ${borderFor(Boolean(errors.password))} pr-12`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  aria-pressed={showPassword}
                  className="absolute inset-y-0 right-0 flex w-12 items-center justify-center rounded-r-lg text-[#26332E]/60 transition-colors hover:text-[#173F35] focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[#C58B61]"
                >
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    {showPassword ? (
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
              </div>
              {errors.password && (
                <p id="password-error" role="alert" className="mt-2 text-sm text-[#B4452F]">
                  {errors.password}
                </p>
              )}
            </div>

            <label htmlFor="remember" className="flex cursor-pointer items-center gap-3 text-sm text-[#26332E]/85">
              <input
                id="remember"
                name="remember"
                type="checkbox"
                checked={values.remember}
                onChange={handleChange}
                className="h-4 w-4 cursor-pointer rounded border-[#173F35]/40 accent-[#173F35] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C58B61]"
              />
              Keep me signed in on this device
            </label>

            <button
              type="submit"
              className="w-full rounded-lg bg-[#173F35] px-5 py-3.5 text-[15px] font-medium text-[#F5F0E6] transition-colors duration-200 motion-reduce:transition-none hover:bg-[#0F2D25] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#C58B61] active:bg-[#0B231C]"
            >
              Sign in
            </button>

            {submitted && (
              <p role="status" className="rounded-lg border border-[#173F35]/20 bg-[#DCEBE2] px-4 py-3 text-sm text-[#173F35]">
                Your details look good. Sign-in will be connected to the secure backend soon.
              </p>
            )}
          </form>

          <p className="mt-8 text-sm text-[#26332E]/80">
            New to HealthCare AI?{" "}
            <Link
              href="/signup"
              className="rounded font-medium text-[#173F35] underline decoration-[#C58B61] decoration-2 underline-offset-4 transition-colors hover:text-[#8F5A33] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C58B61]"
            >
              Create an account
            </Link>
          </p>

          <p className="mt-10 flex items-start gap-3 border-t border-[#173F35]/15 pt-6 text-xs leading-relaxed text-[#26332E]/70">
            <svg viewBox="0 0 24 24" className="mt-0.5 h-4 w-4 shrink-0 text-[#173F35]" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect x="5" y="11" width="14" height="9" rx="2" />
              <path d="M8 11V8a4 4 0 018 0v3" />
            </svg>
            Your health information is private. It is encrypted and only you decide who can see it.
          </p>
        </div>
      </section>
    </main>
  );
}
