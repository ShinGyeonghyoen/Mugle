import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { MoguBreak } from "./MoguBreak";
import { MoguPong } from "./MoguPong";

function assetPath(path: string) {
  return `${import.meta.env.BASE_URL}${path}`;
}

type ChipId =
  | "hearty"
  | "light"
  | "quick"
  | "solo"
  | "safe"
  | "new"
  | "under1000"
  | "anything";

type MoodStage =
  | "calm"
  | "thinking"
  | "recommend"
  | "celebrate"
  | "annoyed_lv1"
  | "annoyed_lv2"
  | "annoyed_lv3"
  | "angry_lv1"
  | "angry_lv2";

interface ChipOption {
  id: ChipId;
  label: string;
}

interface Menu {
  id: number;
  name: string;
  jpName: string;
  description: string;
  tags: ChipId[];
  priceYen: number;
  novelty: number;
  reliability: number;
}

interface MealRecord {
  id: string;
  menuId: number;
  menuName: string;
  decidedAt: string;
  chips: ChipId[];
  forced: boolean;
  expGained?: number;
}

interface MoguReaction {
  stage: MoodStage;
  message: string;
}

type MoguGrowthStage = "baby" | "child" | "teen" | "youngAdult" | "mature";

interface MoguProgress {
  level: number;
  exp: number;
  totalDecisions: number;
  totalRejects: number;
  streakDays: number;
  lastUsedDate: string | null;
  stage: MoguGrowthStage;
}

interface MoguExpResult {
  progress: MoguProgress;
  leveledUp: boolean;
  stageChanged: boolean;
  beforeStage: MoguGrowthStage;
  afterStage: MoguGrowthStage;
}

const chipOptions: ChipOption[] = [
  { id: "hearty", label: "든든하게" },
  { id: "light", label: "가볍게" },
  { id: "quick", label: "빠르게" },
  { id: "solo", label: "혼밥" },
  { id: "safe", label: "실패 없는 선택" },
  { id: "new", label: "새로운 메뉴" },
  { id: "under1000", label: "1,000엔 이하" },
  { id: "anything", label: "아무거나" }
];

const menus: Menu[] = [
  {
    id: 1,
    name: "쇼유 라멘",
    jpName: "醤油ラーメン",
    description: "빠르게 먹기 좋고 익숙해서 실패 확률이 낮은 한 그릇.",
    tags: ["hearty", "quick", "solo", "safe", "under1000"],
    priceYen: 900,
    novelty: 1,
    reliability: 5
  },
  {
    id: 2,
    name: "카츠동",
    jpName: "カツ丼",
    description: "배고픈 날 바로 힘이 나는 따뜻한 돈카츠 덮밥.",
    tags: ["hearty", "solo", "safe"],
    priceYen: 1050,
    novelty: 2,
    reliability: 5
  },
  {
    id: 3,
    name: "규동",
    jpName: "牛丼",
    description: "시간 없을 때도 안정적으로 배를 채워주는 선택.",
    tags: ["quick", "solo", "safe", "under1000"],
    priceYen: 650,
    novelty: 1,
    reliability: 5
  },
  {
    id: 4,
    name: "오야코동",
    jpName: "親子丼",
    description: "부드럽고 부담 없는 닭고기 달걀 덮밥.",
    tags: ["light", "quick", "solo", "safe", "under1000"],
    priceYen: 850,
    novelty: 2,
    reliability: 4
  },
  {
    id: 5,
    name: "카레라이스",
    jpName: "カレーライス",
    description: "고민이 길어질 때 결국 믿고 가는 점심 기본기.",
    tags: ["hearty", "quick", "solo", "safe", "under1000"],
    priceYen: 880,
    novelty: 1,
    reliability: 5
  },
  {
    id: 6,
    name: "치킨 난반 정식",
    jpName: "チキン南蛮定食",
    description: "새콤달콤 소스와 타르타르로 기분까지 채우는 정식.",
    tags: ["hearty", "safe"],
    priceYen: 1150,
    novelty: 3,
    reliability: 4
  },
  {
    id: 7,
    name: "자루소바",
    jpName: "ざるそば",
    description: "가볍고 깔끔하게 끝내고 싶은 날의 시원한 선택.",
    tags: ["light", "quick", "solo", "under1000"],
    priceYen: 780,
    novelty: 2,
    reliability: 4
  },
  {
    id: 8,
    name: "텐동",
    jpName: "天丼",
    description: "바삭한 튀김으로 점심의 존재감을 확실히 세우는 메뉴.",
    tags: ["hearty", "solo", "new"],
    priceYen: 1180,
    novelty: 3,
    reliability: 4
  },
  {
    id: 9,
    name: "오니기리 세트",
    jpName: "おにぎりセット",
    description: "회의 사이에도 부담 없이 먹을 수 있는 가벼운 세트.",
    tags: ["light", "quick", "solo", "under1000"],
    priceYen: 620,
    novelty: 2,
    reliability: 3
  },
  {
    id: 10,
    name: "샐러드 런치",
    jpName: "サラダランチ",
    description: "몸이 무거운 날 리듬을 가볍게 돌려주는 점심.",
    tags: ["light", "quick", "solo", "new", "under1000"],
    priceYen: 930,
    novelty: 3,
    reliability: 3
  },
  {
    id: 11,
    name: "함박 스테이크",
    jpName: "ハンバーグ",
    description: "든든하지만 너무 모험적이지 않은 만족도 높은 한 접시.",
    tags: ["hearty", "safe"],
    priceYen: 1250,
    novelty: 2,
    reliability: 5
  },
  {
    id: 12,
    name: "나폴리탄",
    jpName: "ナポリタン",
    description: "살짝 레트로한 기분 전환이 필요한 날의 파스타.",
    tags: ["new", "solo", "under1000"],
    priceYen: 980,
    novelty: 4,
    reliability: 3
  },
  {
    id: 13,
    name: "마파두부 덮밥",
    jpName: "麻婆豆腐丼",
    description: "평소와 다른 매콤함으로 오후를 깨우는 덮밥.",
    tags: ["hearty", "quick", "solo", "new", "under1000"],
    priceYen: 950,
    novelty: 4,
    reliability: 3
  },
  {
    id: 14,
    name: "초밥 런치",
    jpName: "寿司ランチ",
    description: "조금 산뜻하고 특별한 느낌이 필요한 날.",
    tags: ["light", "new", "safe"],
    priceYen: 1350,
    novelty: 4,
    reliability: 4
  },
  {
    id: 15,
    name: "탄탄멘",
    jpName: "担々麺",
    description: "라멘은 라멘인데 오늘은 조금 더 강한 맛으로.",
    tags: ["hearty", "solo", "new"],
    priceYen: 1080,
    novelty: 4,
    reliability: 3
  },
  {
    id: 16,
    name: "우동",
    jpName: "うどん",
    description: "부담 없이 따뜻하고 빠르게 먹기 좋은 안정권.",
    tags: ["light", "quick", "solo", "safe", "under1000"],
    priceYen: 700,
    novelty: 1,
    reliability: 5
  }
];

