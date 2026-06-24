import type { MoguGrowthStage, MoodStage } from "../types";

export const reactionMessages: Record<MoodStage, string[]> = {
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

export function getStageByRejectCount(rejectCount: number): MoodStage {
  if (rejectCount <= 0) return "recommend";
  if (rejectCount === 1) return "annoyed_lv1";
  if (rejectCount === 2) return "annoyed_lv2";
  if (rejectCount === 3) return "annoyed_lv3";
  if (rejectCount === 4) return "angry_lv1";
  return "angry_lv2";
}

export function pickReactionMessage(stage: MoodStage, previousMessage: string | null): string {
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

export function pickMoguStageMessage(stage: MoguGrowthStage, type: MoguMessageType, previousMessage: string | null): string {
  const group = moguStageMessages[stage] ?? moguStageMessages.baby;
  const messages = group[type] ?? group.main;
  const pool = messages.length > 1 ? messages.filter((message) => message !== previousMessage) : messages;
  return pool[Math.floor(Math.random() * pool.length)] ?? messages[0];
}
