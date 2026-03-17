const moguCharacter = document.getElementById("moguCharacter");
const messageBubble = document.getElementById("messageBubble");
const foodName = document.getElementById("foodName");
const foodDesc = document.getElementById("foodDesc");
const thinkBtn = document.getElementById("thinkBtn");
const searchBtn = document.getElementById("searchBtn");
const chipButtons = document.querySelectorAll(".chip-btn");
const installBtn = document.getElementById("installBtn");

const menus = [
  { name: "라멘", desc: "따뜻하고 진한 국물로 만족감이 높은 메뉴야." },
  { name: "카레라이스", desc: "든든하게 배를 채우고 싶을 때 잘 어울려." },
  { name: "초밥", desc: "조금 더 깔끔하고 가볍게 먹고 싶다면 좋아." },
  { name: "햄버거", desc: "기분 전환하고 싶을 때 만족도가 높은 선택이야." },
  { name: "돈카츠", desc: "바삭한 식감과 든든함이 필요할 때 추천해." },
  { name: "오므라이스", desc: "부드럽고 편안한 한 끼가 생각날 때 좋아." },
  { name: "우동", desc: "부담 없이 따뜻하게 먹고 싶을 때 잘 맞아." },
  { name: "파스타", desc: "조금 분위기 있게 먹고 싶을 때 괜찮은 선택이야." }
];

let deferredPrompt = null;

function clearCharacterAnimations() {
  moguCharacter.classList.remove(
    "bounce-float",
    "thinking-anim",
    "loading-anim",
    "recommend-anim",
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

function setMainState() {
  setCharacter(
    "images/mogu-main.png",
    "모구가 오늘의 메뉴를 같이 찾아줄게!",
    "bounce-float"
  );
  foodName.textContent = "추천 버튼을 눌러보자";
  foodDesc.textContent = "기분에 맞는 메뉴를 모구가 골라줄게.";
}

function setThinkingState() {
  setCharacter(
    "images/mogu-thinking.png",
    "음... 오늘은 뭘 먹을까? 같이 고민해보자!",
    "thinking-anim"
  );
  foodName.textContent = "메뉴 고민 중";
  foodDesc.textContent = "라멘, 카레, 초밥, 햄버거... 뭐가 좋을까?";
}

function setLoadingState() {
  setCharacter(
    "images/mogu-loading.png",
    "모구가 맛있는 메뉴를 열심히 찾는 중이야!",
    "loading-anim"
  );
  foodName.textContent = "검색 중...";
  foodDesc.textContent = "취향에 맞는 메뉴를 빠르게 고르고 있어.";
}

function setRecommendState(menu) {
  setCharacter(
    "images/mogu-recommend.png",
    "이 메뉴 어때? 모구의 추천 결과야!",
    "recommend-anim"
  );
  foodName.textContent = menu.name;
  foodDesc.textContent = menu.desc;
}

function getRandomMenu() {
  const randomIndex = Math.floor(Math.random() * menus.length);
  return menus[randomIndex];
}

thinkBtn.addEventListener("click", () => {
  setThinkingState();
});

searchBtn.addEventListener("click", () => {
  setLoadingState();

  setTimeout(() => {
    const pickedMenu = getRandomMenu();
    setRecommendState(pickedMenu);
  }, 1600);
});

chipButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const selectedFood = button.dataset.food;
    const matchedMenu = menus.find((menu) => menu.name === selectedFood);

    if (!matchedMenu) return;

    setCharacter(
      "images/mogu-thinking.png",
      `${selectedFood} 쪽으로 마음이 기우는 것 같아!`,
      "thinking-anim"
    );
    foodName.textContent = matchedMenu.name;
    foodDesc.textContent = matchedMenu.desc;
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
  setMainState();

  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("./service-worker.js").catch((error) => {
      console.error("Service Worker registration failed:", error);
    });
  }
});
