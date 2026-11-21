"use client";

import { useMemo, useState, type ReactNode } from "react";
import { AlertTriangle, ChevronDown, RefreshCw, Search, SearchX, Stethoscope } from "lucide-react";

import { useHealthSession, type HealthAssessment } from "../health/HealthAssessmentContext";
import { HealthOptionNav } from "../health-options/HealthOptionNav";
import { AppHeader } from "./AppHeader";
import { AIRecommendation } from "./AIRecommendation";
import { DoctorCard, DoctorCardSkeleton } from "./DoctorCard";
import { LocationPanel, type LocationState } from "./LocationPanel";
import { MapPlaceholder } from "./MapPlaceholder";
import {
  DEFAULT_FILTERS,
  DISTANCE_OPTIONS,
  RATING_OPTIONS,
  SORT_OPTIONS,
  SPECIALTIES,
  filterDoctors,
  isDefaultFilters,
  type DoctorFilters,
  type DoctorListing,
  type SortOption,
} from "./demo-doctors";

type DoctorsPageProps = {
  /** Specialty suggested by the AI health assessment. Null until the backend provides one. */
  recommendedSpecialty?: string | null;
};

type PlaceApiResult = {
  id: string;
  name: string;
  address?: string | null;
  rating?: number | null;
  user_rating_count?: number | null;
  phone_number?: string | null;
  distance_meters?: number | null;
  latitude?: number | null;
  longitude?: number | null;
  google_maps_uri?: string | null;
  specialty?: string | null;
  relevance_group?: number | null;
  facility_type?: "hospital" | "clinic" | "doctor" | "other";
  facility_priority?: number | null;
};

