import { ArrowRight, Check } from "lucide-react";

import type { GuideCategory } from "./health-guide-data";
import { CATEGORY_TONES } from "./tones";

type GuideCategoryCardProps = {
  category: GuideCategory;
  topicCount: number;
  selected: boolean;
  onSelect: () => void;
};

export function GuideCategoryCard({ category, topicCount, selected, onSelect }: GuideCategoryCardProps) {
  const Icon = category.icon;
  const tone = CATEGORY_TONES[category.id];

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={`group relative flex h-full w-full flex-col rounded-lg p-6 text-left transition-[box-shadow,transform] duration-300 hover:-translate-y-1 hover:shadow-[0_24px_48px_-28px_oklch(0.29_0.05_160/0.5)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring motion-reduce:hover:translate-y-0 sm:p-7 ${tone.card} ${
        selected ? "ring-2 ring-primary ring-offset-2 ring-offset-background" : ""
      }`}
    >
      <span className="flex items-start justify-between gap-4">
        <span className={`flex h-12 w-12 items-center justify-center rounded-full ${tone.iconWrap}`}>
          <Icon className="h-5 w-5" aria-hidden="true" strokeWidth={1.7} />
        </span>
        <span className="font-display text-3xl font-light italic leading-none opacity-60">
          {category.letter}
        </span>
      </span>

      <span className="mt-8 block font-display text-[1.45rem] leading-[1.12] tracking-[-0.01em]">
        {category.title}
      </span>
      <span className={`mt-2.5 block text-[0.95rem] leading-relaxed ${tone.muted}`}>
        {category.description}
      </span>

      <span className="mt-auto flex items-center justify-between gap-3 pt-7 text-sm font-medium">
        <span>
          {topicCount} {topicCount === 1 ? "topic" : "topics"}
        </span>
        <span className="inline-flex items-center gap-1.5">
          {selected ? (
            <>
              <Check className="h-4 w-4" aria-hidden="true" />
              Showing
            </>
          ) : (
            <>
              Browse
              <ArrowRight
                className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5"
                aria-hidden="true"
              />
            </>
          )}
        </span>
      </span>
    </button>
  );
}
