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
const tripleGuide = document.getElementById("tripleGuide");

const confirmSingleBtn = document.getElementById("confirmSingleBtn");
const singleDecisionWrap = document.getElementById("singleDecisionWrap");
const seeOtherBtn = document.getElementById("seeOtherBtn");

const shareSingleBtn = document.getElementById("shareSingleBtn");
const shareTripleBtn = document.getElementById("shareTripleBtn");
const singleShareWrap = document.getElementById("singleShareWrap");
const tripleShareWrap = document.getElementById("tripleShareWrap");

const relayResultBtn = document.getElementById("relayResultBtn");
const relayResultWrap = document.getElementById("relayResultWrap");

/* 친구 회신 결과 전용 버튼 */
const friendResultWrap = document.getElementById("friendResultWrap");
const confirmFriendResultBtn = document.getElementById("confirmFriendResultBtn");
const restartFromFriendBtn = document.getElementById("restartFromFriendBtn");

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

/* 공유/회신 모드 상태 */
let isSharedSession = false;
let isReplySession = false;

/* 공유받은 단일 메뉴에서 후보 다시 보기 사용 여부 */
let sharedSingleExpanded = false;

/* 친구가 최종 선택한 메뉴 */
let sharedSelectedMenu = null;

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

function hideSingleDecisionButton() {
  if (singleDecisionWrap) {
    singleDecisionWrap.classList.add("hidden");
  }
}

function showSingleDecisionButton() {
  if (
    singleDecisionWrap &&
    currentMode === "simple" &&
    currentSimpleMenu &&
    !isSharedSession &&
    !isReplySession
  ) {
    singleDecisionWrap.classList.remove("hidden");
  }
}

function hideSeeOtherButton() {
  if (seeOtherBtn) {
    seeOtherBtn.classList.add("hidden");
  }
}

function showSeeOtherButton() {
  if (seeOtherBtn && isSharedSession && currentMode === "simple" && currentSimpleMenu && !sharedSingleExpanded) {
    seeOtherBtn.classList.remove("hidden");
  }
}

function hideShareButtons() {
  if (singleShareWrap) singleShareWrap.classList.add("hidden");
  if (tripleShareWrap) tripleShareWrap.classList.add("hidden");
}

function showSingleShareButton() {
  if (isSharedSession || isReplySession) return;
  if (singleShareWrap) singleShareWrap.classList.remove("hidden");
  if (tripleShareWrap) tripleShareWrap.classList.add("hidden");
}

function showTripleShareButton() {
  if (isSharedSession || isReplySession) return;
  if (tripleShareWrap) tripleShareWrap.classList.remove("hidden");
  if (singleShareWrap) singleShareWrap.classList.add("hidden");
}

function hideRelayButton() {
  if (relayResultWrap) relayResultWrap.classList.add("hidden");
}

function showRelayButton() {
  if (relayResultWrap) relayResultWrap.classList.remove("hidden");
}

function hideFriendResultButtons() {
  if (friendResultWrap) friendResultWrap.classList.add("hidden");
}

function showFriendResultButtons() {
  if (friendResultWrap) friendResultWrap.classList.remove("hidden");
}

function clearCelebrateStyle() {
  resultPanel.classList.remove("celebrate");
}

function clearCandidateHighlight() {
  const buttons = candidateButtons.querySelectorAll(".candidate-btn");
  buttons.forEach((button) => button.classList.remove("doom-selected"));
}

function hideChipsAndMainButtons() {
  chipButtons.forEach((btn) => btn.classList.add("hidden"));
  thinkBtn.classList.add("hidden");
  searchBtn.classList.add("hidden");
}

function showChipsAndMainButtons() {
  chipButtons.forEach((btn) => btn.classList.remove("hidden"));
  thinkBtn.classList.remove("hidden");
  searchBtn.classList.remove("hidden");
}

function setMainState() {
  clearCelebrateStyle();
  showSingleView();
  hideSingleDecisionButton();
  hideSeeOtherButton();
  hideShareButtons();
  hideRelayButton();
  hideFriendResultButtons();
  setCharacter("images/mogu-main.png", "오늘도 결정이 어렵지? 모구가 도와줄게!");
  resultLabel.textContent = "오늘의 추천";
  foodName.textContent = "모드를 선택하고 시작해보자";
  foodDesc.textContent = "빠르게 하나 고르거나, 후보 3개 중에서 최종 선택할 수 있어.";
  currentSimpleMenu = null;
  currentTripleCandidates = [];
  sharedSelectedMenu = null;
  sharedSingleExpanded = false;
}

