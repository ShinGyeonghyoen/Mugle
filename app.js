const moguCharacter = document.getElementById("moguCharacter");
const messageBubble = document.getElementById("messageBubble");
const foodName = document.getElementById("foodName");
const foodDesc = document.getElementById("foodDesc");
const resultLabel = document.getElementById("resultLabel");

const thinkBtn = document.getElementById("thinkBtn");
const searchBtn = document.getElementById("searchBtn");

const simpleModeBtn = document.getElementById("simpleModeBtn");
const tripleModeBtn = document.getElementById("tripleModeBtn");

const chipButtons = document.querySelectorAll(".chip-btn");

const resultPanel = document.getElementById("resultPanel");
const singleResultView = document.getElementById("singleResultView");
const tripleResultView = document.getElementById("tripleResultView");
const candidateButtons = document.getElementById("candidateButtons");

/* =========================
   Doom Button Elements
========================= */
const doomButton = document.getElementById("doom-button");
const doomTooltip = document.getElementById("doom-tooltip");
const doomOverlay = document.getElementById("doom-overlay");
const doomCountdown = document.getElementById("doom-countdown");
const doomSubtext = document.getElementById("doom-subtext");
const doomResultModal = document.getElementById("doom-result-modal");
const doomResultEmoji = document.getElementById("doom-result-emoji");
const doomResultText = document.getElementById("doom-result-text");
const doomResultMessage = document.getElementById("doom-result-message");
const doomResultClose = document.getElementById("doom-result-close");

let currentMode = "simple";
let selectedCategory = null;
let rejectCount = 0;
let lastSuggestionKey = null;

/* 현재 추천/후보 상태 추적 */
let currentSimpleMenu = null;
let currentTripleCandidates = [];
let hintShown = false;

/* Doom 상태 */
let doomPressTimer = null;
let doomProgressTimer = null;
let doomPressStartedAt = 0;
let doomLongPressTriggered = false;

const LONG_PRESS_MS = 1400;
const TAP_THRESHOLD_MS = 250;

const annoyedMessages = [
  "흠... 이것도 별로야? 그럼 다시 골라볼게.",
  "꽤 괜찮았는데... 알겠어, 다시 찾아볼게.",
  "입맛이 꽤 까다롭네. 이번엔 더 신중하게 간다.",
  "와, 진짜 결정 어렵다. 그래도 모구는 포기 안 해.",
  "이 정도면 거의 점심 면접 수준인데? 다시 간다.",
  "모구 힘들다... 이번엔 진짜 골라줘. 마지막 각오로 간다."
];

const doomTapMessages = [
  "건드리지 마라.",
  "후회한다.",
  "그건 최후의 수단이다.",
  "아직은 아니다.",
  "정말 답 없을 때만 눌러라."
];

const doomResultMessages = [
  "감사한 줄 알아라.",
  "내가 대신 정해줬다.",
  "이 정도도 못 고르냐.",
  "더 징징대지 마라.",
  "불만 있으면 굶어라.",
  "드디어 내가 나섰군."
];

const doomHintMessages = [
  "계속 못 고르겠으면... 왼쪽 위를 봐라.",
  "정말 답이 없으면 비상장치를 써라.",
  "왼쪽 위는 괜히 있는 게 아니다."
];