const reactionMessages: Record<MoodStage, string[]> = {
  calm: [
    "오늘도 결정이 어렵지? 모구가 같이 골라줄게.",
    "배고픈 시간이다. 조건 몇 개만 찍어봐.",
    "10초 안에 후보를 꺼내볼게. 모구 준비 완료."
  ],
  thinking: [
    "음... 오늘 입맛을 추적하는 중.",
    "조건을 섞는 중이야. 꽤 진지하게 보고 있어.",
    "모구가 메뉴 후보들을 줄 세우는 중."
  ],
  recommend: [
    "이 메뉴 어때? 오늘 점심 후보로 꽤 좋아.",
    "모구의 감으로는 이쪽이야.",
    "지금 조건이면 이 메뉴가 제일 말이 돼."
  ],
  celebrate: [
    "결정 완료. 이제 맛있게 먹기만 하면 돼.",
    "좋아, 오늘 점심은 확정이다.",
    "모구 임무 성공. 이제 점심으로 이동."
  ],
  annoyed_lv1: [
    "흠... 이것도 아니야? 좋아, 다시 골라볼게.",
    "꽤 괜찮았는데. 알겠어, 한 번 더 간다.",
    "첫 거절 접수. 모구 아직 침착해."
  ],
  annoyed_lv2: [
    "입맛이 조금 까다로운 날이네. 이번엔 더 좁혀볼게.",
    "두 번째라니. 좋아, 모구가 집중 모드로 간다.",
    "아직 괜찮아. 하지만 후보들이 긴장하기 시작했어."
  ],
  annoyed_lv3: [
    "세 번이면 점심 회의 수준인데. 다시 뽑는다.",
    "모구의 추천권이 흔들리고 있어. 그래도 간다.",
    "좋아, 이번 후보는 좀 더 진지하게 봐줘."
  ],
  angry_lv1: [
    "네 번째 거절이다. 슬슬 모구가 대신 정할 수도 있어.",
    "이쯤 되면 강제 결정 장치가 꿈틀거린다.",
    "모구가 참을 인을 쓰는 중. 다음엔 진짜 정해버릴지 몰라."
  ],
  angry_lv2: [
    "다섯 번 넘었다. 이제 모구가 결정권을 회수할 수 있어.",
    "충분히 고민했다. 강제 결정 버튼이 너를 보고 있어.",
    "모구 인내심 종료 직전. 누르면 바로 정해준다.",
    "오늘 점심 민주주의가 흔들리고 있다. 최후의 버튼을 봐."
  ]
};