function setThinkingState() {
  clearCelebrateStyle();
  showSingleView();
  hideSingleDecisionButton();
  hideSeeOtherButton();
  hideShareButtons();
  hideRelayButton();
  hideFriendResultButtons();
  setCharacter("images/mogu-thinking.png", "음... 오늘은 뭘 먹을까? 같이 좁혀보자!");
  resultLabel.textContent = "고민 중";
  foodName.textContent = "메뉴 고민 중";
  foodDesc.textContent = "조건을 정하고 추천을 받아보자.";
}

function setLoadingState(customMessage = "모구가 직장인 맞춤 메뉴를 열심히 찾는 중이야!") {
  clearCelebrateStyle();
  showSingleView();
  hideSingleDecisionButton();
  hideSeeOtherButton();
  hideShareButtons();
  hideRelayButton();
  hideFriendResultButtons();
  setCharacter("images/mogu-loading.png", customMessage);
  resultLabel.textContent = "검색 중";
  foodName.textContent = "추천 준비 중...";
  foodDesc.textContent = "취향과 분위기를 고려해서 추리는 중이야.";
}

function setRecommendState(menu, annoyedText = null) {
  clearCelebrateStyle();
  showSingleView();
  hideRelayButton();
  hideSeeOtherButton();
  hideFriendResultButtons();
  setCharacter("images/mogu-recommend.png", annoyedText || "이 메뉴 어때? 모구의 추천 결과야!");
  resultLabel.textContent = "추천 결과";
  foodName.textContent = menu.name;
  foodDesc.textContent = menu.desc;
  currentSimpleMenu = menu;
  currentTripleCandidates = [];
  showSingleDecisionButton();
  showSingleShareButton();
}

function setTripleCandidates(candidateMenus, annoyedText = null) {
  clearCelebrateStyle();
  showTripleView();
  hideSingleDecisionButton();
  hideSeeOtherButton();
  hideRelayButton();
  hideFriendResultButtons();
  setCharacter("images/mogu-recommend.png", annoyedText || "좋아, 고민하기 좋게 후보 3개를 준비했어!");
  resultLabel.textContent = "후보 3개";
  if (tripleGuide) {
    tripleGuide.textContent = isSharedSession
      ? "새로운 후보 3개다. 하나 골라서 결과를 돌려줘"
      : "후보 3개 중 하나를 골라줘";
  }

  candidateButtons.innerHTML = "";
  currentSimpleMenu = null;
  currentTripleCandidates = [...candidateMenus];

  candidateMenus.forEach((menu) => {
    const button = document.createElement("button");
    button.className = "candidate-btn";
    button.type = "button";
    button.textContent = menu.name;
    button.dataset.menuName = menu.name;

    if (isSharedSession) {
      button.addEventListener("click", () => finalizeSharedSelection(menu));
    } else {
      button.addEventListener("click", () => finalizeSelection(menu));
    }

    candidateButtons.appendChild(button);
  });

  if (!isSharedSession && !isReplySession) {
    showTripleShareButton();
  } else {
    hideShareButtons();
  }
}

function finalizeSelection(menu) {
  showSingleView();
  resultPanel.classList.add("celebrate");
  hideSingleDecisionButton();
  hideSeeOtherButton();
  hideShareButtons();
  hideRelayButton();
  hideFriendResultButtons();
  setCharacter("images/mogu-celebrate.png", `${menu.name}, 최종 결정 완료! 이제 맛있게 먹기만 하면 돼!`);
  resultLabel.textContent = "최종 선택";
  foodName.textContent = `오늘의 메뉴는 ${menu.name} 입니다`;
  foodDesc.textContent = `좋아, ${menu.name}로 확정! 오늘 점심은 이걸로 가자 🎉`;
  rejectCount = 0;
  lastSuggestionKey = menu.name;
  currentSimpleMenu = menu;
  currentTripleCandidates = [];
  sharedSelectedMenu = menu;
  clearCandidateHighlight();
  hideDoomResult();
}

