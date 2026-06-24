export type ChipId =
  | "hearty"
  | "light"
  | "quick"
  | "solo"
  | "safe"
  | "new"
  | "under1000"
  | "anything";

export type MoodStage =
  | "calm"
  | "thinking"
  | "recommend"
  | "celebrate"
  | "annoyed_lv1"
  | "annoyed_lv2"
  | "annoyed_lv3"
  | "angry_lv1"
  | "angry_lv2";

export interface ChipOption {
  id: ChipId;
  label: string;
}

export interface Menu {
  id: number;
  name: string;
  jpName: string;
  description: string;
  tags: ChipId[];
  priceYen: number;
  novelty: number;
  reliability: number;
}

export interface MealRecord {
  id: string;
  menuId: number;
  menuName: string;
  decidedAt: string;
  chips: ChipId[];
  forced: boolean;
  expGained?: number;
}

export interface MoguReaction {
  stage: MoodStage;
  message: string;
}

export type MoguGrowthStage = "baby" | "child" | "teen" | "youngAdult" | "mature";

export interface MoguProgress {
  level: number;
  exp: number;
  totalDecisions: number;
  totalRejects: number;
  streakDays: number;
  lastUsedDate: string | null;
  stage: MoguGrowthStage;
}

export interface MoguExpResult {
  progress: MoguProgress;
  leveledUp: boolean;
  stageChanged: boolean;
  beforeStage: MoguGrowthStage;
  afterStage: MoguGrowthStage;
}
