import { menus } from "../data/menus";
import type { ChipId, Menu } from "../types";

interface RecommendOptions {
  previousMenuId?: number;
  recentMenuIds?: number[];
}

export function recommendMenu(selectedChips: ChipId[], options: RecommendOptions = {}): Menu {
  const effectiveChips = selectedChips.includes("anything") ? [] : selectedChips;
  const scored = menus.map((menu) => ({
    menu,
    score: scoreMenu(menu, effectiveChips, options)
  }));

  const bestScore = Math.max(...scored.map((item) => item.score));
  let topTier = scored.filter((item) => item.score >= bestScore - 1);

  if (topTier.every((item) => options.recentMenuIds?.includes(item.menu.id))) {
    topTier = scored.filter((item) => item.menu.id !== options.previousMenuId);
  }

  return randomItem(topTier).menu;
}

function scoreMenu(menu: Menu, chips: ChipId[], options: RecommendOptions): number {
  let score = 1;

  for (const chip of chips) {
    if (menu.tags.includes(chip)) score += 3;
  }

  if (chips.includes("safe")) score += menu.reliability;
  if (chips.includes("new")) score += menu.novelty;
  if (chips.includes("under1000") && menu.priceYen <= 1000) score += 2;
  if (menu.id === options.previousMenuId) score -= 8;
  if (options.recentMenuIds?.includes(menu.id)) score -= 5;

  return score + Math.random() * 1.6;
}

function randomItem<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}
