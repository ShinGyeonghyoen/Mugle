import { chipOptions } from "../data/chips";
import type { ChipId } from "../types";

interface ChipSelectorProps {
  selectedChips: ChipId[];
  onToggle: (chipId: ChipId) => void;
}

export function ChipSelector({ selectedChips, onToggle }: ChipSelectorProps) {
  return (
    <section className="chips" aria-label="점심 조건">
      {chipOptions.map((chip) => {
        const isSelected = selectedChips.includes(chip.id);
        return (
          <button
            key={chip.id}
            type="button"
            className={`chip ${isSelected ? "chip--selected" : ""}`}
            aria-pressed={isSelected}
            onClick={() => onToggle(chip.id)}
          >
            {chip.label}
          </button>
        );
      })}
    </section>
  );
}
