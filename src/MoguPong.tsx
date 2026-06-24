import { useEffect, useRef, useState } from "react";

interface MoguPongProps {
  onClose: () => void;
  onMessage: (message: string) => void;
  onUserWin: () => void;
  onMoguWin: () => void;
}

type PongItemType = "ramen" | "cold" | "doom";
type PongEffect = "smash" | "counter" | "item" | null;
type PongActiveEffect = "SPD" | "SLOW" | "x2" | null;

interface FloatingText {
  text: string;
  x: number;
  y: number;
  color: string;
  createdAt: number;
}

interface PongItem {
  type: PongItemType;
  x: number;
  y: number;
  radius: number;
}

interface PongState {
  ballX: number;
  ballY: number;
  ballVX: number;
  ballVY: number;
  userX: number;
  moguX: number;
  rally: number;
  item: PongItem | null;
  doomBall: boolean;
  lastSmashRally: number;
  effect: PongEffect;
  effectUntil: number;
  floatingText: FloatingText | null;
  running: boolean;
  ended: boolean;
}

const PONG_CANVAS_WIDTH = 340;
const PONG_CANVAS_HEIGHT = 420;
const PONG_PADDLE_WIDTH = 82;
const PONG_PADDLE_HEIGHT = 12;
const PONG_USER_Y = PONG_CANVAS_HEIGHT - 38;
const PONG_MOGU_Y = 28;
const PONG_BALL_RADIUS = 8;
const PONG_INITIAL_SPEED = 4.45;
const PONG_MAX_SPEED = 9;
const PONG_SPEED_INCREASE = 1.045;
const PONG_SMASH_CHANCE = 0.22;
const PONG_ITEM_CHANCE = 0.26;
const PONG_MAX_BOUNCE_ANGLE = 1.12;
const PONG_WIN_SCORE = 3;

const smashMessages = ["모구 스매시 간다!", "이건 못 받겠지?", "메뉴 선택권은 내가 가져간다!"];
const counterMessages = ["오? 반격?", "제법인데?", "이번 건 좀 인정."];
const itemMeta: Record<PongItemType, { emoji: string; label: PongActiveEffect; message: string; collectText: string; color: string }> = {
  ramen: { emoji: "🍜", label: "SPD", message: "공 속도 증가!", collectText: "SPD", color: "#ffb14d" },
  cold: { emoji: "🧊", label: "SLOW", message: "공 속도 감소!", collectText: "SLOW", color: "#70b8e8" },
  doom: { emoji: "☢", label: "x2", message: "득점 x2 발동!", collectText: "x2", color: "#ef5b4d" }
};