const menus = [
  { name: "돈카츠 정식", desc: "바삭하고 든든해서 오후 업무 버티기에 좋아.", categories: ["든든하게", "일식"] },
  { name: "라멘", desc: "진한 국물과 면으로 만족감이 높은 점심 메뉴야.", categories: ["든든하게", "일식"] },
  { name: "차슈동", desc: "고기 비중이 높아 배고픈 날 잘 맞아.", categories: ["든든하게", "일식"] },
  { name: "가라아게 정식", desc: "튀김 계열이 당길 때 실패 확률이 낮아.", categories: ["든든하게", "일식"] },
  { name: "오므라이스", desc: "부드럽고 편하게 먹기 좋은 안정적인 선택이야.", categories: ["가볍게", "일식"] },
  { name: "우동", desc: "속 편하고 부담 없이 먹고 싶을 때 잘 맞아.", categories: ["가볍게", "일식"] },
  { name: "규동", desc: "빠르게 먹으면서도 든든함을 챙길 수 있어.", categories: ["든든하게", "일식"] },
  { name: "스시 런치", desc: "조금 깔끔하고 만족도 있게 먹고 싶을 때 좋아.", categories: ["가볍게", "일식"] },

  { name: "제육볶음", desc: "매콤하게 스트레스 풀고 싶을 때 좋은 메뉴야.", categories: ["든든하게", "한식"] },
  { name: "김치찌개", desc: "익숙하고 실패 가능성이 낮은 직장인 점심 메뉴야.", categories: ["든든하게", "한식"] },
  { name: "된장찌개", desc: "부담이 적고 무난하게 만족할 수 있어.", categories: ["가볍게", "한식"] },
  { name: "순두부찌개", desc: "따뜻하고 깔끔하게 한 끼 해결하기 좋지.", categories: ["가볍게", "한식"] },
  { name: "비빔밥", desc: "균형감 있고 비교적 가볍게 먹을 수 있어.", categories: ["가볍게", "한식"] },
  { name: "불고기 정식", desc: "무난하면서도 만족감 높은 점심 선택지야.", categories: ["든든하게", "한식"] },
  { name: "냉면", desc: "깔끔하고 시원하게 먹고 싶은 날 잘 맞아.", categories: ["가볍게", "한식"] },
  { name: "국밥", desc: "든든함이 최우선일 때 강한 선택지야.", categories: ["든든하게", "한식"] },

  { name: "치킨오버라이스", desc: "요즘 회사원 점심으로 인기가 높고 든든해.", categories: ["든든하게", "양식"] },
  { name: "크림파스타", desc: "조금 기분 내고 싶은 날 무난한 선택이야.", categories: ["든든하게", "양식"] },
  { name: "토마토파스타", desc: "비교적 가볍고 산뜻하게 먹기 좋아.", categories: ["가볍게", "양식"] },
  { name: "함박스테이크", desc: "든든함과 만족감을 동시에 챙길 수 있어.", categories: ["든든하게", "양식"] },
  { name: "치즈버거 세트", desc: "빠르고 익숙하고 실패 확률이 낮아.", categories: ["든든하게", "양식"] },
  { name: "클럽샌드위치", desc: "너무 무겁지 않게 점심을 끝내고 싶을 때 좋아.", categories: ["가볍게", "양식"] },
  { name: "시저샐러드 + 스프", desc: "가볍게 먹고 오후 컨디션 챙기고 싶을 때 적합해.", categories: ["가볍게", "양식"] },
  { name: "피자 런치", desc: "동료와 함께 먹기에도 좋은 만족형 메뉴야.", categories: ["든든하게", "양식"] },

  { name: "마라탕", desc: "자극적인 맛으로 기분 전환하고 싶을 때 좋아.", categories: ["든든하게"] },
  { name: "쌀국수", desc: "깔끔하고 따뜻하면서도 과하지 않아.", categories: ["가볍게"] },
  { name: "탄탄멘", desc: "라멘보다 조금 더 자극적인 선택을 원할 때 좋아.", categories: ["든든하게"] },
  { name: "카레라이스", desc: "누구나 무난하게 만족하기 쉬운 점심 메뉴야.", categories: ["든든하게"] },
  { name: "야키니쿠 런치", desc: "확실히 잘 먹었다는 느낌이 필요한 날 추천해.", categories: ["든든하게"] },
  { name: "소바", desc: "가볍고 빠르게 식사하고 싶을 때 잘 맞아.", categories: ["가볍게", "일식"] },
  { name: "포케볼", desc: "건강함과 트렌디함을 동시에 챙길 수 있어.", categories: ["가볍게"] },
  { name: "부리또볼", desc: "든든하면서도 조금 다른 메뉴를 먹고 싶을 때 좋아.", categories: ["든든하게"] }
];

function setCharacter(imagePath, message) {
  if (moguCharacter) moguCharacter.src = imagePath;
  if (messageBubble) messageBubble.textContent = message;
}