function getStageByRejectCount(rejectCount: number): MoodStage {
  if (rejectCount <= 0) return "recommend";
  if (rejectCount === 1) return "annoyed_lv1";
  if (rejectCount === 2) return "annoyed_lv2";
  if (rejectCount === 3) return "annoyed_lv3";
  if (rejectCount === 4) return "angry_lv1";
  return "angry_lv2";
}

function pickReactionMessage(stage: MoodStage, previousMessage: string | null): string {
  const messages = reactionMessages[stage];
  const pool = messages.length > 1 ? messages.filter((message) => message !== previousMessage) : messages;
  return pool[Math.floor(Math.random() * pool.length)] ?? messages[0];
}

type MoguMessageType = "main" | "thinking" | "recommend" | "annoyed" | "celebrate";

const moguStageMessages: Record<MoguGrowthStage, Record<MoguMessageType, string[]>> = {
  baby: {
    main: ["배고파? Mogu가 골라줄게.", "오늘도 같이 먹을 걸 찾아보자."],
    thinking: ["음... 냄새 좋은 걸 찾는 중.", "잠깐만, 맛있는 후보를 굴려볼게."],
    recommend: ["이거 어때? Mogu 느낌 좋아.", "오늘은 이 메뉴가 반짝 보여."],
    annoyed: ["또 바꿀 거야...? 그래도 찾아볼게.", "Mogu 살짝 삐졌지만 다시 골라줄게."],
    celebrate: ["좋아, 결정했다! Mogu도 신나.", "오늘 메뉴 확정. 냠냠 준비 완료."]
  },
  child: {
    main: ["오늘 점심은 Mogu에게 맡겨봐.", "조건만 살짝 골라줘. 내가 찾아볼게."],
    thinking: ["후보를 비교하는 중이야.", "최근에 먹은 건 피해보고 있어."],
    recommend: ["이 메뉴면 오늘 기분에 잘 맞아.", "이건 꽤 안정적인 선택이야."],
    annoyed: ["음, 마음에 안 들었어? 한 번 더 간다.", "좋아. 이번엔 더 진지하게 골라볼게."],
    celebrate: ["결정 완료. EXP도 챙겼어.", "오늘의 선택 저장 완료."]
  },
  teen: {
    main: ["대충 고르지 말고, 오늘은 감으로 가보자.", "배고프면 판단이 흐려져. 내가 정리해볼게."],
    thinking: ["조건이랑 최근 기록을 같이 보는 중.", "너무 뻔한 선택은 조금 빼볼게."],
    recommend: ["이 정도면 꽤 괜찮은 선택.", "오늘은 이쪽으로 가는 게 맞아 보여."],
    annoyed: ["또? 좋아, 이번엔 더 날카롭게.", "까다로운데? 싫진 않아."],
    celebrate: ["좋아. 오늘의 답은 이거야.", "결정했으면 흔들리지 말자."]
  },
  youngAdult: {
    main: ["오늘의 식사 결정을 깔끔하게 정리해줄게.", "취향, 시간, 무게감까지 보고 고르자."],
    thinking: ["최근 기록과 조건을 균형 있게 맞추는 중.", "후보군을 줄이고 있어. 잠깐만."],
    recommend: ["이 선택이 가장 균형 좋아.", "오늘 상황에는 이 메뉴가 제일 자연스러워."],
    annoyed: ["괜찮아. 결정 피로는 내가 받을게.", "다시 좁혀볼게. 이번엔 더 정확하게."],
    celebrate: ["좋아, 결정 완료. 다음 식사 데이터도 더 똑똑해졌어.", "선택 저장 완료. Mogu도 성장 중."]
  },
  mature: {
    main: ["오늘의 메뉴는 차분하게 골라보자.", "기록과 취향은 충분해. 이제 결정만 하면 돼."],
    thinking: ["반복은 줄이고 만족도는 올리는 쪽으로 계산 중.", "오늘의 맥락에 맞는 답을 고르는 중이야."],
    recommend: ["이게 가장 납득되는 선택이야.", "오늘은 이 메뉴로 가도 후회가 적을 거야."],
    annoyed: ["좋아. 더 엄격하게 다시 보자.", "결정이 어려운 날도 있지. 내가 정리할게."],
    celebrate: ["결정 완료. 좋은 선택이야.", "기록 완료. 다음 추천은 더 정교해질 거야."]
  }
};