function finalizeReplySelection(menu) {
  isReplySession = false;
  isSharedSession = false;
  sharedSelectedMenu = menu;
  currentSimpleMenu = menu;
  currentTripleCandidates = [];
  sharedSingleExpanded = false;

  showChipsAndMainButtons();
  clearCelebrateStyle();
  showSingleView();
  hideSingleDecisionButton();
  hideSeeOtherButton();
  hideShareButtons();
  hideRelayButton();
  hideFriendResultButtons();

  resultPanel.classList.add("celebrate");
  setCharacter("images/mogu-celebrate.png", `${menu.name}, 최종 결정 완료! 이제 진짜 점심 먹으러 가자!`);
  resultLabel.textContent = "최종 선택";
  foodName.textContent = `오늘의 메뉴는 ${menu.name} 입니다`;
  foodDesc.textContent = `좋아, ${menu.name}로 확정! 오늘 점심은 이걸로 가자 🎉`;

  rejectCount = 0;
  lastSuggestionKey = menu.name;
  hideDoomResult();

  if (doomButton) {
    doomButton.classList.remove("hidden");
  }

  window.history.replaceState({}, "", window.location.pathname);
}

function restartFromReplyResult() {
  if (!isReplySession) return;

  const filteredMenus = getFilteredMenus();
  if (filteredMenus.length === 0) {
    showSingleView();
    clearCelebrateStyle();
    hideSingleDecisionButton();
    hideSeeOtherButton();
    hideShareButtons();
    hideRelayButton();
    hideFriendResultButtons();

    setCharacter("images/mogu-thinking.png", "조건에 맞는 메뉴가 없네. 다른 조건으로 다시 골라보자!");
    resultLabel.textContent = "조건 재설정";
    foodName.textContent = "메뉴 없음";
    foodDesc.textContent = "카테고리를 해제하거나 다른 조건으로 다시 시도해봐.";

    currentSimpleMenu = null;
    currentTripleCandidates = [];
    sharedSelectedMenu = null;
    return;
  }

  const annoyedText = "친구 의견도 들었고, 새 후보로 다시 간다.";
  const loadingText = "좋다. 친구가 골라준 것도 봤으니 새 판으로 다시 간다.";

  clearCelebrateStyle();
  hideSingleDecisionButton();
  hideSeeOtherButton();
  hideShareButtons();
  hideRelayButton();
  hideFriendResultButtons();
  clearCandidateHighlight();

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

    currentSimpleMenu = currentMode === "simple" ? currentSimpleMenu : null;
    sharedSelectedMenu = null;
    sharedSingleExpanded = false;
    rejectCount = Math.min(rejectCount + 1, 6);

    if (doomButton) {
      doomButton.classList.remove("hidden");
    }

    window.history.replaceState({}, "", window.location.pathname);
  }, 900);
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
  hideSingleDecisionButton();
  hideSeeOtherButton();
  hideShareButtons();
  hideRelayButton();
  hideFriendResultButtons();
  resultLabel.textContent = "모드 변경";
  foodName.textContent = mode === "simple" ? "심플 모드 선택됨" : "3개 후보 모드 선택됨";
  foodDesc.textContent = mode === "simple"
    ? "한 번에 하나를 바로 추천해줄게."
    : "추천 결과창 안에서 후보 3개를 보여줄게.";

  currentSimpleMenu = null;
  currentTripleCandidates = [];
  sharedSelectedMenu = null;
  sharedSingleExpanded = false;
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
  hideSingleDecisionButton();
  hideSeeOtherButton();
  hideShareButtons();
  hideRelayButton();
  hideFriendResultButtons();
  setCharacter("images/mogu-thinking.png", `${selectedCategory} 느낌으로 후보를 좁혀볼게!`);
  resultLabel.textContent = "조건 선택";
  foodName.textContent = selectedCategory;
  foodDesc.textContent = `${selectedCategory} 기준으로 메뉴를 추려서 추천할게.`;
  currentSimpleMenu = null;
  currentTripleCandidates = [];
  sharedSelectedMenu = null;
  sharedSingleExpanded = false;
  clearCandidateHighlight();
}

