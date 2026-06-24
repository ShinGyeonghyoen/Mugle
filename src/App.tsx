import { useEffect, useMemo, useState } from "react";
import { ChipSelector } from "./components/ChipSelector";
import { DecisionCard } from "./components/DecisionCard";
import { MealHistory } from "./components/MealHistory";
import { MenuCard } from "./components/MenuCard";
import { MoguBreak } from "./components/MoguBreak";
import { MoguPong } from "./components/MoguPong";
import { MoguStage } from "./components/MoguStage";
import { menus } from "./data/menus";
import { getStageByRejectCount, pickMoguStageMessage } from "./data/reactions";
import { recommendMenu } from "./lib/recommendation";
import {
  applyMoguExp,
  createRecordId,
  getMoguStageLabel,
  getRecentMenuIds,
  loadMealRecords,
  loadMoguProgress,
  recordMoguReject,
  saveMealRecord,
  saveMoguProgress
} from "./lib/storage";
import type { ChipId, MealRecord, Menu, MoguExpResult, MoguProgress, MoguReaction, MoodStage } from "./types";

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