function showSingleView() {
  singleResultView.classList.remove("hidden");
  tripleResultView.classList.add("hidden");
}

function showTripleView() {
  singleResultView.classList.add("hidden");
  tripleResultView.classList.remove("hidden");
}

function clearCelebrateStyle() {
  resultPanel.classList.remove("celebrate");
}

function clearCandidateHighlight() {
  const buttons = candidateButtons.querySelectorAll(".candidate-btn");
  buttons.forEach((button) => button.classList.remove("doom-selected"));
}

function setMainState() {
  clearCelebrateStyle();
  showSingleView();
  setCharacter("images/mogu-main.png", "오늘도 결정이 어렵지? 모구가 도와줄게!");
  resultLabel.textContent = "오늘의 추천";
  foodName.textContent = "모드를 선택하고 시작해보자";
  foodDesc.textContent = "빠르게 하나 고르거나, 후보 3개 중에서 최종 선택할 수 있어.";
  currentSimpleMenu = null;
  currentTripleCandidates = [];
}

function setThinkingState() {
  clearCelebrateStyle();
  showSingleView();
  setCharacter("images/mogu-thinking.png", "음... 오늘은 뭘 먹을까? 같이 좁혀보자!");
  resultLabel.textContent = "고민 중";
  foodName.textContent = "메뉴 고민 중";
  foodDesc.textContent = "조건을 정하고 추천을 받아보자.";
}

function setLoadingState(customMessage = "모구가 직장인 맞춤 메뉴를 열심히 찾는 중이야!") {
  clearCelebrateStyle();
  showSingleView();
  setCharacter("images/mogu-loading.png", customMessage);
  resultLabel.textContent = "검색 중";
  foodName.textContent = "추천 준비 중...";
  foodDesc.textContent = "취향과 분위기를 고려해서 추리는 중이야.";
}

function setRecommendState(menu, annoyedText = null) {
  clearCelebrateStyle();
  showSingleView();
  setCharacter("images/mogu-recommend.png", annoyedText || "이 메뉴 어때? 모구의 추천 결과야!");
  resultLabel.textContent = "추천 결과";
  foodName.textContent = menu.name;
  foodDesc.textContent = menu.desc;
  currentSimpleMenu = menu;
  currentTripleCandidates = [];
}

function setTripleCandidates(candidateMenus, annoyedText = null) {
  clearCelebrateStyle();
  showTripleView();
  setCharacter("images/mogu-recommend.png", annoyedText || "좋아, 고민하기 좋게 후보 3개를 준비했어!");
  resultLabel.textContent = "후보 3개";
  candidateButtons.innerHTML = "";
  currentSimpleMenu = null;
  currentTripleCandidates = [...candidateMenus];

  candidateMenus.forEach((menu) => {
    const button = document.createElement("button");
    button.className = "candidate-btn";
    button.type = "button";
    button.textContent = menu.name;
    button.dataset.menuName = menu.name;
    button.addEventListener("click", () => finalizeSelection(menu));
    candidateButtons.appendChild(button);
  });
}

function finalizeSelection(menu) {
  showSingleView();
  resultPanel.classList.add("celebrate");
  setCharacter("images/mogu-celebrate.png", `${menu.name}, 최종 결정 완료! 이제 맛있게 먹기만 하면 돼!`);
  resultLabel.textContent = "최종 선택";
  foodName.textContent = `오늘의 메뉴는 ${menu.name} 입니다`;
  foodDesc.textContent = `좋아, ${menu.name}로 확정! 오늘 점심은 이걸로 가자 🎉`;
  rejectCount = 0;
  lastSuggestionKey = menu.name;
  currentSimpleMenu = menu;
  currentTripleCandidates = [];
  clearCandidateHighlight();
  hideDoomResult();
}

function getFilteredMenus() {
  if (!selectedCategory) return menus;
  return menus.filter((menu) => menu.categories.includes(selectedCategory));
}

