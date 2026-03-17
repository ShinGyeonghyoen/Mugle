const moguCharacter = document.getElementById("moguCharacter");
const messageBubble = document.getElementById("messageBubble");
const foodName = document.getElementById("foodName");
const foodDesc = document.getElementById("foodDesc");
const resultLabel = document.getElementById("resultLabel");
const thinkBtn = document.getElementById("thinkBtn");
const searchBtn = document.getElementById("searchBtn");
const chipButtons = document.querySelectorAll(".chip-btn");
const simpleModeBtn = document.getElementById("simpleModeBtn");
const tripleModeBtn = document.getElementById("tripleModeBtn");
const resultPanel = document.getElementById("resultPanel");
const singleResultView = document.getElementById("singleResultView");
const tripleResultView = document.getElementById("tripleResultView");
const candidateButtons = document.getElementById("candidateButtons");

let currentMode = "simple";
let selectedCategory = null;
let rejectCount = 0;
let lastSuggestionKey = null;

const annoyedMessages = [
  "흠... 이것도 별로야? 그럼 다시 골라볼게.",
  "꽤 괜찮았는데... 알겠어, 다시 찾아볼게.",
  "입맛이 꽤 까다롭네. 이번엔 더 신중하게 간다.",
  "와, 진짜 결정 어렵다. 그래도 모구는 포기 안 해.",
  "이 정도면 거의 점심 면접 수준인데? 다시 간다.",
  "모구 힘들다... 이번엔 진짜 골라줘. 마지막 각오로 간다."
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

function clearCharacterAnimations() {
  moguCharacter.classList.remove(
    "bounce-float",
    "thinking-anim",
    "loading-anim",
    "recommend-anim",
    "celebrate-anim",
    "fade-in"
  );
}

function setCharacter(imagePath, message, animationClass) {
  moguCharacter.src = imagePath;
  messageBubble.textContent = message;

  clearCharacterAnimations();
  void moguCharacter.offsetWidth;
  moguCharacter.classList.add(animationClass, "fade-in");
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

function setMainState() {
  clearCelebrateStyle();
  showSingleView();

  setCharacter(
    "images/mogu-main.png",
    "오늘도 결정이 어렵지? 모구가 도와줄게!",
    "bounce-float"
  );

  resultLabel.textContent = "오늘의 추천";
  foodName.textContent = "모드를 선택하고 시작해보자";
  foodDesc.textContent = "빠르게 하나 고르거나, 후보 3개 중에서 최종 선택할 수 있어.";
}

function setThinkingState() {
  clearCelebrateStyle();
  showSingleView();

  setCharacter(
    "images/mogu-thinking.png",
    "음... 오늘은 뭘 먹을까? 같이 좁혀보자!",
    "thinking-anim"
  );

  resultLabel.textContent = "고민 중";
  foodName.textContent = "메뉴 고민 중";
  foodDesc.textContent = "조건을 정하고 추천을 받아보자.";
}

function setLoadingState(customMessage = "모구가 직장인 맞춤 메뉴를 열심히 찾는 중이야!") {
  clearCelebrateStyle();
  showSingleView();

  setCharacter(
    "images/mogu-loading.png",
    customMessage,
    "loading-anim"
  );

  resultLabel.textContent = "검색 중";
  foodName.textContent = "추천 준비 중...";
  foodDesc.textContent = "취향과 분위기를 고려해서 추리는 중이야.";
}

function setRecommendState(menu, annoyedText = null) {
  clearCelebrateStyle();
  showSingleView();

  const baseMessage = annoyedText ? annoyedText : "이 메뉴 어때? 모구의 추천 결과야!";

  setCharacter(
    "images/mogu-recommend.png",
    baseMessage,
    "recommend-anim"
  );

  resultLabel.textContent = "추천 결과";
  foodName.textContent = menu.name;
  foodDesc.textContent = menu.desc;
}

function setTripleCandidates(candidateMenus, annoyedText = null) {
  clearCelebrateStyle();
  showTripleView();

  setCharacter(
    "images/mogu-recommend.png",
    annoyedText || "좋아, 고민하기 좋게 후보 3개를 준비했어!",
    "recommend-anim"
  );

  resultLabel.textContent = "후보 3개";
  candidateButtons.innerHTML = "";

  candidateMenus.forEach((menu) => {
    const button = document.createElement("button");
    button.className = "candidate-btn";
    button.type = "button";
    button.textContent = menu.name;

    button.addEventListener("click", () => {
      finalizeSelection(menu);
    });

    candidateButtons.appendChild(button);
  });
}

function finalizeSelection(menu) {
  showSingleView();
  clearCelebrateStyle();
  resultPanel.classList.add("celebrate");

  setCharacter(
    "images/mogu-celebrate.png",
    `${menu.name}, 최종 결정 완료! 이제 맛있게 먹기만 하면 돼!`,
    "celebrate-anim"
  );

  resultLabel.textContent = "최종 선택";
  foodName.textContent = `오늘의 메뉴는 ${menu.name} 입니다`;
  foodDesc.textContent = `좋아, ${menu.name}로 확정! 오늘 점심은 이걸로 가자 🎉`;

  rejectCount = 0;
  lastSuggestionKey = menu.name;
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

  setCharacter(
    "images/mogu-thinking.png",
    `${selectedCategory} 느낌으로 후보를 좁혀볼게!`,
    "thinking-anim"
  );

  resultLabel.textContent = "조건 선택";
  foodName.textContent = selectedCategory;
  foodDesc.textContent = `${selectedCategory} 기준으로 메뉴를 추려서 추천할게.`;
}

thinkBtn.addEventListener("click", () => {
  rejectCount = 0;
  setThinkingState();
});

searchBtn.addEventListener("click", () => {
  const filteredMenus = getFilteredMenus();

  if (filteredMenus.length === 0) {
    showSingleView();
    setCharacter(
      "images/mogu-thinking.png",
      "조건에 맞는 메뉴가 없네. 다른 조건으로 다시 골라보자!",
      "thinking-anim"
    );
    resultLabel.textContent = "조건 재설정";
    foodName.textContent = "메뉴 없음";
    foodDesc.textContent = "카테고리를 해제하거나 다른 조건으로 다시 시도해봐.";
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
  }, 1200);
});

simpleModeBtn.addEventListener("click", () => {
  activateMode("simple");
});

tripleModeBtn.addEventListener("click", () => {
  activateMode("triple");
});

chipButtons.forEach((button) => {
  button.addEventListener("click", () => {
    activateCategory(button.dataset.category);
  });
});

window.addEventListener("load", () => {
  activateMode("simple");
  setMainState();

  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("./service-worker.js").catch((error) => {
      console.error("Service Worker registration failed:", error);
    });
  }
});
