"use client";

import { useState, type FormEvent } from "react";
import { AlertCircle, Crosshair, Loader2, MapPin, ShieldAlert } from "lucide-react";

export type LocationState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "located"; latitude: number; longitude: number; accuracy: number }
  | { status: "denied" }
  | { status: "unavailable"; message: string }
  | { status: "manual"; query: string };

type LocationPanelProps = {
  location: LocationState;
  onUseMyLocation: () => void;
  onManualLocation: (query: string) => void;
};

export function LocationPanel({ location, onUseMyLocation, onManualLocation }: LocationPanelProps) {
  const [value, setValue] = useState("");
  const [inputError, setInputError] = useState<string | null>(null);
  const loading = location.status === "loading";

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const query = value.trim();
    if (!query) {
      setInputError("Enter a city, area or PIN code.");
      return;
    }
    setInputError(null);
    onManualLocation(query);
  };

  return (
    <section
      aria-labelledby="location-heading"
      className="rounded-md border border-border bg-card p-5 sm:p-6"
    >
      <h2 id="location-heading" className="text-xl tracking-tight">
        Your location
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Share your location or type a city, area or PIN code.
      </p>

      <form onSubmit={submit} noValidate className="mt-5 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <label htmlFor="location-input" className="sr-only">
            City, area or PIN code
          </label>
          <MapPin
            className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <input
            id="location-input"
            type="text"
            inputMode="text"
            autoComplete="address-level2"
            placeholder="City, area or PIN code"
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
              if (inputError) setInputError(null);
            }}
            aria-invalid={inputError ? true : undefined}
            aria-describedby={inputError ? "location-input-error" : undefined}
            className="h-12 w-full rounded-full border border-input bg-background pl-10 pr-4 text-[0.95rem] text-foreground placeholder:text-muted-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          />
        </div>
        <button
          type="submit"
          className="inline-flex h-12 items-center justify-center rounded-full bg-primary px-6 text-[0.95rem] font-medium text-primary-foreground transition-colors hover:bg-forest-deep"
        >
          Search area
        </button>
        <button
          type="button"
          onClick={onUseMyLocation}
          disabled={loading}
          className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-foreground/20 px-5 text-[0.95rem] font-medium text-foreground transition-colors hover:border-primary hover:text-primary disabled:cursor-wait disabled:opacity-70"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          ) : (
            <Crosshair className="h-4 w-4" aria-hidden="true" />
          )}
          {loading ? "Locating…" : "Use My Location"}
        </button>
      </form>

      {inputError && (
        <p id="location-input-error" className="mt-2 text-sm text-destructive">
          {inputError}
        </p>
      )}

      <div aria-live="polite" className="empty:hidden">
        <LocationMessage location={location} />
      </div>
    </section>
  );
}

function LocationMessage({ location }: { location: LocationState }) {
  switch (location.status) {
    case "idle":
      return null;
    case "loading":
      return (
        <p className="mt-4 text-sm text-muted-foreground">
          Waiting for your browser — please allow location access if asked.
        </p>
      );
    case "located":
      return (
        <Note tone="info">
          Location received (approx. {location.latitude.toFixed(3)},{" "}
          {location.longitude.toFixed(3)}). Nearby Geoapify places can now be searched by distance.
        </Note>
      );
    case "manual":
      return (
        <Note tone="info">
          Searching for Geoapify places near “{location.query}”.
        </Note>
      );
    case "denied":
      return (
        <Note tone="error" icon="shield">
          Location permission was denied, so nearby hospitals cannot be sorted by distance. Allow
          location in your browser settings or enter a city, area or PIN code above.
        </Note>
      );
    case "unavailable":
      return <Note tone="error">{location.message}</Note>;
  }
}

function Note({
  tone,
  icon = "alert",
  children,
}: {
  tone: "info" | "error";
  icon?: "alert" | "shield";
  children: React.ReactNode;
}) {
  const Icon = icon === "shield" ? ShieldAlert : AlertCircle;
  return (
    <p
      className={`mt-4 flex gap-2.5 rounded-md px-4 py-3 text-sm leading-relaxed ${
        tone === "error" ? "bg-destructive/10 text-foreground" : "bg-secondary text-secondary-foreground"
      }`}
    >
      <Icon
        className={`mt-0.5 h-4 w-4 shrink-0 ${tone === "error" ? "text-destructive" : "text-primary"}`}
        aria-hidden="true"
      />
      <span>{children}</span>
    </p>
  );
}