function getRandomMenu(list) {
  if (list.length === 1) return list[0];

  let picked = list[Math.floor(Math.random() * list.length)];
  if (lastSuggestionKey) {
    let safeCount = 0;
    while (picked.name === lastSuggestionKey && safeCount < 10) {
      picked = list[Math.floor(Math.random() * list.length)];
      safeCount += 1;
    }
  }
  return picked;
}

function getThreeRandomMenus(list) {
  const copied = [...list];
  const picked = [];

  while (copied.length > 0 && picked.length < 3) {
    const index = Math.floor(Math.random() * copied.length);
    const selected = copied.splice(index, 1)[0];

    if (selected.name !== lastSuggestionKey || copied.length === 0) {
      picked.push(selected);
    }
  }

  while (picked.length < 3 && list.length > picked.length) {
    const fallback = list.find((menu) => !picked.some((item) => item.name === menu.name));
    if (!fallback) break;
    picked.push(fallback);
  }

  return picked;
}

function getAnnoyedMessage() {
  if (rejectCount <= 0) return null;
  const index = Math.min(rejectCount, 6) - 1;
  return annoyedMessages[index];
}

function activateMode(mode) {
  currentMode = mode;

  if (mode === "simple") {
    simpleModeBtn.classList.add("active");
    tripleModeBtn.classList.remove("active");
    messageBubble.textContent = "빠르게 하나 딱 골라줄게!";
  } else {
    tripleModeBtn.classList.add("active");
    simpleModeBtn.classList.remove("active");
    messageBubble.textContent = "후보 3개를 보여줄 테니 마지막 선택만 해!";
  }

  clearCelebrateStyle();
  showSingleView();
  resultLabel.textContent = "모드 변경";
  foodName.textContent = mode === "simple" ? "심플 모드 선택됨" : "3개 후보 모드 선택됨";
  foodDesc.textContent = mode === "simple"
    ? "한 번에 하나를 바로 추천해줄게."
    : "추천 결과창 안에서 후보 3개를 보여줄게.";

  currentSimpleMenu = null;
  currentTripleCandidates = [];
  clearCandidateHighlight();
}

function activateCategory(category) {
  if (selectedCategory === category) {
    selectedCategory = null;
    chipButtons.forEach((btn) => btn.classList.remove("active"));
    setMainState();
    return;
  }

  selectedCategory = category;
  chipButtons.forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.category === category);
  });

  showSingleView();
  clearCelebrateStyle();
  setCharacter("images/mogu-thinking.png", `${selectedCategory} 느낌으로 후보를 좁혀볼게!`);
  resultLabel.textContent = "조건 선택";
  foodName.textContent = selectedCategory;
  foodDesc.textContent = `${selectedCategory} 기준으로 메뉴를 추려서 추천할게.`;
  currentSimpleMenu = null;
  currentTripleCandidates = [];
  clearCandidateHighlight();
}

/* =========================
   Doom Helpers
========================= */
function randomPick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function vibrateSafe(pattern) {
  if (navigator.vibrate) navigator.vibrate(pattern);
}

function showDoomTooltip(message, timeout = 1000) {
  if (!doomTooltip) return;
  doomTooltip.textContent = message;
  doomTooltip.classList.remove("hidden");

  clearTimeout(showDoomTooltip._timer);
  showDoomTooltip._timer = setTimeout(() => {
    doomTooltip.classList.add("hidden");
  }, timeout);
}

function showHintBubble(message) {
  if (document.getElementById("mog-hint-bubble")) return;

  const bubble = document.createElement("div");
  bubble.id = "mog-hint-bubble";
  bubble.textContent = message;
  document.body.appendChild(bubble);

  setTimeout(() => {
    bubble.remove();
  }, 2600);
}

function maybeShowDoomHint() {
  if (hintShown) return;
  if (rejectCount >= 3) {
    hintShown = true;
    showHintBubble(randomPick(doomHintMessages));
  }
}

function showDoomOverlay() {
  if (!doomOverlay) return;
  doomOverlay.classList.remove("hidden");
  doomOverlay.setAttribute("aria-hidden", "false");
}

function hideDoomOverlay() {
  if (!doomOverlay) return;
  doomOverlay.classList.add("hidden");
  doomOverlay.setAttribute("aria-hidden", "true");
}

