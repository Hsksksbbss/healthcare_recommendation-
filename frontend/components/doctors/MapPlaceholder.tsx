type MapPlaceholderProps = {
  /** True once the user has shared their location or typed one in */
  hasLocation: boolean;
};

/**
 * Reserved area for a future map view. The result cards link to the corresponding
 * Google Maps place without rendering unverified map markers here.
 */
export function MapPlaceholder({ hasLocation }: MapPlaceholderProps) {
  return (
    <section
      aria-labelledby="map-heading"
      className="overflow-hidden rounded-md border border-border bg-card"
    >
      <div
        id="doctors-map"
        data-map-container=""
        className="flex aspect-[4/3] flex-col items-center justify-center bg-secondary/70 px-8 text-center"
      >
        <svg viewBox="0 0 120 120" className="h-28 w-28" aria-hidden="true">
          <ellipse cx="60" cy="98" rx="30" ry="7" fill="var(--sage-deep)" opacity="0.45" />
          <ellipse cx="60" cy="98" rx="16" ry="3.5" fill="var(--sage-deep)" opacity="0.7" />
          <path
            d="M60 14c-17.7 0-32 13.9-32 31.2C28 68 60 96 60 96s32-28 32-50.8C92 27.9 77.7 14 60 14Z"
            fill="var(--primary)"
          />
          <circle cx="60" cy="45" r="12" fill="var(--background)" />
          <path d="M57.5 39h5v3.5H66v5h-3.5V51h-5v-3.5H54v-5h3.5Z" fill="var(--teal)" />
        </svg>
        <h2 id="map-heading" className="mt-5 text-2xl tracking-tight">
          Map view coming soon
        </h2>
        <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
          Nearby Google-listed places are shown in the results. Map tiles and markers are not
          displayed yet.
        </p>
      </div>
      <p className="border-t border-border px-5 py-3.5 text-xs text-muted-foreground">
        {hasLocation
          ? "Your location is used to search the nearby results."
          : "Share or enter a location to search nearby results."}
      </p>
    </section>
  );
}
