const moguCharacter = document.getElementById("moguCharacter");
const messageBubble = document.getElementById("messageBubble");
const foodName = document.getElementById("foodName");
const foodDesc = document.getElementById("foodDesc");
const resultLabel = document.getElementById("resultLabel");
const thinkBtn = document.getElementById("thinkBtn");
const searchBtn = document.getElementById("searchBtn");
const chipButtons = document.querySelectorAll(".chip-btn");
const installBtn = document.getElementById("installBtn");
const simpleModeBtn = document.getElementById("simpleModeBtn");
const tripleModeBtn = document.getElementById("tripleModeBtn");
const candidateSection = document.getElementById("candidateSection");
const candidateList = document.getElementById("candidateList");
const celebrationSection = document.getElementById("celebrationSection");
const celebrationText = document.getElementById("celebrationText");
const resultPanel = document.querySelector(".result-panel");

let deferredPrompt = null;
let currentMode = "simple";
let selectedCategory = null;

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

function resetCelebration() {
  celebrationSection.classList.add("hidden");
  resultPanel.classList.remove("celebrate");
}

function resetCandidates() {
  candidateSection.classList.add("hidden");
  candidateList.innerHTML = "";
}

function setMainState() {
  resetCelebration();
  resetCandidates();

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
  resetCelebration();
  resetCandidates();

  setCharacter(
    "images/mogu-thinking.png",
    "음... 오늘은 뭘 먹을까? 같이 후보를 좁혀보자!",
    "thinking-anim"
  );
  resultLabel.textContent = "고민 중";
  foodName.textContent = "메뉴 고민 중";
  foodDesc.textContent = "오늘 기분과 배고픔 정도를 생각해보자.";
}

function setLoadingState() {
  resetCelebration();
  resetCandidates();

  setCharacter(
    "images/mogu-loading.png",
    "모구가 직장인 맞춤 메뉴를 열심히 찾는 중이야!",
    "loading-anim"
  );
  resultLabel.textContent = "검색 중";
  foodName.textContent = "추천 준비 중...";
  foodDesc.textContent = "30대 초반 회사원이 좋아할 만한 메뉴를 추리는 중이야.";
}

function setRecommendState(menu) {
  setCharacter(
    "images/mogu-recommend.png",
    "이 메뉴 어때? 모구의 추천 결과야!",
    "recommend-anim"
  );
  resultLabel.textContent = "추천 결과";
  foodName.textContent = menu.name;
  foodDesc.textContent = menu.desc;
}

function setCelebrateState(menuName) {
  setCharacter(
    "images/mogu-recommend.png",
    `${menuName}, 최종 확정! 오늘 점심 결정 완료!`,
    "celebrate-anim"
  );
  resultLabel.textContent = "최종 선택";
  resultPanel.classList.add("celebrate");
  celebrationSection.classList.remove("hidden");
  celebrationText.textContent = `좋아, 오늘 메뉴는 "${menuName}"로 확정! 맛있게 먹자 🎉`;
}

function getFilteredMenus() {
  if (!selectedCategory) return menus;

  return menus.filter((menu) => menu.categories.includes(selectedCategory));
}

function getRandomMenu(list) {
  const randomIndex = Math.floor(Math.random() * list.length);
  return list[randomIndex];
}

function getThreeRandomMenus(list) {
  const copied = [...list];
  const picked = [];

  while (copied.length > 0 && picked.length < 3) {
    const index = Math.floor(Math.random() * copied.length);
    picked.push(copied.splice(index, 1)[0]);
  }

  return picked;
}

function renderCandidates(candidateMenus) {
  candidateList.innerHTML = "";

  candidateMenus.forEach((menu) => {
    const card = document.createElement("div");
    card.className = "candidate-card";

    card.innerHTML = `
      <h4>${menu.name}</h4>
      <p>${menu.desc}</p>
      <div class="candidate-action">
        <button class="pick-btn" type="button">이걸로 결정</button>
      </div>
    `;

    const pickBtn = card.querySelector(".pick-btn");
    pickBtn.addEventListener("click", () => {
      setCelebrateState(menu.name);
      foodName.textContent = menu.name;
      foodDesc.textContent = menu.desc;
    });

    candidateList.appendChild(card);
  });

  candidateSection.classList.remove("hidden");
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

  resetCelebration();
  resetCandidates();
}

function activateCategory(category) {
  if (selectedCategory === category) {
    selectedCategory = null;
    chipButtons.forEach((btn) => btn.classList.remove("active"));
    return;
  }

  selectedCategory = category;

  chipButtons.forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.category === category);
  });
}

thinkBtn.addEventListener("click", () => {
  setThinkingState();
});

searchBtn.addEventListener("click", () => {
  const filteredMenus = getFilteredMenus();

  if (filteredMenus.length === 0) {
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

  setLoadingState();

  setTimeout(() => {
    if (currentMode === "simple") {
      const picked = getRandomMenu(filteredMenus);
      setRecommendState(picked);
    } else {
      setCharacter(
        "images/mogu-recommend.png",
        "좋아, 고민하기 좋게 후보 3개를 준비했어!",
        "recommend-anim"
      );
      resultLabel.textContent = "후보 3개";
      foodName.textContent = "마음 가는 메뉴를 골라봐";
      foodDesc.textContent = "딱 하나만 선택하면 모구가 확정해줄게.";
      renderCandidates(getThreeRandomMenus(filteredMenus));
    }
  }, 1500);
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

    if (selectedCategory) {
      setCharacter(
        "images/mogu-thinking.png",
        `${selectedCategory} 느낌으로 후보를 좁혀볼게!`,
        "thinking-anim"
      );
      resultLabel.textContent = "조건 선택";
      foodName.textContent = selectedCategory;
      foodDesc.textContent = `${selectedCategory} 기준으로 메뉴를 다시 추려볼 수 있어.`;
    } else {
      setMainState();
    }
  });
});

window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  deferredPrompt = e;
  installBtn.hidden = false;
});

installBtn.addEventListener("click", async () => {
  if (!deferredPrompt) return;

  deferredPrompt.prompt();
  await deferredPrompt.userChoice;
  deferredPrompt = null;
  installBtn.hidden = true;
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