function showDoomResult(menu, customMessage = null) {
  if (!doomResultModal) return;

  doomResultEmoji.textContent = "☢";
  doomResultText.textContent = `오늘의 메뉴는 ${menu.name}다`;
  doomResultMessage.textContent = customMessage || randomPick(doomResultMessages);

  doomResultModal.classList.remove("hidden");
  doomResultModal.setAttribute("aria-hidden", "false");
}

function hideDoomResult() {
  if (!doomResultModal) return;
  doomResultModal.classList.add("hidden");
  doomResultModal.setAttribute("aria-hidden", "true");
}

function startDoomProgress() {
  if (!doomButton) return;

  clearInterval(doomProgressTimer);
  const start = Date.now();
  doomButton.classList.add("progressing");

  doomProgressTimer = setInterval(() => {
    const elapsed = Date.now() - start;
    const progress = Math.min((elapsed / LONG_PRESS_MS) * 100, 100);
    doomButton.style.setProperty("--press-progress", `${progress}%`);
  }, 16);
}

function stopDoomProgress() {
  if (!doomButton) return;

  clearInterval(doomProgressTimer);
  doomButton.classList.remove("progressing");
  doomButton.style.setProperty("--press-progress", "0%");
}

function getDoomTargetMenu() {
  if (currentMode === "triple" && currentTripleCandidates.length > 0) {
    return randomPick(currentTripleCandidates);
  }

  const filteredMenus = getFilteredMenus();
  if (!filteredMenus.length) return null;

  if (currentSimpleMenu) {
    return currentSimpleMenu;
  }

  return getRandomMenu(filteredMenus);
}

function highlightForcedCandidate(menu) {
  if (currentMode !== "triple") return;

  clearCandidateHighlight();
  const buttons = candidateButtons.querySelectorAll(".candidate-btn");
  buttons.forEach((button) => {
    if (button.dataset.menuName === menu.name) {
      button.classList.add("doom-selected");
    }
  });
}

async function startDoomDecision() {
  const targetMenu = getDoomTargetMenu();

  if (!targetMenu) {
    showDoomTooltip("후보가 없다. 먼저 추천을 받아라.", 1400);
    return;
  }

  showDoomOverlay();
  document.body.classList.add("doom-shaking");
  vibrateSafe([80, 40, 80]);

  const countdownTexts = ["3", "2", "1"];

  for (let i = 0; i < countdownTexts.length; i += 1) {
    doomCountdown.textContent = countdownTexts[i];

    if (i === 0) {
      doomSubtext.textContent = "지구멸망 프로토콜 시작";
    } else if (i === 1) {
      doomSubtext.textContent = "인간의 선택권 회수 중";
    } else {
      doomSubtext.textContent = "운명 결정 실행";
    }

    await wait(700);
  }

  hideDoomOverlay();
  document.body.classList.remove("doom-shaking");

  if (currentMode === "triple" && currentTripleCandidates.length > 0) {
    highlightForcedCandidate(targetMenu);

    await wait(220);

    showSingleView();
    resultPanel.classList.add("celebrate");
    setCharacter("images/mogu-celebrate.png", `인류는 멸망하지 않았다. 하지만 오늘은 ${targetMenu.name}다.`);
    resultLabel.textContent = "강제 결정 완료";
    foodName.textContent = `오늘의 메뉴는 ${targetMenu.name} 입니다`;
    foodDesc.textContent = `고민 끝. 모구가 ${targetMenu.name}(으)로 강제 확정했다 ☢`;
    showDoomResult(targetMenu);
    lastSuggestionKey = targetMenu.name;
    rejectCount = 0;
    currentSimpleMenu = targetMenu;
    currentTripleCandidates = [];
    return;
  }

  resultPanel.classList.add("celebrate");
  setCharacter("images/mogu-celebrate.png", `드디어 결정을 포기했군. 오늘은 ${targetMenu.name}다.`);
  resultLabel.textContent = "강제 결정 완료";
  foodName.textContent = `오늘의 메뉴는 ${targetMenu.name} 입니다`;
  foodDesc.textContent = `모구가 최후의 수단으로 ${targetMenu.name}(으)로 확정했다 ☢`;
  showDoomResult(targetMenu);
  lastSuggestionKey = targetMenu.name;
  rejectCount = 0;
  currentSimpleMenu = targetMenu;
  currentTripleCandidates = [];
}