/* =========================
   Share Helpers
========================= */
function buildShareUrl() {
  const url = new URL(window.location.href);
  url.search = "";

  url.searchParams.set("share", "1");

  if (currentMode === "triple" && currentTripleCandidates.length > 0) {
    url.searchParams.set("mode", "triple");
    url.searchParams.set(
      "items",
      currentTripleCandidates.map((menu) => menu.name).join("|")
    );
  } else if (currentSimpleMenu) {
    url.searchParams.set("mode", "single");
    url.searchParams.set("item", currentSimpleMenu.name);
  } else {
    return null;
  }

  return url.toString();
}

function buildReplyUrl() {
  if (!sharedSelectedMenu) return null;

  const url = new URL(window.location.href);
  url.search = "";
  url.searchParams.set("reply", "1");
  url.searchParams.set("mode", currentMode === "triple" ? "triple" : "single");
  url.searchParams.set("selected", sharedSelectedMenu.name);

  return url.toString();
}

async function shareCurrentState() {
  const shareUrl = buildShareUrl();

  if (!shareUrl) {
    setCharacter("images/mogu-thinking.png", "먼저 추천 결과를 만든 다음에 친구한테 넘겨라.");
    return;
  }

  const shareData = {
    title: "Mugle - 누가 좀 골라줘",
    text: "모구가 대신 물어봄. 이거 좀 골라줘.",
    url: shareUrl
  };

  try {
    if (navigator.share) {
      await navigator.share(shareData);
    } else if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(shareUrl);
      setCharacter("images/mogu-recommend.png", "링크 복사했다. 이제 친구한테 던져라.");
    } else {
      window.prompt("이 링크를 복사해서 공유해줘", shareUrl);
    }
  } catch (error) {
    // 공유 취소 시 무시
  }
}

async function shareReplyResult() {
  const replyUrl = buildReplyUrl();

  if (!replyUrl) {
    setCharacter("images/mogu-thinking.png", "먼저 친구가 메뉴를 골라야 한다.");
    return;
  }

  const shareData = {
    title: "Mugle - 결과 전달",
    text: `대신 골라줬다. 오늘은 ${sharedSelectedMenu.name}다.`,
    url: replyUrl
  };

  try {
    if (navigator.share) {
      await navigator.share(shareData);
      setCharacter("images/mogu-celebrate.png", "결과를 넘겼다. 이제 저 인간이 먹으러 가면 된다.");
    } else if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(replyUrl);
      setCharacter("images/mogu-celebrate.png", "결과 링크 복사했다. 원래 주인에게 돌려줘라.");
    } else {
      window.prompt("이 결과 링크를 복사해서 전달해줘", replyUrl);
    }
  } catch (error) {
    // 공유 취소 시 무시
  }
}

function getMenuByName(name) {
  return menus.find((menu) => menu.name === name) || {
    name,
    desc: "친구가 대신 골라주길 기다리는 메뉴야.",
    categories: []
  };
}

function parseShareParams() {
  const params = new URLSearchParams(window.location.search);
  const isShare = params.get("share") === "1";
  if (!isShare) return null;

  const mode = params.get("mode");

  if (mode === "single") {
    const item = params.get("item");
    if (!item) return null;
    return {
      mode: "single",
      item
    };
  }

  if (mode === "triple") {
    const itemsRaw = params.get("items");
    if (!itemsRaw) return null;
    return {
      mode: "triple",
      items: itemsRaw.split("|")
    };
  }

  return null;
}

function parseReplyParams() {
  const params = new URLSearchParams(window.location.search);
  const isReply = params.get("reply") === "1";
  if (!isReply) return null;

  const selected = params.get("selected");
  const mode = params.get("mode") || "single";

  if (!selected) return null;

  return {
    mode,
    selected
  };
}

function enterSharedSingleMode(itemName) {
  isSharedSession = true;
  isReplySession = false;
  currentMode = "simple";
  currentSimpleMenu = getMenuByName(itemName);
  currentTripleCandidates = [];
  sharedSelectedMenu = null;
  sharedSingleExpanded = false;

  simpleModeBtn.classList.add("active");
  tripleModeBtn.classList.remove("active");

  hideChipsAndMainButtons();
  hideShareButtons();
  hideRelayButton();
  hideFriendResultButtons();
  clearCelebrateStyle();
  showSingleView();

  setCharacter("images/mogu-recommend.png", "이 인간이 또 결정을 못 한다. 네가 대신 정해줘라.");
  resultLabel.textContent = "공유 받은 선택 요청";
  foodName.textContent = currentSimpleMenu.name;
  foodDesc.textContent = currentSimpleMenu.desc;

  if (confirmSingleBtn) {
    confirmSingleBtn.textContent = "이걸로 가자";
  }

  if (singleDecisionWrap) {
    singleDecisionWrap.classList.remove("hidden");
  }

  showSeeOtherButton();
}