type PlacesResponse = {
  results: PlaceApiResult[];
  specialty?: string | null;
  no_exact_match?: boolean;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function assessmentRequest(assessment: HealthAssessment) {
  return {
    age: assessment.age,
    gender: assessment.gender,
    height: assessment.height ?? null,
    weight: assessment.weight ?? null,
    existing_medical_conditions: assessment.existingMedicalConditions ?? null,
    allergies: assessment.allergies ?? null,
    current_medications: assessment.currentMedications ?? null,
    health_concern: assessment.healthConcern,
    symptom_duration: assessment.symptomDuration,
    severity: assessment.severity,
    additional: assessment.additional ?? null,
  };
}

function readError(body: unknown, fallback: string): string {
  if (isRecord(body) && typeof body.detail === "string") return body.detail;
  return fallback;
}

function isPlacesResponse(value: unknown): value is PlacesResponse {
  if (!isRecord(value) || !Array.isArray(value.results)) return false;
  return value.results.every(
    (place) =>
      isRecord(place) &&
      typeof place.id === "string" &&
      typeof place.name === "string",
  );
}

function distanceBetween(
  first: { latitude: number; longitude: number },
  second: { latitude: number; longitude: number },
): number {
  const earthRadiusKm = 6371;
  const latitudeDelta = ((second.latitude - first.latitude) * Math.PI) / 180;
  const longitudeDelta = ((second.longitude - first.longitude) * Math.PI) / 180;
  const firstLatitude = (first.latitude * Math.PI) / 180;
  const secondLatitude = (second.latitude * Math.PI) / 180;
  const haversine =
    Math.sin(latitudeDelta / 2) ** 2 +
    Math.sin(longitudeDelta / 2) ** 2 * Math.cos(firstLatitude) * Math.cos(secondLatitude);
  return 2 * earthRadiusKm * Math.asin(Math.sqrt(haversine));
}

function toDoctorListing(
  place: PlaceApiResult,
  specialty: string | null,
  origin: { latitude: number; longitude: number } | null,
): DoctorListing {
  const straightLineDistance =
    origin &&
    typeof place.latitude === "number" &&
    typeof place.longitude === "number"
      ? distanceBetween(origin, {
          latitude: place.latitude,
          longitude: place.longitude,
        })
      : null;
  const geoapifyDistance =
    typeof place.distance_meters === "number" && place.distance_meters >= 0
      ? place.distance_meters / 1000
      : null;

  return {
    id: place.id,
    name: place.name,
    specialty: place.specialty ?? specialty,
    address: place.address ?? null,
    rating: place.rating ?? null,
    reviewCount: place.user_rating_count ?? null,
    distanceKm: geoapifyDistance ?? straightLineDistance,
    phoneNumber: place.phone_number ?? null,
    googleMapsUri: place.google_maps_uri ?? null,
    facilityType: place.facility_type ?? "other",
    facilityPriority: place.facility_priority ?? 3,
  };
}

export function DoctorsPage({ recommendedSpecialty = null }: DoctorsPageProps) {
  const {
    assessment,
    doctorResults,
    setDoctorResults,
    recommendedSpecialty: storedSpecialty,
    setRecommendedSpecialty,
  } = useHealthSession();
  const initialSpecialty = storedSpecialty ?? recommendedSpecialty;
  const [filters, setFilters] = useState<DoctorFilters>(() =>
    initialSpecialty ? { ...DEFAULT_FILTERS, specialty: initialSpecialty } : DEFAULT_FILTERS,
  );
  const [location, setLocation] = useState<LocationState>({ status: "idle" });
  const [suggestedSpecialty, setSuggestedSpecialty] = useState<string | null>(initialSpecialty);
  const [doctors, setDoctors] = useState<DoctorListing[]>(() => doctorResults);
  const [searchStatus, setSearchStatus] = useState<ResultsStatus>(() =>
    doctorResults.length > 0 ? "ready" : "idle",
  );
  const [searchError, setSearchError] = useState<string>("");
  const [noExactMatch, setNoExactMatch] = useState(false);
  const hasLocation = location.status === "located" || location.status === "manual";

  const results = useMemo(() => filterDoctors(doctors, filters), [doctors, filters]);

  const update = (patch: Partial<DoctorFilters>) => {
    setFilters((f) => ({ ...f, ...patch }));
    if (patch.specialty !== undefined && hasLocation) {
      void searchPlaces(location, patch.specialty);
    }
  };

  const clearFilters = () => {
    setFilters(DEFAULT_FILTERS);
    if (hasLocation) void searchPlaces(location, "all");
  };

  const requestLocation = () => {
    if (typeof navigator === "undefined" || !("geolocation" in navigator)) {
      setLocation({
        status: "unavailable",
        message:
          "Your browser does not support location sharing. Enter a city, area or PIN code instead.",
      });
      return;
    }
    setLocation({ status: "loading" });
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        handleLocation({
          status: "located",
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
        }),
      (err) => {
        if (err.code === err.PERMISSION_DENIED) {
          setLocation({ status: "denied" });
        } else {
          setLocation({
            status: "unavailable",
            message:
              err.code === err.TIMEOUT
                ? "Finding your location took too long. Try again, or enter a city, area or PIN code."
                : "Your location could not be determined right now. Try again, or enter a city, area or PIN code.",
          });
        }
      },
      { enableHighAccuracy: false, timeout: 15000, maximumAge: 300000 },
    );
  };

  async function getRecommendedSpecialty(): Promise<string | null> {
    if (suggestedSpecialty) return suggestedSpecialty;
    if (!assessment) return null;

    const response = await fetch("http://127.0.0.1:8000/api/health/recommend-specialty", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(assessmentRequest(assessment)),
    });
    const body: unknown = await response.json().catch(() => null);
    if (!response.ok) throw new Error(readError(body, "We could not get specialty guidance."));
    if (!isRecord(body) || typeof body.recommended_specialty !== "string") {
      throw new Error("The specialty guidance response was not usable.");
    }
    setSuggestedSpecialty(body.recommended_specialty);
    setRecommendedSpecialty(body.recommended_specialty);
    return body.recommended_specialty;
  }

  async function searchPlaces(nextLocation: LocationState, selectedSpecialty = filters.specialty) {
    if (nextLocation.status !== "located" && nextLocation.status !== "manual") return;
    setSearchStatus("loading");
    setSearchError("");

    try {
      const specialty =
        selectedSpecialty !== "all" ? selectedSpecialty : await getRecommendedSpecialty();
      const requestBody = {
        ...(nextLocation.status === "located"
          ? { latitude: nextLocation.latitude, longitude: nextLocation.longitude }
          : { location_query: nextLocation.query }),
        specialty,
        health_concern: assessment?.healthConcern ?? null,
      };
      const response = await fetch("http://127.0.0.1:8000/api/places/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });
      const body: unknown = await response.json().catch(() => null);
      if (!response.ok) throw new Error(readError(body, "Nearby places could not be loaded."));
      if (!isPlacesResponse(body)) throw new Error("The places service returned an unexpected response.");

      const origin =
        nextLocation.status === "located"
          ? { latitude: nextLocation.latitude, longitude: nextLocation.longitude }
          : null;
      const nextDoctors = body.results.map((place) => toDoctorListing(place, specialty, origin));
      const sortedDoctors = [...nextDoctors].sort((a, b) => {
        const categoryDifference =
          (a.facilityPriority ?? 3) - (b.facilityPriority ?? 3);
        if (categoryDifference !== 0) return categoryDifference;
        return (
          (a.distanceKm ?? Number.POSITIVE_INFINITY) -
          (b.distanceKm ?? Number.POSITIVE_INFINITY)
        );
      });
      setDoctors(sortedDoctors);
      setDoctorResults(sortedDoctors);
      setNoExactMatch(body.no_exact_match === true);
      setSearchStatus("ready");
    } catch (error) {
      setDoctors([]);
      setDoctorResults([]);
      setNoExactMatch(false);
      setSearchError(error instanceof Error ? error.message : "Nearby places could not be loaded.");
      setSearchStatus("error");
    }
  }

  function handleLocation(nextLocation: LocationState) {
    setLocation(nextLocation);
    if (nextLocation.status === "located" || nextLocation.status === "manual") {
      setFilters((current) => ({ ...current, sort: "nearest" }));
    }
    void searchPlaces(nextLocation);
  }

  return (
    <div className="min-h-screen bg-background">
      <AppHeader currentHref="/doctors" />
      <HealthOptionNav current="doctors" />

      <main id="main">
        <section aria-labelledby="doctors-heading" className="shell pb-8 pt-10 sm:pt-14">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-primary">
            Find Doctors
          </p>
          <h1
            id="doctors-heading"
            className="mt-4 max-w-3xl text-[clamp(2.4rem,5.6vw,4.25rem)] font-normal leading-[1] tracking-[-0.03em]"
          >
            Find the Right Doctor <em className="text-primary">Near You</em>
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-muted-foreground">
            Find nearby doctors and clinics based on your healthcare needs — search by name,
            specialty or clinic and narrow results by distance and rating.
          </p>
          <p className="mt-6 inline-flex items-center gap-2.5 rounded-full bg-secondary px-4 py-2 text-sm text-secondary-foreground">
            <Stethoscope className="h-4 w-4" aria-hidden="true" />
            {suggestedSpecialty ? (
              <span>
                Recommended specialty: <strong className="font-semibold">{suggestedSpecialty}</strong>
              </span>
            ) : (
              <span className="font-medium">Explore Doctors Near You</span>
            )}
          </p>
        </section>

        <div className="shell">
          <aside
            aria-label="Emergency notice"
            className="flex gap-3 border-l-2 border-destructive bg-destructive/5 px-5 py-4"
          >
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" aria-hidden="true" />
            <p className="text-sm leading-relaxed text-foreground">
              <strong className="font-semibold">In an emergency, don&apos;t wait for an appointment.</strong>{" "}
              If you have severe or life-threatening symptoms — such as chest pain, difficulty
              breathing, sudden weakness or heavy bleeding — contact your local emergency services
              immediately.
            </p>
          </aside>
        </div>

        <div className="shell mt-8 space-y-6">
          <LocationPanel
            location={location}
            onUseMyLocation={requestLocation}
            onManualLocation={(query) => handleLocation({ status: "manual", query })}
          />
          <FiltersBar filters={filters} onChange={update} onClear={clearFilters} />
        </div>

        <div className="shell mt-10 grid gap-10 pb-20 lg:grid-cols-12 lg:gap-8">
          <section aria-labelledby="results-heading" className="lg:col-span-7">
            <DoctorResults
              status={searchStatus}
              doctors={results}
              noExactMatch={noExactMatch}
              onClear={clearFilters}
              onRetry={() => void searchPlaces(location)}
              errorMessage={searchError}
            />
          </section>

          <div className="space-y-6 lg:col-span-5">
            <div className="space-y-6 lg:sticky lg:top-24">
              <MapPlaceholder hasLocation={hasLocation} />
              <AIRecommendation
                recommendedSpecialty={suggestedSpecialty}
                onApplySpecialty={(specialty) => update({ specialty })}
              />
            </div>
          </div>
        </div>

        <section aria-label="Medical disclaimer" className="border-t border-border bg-sand/50">
          <div className="shell py-10">
            <p className="max-w-3xl text-sm leading-relaxed text-foreground/85">
              <strong className="font-semibold">Medical disclaimer.</strong> HealthCare AI helps you
              explore healthcare options. It does not replace professional medical advice, diagnosis
              or treatment. Always consult a qualified healthcare professional about your symptoms.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}

function FiltersBar({
  filters,
  onChange,
  onClear,
}: {
  filters: DoctorFilters;
  onChange: (patch: Partial<DoctorFilters>) => void;
  onClear: () => void;
}) {
  return (
    <section
      aria-labelledby="filters-heading"
      className="rounded-md border border-border bg-card p-5 sm:p-6"
    >
      <div className="flex items-center justify-between gap-4">
        <h2 id="filters-heading" className="text-xl tracking-tight">
          Search & filters
        </h2>
        <button
          type="button"
          onClick={onClear}
          disabled={isDefaultFilters(filters)}
          className="inline-flex h-9 items-center gap-1.5 rounded-full px-3 text-sm font-medium text-primary transition-colors hover:bg-secondary disabled:cursor-not-allowed disabled:text-muted-foreground disabled:hover:bg-transparent"
        >
          <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
          Clear filters
        </button>
      </div>

      <div className="relative mt-5">
        <label htmlFor="doctor-search" className="sr-only">
          Search by doctor name, clinic or specialty
        </label>
        <Search
          className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
        <input
          id="doctor-search"
          type="search"
          placeholder="Search doctor, clinic or specialty"
          value={filters.query}
          onChange={(e) => onChange({ query: e.target.value })}
          className="h-12 w-full rounded-full border border-input bg-background pl-10 pr-4 text-[0.95rem] text-foreground placeholder:text-muted-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        />
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <FilterSelect
          id="filter-specialty"
          label="Specialty"
          value={filters.specialty}
          onChange={(v) => onChange({ specialty: v })}
        >
          <option value="all">All specialties</option>
          {SPECIALTIES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </FilterSelect>
        <FilterSelect
          id="filter-distance"
          label="Distance"
          value={filters.maxDistanceKm === null ? "any" : String(filters.maxDistanceKm)}
          onChange={(v) => onChange({ maxDistanceKm: v === "any" ? null : Number(v) })}
        >
          <option value="any">Any distance</option>
          {DISTANCE_OPTIONS.map((d) => (
            <option key={d} value={d}>
              Within {d} km
            </option>
          ))}
        </FilterSelect>
        <FilterSelect
          id="filter-rating"
          label="Rating"
          value={String(filters.minRating)}
          onChange={(v) => onChange({ minRating: Number(v) })}
        >
          {RATING_OPTIONS.map((r) => (
            <option key={r.value} value={r.value}>
              {r.label}
            </option>
          ))}
        </FilterSelect>
        <FilterSelect
          id="filter-sort"
          label="Sort by"
          value={filters.sort}
          onChange={(v) => onChange({ sort: v as SortOption })}
        >
          {SORT_OPTIONS.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </FilterSelect>
      </div>
    </section>
  );
}

function FilterSelect({
  id,
  label,
  value,
  onChange,
  children,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={id}
        className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground"
      >
        {label}
      </label>
      <div className="relative">
        <select
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-11 w-full appearance-none rounded-md border border-input bg-background pl-3.5 pr-9 text-sm text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          {children}
        </select>
        <ChevronDown
          className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
      </div>
    </div>
  );
}

type ResultsStatus = "idle" | "loading" | "error" | "ready";

function DoctorResults({
  status,
  doctors,
  noExactMatch,
  onClear,
  onRetry,
  errorMessage,
}: {
  status: ResultsStatus;
  doctors: DoctorListing[];
  noExactMatch: boolean;
  onClear: () => void;
  onRetry?: (() => void) | undefined;
  errorMessage: string;
}) {
  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-3 border-b border-border pb-4">
        <div>
          <h2 id="results-heading" className="text-2xl tracking-tight">
            Doctors & clinics
          </h2>
          <p className="mt-1 text-sm text-muted-foreground" aria-live="polite">
            {status === "ready"
              ? `${doctors.length} Geoapify-listed ${doctors.length === 1 ? "place" : "places"}`
              : status === "loading"
                ? "Updating…"
                : status === "idle"
                  ? "Share or enter a location to search"
                : "Results unavailable"}
          </p>
        </div>
      </div>
      <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
        Results come from Geoapify. A map listing does not verify a provider&apos;s medical
        credentials, qualifications or availability.
      </p>
      {status === "ready" && noExactMatch && doctors.length > 0 && (
        <p className="mt-3 text-sm font-medium text-primary" role="status">
          No exact specialty match was found. Showing nearby general hospitals and general
          healthcare providers as alternatives.
        </p>
      )}

      <div className="mt-6">
        {status === "loading" && (
          <div className="space-y-4" role="status" aria-label="Loading results">
            <DoctorCardSkeleton />
            <DoctorCardSkeleton />
            <DoctorCardSkeleton />
          </div>
        )}

        {status === "error" && (
          <StateMessage
            icon={<AlertTriangle className="h-6 w-6 text-destructive" aria-hidden="true" />}
            title="We couldn't load doctors right now"
            body={errorMessage || "Please check your connection and try again."}
            action={onRetry ? { label: "Try again", onClick: onRetry } : undefined}
          />
        )}

        {status === "idle" && (
          <StateMessage
            icon={<SearchX className="h-6 w-6 text-muted-foreground" aria-hidden="true" />}
            title="Search for nearby places"
            body="Share your location or enter a city, area or PIN code to find Geoapify-listed doctors, clinics and hospitals."
          />
        )}

        {status === "ready" && doctors.length === 0 && (
          <StateMessage
            icon={<SearchX className="h-6 w-6 text-muted-foreground" aria-hidden="true" />}
            title="No nearby places found"
            body="Try a broader area, another specialty or different filters."
            action={{ label: "Clear filters", onClick: onClear }}
          />
        )}

        {status === "ready" && doctors.length > 0 && (
          <div className="space-y-8">
            {([
              ["hospital", "Nearby Hospitals"],
              ["clinic", "Nearby Clinics"],
              ["doctor", "Nearby Doctors"],
            ] as const).map(([facilityType, title]) => {
              const sectionDoctors = doctors.filter(
                (doctor) => doctor.facilityType === facilityType,
              );
              return (
                <section key={facilityType} aria-labelledby={`${facilityType}-results-heading`}>
                  <h3
                    id={`${facilityType}-results-heading`}
                    className="border-b border-border pb-3 text-lg font-medium"
                  >
                    {title}{" "}
                    <span className="text-sm font-normal text-muted-foreground">
                      ({sectionDoctors.length})
                    </span>
                  </h3>
                  {sectionDoctors.length > 0 ? (
                    <ul className="mt-4 space-y-4">
                      {sectionDoctors.map((doctor) => (
                        <li key={doctor.id}>
                          <DoctorCard doctor={doctor} />
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="mt-3 text-sm text-muted-foreground">
                      No nearby {facilityType === "doctor" ? "doctors" : `${facilityType}s`} found.
                    </p>
                  )}
                </section>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}

function StateMessage({
  icon,
  title,
  body,
  action,
}: {
  icon: ReactNode;
  title: string;
  body: string;
  action?: { label: string; onClick: () => void } | undefined;
}) {
  return (
    <div className="flex flex-col items-center rounded-md border border-dashed border-border px-6 py-14 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">{icon}</span>
      <h3 className="mt-4 text-xl tracking-tight">{title}</h3>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">{body}</p>
      {action && (
        <button
          type="button"
          onClick={action.onClick}
          className="mt-6 inline-flex h-10 items-center rounded-full bg-primary px-5 text-sm font-medium text-primary-foreground transition-colors hover:bg-forest-deep"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