function handleDoomPressStart(event) {
  if (!doomButton) return;
  event.preventDefault();

  doomPressStartedAt = Date.now();
  doomLongPressTriggered = false;

  doomButton.classList.add("is-pressing");
  startDoomProgress();

  doomPressTimer = setTimeout(async () => {
    doomLongPressTriggered = true;
    vibrateSafe(120);
    await startDoomDecision();
  }, LONG_PRESS_MS);
}

function handleDoomPressEnd() {
  if (!doomButton) return;

  const pressedMs = Date.now() - doomPressStartedAt;

  clearTimeout(doomPressTimer);
  stopDoomProgress();
  doomButton.classList.remove("is-pressing");

  if (!doomLongPressTriggered && pressedMs <= TAP_THRESHOLD_MS) {
    showDoomTooltip(randomPick(doomTapMessages));
  }
}

function bindDoomButtonEvents() {
  if (!doomButton) return;

  doomButton.addEventListener("mousedown", handleDoomPressStart);
  doomButton.addEventListener("mouseup", handleDoomPressEnd);
  doomButton.addEventListener("mouseleave", handleDoomPressEnd);

  doomButton.addEventListener("touchstart", handleDoomPressStart, { passive: false });
  doomButton.addEventListener("touchend", handleDoomPressEnd);
  doomButton.addEventListener("touchcancel", handleDoomPressEnd);

  if (doomResultClose) {
    doomResultClose.addEventListener("click", hideDoomResult);
  }

  if (doomResultModal) {
    doomResultModal.addEventListener("click", (event) => {
      if (event.target === doomResultModal) {
        hideDoomResult();
      }
    });
  }
}

/* =========================
   Existing Events
========================= */
thinkBtn.addEventListener("click", () => {
  rejectCount = 0;
  setThinkingState();
});

searchBtn.addEventListener("click", () => {
  const filteredMenus = getFilteredMenus();

  if (filteredMenus.length === 0) {
    showSingleView();
    setCharacter("images/mogu-thinking.png", "조건에 맞는 메뉴가 없네. 다른 조건으로 다시 골라보자!");
    resultLabel.textContent = "조건 재설정";
    foodName.textContent = "메뉴 없음";
    foodDesc.textContent = "카테고리를 해제하거나 다른 조건으로 다시 시도해봐.";
    currentSimpleMenu = null;
    currentTripleCandidates = [];
    return;
  }

  const annoyedText = getAnnoyedMessage();
  const loadingText = annoyedText || "모구가 직장인 맞춤 메뉴를 열심히 찾는 중이야!";
  setLoadingState(loadingText);

  setTimeout(() => {
    if (currentMode === "simple") {
      const picked = getRandomMenu(filteredMenus);
      setRecommendState(picked, annoyedText);
      lastSuggestionKey = picked.name;
    } else {
      const pickedMenus = getThreeRandomMenus(filteredMenus);
      setTripleCandidates(pickedMenus, annoyedText);
      lastSuggestionKey = pickedMenus.map((m) => m.name).join("|");
    }

    rejectCount = Math.min(rejectCount + 1, 6);
    maybeShowDoomHint();
  }, 1200);
});

simpleModeBtn.addEventListener("click", () => activateMode("simple"));
tripleModeBtn.addEventListener("click", () => activateMode("triple"));

chipButtons.forEach((button) => {
  button.addEventListener("click", () => {
    activateCategory(button.dataset.category);
  });
});

window.addEventListener("load", () => {
  setMainState();
  bindDoomButtonEvents();

  setTimeout(() => {
    if (!hintShown) {
      hintShown = true;
      showHintBubble("진짜 못 고르겠으면... 왼쪽 위를 건드려봐라.");
    }
  }, 1800);
});