export function MoguPong({ onClose, onMessage, onUserWin, onMoguWin }: MoguPongProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const stateRef = useRef<PongState>(createInitialPongState());
  const scoreRef = useRef({ user: 0, mogu: 0 });
  const pongAnimationId = useRef<number | null>(null);
  const effectTimeoutId = useRef<number | null>(null);
  const itemTimeoutId = useRef<number | null>(null);
  const finishTimeoutId = useRef<number | null>(null);
  const [isPongPlaying, setIsPongPlaying] = useState(false);
  const [pongUserScore, setPongUserScore] = useState(0);
  const [pongMoguScore, setPongMoguScore] = useState(0);
  const [pongRallyCount, setPongRallyCount] = useState(0);
  const [visualEffect, setVisualEffect] = useState<PongEffect>(null);
  const [activeEffectLabel, setActiveEffectLabel] = useState<PongActiveEffect>(null);

  useEffect(() => {
    drawPong();
    onMessage("나랑 한 판 해서 오늘 메뉴를 정하자.");

    return () => {
      stopPongLoop();
      clearPongTimers();
    };
  }, []);

  function startGame() {
    stopPongLoop();
    clearPongTimers();
    stateRef.current = createInitialPongState();
    stateRef.current.running = true;
    scoreRef.current = { user: 0, mogu: 0 };
    setPongUserScore(0);
    setPongMoguScore(0);
    setPongRallyCount(0);
    setVisualEffect(null);
    setActiveEffectLabel(null);
    setIsPongPlaying(true);
    onMessage("나랑 한 판 해서 오늘 메뉴를 정하자.");
    pongAnimationId.current = window.requestAnimationFrame(updatePong);
  }

  function closeGame() {
    stopPongLoop();
    clearPongTimers();
    setIsPongPlaying(false);
    onClose();
  }

  function stopPongLoop() {
    if (pongAnimationId.current !== null) {
      window.cancelAnimationFrame(pongAnimationId.current);
      pongAnimationId.current = null;
    }
    stateRef.current.running = false;
  }

  function clearEffectTimer() {
    if (effectTimeoutId.current !== null) {
      window.clearTimeout(effectTimeoutId.current);
      effectTimeoutId.current = null;
    }
  }

  function clearPongTimers() {
    clearEffectTimer();
    if (itemTimeoutId.current !== null) {
      window.clearTimeout(itemTimeoutId.current);
      itemTimeoutId.current = null;
    }
    if (finishTimeoutId.current !== null) {
      window.clearTimeout(finishTimeoutId.current);
      finishTimeoutId.current = null;
    }
  }

  function updatePong() {
    const state = stateRef.current;
    if (!state.running || state.ended) return;

    state.ballX += state.ballVX;
    state.ballY += state.ballVY;

    if (state.ballX <= PONG_BALL_RADIUS || state.ballX >= PONG_CANVAS_WIDTH - PONG_BALL_RADIUS) {
      state.ballVX *= -1;
      state.ballX = clamp(state.ballX, PONG_BALL_RADIUS, PONG_CANVAS_WIDTH - PONG_BALL_RADIUS);
    }

    moveMoguPaddle(state);
    handlePaddleCollision(state);
    handleItemCollision(state);
    handleScore(state);
    drawPong();

    if (!state.ended) {
      pongAnimationId.current = window.requestAnimationFrame(updatePong);
    }
  }

  function moveMoguPaddle(state: PongState) {
    const target = state.ballX - PONG_PADDLE_WIDTH / 2 + Math.sin(Date.now() / 210) * 8;
    const speed = getMoguAiSpeed(state.rally);
    state.moguX += clamp(target - state.moguX, -speed, speed);
    state.moguX = clamp(state.moguX, 0, PONG_CANVAS_WIDTH - PONG_PADDLE_WIDTH);
  }

  function getMoguAiSpeed(rally: number) {
    if (rally >= 15) return 5.4;
    if (rally >= 10) return 4.8;
    if (rally >= 5) return 4.0;
    return 3.2;
  }

  function handlePaddleCollision(state: PongState) {
    const hitUser =
      state.ballVY > 0 &&
      state.ballY + PONG_BALL_RADIUS >= PONG_USER_Y &&
      state.ballY - PONG_BALL_RADIUS <= PONG_USER_Y + PONG_PADDLE_HEIGHT &&
      state.ballX >= state.userX &&
      state.ballX <= state.userX + PONG_PADDLE_WIDTH;

    const hitMogu =
      state.ballVY < 0 &&
      state.ballY - PONG_BALL_RADIUS <= PONG_MOGU_Y + PONG_PADDLE_HEIGHT &&
      state.ballY + PONG_BALL_RADIUS >= PONG_MOGU_Y &&
      state.ballX >= state.moguX &&
      state.ballX <= state.moguX + PONG_PADDLE_WIDTH;

    if (!hitUser && !hitMogu) return;

    const paddleX = hitUser ? state.userX : state.moguX;
    const relativeHit = clamp((state.ballX - (paddleX + PONG_PADDLE_WIDTH / 2)) / (PONG_PADDLE_WIDTH / 2), -1, 1);
    const nextSpeed = Math.min(PONG_MAX_SPEED, getBallSpeed(state) * PONG_SPEED_INCREASE);
    reflectBall(state, relativeHit, nextSpeed, hitUser ? -1 : 1);
    state.ballY = hitUser
      ? PONG_USER_Y - PONG_BALL_RADIUS - 1
      : PONG_MOGU_Y + PONG_PADDLE_HEIGHT + PONG_BALL_RADIUS + 1;
    state.rally += 1;
    setPongRallyCount(state.rally);

    if (hitUser && Math.abs(relativeHit) >= 0.72) {
      reflectBall(state, relativeHit, Math.min(PONG_MAX_SPEED, getBallSpeed(state) * 1.12), -1);
      showEffect("counter", 260);
      onMessage(randomPick(counterMessages));
    } else if (hitMogu && shouldMoguSmash(state)) {
      reflectBall(state, relativeHit * 0.8, Math.min(PONG_MAX_SPEED, getBallSpeed(state) * 1.24), 1);
      state.lastSmashRally = state.rally;
      showEffect("smash", 320);
      onMessage(randomPick(smashMessages));
    } else {
      if (state.rally === 5) onMessage("생각보다 오래 버티는데?");
      if (state.rally === 10) onMessage("좋다. 이 정도면 인정해주지.");
    }

    maybeSpawnItem(state);
  }

  function shouldMoguSmash(state: PongState) {
    return state.rally >= 6 && state.rally - state.lastSmashRally >= 4 && Math.random() < PONG_SMASH_CHANCE;
  }

  function reflectBall(state: PongState, relativeHit: number, speed: number, verticalDirection: 1 | -1) {
    const angle = relativeHit * PONG_MAX_BOUNCE_ANGLE;
    state.ballVX = Math.sin(angle) * speed;
    state.ballVY = Math.cos(angle) * speed * verticalDirection;
  }

  function maybeSpawnItem(state: PongState) {
    if (state.rally < 5 || state.item || Math.random() > PONG_ITEM_CHANCE) return;

    state.item = {
      type: randomPick(["ramen", "cold", "doom"] as PongItemType[]),
      x: 44 + Math.random() * (PONG_CANVAS_WIDTH - 88),
      y: 110 + Math.random() * (PONG_CANVAS_HEIGHT - 220),
      radius: 15
    };
  }

  function handleItemCollision(state: PongState) {
    if (!state.item) return;

    const distance = Math.hypot(state.ballX - state.item.x, state.ballY - state.item.y);
    if (distance > state.item.radius + PONG_BALL_RADIUS) return;

    const item = state.item;
    state.item = null;
    showEffect("item", 300);
    const meta = itemMeta[item.type];
    onMessage(meta.message);
    setFloatingText(meta.collectText, item.x, item.y, meta.color);

    if (item.type === "ramen") {
      setActiveEffectLabel("SPD");
      scaleBallSpeed(state, 1.18);
      scheduleSpeedRestore(1 / 1.18, 2200, "SPD");
    }

    if (item.type === "cold") {
      setActiveEffectLabel("SLOW");
      scaleBallSpeed(state, 0.78, 3.8);
      scheduleSpeedRestore(1 / 0.78, 1800, "SLOW");
    }

    if (item.type === "doom") {
      state.doomBall = true;
      setActiveEffectLabel("x2");
    }
  }

  function handleScore(state: PongState) {
    if (state.ballY < -PONG_BALL_RADIUS) {
      const point = state.doomBall ? 2 : 1;
      addScore("user", point);
      onMessage(point === 2 ? "2점 들어갔다!" : "오? 제법인데?");
      if (point === 2) setFloatingText("+2", state.ballX, 42, "#ef5b4d");
      if (scoreRef.current.user >= PONG_WIN_SCORE) {
        finishGame("user");
        return;
      }
      if (point === 1) maybeShowDeuceMessage();
      resetBall(1);
    }

    if (state.ballY > PONG_CANVAS_HEIGHT + PONG_BALL_RADIUS) {
      const point = state.doomBall ? 2 : 1;
      addScore("mogu", point);
      onMessage(point === 2 ? "2점 들어갔다!" : "메뉴도 못 고르더니 공도 못 받네.");
      if (point === 2) setFloatingText("+2", state.ballX, PONG_CANVAS_HEIGHT - 42, "#ef5b4d");
      if (scoreRef.current.mogu >= PONG_WIN_SCORE) {
        finishGame("mogu");
        return;
      }
      if (point === 1) maybeShowDeuceMessage();
      resetBall(-1);
    }
  }

  function addScore(player: "user" | "mogu", point: number) {
    scoreRef.current[player] = Math.min(PONG_WIN_SCORE, scoreRef.current[player] + point);
    setPongUserScore(scoreRef.current.user);
    setPongMoguScore(scoreRef.current.mogu);
  }

  function maybeShowDeuceMessage() {
    if (scoreRef.current.user === 2 && scoreRef.current.mogu === 2) {
      onMessage(randomPick(["여기서 지면 메뉴 선택권 없다.", "마지막 한 점이다. 집중해라."]));
    }
  }

  function finishGame(winner: "user" | "mogu") {
    const state = stateRef.current;
    state.ended = true;
    stopPongLoop();
    clearPongTimers();
    setIsPongPlaying(false);

    if (winner === "user") {
      onMessage("좋다. 네가 고를 기회를 주지.");
      finishTimeoutId.current = window.setTimeout(onUserWin, 420);
    } else {
      onMessage("졌으니 오늘은 내가 고른다.");
      finishTimeoutId.current = window.setTimeout(onMoguWin, 420);
    }
  }

  function resetBall(direction: 1 | -1) {
    const state = stateRef.current;
    const nextState = createInitialPongState(direction);
    state.ballX = nextState.ballX;
    state.ballY = nextState.ballY;
    state.ballVX = nextState.ballVX;
    state.ballVY = nextState.ballVY;
    state.rally = 0;
    state.item = null;
    state.doomBall = false;
    state.effect = null;
    state.floatingText = null;
    if (itemTimeoutId.current !== null) {
      window.clearTimeout(itemTimeoutId.current);
      itemTimeoutId.current = null;
    }
    setPongRallyCount(0);
    setVisualEffect(null);
    setActiveEffectLabel(null);
    drawPong();
  }

  function moveUserPaddle(clientX: number) {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const ratio = PONG_CANVAS_WIDTH / rect.width;
    const x = (clientX - rect.left) * ratio - PONG_PADDLE_WIDTH / 2;
    stateRef.current.userX = clamp(x, 0, PONG_CANVAS_WIDTH - PONG_PADDLE_WIDTH);
    drawPong();
  }

  function showEffect(effect: Exclude<PongEffect, null>, duration: number) {
    clearEffectTimer();
    stateRef.current.effect = effect;
    stateRef.current.effectUntil = performance.now() + duration;
    setVisualEffect(effect);
    effectTimeoutId.current = window.setTimeout(() => {
      stateRef.current.effect = null;
      setVisualEffect(null);
    }, duration);
  }

  function scheduleSpeedRestore(factor: number, delay: number, effectLabel: Exclude<PongActiveEffect, "x2" | null>) {
    if (itemTimeoutId.current !== null) {
      window.clearTimeout(itemTimeoutId.current);
    }
    itemTimeoutId.current = window.setTimeout(() => {
      const state = stateRef.current;
      if (state.running && !state.ended) {
        scaleBallSpeed(state, factor, PONG_INITIAL_SPEED);
      }
      setActiveEffectLabel((current) => (current === effectLabel ? (state.doomBall ? "x2" : null) : current));
      itemTimeoutId.current = null;
    }, delay);
  }

  function setFloatingText(text: string, x: number, y: number, color: string) {
    stateRef.current.floatingText = {
      text,
      x,
      y,
      color,
      createdAt: performance.now()
    };
  }

  function drawPong() {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;

    const state = stateRef.current;
    const now = performance.now();
    context.clearRect(0, 0, PONG_CANVAS_WIDTH, PONG_CANVAS_HEIGHT);

    const bg = context.createLinearGradient(0, 0, 0, PONG_CANVAS_HEIGHT);
    bg.addColorStop(0, "#fff8ed");
    bg.addColorStop(1, "#effbf8");
    context.fillStyle = bg;
    context.fillRect(0, 0, PONG_CANVAS_WIDTH, PONG_CANVAS_HEIGHT);

    drawFlash(context, state, now);
    drawCenterLine(context);
    drawItem(context, state.item, now);
    drawPaddle(context, state.moguX, PONG_MOGU_Y, "#ffb14d");
    drawPaddle(context, state.userX, PONG_USER_Y, "#70b8b3");
    drawBall(context, state, now);
    drawFloatingText(context, state, now);
  }

  return (
    <section id="gamePanel" className="game-panel" aria-label="Mogu Pong">
      <div className="game-panel__header">
        <div>
          <p className="eyebrow">Mini Game</p>
          <h2>Mogu Pong</h2>
        </div>
        <div className="game-score" aria-label="점수">
          <span>나 {pongUserScore}</span>
          <span>모구 {pongMoguScore}</span>
        </div>
      </div>

      <div className="game-rally-row">
        <span className="game-rally">랠리 {pongRallyCount}</span>
        <span className={`game-active-effect ${activeEffectLabel ? "game-active-effect--on" : ""}`}>
          효과: {activeEffectLabel ?? "없음"}
        </span>
        {activeEffectLabel === "x2" && <span className="game-active-effect game-active-effect--danger">x2 준비됨</span>}
      </div>
      <canvas
        ref={canvasRef}
        className={`pong-canvas ${visualEffect ? `pong-canvas--${visualEffect}` : ""}`}
        width={PONG_CANVAS_WIDTH}
        height={PONG_CANVAS_HEIGHT}
        onMouseMove={(event) => moveUserPaddle(event.clientX)}
        onTouchMove={(event) => {
          const touch = event.touches[0];
          if (!touch) return;
          event.preventDefault();
          moveUserPaddle(touch.clientX);
        }}
      />

      <div className="game-controls">
        <button type="button" className="button button--primary" onClick={startGame} disabled={isPongPlaying}>
          게임 시작
        </button>
        <button type="button" className="button button--secondary" onClick={closeGame}>
          돌아가기
        </button>
      </div>
      <div className="game-item-guide" aria-label="아이템 설명">
        <span>x2=다음 득점 2점</span>
        <span>SPD=속도 증가</span>
        <span>SLOW=속도 감소</span>
      </div>
    </section>
  );
}