function pickMoguStageMessage(stage: MoguGrowthStage, type: MoguMessageType, previousMessage: string | null): string {
  const group = moguStageMessages[stage] ?? moguStageMessages.baby;
  const messages = group[type] ?? group.main;
  const pool = messages.length > 1 ? messages.filter((message) => message !== previousMessage) : messages;
  return pool[Math.floor(Math.random() * pool.length)] ?? messages[0];
}

const STORAGE_KEY = "mugle.mealRecords.v2";
const MOGU_PROGRESS_KEY = "mugle_mogu_progress";
const MAX_RECORDS = 12;
const REQUIRED_EXP_PER_LEVEL = 100;

const DEFAULT_MOGU_PROGRESS: MoguProgress = {
  level: 1,
  exp: 0,
  totalDecisions: 0,
  totalRejects: 0,
  streakDays: 0,
  lastUsedDate: null,
  stage: "baby"
};

function loadMealRecords(): MealRecord[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveMealRecord(record: MealRecord): MealRecord[] {
  const records = [record, ...loadMealRecords()].slice(0, MAX_RECORDS);
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  return records;
}

function getRecentMenuIds(limit = 5): number[] {
  return loadMealRecords()
    .slice(0, limit)
    .map((record) => record.menuId)
    .filter((menuId): menuId is number => Number.isFinite(menuId));
}

function createRecordId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function getMoguStage(level: number): MoguGrowthStage {
  if (level >= 20) return "mature";
  if (level >= 15) return "youngAdult";
  if (level >= 10) return "teen";
  if (level >= 5) return "child";
  return "baby";
}

function getMoguStageLabel(stage: MoguGrowthStage): string {
  const labels: Record<MoguGrowthStage, string> = {
    baby: "아기 Mogu",
    child: "어린이 Mogu",
    teen: "청소년 Mogu",
    youngAdult: "어른 Mogu",
    mature: "마스터 Mogu"
  };

  return labels[stage];
}

function getProgressPercent(exp: number, requiredExp = REQUIRED_EXP_PER_LEVEL): number {
  if (!requiredExp) return 0;
  return Math.max(0, Math.min((exp / requiredExp) * 100, 100));
}

function loadMoguProgress(): MoguProgress {
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

function saveMoguProgress(progress: MoguProgress): MoguProgress {
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

function applyMoguExp(progress: MoguProgress, gainedExp: number): MoguExpResult {
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

function recordMoguReject(progress: MoguProgress): MoguProgress {
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

interface RecommendOptions {
  previousMenuId?: number;
  recentMenuIds?: number[];
}

function recommendMenu(selectedChips: ChipId[], options: RecommendOptions = {}): Menu {
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

interface ChipSelectorProps {
  selectedChips: ChipId[];
  onToggle: (chipId: ChipId) => void;
}

function ChipSelector({ selectedChips, onToggle }: ChipSelectorProps) {
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

interface DecisionCardProps {
  record: MealRecord | null;
}

function DecisionCard({ record }: DecisionCardProps) {
  if (!record) return null;

  const time = new Intl.DateTimeFormat("ko-KR", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(record.decidedAt));

  return (
    <section className="decision-card" aria-label="결정 완료 카드">
      <img src={assetPath("images/mogu-celebrate.png")} alt="축하하는 모구" />
      <div>
        <p className="eyebrow">{record.forced ? "모구가 대신 결정" : "오늘 점심 확정"}</p>
        <h2>{record.menuName}</h2>
        <p>{time}에 저장했어. 내일도 다시 열면 기록이 남아 있어.</p>
      </div>
    </section>
  );
}

interface MealHistoryProps {
  records: MealRecord[];
}

function MealHistory({ records }: MealHistoryProps) {
  if (records.length === 0) return null;

  return (
    <section className="history" aria-label="최근 식사 기록">
      <div className="section-heading">
        <p className="eyebrow">최근 기록</p>
        <h2>모구가 기억하는 점심</h2>
      </div>
      <ul>
        {records.slice(0, 5).map((record) => (
          <li key={record.id}>
            <span>{record.menuName}</span>
            <time dateTime={record.decidedAt}>
              {new Intl.DateTimeFormat("ko-KR", { month: "numeric", day: "numeric" }).format(
                new Date(record.decidedAt)
              )}
            </time>
          </li>
        ))}
      </ul>
    </section>
  );
}

interface MenuCardProps {
  menu: Menu | null;
  isDecided: boolean;
  forced: boolean;
}

function MenuCard({ menu, isDecided, forced }: MenuCardProps) {
  if (!menu) {
    return (
      <section className="menu-card menu-card--empty">
        <p className="eyebrow">오늘의 추천</p>
        <h2>조건을 고르고 추천을 받아봐</h2>
        <p>아무거나를 누르면 모구가 완전히 마음대로 고른다.</p>
      </section>
    );
  }

  return (
    <section className={`menu-card ${isDecided ? "menu-card--decided" : ""}`}>
      <p className="eyebrow">{isDecided ? (forced ? "강제 결정 완료" : "결정 완료") : "모구의 추천"}</p>
      <h2>{menu.name}</h2>
      <p className="jp-name">{menu.jpName}</p>
      <p>{menu.description}</p>
      <div className="menu-meta" aria-label="메뉴 정보">
        <span>{menu.priceYen.toLocaleString("ko-KR")}엔</span>
        <span>안정감 {menu.reliability}/5</span>
        <span>새로움 {menu.novelty}/5</span>
      </div>
    </section>
  );
}

interface MoguStageProps {
  stage: MoodStage;
  message: string;
  progress: MoguProgress;
  expGain: number | null;
}

type VisualState = "main" | "thinking" | "loading" | "recommend" | "celebrate";

const fallbackImages: Record<VisualState, string> = {
  main: assetPath("images/mogu-main_bg_removed.png"),
  thinking: assetPath("images/mogu-thinking_bg_removed.png"),
  loading: assetPath("images/mogu-loading.png"),
  recommend: assetPath("images/mogu-recommend_bg_removed.png"),
  celebrate: assetPath("images/mogu-celebrate.png")
};

const stageImages: Record<MoguGrowthStage, Record<VisualState, string>> = {
  baby: fallbackImages,
  child: fallbackImages,
  teen: fallbackImages,
  youngAdult: fallbackImages,
  mature: fallbackImages
};

const danceFrames = Array.from({ length: 9 }, (_, index) => assetPath(`images/mogu-dance/mogu-dance-${index + 1}.png`));

function MoguStage({ stage, message, progress, expGain }: MoguStageProps) {
  const isCelebrating = stage === "celebrate";
  const visualState = getVisualState(stage);
  const fallbackImage = fallbackImages[visualState];
  const imageSrc = stageImages[progress.stage]?.[visualState] ?? fallbackImage;
  const expPercent = getProgressPercent(progress.exp);
  const progressStyle = { "--mogu-progress": `${expPercent}%` } as CSSProperties;

  return (
    <section className={`mogu-stage mogu-stage--${stage}`} data-mogu-growth-stage={progress.stage} aria-label="Mogu status">
      <div className="mogu-spotlight" aria-hidden="true" />
      <div className="mogu-motion" key={`${stage}-${message}`}>
        {isCelebrating ? (
          <div className="mogu-dance" aria-label="Celebrating Mogu">
            {danceFrames.map((frame, index) => (
              <img
                key={frame}
                className="mogu-dance-frame"
                src={frame}
                alt={index === 0 ? "Celebrating Mogu" : ""}
                aria-hidden={index === 0 ? undefined : true}
              />
            ))}
          </div>
        ) : (
          <img
            className="mogu-image"
            src={imageSrc}
            alt="Mogu character"
            onError={(event) => {
              event.currentTarget.src = fallbackImage;
            }}
          />
        )}
        <span className="mogu-effect mogu-effect--left" aria-hidden="true" />
        <span className="mogu-effect mogu-effect--right" aria-hidden="true" />
      </div>
      <div className="mogu-growth-panel" aria-label={`Lv.${progress.level} ${progress.exp} / ${REQUIRED_EXP_PER_LEVEL}`}>
        <div className="mogu-progress-head">
          <span id="moguStageLabel" className="mogu-stage-label">
            {getMoguStageLabel(progress.stage)}가 성장 중
          </span>
          {expGain !== null && <span className="mogu-exp-gain">EXP +{expGain}</span>}
        </div>
        <div className="mogu-progress-bar" aria-hidden="true">
          <div id="moguProgressFill" className="mogu-progress-fill" style={progressStyle} />
        </div>
        <div className="mogu-progress-meta">
          <span>Lv.{progress.level}</span>
          <span>
            {progress.exp} / {REQUIRED_EXP_PER_LEVEL}
          </span>
          <span>{progress.streakDays} streak</span>
        </div>
      </div>
      <div className="speech-bubble" role="status" aria-live="polite">
        {message}
      </div>
    </section>
  );
}

function getVisualState(stage: MoodStage): VisualState {
  if (stage === "calm") return "main";
  if (stage === "celebrate") return "celebrate";
  if (stage === "recommend" || stage === "annoyed_lv1") return "recommend";
  if (stage === "thinking" || stage === "annoyed_lv2") return "thinking";
  return "loading";
}


const initialReaction: MoguReaction = {
  stage: "calm",
  message: "오늘 점심, Mogu가 같이 골라줄게."
};

export default function App() {
  const [selectedChips, setSelectedChips] = useState<ChipId[]>([]);
  const [currentMenu, setCurrentMenu] = useState<Menu | null>(null);
  const [reaction, setReaction] = useState<MoguReaction>(initialReaction);
  const [lastMessage, setLastMessage] = useState<string | null>(initialReaction.message);
  const [rejectCount, setRejectCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isPongGameOpen, setIsPongGameOpen] = useState(false);
  const [isBreakGameOpen, setIsBreakGameOpen] = useState(false);
  const [candidateMenus, setCandidateMenus] = useState<Menu[]>([]);
  const [decidedRecord, setDecidedRecord] = useState<MealRecord | null>(null);
  const [records, setRecords] = useState<MealRecord[]>([]);
  const [moguProgress, setMoguProgress] = useState<MoguProgress>(() => loadMoguProgress());
  const [lastExpGain, setLastExpGain] = useState<number | null>(null);

  useEffect(() => {
    setRecords(loadMealRecords());
  }, []);

  useEffect(() => {
    document.body.dataset.moguStage = moguProgress.stage;
  }, [moguProgress.stage]);

  const hasRecommendation = currentMenu !== null;
  const isMiniGameOpen = isPongGameOpen || isBreakGameOpen;
  const showForceHint = rejectCount >= 4 && !decidedRecord;
  const showForceProminent = rejectCount >= 5 && !decidedRecord;

  const selectedSummary = useMemo(() => {
    if (selectedChips.length === 0 || selectedChips.includes("anything")) return "조건 없음";
    return `${selectedChips.length}개 조건 선택`;
  }, [selectedChips]);

  function toggleChip(chipId: ChipId) {
    setDecidedRecord(null);
    setCandidateMenus([]);
    setLastExpGain(null);
    setReactionWithStage("thinking");

    setSelectedChips((current) => {
      if (chipId === "anything") return current.includes("anything") ? [] : ["anything"];
      const withoutAnything = current.filter((item) => item !== "anything");
      return withoutAnything.includes(chipId)
        ? withoutAnything.filter((item) => item !== chipId)
        : [...withoutAnything, chipId];
    });
  }

  function pickFirstRecommendation() {
    setRejectCount(0);
    setCandidateMenus([]);
    pickMenu({
      nextRejectCount: 0,
      stage: "recommend",
      delay: 420
    });
  }

  function rerollRecommendation() {
    const nextRejectCount = rejectCount + 1;
    setCandidateMenus([]);
    setMoguProgress((current) => recordMoguReject(current));
    pickMenu({
      nextRejectCount,
      stage: getStageByRejectCount(nextRejectCount),
      delay: 360
    });
  }

  function startThinking() {
    setCurrentMenu(null);
    setCandidateMenus([]);
    setDecidedRecord(null);
    setLastExpGain(null);
    setRejectCount(0);
    setReactionWithStage("thinking");
  }

  function showCandidateMenus() {
    setCurrentMenu(null);
    setCandidateMenus(pickCandidateMenus(currentMenu?.id, getRecentMenuIds()));
    setDecidedRecord(null);
    setLastExpGain(null);
    setRejectCount(0);
    setReactionWithStage("recommend", "후보 3개를 준비했어. 마음에 드는 걸 골라봐.");
  }

  function forceDecision() {
    const menu = currentMenu ?? pickRecommendedMenu();
    setIsPongGameOpen(false);
    setIsBreakGameOpen(false);
    completeDecision(menu, true);
  }

  function completeDecision(menu = currentMenu, forced = false) {
    if (!menu) return;

    const expGained = forced ? 25 : 20;
    const expResult = applyMoguExp(moguProgress, expGained);
    const nextProgress = saveMoguProgress(expResult.progress);
    const record: MealRecord = {
      id: createRecordId(),
      menuId: menu.id,
      menuName: menu.name,
      decidedAt: new Date().toISOString(),
      chips: selectedChips,
      forced,
      expGained
    };

    setCurrentMenu(menu);
    setDecidedRecord(record);
    setCandidateMenus([]);
    setIsPongGameOpen(false);
    setIsBreakGameOpen(false);
    setRejectCount(0);
    setMoguProgress(nextProgress);
    setLastExpGain(expGained);
    setRecords(saveMealRecord(record));
    setReactionWithStage("celebrate", buildDecisionMessage(menu, expResult));
  }

  function pickMenu({
    nextRejectCount,
    stage,
    delay
  }: {
    nextRejectCount: number;
    stage: MoodStage;
    delay: number;
  }) {
    setIsLoading(true);
    setDecidedRecord(null);
    setLastExpGain(null);
    setReactionWithStage("thinking");

    window.setTimeout(() => {
      const nextMenu = pickRecommendedMenu();
      const message = pickMoguStageMessage(moguProgress.stage, getMessageType(stage), lastMessage);
      setCurrentMenu(nextMenu);
      setRejectCount(nextRejectCount);
      setReaction({ stage, message });
      setLastMessage(message);
      setIsLoading(false);
    }, delay);
  }

  function setReactionWithStage(stage: MoodStage, customMessage?: string) {
    const message = customMessage ?? pickMoguStageMessage(moguProgress.stage, getMessageType(stage), lastMessage);
    setReaction({ stage, message });
    setLastMessage(message);
  }

  function openPongGame() {
    setIsPongGameOpen(true);
    setIsBreakGameOpen(false);
    setCandidateMenus([]);
    setDecidedRecord(null);
    setLastExpGain(null);
    setReactionWithStage("calm", "나랑 한 판 해서 오늘 메뉴를 정하자.");
  }

  function closePongGame() {
    setIsPongGameOpen(false);
    setReactionWithStage("calm");
  }

  function openBreakGame() {
    setIsBreakGameOpen(true);
    setIsPongGameOpen(false);
    setCandidateMenus([]);
    setDecidedRecord(null);
    setLastExpGain(null);
    setReactionWithStage("thinking", "고민의 벽을 부수고 메뉴 후보를 얻어보자.");
  }

  function closeBreakGame() {
    setIsBreakGameOpen(false);
    setReactionWithStage("calm");
  }

  function handlePongUserWin() {
    const candidates = pickCandidateMenus(currentMenu?.id, getRecentMenuIds());
    setIsPongGameOpen(false);
    setCurrentMenu(null);
    setCandidateMenus(candidates);
    setRejectCount(0);
    setReactionWithStage("recommend", "좋아. 네가 이겼으니까 후보 3개를 줄게.");
  }

  function handlePongMoguWin() {
    const menu = pickRecommendedMenu();
    setIsPongGameOpen(false);
    setCandidateMenus([]);
    setCurrentMenu(menu);
    setDecidedRecord(null);
    setRejectCount(0);
    setReactionWithStage("recommend", "이번 판은 Mogu 승리. 이 메뉴로 가보자.");
  }

  function handleBreakSuccess(perfect: boolean) {
    const candidates = pickCandidateMenus(currentMenu?.id, getRecentMenuIds());
    setIsBreakGameOpen(false);
    setCurrentMenu(null);
    setCandidateMenus(candidates);
    setRejectCount(0);
    setReactionWithStage(
      perfect ? "celebrate" : "recommend",
      perfect ? "완벽하게 부쉈어. 후보 선택권을 줄게." : "좋아. 후보 3개 중에서 골라봐."
    );
  }

  function handleBreakFail() {
    const menu = pickRecommendedMenu();
    setIsBreakGameOpen(false);
    setCandidateMenus([]);
    setCurrentMenu(menu);
    setDecidedRecord(null);
    setRejectCount(0);
    setReactionWithStage("recommend", "벽이 단단했네. 대신 Mogu가 하나 골랐어.");
  }

  function chooseCandidate(menu: Menu) {
    setCurrentMenu(menu);
    setCandidateMenus([]);
    setDecidedRecord(null);
    setLastExpGain(null);
    setReactionWithStage("recommend", `${menu.name}, 이 후보로 가볼까?`);
  }

  function pickRecommendedMenu() {
    return recommendMenu(selectedChips, {
      previousMenuId: currentMenu?.id,
      recentMenuIds: getRecentMenuIds()
    });
  }

  function buildDecisionMessage(menu: Menu, result: MoguExpResult) {
    if (result.stageChanged) {
      return `${menu.name}, 오늘 메뉴로 결정 완료. ${getMoguStageLabel(result.beforeStage)}에서 ${getMoguStageLabel(result.afterStage)}로 성장했어!`;
    }

    if (result.leveledUp) {
      return `${menu.name}, 오늘 메뉴로 결정 완료. Lv.${result.progress.level} 달성!`;
    }

    return `${menu.name}, 오늘 메뉴로 결정 완료.`;
  }

  return (
    <main className="app">
      {!isMiniGameOpen && (
        <button
          type="button"
          className={`doom-button ${showForceHint ? "doom-button--hint" : ""} ${showForceProminent ? "doom-button--awake" : ""}`}
          aria-label="모구에게 강제로 맡기기"
          title={showForceProminent ? "이제 Mogu가 정해도 되지?" : "계속 고민되면 Mogu에게 맡겨봐"}
          onClick={forceDecision}
        >
          !
        </button>
      )}

      <header className="topbar">
        <div>
          <p className="eyebrow">Mugle v1.2</p>
          <h1>Mogu가 오늘 메뉴를 골라줄게</h1>
        </div>
        <span className="status-pill">{selectedSummary}</span>
      </header>

      <MoguStage stage={isLoading ? "thinking" : reaction.stage} message={reaction.message} progress={moguProgress} expGain={lastExpGain} />

      {!isMiniGameOpen && (
        <>
          <section className="primary-action" aria-label="메뉴 추천 행동">
            <button
              type="button"
              className="button button--primary button--hero primary-action-button"
              onClick={hasRecommendation ? () => completeDecision() : pickFirstRecommendation}
              disabled={isLoading}
            >
              {hasRecommendation ? "이걸로 결정" : "Mogu에게 골라달라고 하기"}
            </button>
            <div className="secondary-actions" aria-label="보조 행동">
              <button type="button" className="button button--secondary" onClick={showCandidateMenus} disabled={isLoading}>
                후보 3개 보기
              </button>
              <button type="button" className="button button--ghost" onClick={rerollRecommendation} disabled={!hasRecommendation || isLoading}>
                마음에 안 들어
              </button>
              <button type="button" className="button button--ghost" onClick={startThinking} disabled={isLoading}>
                다시 생각
              </button>
            </div>
          </section>

          <ChipSelector selectedChips={selectedChips} onToggle={toggleChip} />

          <MenuCard menu={currentMenu} isDecided={Boolean(decidedRecord)} forced={decidedRecord?.forced ?? false} />

          {candidateMenus.length > 0 && (
            <section className="candidate-panel" aria-label="후보 3개">
              <p className="eyebrow">Choice Set</p>
              <h2>오늘의 후보 3개</h2>
              <div className="candidate-grid">
                {candidateMenus.map((menu) => (
                  <button key={menu.id} type="button" className="candidate-card" onClick={() => chooseCandidate(menu)}>
                    <span>{menu.name}</span>
                    <small>{menu.jpName}</small>
                  </button>
                ))}
              </div>
            </section>
          )}

          <section className="game-hub" aria-label="미니게임">
            <div className="game-hub__copy">
              <p className="eyebrow">Mini Games</p>
              <h2>결정이 어려우면 한 판 하고 정해도 좋아.</h2>
            </div>
            <div className="game-card-grid">
              <button type="button" id="moguBreakBtn" className="game-card-button" onClick={openBreakGame} disabled={isLoading}>
                <span className="game-card-button__icon">B</span>
                <span>
                  <strong>고민의 벽 부수기</strong>
                  <small>벽돌을 깨고 후보 선택권 얻기</small>
                </span>
              </button>
              <button type="button" id="pongGameBtn" className="game-card-button" onClick={openPongGame} disabled={isLoading}>
                <span className="game-card-button__icon">P</span>
                <span>
                  <strong>Mogu랑 한 판 하기</strong>
                  <small>랠리 결과로 메뉴 정하기</small>
                </span>
              </button>
            </div>
          </section>
        </>
      )}

      {isPongGameOpen && (
        <MoguPong
          onClose={closePongGame}
          onMessage={(message) => setReactionWithStage("thinking", message)}
          onUserWin={handlePongUserWin}
          onMoguWin={handlePongMoguWin}
        />
      )}

      {isBreakGameOpen && (
        <MoguBreak
          onClose={closeBreakGame}
          onMessage={(message) => setReactionWithStage("thinking", message)}
          onSuccess={handleBreakSuccess}
          onFail={handleBreakFail}
        />
      )}

      {!isMiniGameOpen && showForceHint && (
        <section className={`force-panel ${showForceProminent ? "force-panel--visible" : ""}`}>
          <div>
            <p className="eyebrow">Mogu Override</p>
            <h2>{showForceProminent ? "이제 Mogu가 정해도 되지?" : "계속 거절하면 Mogu가 정해버릴지도"}</h2>
          </div>
          <button type="button" className="force-button" onClick={forceDecision}>
            {showForceProminent ? "강제 결정하기" : "Mogu에게 맡기기"}
          </button>
        </section>
      )}

      {!isMiniGameOpen && <DecisionCard record={decidedRecord} />}
      {!isMiniGameOpen && <MealHistory records={records} />}
    </main>
  );
}

function pickCandidateMenus(previousMenuId?: number, recentMenuIds: number[] = []) {
  const availableMenus = menus.filter((menu) => menu.id !== previousMenuId);
  const freshMenus = availableMenus.filter((menu) => !recentMenuIds.includes(menu.id));
  const sourceMenus = freshMenus.length >= 3 ? freshMenus : availableMenus;
  const shuffled = [...sourceMenus].sort(() => Math.random() - 0.5);

  return shuffled.slice(0, 3);
}

function getMessageType(stage: MoodStage) {
  if (stage === "calm") return "main";
  if (stage === "thinking") return "thinking";
  if (stage === "recommend") return "recommend";
  if (stage === "celebrate") return "celebrate";
  return "annoyed";
}