function enterSharedTripleMode(itemNames) {
  isSharedSession = true;
  isReplySession = false;
  currentMode = "triple";
  currentSimpleMenu = null;
  currentTripleCandidates = itemNames.map(getMenuByName);
  sharedSelectedMenu = null;
  sharedSingleExpanded = true;

  simpleModeBtn.classList.remove("active");
  tripleModeBtn.classList.add("active");

  hideChipsAndMainButtons();
  hideSingleDecisionButton();
  hideSeeOtherButton();
  hideShareButtons();
  hideRelayButton();
  hideFriendResultButtons();
  clearCelebrateStyle();
  showTripleView();

  setCharacter("images/mogu-recommend.png", "결정 못 하는 놈 대신 네가 골라라.");
  resultLabel.textContent = "공유 받은 선택 요청";
  if (tripleGuide) {
    tripleGuide.textContent = "후보 3개 중 하나를 골라서 결과를 돌려줘";
  }
  candidateButtons.innerHTML = "";

  currentTripleCandidates.forEach((menu) => {
    const button = document.createElement("button");
    button.className = "candidate-btn";
    button.type = "button";
    button.textContent = menu.name;
    button.dataset.menuName = menu.name;
    button.addEventListener("click", () => finalizeSharedSelection(menu));
    candidateButtons.appendChild(button);
  });
}

function expandSharedSingleToTriple() {
  if (!isSharedSession || !currentSimpleMenu) return;

  const filteredMenus = getFilteredMenus();
  const newCandidates = getThreeRandomMenus(filteredMenus);

  sharedSingleExpanded = true;
  currentMode = "triple";
  simpleModeBtn.classList.remove("active");
  tripleModeBtn.classList.add("active");

  setCharacter("images/mogu-recommend.png", "좋다. 완전히 새로운 후보 3개를 다시 뽑아왔다.");
  setTripleCandidates(newCandidates, "마음에 안 들었나 보네. 그럼 새 후보로 다시 간다.");
}

function finalizeSharedSelection(menu) {
  showSingleView();
  hideSingleDecisionButton();
  hideSeeOtherButton();
  hideShareButtons();
  hideFriendResultButtons();
  showRelayButton();
  resultPanel.classList.add("celebrate");
  setCharacter("images/mogu-celebrate.png", `대신 골라줬다. 오늘은 ${menu.name}다.`);
  resultLabel.textContent = "대신 골라줌 완료";
  foodName.textContent = `오늘의 메뉴는 ${menu.name} 입니다`;
  foodDesc.textContent = `좋다. ${menu.name}(으)로 정해줬다. 이제 결과를 돌려주면 된다 🎉`;
  currentSimpleMenu = menu;
  currentTripleCandidates = [];
  sharedSelectedMenu = menu;
  clearCandidateHighlight();
}

function enterReplyMode(selectedName, mode = "single") {
  isReplySession = true;
  isSharedSession = false;
  currentMode = mode === "triple" ? "triple" : "simple";

  const menu = getMenuByName(selectedName);
  currentSimpleMenu = menu;
  currentTripleCandidates = [];
  sharedSelectedMenu = menu;
  sharedSingleExpanded = false;

  hideChipsAndMainButtons();
  hideSingleDecisionButton();
  hideSeeOtherButton();
  hideShareButtons();
  hideRelayButton();
  showSingleView();
  clearCelebrateStyle();
  hideFriendResultButtons();

  resultPanel.classList.add("celebrate");
  setCharacter("images/mogu-celebrate.png", `친구가 대신 정해줬다. 오늘은 ${menu.name}다.`);
  resultLabel.textContent = "친구가 골라준 결과";
  foodName.textContent = `오늘의 메뉴는 ${menu.name} 입니다`;
  foodDesc.textContent = `친구 의견도 들었다. 이걸로 갈지, 새로 다시 뽑을지 정하면 된다.`;
  showFriendResultButtons();
}

