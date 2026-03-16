import { menus } from "./data/menus.js";
import { moguStates } from "./characters/mogu.js";

let skipCount = 0;
let isResultMode = false;

const listEl = document.getElementById("menu-list");
const messageEl = document.getElementById("message");
const characterEl = document.getElementById("character");
const againBtn = document.getElementById("again");
const recommendBtn = document.getElementById("recommendBtn");
const resetBtn = document.getElementById("resetBtn");

const styleSelect = document.getElementById("styleSelect");
const soloSelect = document.getElementById("soloSelect");
const quickSelect = document.getElementById("quickSelect");
const budgetSelect = document.getElementById("budgetSelect");

const resultBox = document.getElementById("resultBox");
const resultMenu = document.getElementById("resultMenu");
const resultJpName = document.getElementById("resultJpName");
const filterBox = document.getElementById("filterBox");

function setMood(mood) {
  characterEl.className = `character mood-${mood}`;
}

function updateMood() {
  if (isResultMode) {
    return;
  }

  let stateIndex = skipCount;

  if (stateIndex >= moguStates.length) {
    stateIndex = moguStates.length - 1;
  }

  const state = moguStates[stateIndex];
  messageEl.innerText = state.message;
  setMood(state.mood);
}

function getFilteredMenus() {
  const style = styleSelect.value;
  const solo = soloSelect.value;
  const quick = quickSelect.value;
  const budget = budgetSelect.value;

  return menus.filter((menu) => {
    let styleMatch = true;
    let soloMatch = true;
    let quickMatch = true;
    let budgetMatch = true;

    if (style === "light") {
      styleMatch = menu.heavyLevel <= 2;
    } else if (style === "heavy") {
      styleMatch = menu.heavyLevel >= 2;
    }

    if (solo === "solo") {
      soloMatch = menu.soloFriendly === true;
    }

    if (quick === "quick") {
      quickMatch = menu.quick === true;
    }

    if (budget === "cheap") {
      budgetMatch = menu.priceLevel === 1;
    } else if (budget === "normal") {
      budgetMatch = menu.priceLevel <= 2;
    }

    return styleMatch && soloMatch && quickMatch && budgetMatch;
  });
}

function getRandomMenusFromList(sourceList, count) {
  const shuffled = [...sourceList].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

function showResult(menu) {
  isResultMode = true;

  resultMenu.innerText = menu.name;
  resultJpName.innerText = menu.jpName;

  resultBox.classList.remove("hidden");
  resetBtn.classList.remove("hidden");

  listEl.classList.add("hidden");
  filterBox.classList.add("hidden");
  recommendBtn.classList.add("hidden");
  againBtn.classList.add("hidden");

  messageEl.innerText = `${menu.name}, 오늘 점심은 이걸로 가자!`;
  setMood("happy");
}

function chooseMenu(menu) {
  showResult(menu);
}

function renderMenus() {
  const filteredMenus = getFilteredMenus();

  listEl.innerHTML = "";
  listEl.classList.remove("hidden");
  resultBox.classList.add("hidden");
  resetBtn.classList.add("hidden");

  filterBox.classList.remove("hidden");
  recommendBtn.classList.remove("hidden");
  againBtn.classList.remove("hidden");

  isResultMode = false;

  if (filteredMenus.length === 0) {
    messageEl.innerText = "조건에 맞는 메뉴가 없어요. 조건을 조금 완화해볼까?";
    setMood("sad");
    return;
  }

  const selectedMenus = getRandomMenusFromList(
    filteredMenus,
    Math.min(3, filteredMenus.length)
  );

  selectedMenus.forEach((menu) => {
    const btn = document.createElement("button");
    btn.className = "menu-button";
    btn.innerHTML = `${menu.name}<span class="jp-name">${menu.jpName}</span>`;

    btn.addEventListener("click", () => {
      chooseMenu(menu);
    });

    listEl.appendChild(btn);
  });

  updateMood();
}

function resetApp() {
  skipCount = 0;
  isResultMode = false;

  resultBox.classList.add("hidden");
  resetBtn.classList.add("hidden");

  listEl.classList.remove("hidden");
  filterBox.classList.remove("hidden");
  recommendBtn.classList.remove("hidden");
  againBtn.classList.remove("hidden");

  updateMood();
  renderMenus();
}

recommendBtn.addEventListener("click", () => {
  skipCount = 0;
  isResultMode = false;
  renderMenus();
});

againBtn.addEventListener("click", () => {
  skipCount += 1;
  isResultMode = false;
  renderMenus();
});

resetBtn.addEventListener("click", () => {
  resetApp();
});

renderMenus();