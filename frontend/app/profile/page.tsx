"use client";

import { useMemo, useState, type ChangeEvent, type FormEvent } from "react";
import { Camera, Check, CircleUserRound, Pencil, ShieldCheck, X } from "lucide-react";

import { AppHeader } from "../../components/doctors/AppHeader";

type ProfileValues = {
  fullName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: string;
  photo: string;
};

type ProfileErrors = Partial<
  Record<"fullName" | "email" | "phone" | "dateOfBirth" | "gender" | "photo", string>
>;

const EMPTY_PROFILE: ProfileValues = {
  fullName: "",
  email: "",
  phone: "",
  dateOfBirth: "",
  gender: "",
  photo: "",
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_PATTERN = /^[+()\d\s-]{7,}$/;

function validateProfile(values: ProfileValues): ProfileErrors {
  const errors: ProfileErrors = {};
  if (!values.fullName.trim()) errors.fullName = "Enter your full name.";
  if (!values.email.trim()) errors.email = "Enter your email address.";
  else if (!EMAIL_PATTERN.test(values.email.trim())) errors.email = "Enter a valid email address.";
  if (values.phone.trim() && !PHONE_PATTERN.test(values.phone.trim())) {
    errors.phone = "Enter a valid phone number.";
  }
  if (values.dateOfBirth) {
    const date = new Date(`${values.dateOfBirth}T00:00:00`);
    if (Number.isNaN(date.getTime()) || date > new Date()) {
      errors.dateOfBirth = "Date of birth cannot be in the future.";
    }
  }
  if (!values.gender) errors.gender = "Choose an option or select Prefer not to say.";
  return errors;
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "G";
  return parts
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function displayValue(value: string): string {
  return value.trim() || "Not provided";
}

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} role="alert" className="mt-2 text-sm text-destructive">
      {message}
    </p>
  );
}

const inputClass =
  "mt-2 block w-full rounded-lg border border-input bg-background px-4 py-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-4 focus:ring-primary/10";