function createInitialPongState(direction: 1 | -1 = Math.random() > 0.5 ? 1 : -1): PongState {
  const angle = (Math.random() * 0.55 + 0.18) * (Math.random() > 0.5 ? 1 : -1);
  return {
    ballX: PONG_CANVAS_WIDTH / 2,
    ballY: PONG_CANVAS_HEIGHT / 2,
    ballVX: Math.sin(angle) * PONG_INITIAL_SPEED,
    ballVY: Math.cos(angle) * PONG_INITIAL_SPEED * direction,
    userX: PONG_CANVAS_WIDTH / 2 - PONG_PADDLE_WIDTH / 2,
    moguX: PONG_CANVAS_WIDTH / 2 - PONG_PADDLE_WIDTH / 2,
    rally: 0,
    item: null,
    doomBall: false,
    lastSmashRally: 0,
    effect: null,
    effectUntil: 0,
    floatingText: null,
    running: false,
    ended: false
  };
}

function drawCenterLine(context: CanvasRenderingContext2D) {
  context.setLineDash([8, 10]);
  context.strokeStyle = "rgba(111, 71, 38, 0.2)";
  context.lineWidth = 2;
  context.beginPath();
  context.moveTo(18, PONG_CANVAS_HEIGHT / 2);
  context.lineTo(PONG_CANVAS_WIDTH - 18, PONG_CANVAS_HEIGHT / 2);
  context.stroke();
  context.setLineDash([]);
}