function initSharedModeIfNeeded() {
  const shareData = parseShareParams();
  if (!shareData) return false;

  if (shareData.mode === "single") {
    enterSharedSingleMode(shareData.item);
    return true;
  }

  if (shareData.mode === "triple") {
    enterSharedTripleMode(shareData.items);
    return true;
  }

  return false;
}

function initReplyModeIfNeeded() {
  const replyData = parseReplyParams();
  if (!replyData) return false;

  enterReplyMode(replyData.selected, replyData.mode);
  return true;
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
  if (hintShown || isSharedSession || isReplySession) return;
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
    hideSingleDecisionButton();
    hideSeeOtherButton();
    hideShareButtons();
    hideRelayButton();
    hideFriendResultButtons();
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
    sharedSelectedMenu = targetMenu;
    return;
  }

  hideSingleDecisionButton();
  hideSeeOtherButton();
  hideShareButtons();
  hideRelayButton();
  hideFriendResultButtons();
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
  sharedSelectedMenu = targetMenu;
}

function handleDoomPressStart(event) {
  if (!doomButton || isSharedSession || isReplySession) return;
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
  if (!doomButton || isSharedSession || isReplySession) return;

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
  if (isSharedSession || isReplySession) return;
  rejectCount = 0;
  setThinkingState();
});

searchBtn.addEventListener("click", () => {
  if (isSharedSession || isReplySession) return;

  const filteredMenus = getFilteredMenus();

  if (filteredMenus.length === 0) {
    showSingleView();
    hideSingleDecisionButton();
    hideSeeOtherButton();
    hideShareButtons();
    hideRelayButton();
    hideFriendResultButtons();
    setCharacter("images/mogu-thinking.png", "조건에 맞는 메뉴가 없네. 다른 조건으로 다시 골라보자!");
    resultLabel.textContent = "조건 재설정";
    foodName.textContent = "메뉴 없음";
    foodDesc.textContent = "카테고리를 해제하거나 다른 조건으로 다시 시도해봐.";
    currentSimpleMenu = null;
    currentTripleCandidates = [];
    sharedSelectedMenu = null;
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

simpleModeBtn.addEventListener("click", () => {
  if (isSharedSession || isReplySession) return;
  activateMode("simple");
});

tripleModeBtn.addEventListener("click", () => {
  if (isSharedSession || isReplySession) return;
  activateMode("triple");
});

chipButtons.forEach((button) => {
  button.addEventListener("click", () => {
    if (isSharedSession || isReplySession) return;
    activateCategory(button.dataset.category);
  });
});

if (confirmSingleBtn) {
  confirmSingleBtn.addEventListener("click", () => {
    if (!currentSimpleMenu) return;

    if (isSharedSession) {
      finalizeSharedSelection(currentSimpleMenu);
    } else if (!isReplySession) {
      finalizeSelection(currentSimpleMenu);
    }
  });
}

if (seeOtherBtn) {
  seeOtherBtn.addEventListener("click", () => {
    if (!isSharedSession || isReplySession) return;
    expandSharedSingleToTriple();
  });
}

if (shareSingleBtn) {
  shareSingleBtn.addEventListener("click", async () => {
    await shareCurrentState();
  });
}

if (shareTripleBtn) {
  shareTripleBtn.addEventListener("click", async () => {
    await shareCurrentState();
  });
}

if (relayResultBtn) {
  relayResultBtn.addEventListener("click", async () => {
    await shareReplyResult();
  });
}

if (confirmFriendResultBtn) {
  confirmFriendResultBtn.addEventListener("click", () => {
    if (!isReplySession || !currentSimpleMenu) return;
    finalizeReplySelection(currentSimpleMenu);
  });
}

if (restartFromFriendBtn) {
  restartFromFriendBtn.addEventListener("click", () => {
    if (!isReplySession) return;
    restartFromReplyResult();
  });
}

window.addEventListener("load", () => {
  bindDoomButtonEvents();

  const enteredReply = initReplyModeIfNeeded();
  if (enteredReply) {
    doomButton?.classList.add("hidden");
    return;
  }

  const enteredShared = initSharedModeIfNeeded();
  if (enteredShared) {
    doomButton?.classList.add("hidden");
    return;
  }

  showChipsAndMainButtons();
  setMainState();

  setTimeout(() => {
    if (!hintShown) {
      hintShown = true;
      showHintBubble("진짜 못 고르겠으면... 왼쪽 위를 건드려봐라.");
    }
  }, 1800);
});
