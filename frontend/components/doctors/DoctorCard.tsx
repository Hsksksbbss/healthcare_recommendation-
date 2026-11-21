"use client";

import { useState } from "react";
import { MapPin, Navigation, Phone, Star, UserRound } from "lucide-react";

import type { DoctorListing } from "./demo-doctors";

export function DoctorCard({ doctor }: { doctor: DoctorListing }) {
  const headingId = `${doctor.id}-name`;
  const [directionsError, setDirectionsError] = useState("");

  const openDirections = () => {
    const name = doctor.name.trim();
    const address = doctor.address?.trim();
    if (!name || !address) {
      setDirectionsError("Hospital search is unavailable because this listing has no valid name or address.");
      return;
    }
    setDirectionsError("");
    const query = `distance between my current location and ${name}, ${address}`;
    window.open(
      `https://www.google.com/search?q=${encodeURIComponent(query)}`,
      "_blank",
      "noopener,noreferrer",
    );
  };

  return (
    <article
      aria-labelledby={headingId}
      className="rounded-md border border-border bg-card p-5 transition-colors hover:border-foreground/20 sm:p-6"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex gap-4">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
            <UserRound className="h-5 w-5" aria-hidden="true" />
          </span>
          <div>
            <h3 id={headingId} className="text-xl leading-tight tracking-tight">
              {doctor.name}
            </h3>
            {doctor.specialty && (
              <p className="mt-1 text-sm font-medium text-primary">{doctor.specialty}</p>
            )}
          </div>
        </div>
      </div>

      <dl className="mt-5 grid gap-x-6 gap-y-2.5 text-sm sm:grid-cols-2">
        {doctor.rating !== null && (
          <div className="flex items-center gap-2">
            <dt className="sr-only">Google rating</dt>
            <Star className="h-4 w-4 shrink-0 fill-sand-deep text-sand-deep" aria-hidden="true" />
            <dd>
              <span className="font-medium text-foreground">{doctor.rating.toFixed(1)}</span>{" "}
              {doctor.reviewCount !== null && (
                <span className="text-muted-foreground">({doctor.reviewCount} ratings)</span>
              )}
            </dd>
          </div>
        )}
        {doctor.distanceKm !== null && (
          <div className="flex items-center gap-2">
            <dt className="sr-only">Approximate distance</dt>
            <Navigation className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
            <dd className="text-foreground">{doctor.distanceKm.toFixed(1)} km away</dd>
          </div>
        )}
        {doctor.address && (
          <div className="flex items-start gap-2 sm:col-span-2">
          <dt className="sr-only">Address</dt>
          <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
          <dd className="text-muted-foreground">{doctor.address}</dd>
          </div>
        )}
        {doctor.phoneNumber && (
          <div className="flex items-center gap-2">
            <dt className="sr-only">Phone</dt>
            <Phone className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
            <dd className="text-foreground">{doctor.phoneNumber}</dd>
          </div>
        )}
      </dl>

      <div className="mt-6 flex flex-wrap gap-2.5 border-t border-border pt-5">
        <button
          type="button"
          onClick={openDirections}
          className="inline-flex h-10 items-center gap-2 rounded-full border border-foreground/20 px-4 text-sm font-medium text-foreground transition-colors hover:border-primary hover:text-primary"
        >
          <Navigation className="h-4 w-4" aria-hidden="true" />
          Get Directions
        </button>
        {doctor.phoneNumber && (
          <a
            href={`tel:${doctor.phoneNumber}`}
            className="inline-flex h-10 items-center gap-2 rounded-full border border-foreground/20 px-4 text-sm font-medium text-foreground transition-colors hover:border-primary hover:text-primary"
          >
            <Phone className="h-4 w-4" aria-hidden="true" />
            Call
          </a>
        )}
      </div>
      {directionsError && (
        <p className="mt-3 text-sm text-destructive" role="alert">
          {directionsError}
        </p>
      )}
      <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
        Geoapify-listed place. Listing information is not a verification of medical credentials.
      </p>
    </article>
  );
}

export function DoctorCardSkeleton() {
  return (
    <div aria-hidden="true" className="rounded-md border border-border bg-card p-5 sm:p-6">
      <div className="flex gap-4">
        <div className="h-12 w-12 animate-pulse rounded-full bg-muted" />
        <div className="flex-1 space-y-2.5 pt-1">
          <div className="h-4 w-1/2 animate-pulse rounded-sm bg-muted" />
          <div className="h-3 w-1/3 animate-pulse rounded-sm bg-muted" />
        </div>
      </div>
      <div className="mt-6 space-y-2.5">
        <div className="h-3 w-full animate-pulse rounded-sm bg-muted" />
        <div className="h-3 w-2/3 animate-pulse rounded-sm bg-muted" />
      </div>
      <div className="mt-6 h-10 w-full animate-pulse rounded-full bg-muted" />
    </div>
  );
}
