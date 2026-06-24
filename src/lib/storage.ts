import type { MealRecord, MoguExpResult, MoguGrowthStage, MoguProgress } from "../types";

const STORAGE_KEY = "mugle.mealRecords.v2";
const MOGU_PROGRESS_KEY = "mugle_mogu_progress";
const MAX_RECORDS = 12;
export const REQUIRED_EXP_PER_LEVEL = 100;

const DEFAULT_MOGU_PROGRESS: MoguProgress = {
  level: 1,
  exp: 0,
  totalDecisions: 0,
  totalRejects: 0,
  streakDays: 0,
  lastUsedDate: null,
  stage: "baby"
};

export function loadMealRecords(): MealRecord[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveMealRecord(record: MealRecord): MealRecord[] {
  const records = [record, ...loadMealRecords()].slice(0, MAX_RECORDS);
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  return records;
}

export function getRecentMenuIds(limit = 5): number[] {
  return loadMealRecords()
    .slice(0, limit)
    .map((record) => record.menuId)
    .filter((menuId): menuId is number => Number.isFinite(menuId));
}

export function createRecordId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function getMoguStage(level: number): MoguGrowthStage {
  if (level >= 20) return "mature";
  if (level >= 15) return "youngAdult";
  if (level >= 10) return "teen";
  if (level >= 5) return "child";
  return "baby";
}

export function getMoguStageLabel(stage: MoguGrowthStage): string {
  const labels: Record<MoguGrowthStage, string> = {
    baby: "아기 Mogu",
    child: "어린이 Mogu",
    teen: "청소년 Mogu",
    youngAdult: "어른 Mogu",
    mature: "마스터 Mogu"
  };

  return labels[stage];
}

export function getProgressPercent(exp: number, requiredExp = REQUIRED_EXP_PER_LEVEL): number {
  if (!requiredExp) return 0;
  return Math.max(0, Math.min((exp / requiredExp) * 100, 100));
}

export function loadMoguProgress(): MoguProgress {
  try {
    const raw = window.localStorage.getItem(MOGU_PROGRESS_KEY);
    if (!raw) return DEFAULT_MOGU_PROGRESS;

    const parsed = JSON.parse(raw) as Partial<MoguProgress>;
    const level = sanitizeNumber(parsed.level, DEFAULT_MOGU_PROGRESS.level);
    const exp = Math.max(0, Math.min(sanitizeNumber(parsed.exp, DEFAULT_MOGU_PROGRESS.exp), REQUIRED_EXP_PER_LEVEL - 1));
    const stage = getMoguStage(level);

    return {
      ...DEFAULT_MOGU_PROGRESS,
      ...parsed,
      level,
      exp,
      totalDecisions: sanitizeNumber(parsed.totalDecisions, DEFAULT_MOGU_PROGRESS.totalDecisions),
      totalRejects: sanitizeNumber(parsed.totalRejects, DEFAULT_MOGU_PROGRESS.totalRejects),
      streakDays: sanitizeNumber(parsed.streakDays, DEFAULT_MOGU_PROGRESS.streakDays),
      lastUsedDate: typeof parsed.lastUsedDate === "string" ? parsed.lastUsedDate : null,
      stage
    };
  } catch {
    return DEFAULT_MOGU_PROGRESS;
  }
}

export function saveMoguProgress(progress: MoguProgress): MoguProgress {
  const normalized = {
    ...progress,
    level: Math.max(1, Math.floor(progress.level)),
    exp: Math.max(0, Math.min(Math.floor(progress.exp), REQUIRED_EXP_PER_LEVEL - 1)),
    stage: getMoguStage(progress.level)
  };

  try {
    window.localStorage.setItem(MOGU_PROGRESS_KEY, JSON.stringify(normalized));
  } catch {
    // localStorage may be unavailable in private browsing; the app can continue with in-memory progress.
  }

  return normalized;
}

export function applyMoguExp(progress: MoguProgress, gainedExp: number): MoguExpResult {
  const beforeStage = getMoguStage(progress.level);
  const today = new Date().toISOString().slice(0, 10);

  let nextProgress: MoguProgress = {
    ...progress,
    exp: progress.exp + Math.max(0, gainedExp),
    totalDecisions: progress.totalDecisions + 1,
    streakDays: getNextStreakDays(progress.lastUsedDate, today, progress.streakDays),
    lastUsedDate: today
  };

  while (nextProgress.exp >= REQUIRED_EXP_PER_LEVEL) {
    nextProgress.exp -= REQUIRED_EXP_PER_LEVEL;
    nextProgress.level += 1;
  }

  const afterStage = getMoguStage(nextProgress.level);
  nextProgress = { ...nextProgress, stage: afterStage };

  return {
    progress: nextProgress,
    leveledUp: nextProgress.level > progress.level,
    stageChanged: beforeStage !== afterStage,
    beforeStage,
    afterStage
  };
}

export function recordMoguReject(progress: MoguProgress): MoguProgress {
  return saveMoguProgress({
    ...progress,
    totalRejects: progress.totalRejects + 1
  });
}

function sanitizeNumber(value: unknown, fallback: number): number {
  return Number.isFinite(value) ? Math.max(0, Math.floor(Number(value))) : fallback;
}

function getNextStreakDays(lastUsedDate: string | null, today: string, currentStreak: number): number {
  if (!lastUsedDate) return 1;
  if (lastUsedDate === today) return Math.max(1, currentStreak);

  const lastTime = Date.parse(`${lastUsedDate}T00:00:00.000Z`);
  const todayTime = Date.parse(`${today}T00:00:00.000Z`);
  const dayDiff = Math.round((todayTime - lastTime) / 86_400_000);

  return dayDiff === 1 ? currentStreak + 1 : 1;
}