function drawPaddle(context: CanvasRenderingContext2D, x: number, y: number, color: string) {
  context.fillStyle = color;
  context.beginPath();
  context.roundRect(x, y, PONG_PADDLE_WIDTH, PONG_PADDLE_HEIGHT, 999);
  context.fill();
}

function drawBall(context: CanvasRenderingContext2D, state: PongState, now: number) {
  const effectGlow = state.effect === "counter" && now < state.effectUntil;
  const doomGlow = state.doomBall;
  const speed = getBallSpeed(state);
  const isFast = speed >= 7.2;
  const isSlow = speed <= 4.2;

  if (isFast) {
    context.strokeStyle = "rgba(255, 177, 77, 0.52)";
    context.lineWidth = 2;
    for (let index = 1; index <= 3; index += 1) {
      context.beginPath();
      context.moveTo(state.ballX - state.ballVX * index * 0.9, state.ballY - state.ballVY * index * 0.9);
      context.lineTo(state.ballX - state.ballVX * (index + 0.7), state.ballY - state.ballVY * (index + 0.7));
      context.stroke();
    }
  }

  if (effectGlow || doomGlow) {
    context.beginPath();
    context.arc(state.ballX, state.ballY, PONG_BALL_RADIUS + (doomGlow ? 8 : 5), 0, Math.PI * 2);
    context.fillStyle = doomGlow ? "rgba(239, 91, 77, 0.18)" : "rgba(255, 177, 77, 0.22)";
    context.fill();
  }

  context.beginPath();
  context.arc(state.ballX, state.ballY, PONG_BALL_RADIUS, 0, Math.PI * 2);
  context.fillStyle = doomGlow ? "#ef5b4d" : isSlow ? "#70b8e8" : "#3d2a1d";
  context.shadowColor = doomGlow ? "rgba(239, 91, 77, 0.38)" : "rgba(61, 42, 29, 0.22)";
  context.shadowBlur = doomGlow ? 14 : 8;
  context.fill();
  context.shadowBlur = 0;
}