export default function ProfilePage() {
  const [savedProfile, setSavedProfile] = useState<ProfileValues>(EMPTY_PROFILE);
  const [draftProfile, setDraftProfile] = useState<ProfileValues>(EMPTY_PROFILE);
  const [editing, setEditing] = useState(false);
  const [errors, setErrors] = useState<ProfileErrors>({});
  const [status, setStatus] = useState<"idle" | "saved">("idle");

  const profile = editing ? draftProfile : savedProfile;
  const avatarLabel = useMemo(() => initials(savedProfile.fullName), [savedProfile.fullName]);

  function update<K extends keyof ProfileValues>(key: K, value: ProfileValues[K]) {
    setDraftProfile((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
    setStatus("idle");
  }

  function startEditing() {
    setDraftProfile(savedProfile);
    setErrors({});
    setStatus("idle");
    setEditing(true);
  }

  function cancelEditing() {
    setDraftProfile(savedProfile);
    setErrors({});
    setStatus("idle");
    setEditing(false);
  }

  function handlePhotoChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setErrors((current) => ({ ...current, photo: "Choose an image file." }));
      return;
    }
    const reader = new FileReader();
    reader.onload = () => update("photo", typeof reader.result === "string" ? reader.result : "");
    reader.readAsDataURL(file);
  }

  function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const found = validateProfile(draftProfile);
    setErrors(found);
    if (Object.keys(found).length) return;
    setSavedProfile(draftProfile);
    setEditing(false);
    setStatus("saved");
  }

  return (
    <div className="min-h-screen bg-background">
      <AppHeader currentHref="/profile" />

      <main className="shell pb-20 pt-10 sm:pt-14">
        <div className="flex flex-col gap-6 border-b border-border pb-8 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-primary">Your account</p>
            <h1 className="mt-4 text-[clamp(2.4rem,5.6vw,4.25rem)] font-normal leading-none tracking-[-0.03em]">
              Profile
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-muted-foreground">
              Keep your personal details organized for a more personal HealthCare AI experience.
            </p>
          </div>
          {!editing && (
            <button
              type="button"
              onClick={startEditing}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-primary px-5 text-sm font-medium text-primary-foreground transition-colors hover:bg-forest-deep"
            >
              <Pencil className="h-4 w-4" aria-hidden="true" />
              Edit Profile
            </button>
          )}
        </div>

        <div className="mt-8 rounded-md border border-teal/40 bg-secondary px-5 py-4 text-sm leading-relaxed text-secondary-foreground">
          <p className="flex items-start gap-3">
            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-teal" aria-hidden="true" />
            <span>
              <strong className="font-semibold">Prototype profile.</strong> Login and signup are not
              connected to a backend yet, so these details are held only in this page session and are
              not permanently saved.
            </span>
          </p>
        </div>

        <form onSubmit={saveProfile} noValidate className="mt-8 grid gap-8 lg:grid-cols-[18rem_1fr]">
          <section className="rounded-md border border-border bg-card p-6 text-center">
            <div className="mx-auto flex h-32 w-32 items-center justify-center overflow-hidden rounded-full bg-secondary text-3xl font-medium text-secondary-foreground">
              {profile.photo ? (
                // The selected image is intentionally kept in memory only.
                // eslint-disable-next-line @next/next/no-img-element
                <img src={profile.photo} alt="Profile preview" className="h-full w-full object-cover" />
              ) : (
                avatarLabel
              )}
            </div>
            <h2 className="mt-5 text-xl font-medium text-foreground">
              {savedProfile.fullName.trim() || "Guest profile"}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {savedProfile.email.trim() || "No account details available"}
            </p>

            {editing && (
              <label className="mt-6 inline-flex cursor-pointer items-center justify-center gap-2 rounded-full border border-foreground/20 px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:border-primary hover:text-primary">
                <Camera className="h-4 w-4" aria-hidden="true" />
                Choose photo
                <input type="file" accept="image/*" onChange={handlePhotoChange} className="sr-only" />
              </label>
            )}
            {editing && <FieldError id="photo-error" message={errors.photo} />}
          </section>

          <section className="rounded-md border border-border bg-card p-6 sm:p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl tracking-tight">Personal information</h2>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  Add details you would like to keep with your profile.
                </p>
              </div>
              {!editing && <CircleUserRound className="h-6 w-6 text-primary" aria-hidden="true" />}
            </div>

            <div className="mt-8 grid gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="full-name" className="text-sm font-medium text-primary">Full name</label>
                {editing ? (
                  <>
                    <input
                      id="full-name"
                      value={draftProfile.fullName}
                      onChange={(event) => update("fullName", event.target.value)}
                      autoComplete="name"
                      className={inputClass}
                    />
                    <FieldError id="full-name-error" message={errors.fullName} />
                  </>
                ) : (
                  <p className="mt-3 text-base">{displayValue(profile.fullName)}</p>
                )}
              </div>

              <div>
                <label htmlFor="email" className="text-sm font-medium text-primary">Email address</label>
                {editing ? (
                  <>
                    <input
                      id="email"
                      type="email"
                      value={draftProfile.email}
                      onChange={(event) => update("email", event.target.value)}
                      autoComplete="email"
                      className={inputClass}
                    />
                    <FieldError id="email-error" message={errors.email} />
                  </>
                ) : (
                  <p className="mt-3 text-base">{displayValue(profile.email)}</p>
                )}
              </div>

              <div>
                <label htmlFor="phone" className="text-sm font-medium text-primary">Phone number</label>
                {editing ? (
                  <>
                    <input
                      id="phone"
                      type="tel"
                      value={draftProfile.phone}
                      onChange={(event) => update("phone", event.target.value)}
                      autoComplete="tel"
                      className={inputClass}
                    />
                    <FieldError id="phone-error" message={errors.phone} />
                  </>
                ) : (
                  <p className="mt-3 text-base">{displayValue(profile.phone)}</p>
                )}
              </div>

              <div>
                <label htmlFor="date-of-birth" className="text-sm font-medium text-primary">Date of birth</label>
                {editing ? (
                  <>
                    <input
                      id="date-of-birth"
                      type="date"
                      value={draftProfile.dateOfBirth}
                      onChange={(event) => update("dateOfBirth", event.target.value)}
                      autoComplete="bday"
                      className={inputClass}
                    />
                    <FieldError id="date-of-birth-error" message={errors.dateOfBirth} />
                  </>
                ) : (
                  <p className="mt-3 text-base">{displayValue(profile.dateOfBirth)}</p>
                )}
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="gender" className="text-sm font-medium text-primary">Gender</label>
                {editing ? (
                  <>
                    <select
                      id="gender"
                      value={draftProfile.gender}
                      onChange={(event) => update("gender", event.target.value)}
                      className={inputClass}
                    >
                      <option value="">Select an option</option>
                      <option value="Female">Female</option>
                      <option value="Male">Male</option>
                      <option value="Non-binary">Non-binary</option>
                      <option value="Another identity">Another identity</option>
                      <option value="Prefer not to say">Prefer not to say</option>
                    </select>
                    <FieldError id="gender-error" message={errors.gender} />
                  </>
                ) : (
                  <p className="mt-3 text-base">{displayValue(profile.gender)}</p>
                )}
              </div>
            </div>

            {editing && (
              <div className="mt-8 flex flex-col-reverse gap-3 border-t border-border pt-6 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={cancelEditing}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-foreground/20 px-5 text-sm font-medium text-foreground transition-colors hover:border-primary hover:text-primary"
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-primary px-5 text-sm font-medium text-primary-foreground transition-colors hover:bg-forest-deep"
                >
                  <Check className="h-4 w-4" aria-hidden="true" />
                  Save Changes
                </button>
              </div>
            )}

            {status === "saved" && !editing && (
              <p role="status" className="mt-6 rounded-md border border-primary/20 bg-sage px-4 py-3 text-sm text-primary">
                Changes updated for this page session. They are not permanently saved yet.
              </p>
            )}
          </section>
        </form>
      </main>
    </div>
  );
}
