export const SPECIALTIES = [
  "General Physician",
  "Cardiologist",
  "Dermatologist",
  "Neurologist",
  "Orthopedic",
  "Dentist",
  "Pediatrician",
  "Gynecologist",
  "Psychiatrist",
] as const;

export type Specialty = (typeof SPECIALTIES)[number];

export const DISTANCE_OPTIONS = [5, 10, 25, 50] as const;

export const RATING_OPTIONS = [
  { value: 0, label: "Any rating" },
  { value: 3.5, label: "3.5 and above" },
  { value: 4, label: "4.0 and above" },
  { value: 4.5, label: "4.5 and above" },
] as const;

export const SORT_OPTIONS = [
  { value: "recommended", label: "Recommended" },
  { value: "nearest", label: "Nearest" },
  { value: "rating", label: "Highest Rated" },
] as const;

export type SortOption = (typeof SORT_OPTIONS)[number]["value"];

export type DoctorListing = {
  id: string;
  name: string;
  specialty: string | null;
  address: string | null;
  rating: number | null;
  reviewCount: number | null;
  distanceKm: number | null;
  phoneNumber: string | null;
  googleMapsUri: string | null;
  facilityType: "hospital" | "clinic" | "doctor" | "other";
  facilityPriority: number;
};

export type DoctorFilters = {
  query: string;
  specialty: string | "all";
  maxDistanceKm: number | null;
  minRating: number;
  sort: SortOption;
};

export const DEFAULT_FILTERS: DoctorFilters = {
  query: "",
  specialty: "all",
  maxDistanceKm: null,
  minRating: 0,
  sort: "recommended",
};

/** Search, filter and sort Geoapify-listed places without inventing missing details. */
export function filterDoctors(
  doctors: DoctorListing[],
  filters: DoctorFilters,
): DoctorListing[] {
  const query = filters.query.trim().toLowerCase();

  const matches = doctors.filter((doctor) => {
    if (
      query &&
      ![doctor.name, doctor.specialty ?? "", doctor.address ?? ""].some((field) =>
        field.toLowerCase().includes(query),
      )
    ) {
      return false;
    }
    if (
      filters.specialty !== "all" &&
      doctor.specialty !== filters.specialty
    ) {
      return false;
    }
    if (
      filters.maxDistanceKm !== null &&
      (doctor.distanceKm === null || doctor.distanceKm > filters.maxDistanceKm)
    ) {
      return false;
    }
    if ((doctor.rating ?? 0) < filters.minRating) return false;
    return true;
  });

  if (filters.sort === "nearest") {
    return [...matches].sort(
      (a, b) =>
        (a.facilityPriority - b.facilityPriority) ||
        (a.distanceKm ?? Number.POSITIVE_INFINITY) -
          (b.distanceKm ?? Number.POSITIVE_INFINITY),
    );
  }
  if (filters.sort === "rating") {
    return [...matches].sort(
      (a, b) => (b.rating ?? 0) - (a.rating ?? 0) || (b.reviewCount ?? 0) - (a.reviewCount ?? 0),
    );
  }
  return matches;
}

export function isDefaultFilters(filters: DoctorFilters): boolean {
  return (
    filters.query === DEFAULT_FILTERS.query &&
    filters.specialty === DEFAULT_FILTERS.specialty &&
    filters.maxDistanceKm === DEFAULT_FILTERS.maxDistanceKm &&
    filters.minRating === DEFAULT_FILTERS.minRating &&
    filters.sort === DEFAULT_FILTERS.sort
  );
}