function drawItem(context: CanvasRenderingContext2D, item: PongItem | null, now: number) {
  if (!item) return;

  const meta = itemMeta[item.type];
  const pulse = 1 + Math.sin(now / 120) * 0.08;
  context.save();
  context.translate(item.x, item.y);
  context.scale(pulse, pulse);
  context.beginPath();
  context.roundRect(-25, -23, 50, 46, 14);
  context.fillStyle = `${meta.color}33`;
  context.fill();
  context.fillStyle = "#fffdf9";
  context.strokeStyle = meta.color;
  context.lineWidth = 2;
  context.beginPath();
  context.roundRect(-22, -20, 44, 40, 12);
  context.fill();
  context.stroke();
  context.font = "17px sans-serif";
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillText(meta.emoji, 0, -6);
  context.font = "800 12px sans-serif";
  context.fillStyle = "#3d2a1d";
  context.fillText(meta.label ?? "☢", 0, 11);
  context.restore();
}

function drawFloatingText(context: CanvasRenderingContext2D, state: PongState, now: number) {
  const floatingText = state.floatingText;
  if (!floatingText) return;

  const age = now - floatingText.createdAt;
  if (age > 780) {
    state.floatingText = null;
    return;
  }

  const progress = age / 780;
  context.save();
  context.globalAlpha = 1 - progress;
  context.font = "900 18px sans-serif";
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillStyle = floatingText.color;
  context.strokeStyle = "rgba(255, 253, 249, 0.92)";
  context.lineWidth = 4;
  const y = floatingText.y - progress * 24;
  context.strokeText(floatingText.text, floatingText.x, y);
  context.fillText(floatingText.text, floatingText.x, y);
  context.restore();
}

function drawFlash(context: CanvasRenderingContext2D, state: PongState, now: number) {
  if (!state.effect || now >= state.effectUntil) return;

  const progress = clamp((state.effectUntil - now) / 320, 0, 1);
  const color =
    state.effect === "smash"
      ? `rgba(239, 91, 77, ${0.12 * progress})`
      : state.effect === "counter"
        ? `rgba(255, 177, 77, ${0.1 * progress})`
        : `rgba(112, 184, 179, ${0.1 * progress})`;
  context.fillStyle = color;
  context.fillRect(0, 0, PONG_CANVAS_WIDTH, PONG_CANVAS_HEIGHT);
}

function getBallSpeed(state: PongState) {
  return Math.hypot(state.ballVX, state.ballVY);
}

function scaleBallSpeed(state: PongState, factor: number, minSpeed = PONG_INITIAL_SPEED) {
  const speed = getBallSpeed(state);
  if (speed === 0) return;

  const nextSpeed = clamp(speed * factor, minSpeed, PONG_MAX_SPEED);
  const scale = nextSpeed / speed;
  state.ballVX *= scale;
  state.ballVY *= scale;
}

function randomPick<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}
