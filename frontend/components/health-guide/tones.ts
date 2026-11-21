import type { GuideCategoryId } from "./health-guide-data";

/** Colour treatment per category, shared by the category cards and article tags. */
export const CATEGORY_TONES: Record<
  GuideCategoryId,
  { card: string; muted: string; iconWrap: string; tag: string }
> = {
  conditions: {
    card: "bg-secondary text-secondary-foreground",
    muted: "text-secondary-foreground/75",
    iconWrap: "bg-background/70 text-primary",
    tag: "bg-secondary text-secondary-foreground",
  },
  lifestyle: {
    card: "bg-sand text-foreground",
    muted: "text-foreground/70",
    iconWrap: "bg-background/70 text-sand-deep",
    tag: "bg-sand text-foreground",
  },
  "first-aid": {
    card: "bg-teal-soft text-foreground",
    muted: "text-foreground/70",
    iconWrap: "bg-background/70 text-accent",
    tag: "bg-teal-soft text-foreground",
  },
  "see-doctor": {
    card: "bg-forest-deep text-forest-foreground",
    muted: "text-forest-muted",
    iconWrap: "bg-forest-line text-forest-foreground",
    tag: "bg-primary text-primary-foreground",
  },
};
