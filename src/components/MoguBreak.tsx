import { useEffect, useRef, useState } from "react";

interface MoguBreakProps {
  onClose: () => void;
  onMessage: (message: string) => void;
  onSuccess: (perfect: boolean) => void;
  onFail: () => void;
}

type BreakBrickType = "normal" | "ramen" | "cold" | "curry" | "doom";
type BreakEffect = "hit" | "special" | "miss" | null;

interface BreakBall {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
}

interface BreakPaddle {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface BreakBrick {
  x: number;
  y: number;
  width: number;
  height: number;
  type: BreakBrickType;
  destroyed: boolean;
}

interface BreakParticle {
  x: number;
  y: number;
  life: number;
  color: string;
}

interface BreakState {
  breakBall: BreakBall;
  breakPaddle: BreakPaddle;
  breakBricks: BreakBrick[];
  particles: BreakParticle[];
  running: boolean;
  ended: boolean;
  effect: BreakEffect;
  effectUntil: number;
}

const BREAK_WIDTH = 340;
const BREAK_HEIGHT = 430;
const BREAK_INITIAL_BALL_SPEED = 4.5;
const BREAK_MAX_BALL_SPEED = 8.5;
const BREAK_SPEED_INCREASE = 1.035;
const BREAK_LIVES = 3;
const BREAK_MAX_LIVES = 4;
const BREAK_ROWS = 4;
const BREAK_COLS = 6;
const BREAK_TOTAL_BRICKS = BREAK_ROWS * BREAK_COLS;
const BREAK_SUCCESS_COUNT = Math.ceil(BREAK_TOTAL_BRICKS * 0.7);

const breakMessages = {
  start: ["고민의 벽을 부숴라.", "오늘 메뉴는 실력으로 정한다.", "공 하나로 네 우유부단함을 박살내겠다."],
  hit: ["좋다. 하나 줄었다.", "그 벽은 약했다.", "조금씩 결정에 가까워지고 있다."],
  combo: ["오? 오늘은 좀 한다.", "이 정도면 메뉴 고를 자격이 생기겠는데?", "계속 부숴라. 고민도 같이 부서진다."],
  miss: ["공도 못 받고 메뉴도 못 고르냐.", "방금 건 좀 심했다.", "괜찮다. 아직 목숨은 남았다."],
  lastLife: ["이제 진짜 마지막이다.", "여기서 떨어지면 내가 고른다.", "집중해라. 메뉴 선택권이 걸렸다."],
  success: ["좋다. 이겼으니 후보 3개 중에서 골라라.", "고민의 벽을 꽤 부쉈군.", "오늘은 네 선택을 인정해주지."],
  perfect: ["고민의 벽을 전부 부쉈다.", "완벽하다. 오늘은 네가 고를 자격이 있다.", "모구도 인정한다. 이건 완승이다."],
  fail: ["졌으니 오늘은 내가 고른다.", "선택권은 회수했다.", "벽을 못 부쉈으니 메뉴도 내가 정한다."]
};

const brickMeta: Record<BreakBrickType, { color: string; emoji: string; message: string }> = {
  normal: { color: "#ffbd63", emoji: "", message: "" },
  ramen: { color: "#ff9f43", emoji: "🍜", message: "라멘 부스트 발동!" },
  cold: { color: "#8fd0ff", emoji: "🧊", message: "잠깐 식혔다." },
  curry: { color: "#d89b45", emoji: "🍛", message: "카레 실드로 한 번 더 버틴다." },
  doom: { color: "#ef5b4d", emoji: "☢", message: "위험한 벽돌을 건드렸다." }
};

export function MoguBreak({ onClose, onMessage, onSuccess, onFail }: MoguBreakProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const stateRef = useRef<BreakState>(createBreakState());
  const lastMessageRef = useRef<string | null>(null);
  const breakAnimationId = useRef<number | null>(null);
  const effectTimeoutId = useRef<number | null>(null);
  const slowTimeoutId = useRef<number | null>(null);
  const finishTimeoutId = useRef<number | null>(null);
  const [isBreakPlaying, setIsBreakPlaying] = useState(false);
  const [breakScore, setBreakScore] = useState(0);
  const [breakLives, setBreakLives] = useState(BREAK_LIVES);
  const [breakDestroyedCount, setBreakDestroyedCount] = useState(0);
  const [visualEffect, setVisualEffect] = useState<BreakEffect>(null);

  const breakTotalBricks = BREAK_TOTAL_BRICKS;
  const breakProgress = Math.round((breakDestroyedCount / breakTotalBricks) * 100);

  useEffect(() => {
    say(randomNonRepeat(breakMessages.start));
    drawBreak();

    return () => {
      stopBreakLoop();
      clearBreakTimers();
    };
  }, []);

  function startBreakGame() {
    stopBreakLoop();
    clearBreakTimers();
    stateRef.current = createBreakState();
    stateRef.current.running = true;
    setBreakScore(0);
    setBreakLives(BREAK_LIVES);
    setBreakDestroyedCount(0);
    setVisualEffect(null);
    setIsBreakPlaying(true);
    say("모구가 공을 던졌다!");
    breakAnimationId.current = window.requestAnimationFrame(updateBreak);
  }

  function closeBreakGame() {
    stopBreakLoop();
    clearBreakTimers();
    setIsBreakPlaying(false);
    onClose();
  }

  function stopBreakLoop() {
    if (breakAnimationId.current !== null) {
      window.cancelAnimationFrame(breakAnimationId.current);
      breakAnimationId.current = null;
    }
    stateRef.current.running = false;
  }

  function clearBreakTimers() {
    for (const timer of [effectTimeoutId, slowTimeoutId, finishTimeoutId]) {
      if (timer.current !== null) {
        window.clearTimeout(timer.current);
        timer.current = null;
      }
    }
  }

  function updateBreak() {
    const state = stateRef.current;
    if (!state.running || state.ended) return;

    const ball = state.breakBall;
    ball.x += ball.vx;
    ball.y += ball.vy;

    if (ball.x <= ball.radius || ball.x >= BREAK_WIDTH - ball.radius) {
      ball.vx *= -1;
      ball.x = clamp(ball.x, ball.radius, BREAK_WIDTH - ball.radius);
    }

    if (ball.y <= ball.radius) {
      ball.vy *= -1;
      ball.y = ball.radius;
    }

    handlePaddleCollision(state);
    handleBrickCollision(state);
    handleMiss(state);
    updateParticles(state);
    drawBreak();

    if (!state.ended) {
      breakAnimationId.current = window.requestAnimationFrame(updateBreak);
    }
  }

  function handlePaddleCollision(state: BreakState) {
    const { breakBall: ball, breakPaddle: paddle } = state;
    const hit =
      ball.vy > 0 &&
      ball.y + ball.radius >= paddle.y &&
      ball.y - ball.radius <= paddle.y + paddle.height &&
      ball.x >= paddle.x &&
      ball.x <= paddle.x + paddle.width;

    if (!hit) return;

    const relativeHit = clamp((ball.x - (paddle.x + paddle.width / 2)) / (paddle.width / 2), -1, 1);
    const speed = Math.min(BREAK_MAX_BALL_SPEED, getBallSpeed(ball) * BREAK_SPEED_INCREASE);
    const angle = relativeHit * 1.05;
    ball.vx = Math.sin(angle) * speed;
    ball.vy = -Math.cos(angle) * speed;
    ball.y = paddle.y - ball.radius - 1;
  }

  function handleBrickCollision(state: BreakState) {
    const ball = state.breakBall;
    const brick = state.breakBricks.find(
      (target) =>
        !target.destroyed &&
        ball.x + ball.radius >= target.x &&
        ball.x - ball.radius <= target.x + target.width &&
        ball.y + ball.radius >= target.y &&
        ball.y - ball.radius <= target.y + target.height
    );

    if (!brick) return;

    brick.destroyed = true;
    ball.vy *= -1;
    scaleBallSpeed(ball, BREAK_SPEED_INCREASE);
    spawnParticles(state, brick);
    showEffect(brick.type === "normal" ? "hit" : "special", brick.type === "normal" ? 180 : 280);
    applyBrickEffect(brick.type, ball);

    const nextDestroyed = state.breakBricks.filter((target) => target.destroyed).length;
    const bonus = brick.type === "doom" ? 3 : 1;
    setBreakDestroyedCount(nextDestroyed);
    setBreakScore((score) => score + bonus);

    if (nextDestroyed === BREAK_TOTAL_BRICKS) {
      finishBreak(true);
      return;
    }

    if (brick.type === "normal") {
      say(randomNonRepeat(nextDestroyed > 0 && nextDestroyed % 5 === 0 ? breakMessages.combo : breakMessages.hit));
    }
  }

  function applyBrickEffect(type: BreakBrickType, ball: BreakBall) {
    if (type === "normal") return;

    say(brickMeta[type].message);

    if (type === "ramen") {
      scaleBallSpeed(ball, 1.18);
    }

    if (type === "cold") {
      scaleBallSpeed(ball, 0.76, 3.4);
      if (slowTimeoutId.current !== null) window.clearTimeout(slowTimeoutId.current);
      slowTimeoutId.current = window.setTimeout(() => {
        scaleBallSpeed(stateRef.current.breakBall, 1 / 0.76);
        slowTimeoutId.current = null;
      }, 1800);
    }

    if (type === "curry") {
      setBreakLives((lives) => Math.min(BREAK_MAX_LIVES, lives + 1));
    }

    if (type === "doom") {
      scaleBallSpeed(ball, 1.2);
    }
  }

  function handleMiss(state: BreakState) {
    const ball = state.breakBall;
    if (ball.y <= BREAK_HEIGHT + ball.radius) return;

    showEffect("miss", 260);
    setBreakLives((lives) => {
      const nextLives = lives - 1;
      if (nextLives <= 0) {
        const destroyed = state.breakBricks.filter((brick) => brick.destroyed).length;
        if (destroyed >= BREAK_SUCCESS_COUNT) {
          finishBreak(false);
        } else {
          failBreak();
        }
        return 0;
      }

      say(randomNonRepeat(nextLives === 1 ? breakMessages.lastLife : breakMessages.miss));
      resetBallAndPaddle(state);
      return nextLives;
    });
  }

  function finishBreak(perfect: boolean) {
    const messages = perfect ? breakMessages.perfect : breakMessages.success;
    say(randomNonRepeat(messages));
    endBreakLoop();
    finishTimeoutId.current = window.setTimeout(() => onSuccess(perfect), 520);
  }

  function failBreak() {
    say(randomNonRepeat(breakMessages.fail));
    endBreakLoop();
    finishTimeoutId.current = window.setTimeout(onFail, 520);
  }

  function endBreakLoop() {
    stateRef.current.ended = true;
    stopBreakLoop();
    setIsBreakPlaying(false);
  }

  function resetBallAndPaddle(state: BreakState) {
    const next = createBreakState();
    state.breakBall = next.breakBall;
    state.breakPaddle = next.breakPaddle;
    drawBreak();
  }

  function moveBreakPaddle(clientX: number) {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const ratio = BREAK_WIDTH / rect.width;
    const x = (clientX - rect.left) * ratio - stateRef.current.breakPaddle.width / 2;
    stateRef.current.breakPaddle.x = clamp(x, 0, BREAK_WIDTH - stateRef.current.breakPaddle.width);
    drawBreak();
  }

  function showEffect(effect: Exclude<BreakEffect, null>, duration: number) {
    if (effectTimeoutId.current !== null) window.clearTimeout(effectTimeoutId.current);
    stateRef.current.effect = effect;
    stateRef.current.effectUntil = performance.now() + duration;
    setVisualEffect(effect);
    effectTimeoutId.current = window.setTimeout(() => {
      stateRef.current.effect = null;
      setVisualEffect(null);
      effectTimeoutId.current = null;
    }, duration);
  }

  function say(message: string) {
    lastMessageRef.current = message;
    onMessage(message);
  }

  function randomNonRepeat(messages: string[]) {
    const pool = messages.length > 1 ? messages.filter((message) => message !== lastMessageRef.current) : messages;
    return pool[Math.floor(Math.random() * pool.length)] ?? messages[0];
  }

  function drawBreak() {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;

    const state = stateRef.current;
    context.clearRect(0, 0, BREAK_WIDTH, BREAK_HEIGHT);
    drawBreakBackground(context);
    drawBreakFlash(context, state);
    drawBricks(context, state.breakBricks);
    drawParticles(context, state.particles);
    drawPaddle(context, state.breakPaddle);
    drawBall(context, state.breakBall);
  }

  return (
    <section id="breakGamePanel" className="break-game-panel" aria-label="Mogu Break">
      <div className="game-panel__header">
        <div>
          <p className="eyebrow">Mini Game</p>
          <h2>Mogu Break</h2>
        </div>
        <div className="break-stats">
          <span id="breakScore">점수 {breakScore}</span>
          <span id="breakLives">목숨 {breakLives}</span>
          <span id="breakProgress">파괴율 {breakProgress}%</span>
        </div>
      </div>
      <p className="break-description">모구가 던진 공으로 고민의 벽을 부숴라.</p>
      <canvas
        ref={canvasRef}
        id="breakCanvas"
        className={`break-canvas ${visualEffect ? `break-canvas--${visualEffect}` : ""}`}
        width={BREAK_WIDTH}
        height={BREAK_HEIGHT}
        onMouseMove={(event) => moveBreakPaddle(event.clientX)}
        onTouchMove={(event) => {
          const touch = event.touches[0];
          if (!touch) return;
          event.preventDefault();
          moveBreakPaddle(touch.clientX);
        }}
      />
      <div className="game-controls">
        <button id="breakStartBtn" type="button" className="button button--primary" onClick={startBreakGame} disabled={isBreakPlaying}>
          게임 시작
        </button>
        <button id="breakBackBtn" type="button" className="button button--secondary" onClick={closeBreakGame}>
          돌아가기
        </button>
      </div>
    </section>
  );
}

function createBreakState(): BreakState {
  return {
    breakBall: createBreakBall(),
    breakPaddle: {
      x: BREAK_WIDTH / 2 - 54,
      y: BREAK_HEIGHT - 34,
      width: 108,
      height: 12
    },
    breakBricks: createBreakBricks(),
    particles: [],
    running: false,
    ended: false,
    effect: null,
    effectUntil: 0
  };
}

function createBreakBall(): BreakBall {
  const angle = (Math.random() * 0.5 + 0.2) * (Math.random() > 0.5 ? 1 : -1);
  return {
    x: BREAK_WIDTH / 2,
    y: BREAK_HEIGHT - 60,
    vx: Math.sin(angle) * BREAK_INITIAL_BALL_SPEED,
    vy: -Math.cos(angle) * BREAK_INITIAL_BALL_SPEED,
    radius: 7
  };
}

function createBreakBricks(): BreakBrick[] {
  const margin = 16;
  const gap = 7;
  const width = (BREAK_WIDTH - margin * 2 - gap * (BREAK_COLS - 1)) / BREAK_COLS;
  const height = 22;
  const specialTypes = shuffle(["ramen", "cold", "curry", "doom", "ramen", "cold"] as BreakBrickType[]).slice(
    0,
    4 + Math.floor(Math.random() * 3)
  );
  const specialIndexes = new Set(shuffle(Array.from({ length: BREAK_TOTAL_BRICKS }, (_, index) => index)).slice(0, specialTypes.length));

  return Array.from({ length: BREAK_TOTAL_BRICKS }, (_, index) => {
    const row = Math.floor(index / BREAK_COLS);
    const col = index % BREAK_COLS;
    return {
      x: margin + col * (width + gap),
      y: 54 + row * (height + gap),
      width,
      height,
      type: specialIndexes.has(index) ? (specialTypes.pop() ?? "normal") : "normal",
      destroyed: false
    };
  });
}

function drawBreakBackground(context: CanvasRenderingContext2D) {
  const bg = context.createLinearGradient(0, 0, 0, BREAK_HEIGHT);
  bg.addColorStop(0, "#fff8ed");
  bg.addColorStop(1, "#effbf8");
  context.fillStyle = bg;
  context.fillRect(0, 0, BREAK_WIDTH, BREAK_HEIGHT);
}

function drawBreakFlash(context: CanvasRenderingContext2D, state: BreakState) {
  if (!state.effect || performance.now() >= state.effectUntil) return;
  const alpha = state.effect === "miss" ? 0.14 : state.effect === "special" ? 0.12 : 0.08;
  context.fillStyle =
    state.effect === "miss" ? `rgba(239, 91, 77, ${alpha})` : `rgba(255, 177, 77, ${alpha})`;
  context.fillRect(0, 0, BREAK_WIDTH, BREAK_HEIGHT);
}

function drawBricks(context: CanvasRenderingContext2D, bricks: BreakBrick[]) {
  for (const brick of bricks) {
    if (brick.destroyed) continue;
    const meta = brickMeta[brick.type];
    context.fillStyle = meta.color;
    context.strokeStyle = "rgba(111, 71, 38, 0.18)";
    context.lineWidth = 1;
    context.beginPath();
    context.roundRect(brick.x, brick.y, brick.width, brick.height, 6);
    context.fill();
    context.stroke();
    if (meta.emoji) {
      context.font = "15px sans-serif";
      context.textAlign = "center";
      context.textBaseline = "middle";
      context.fillStyle = "#fffdf9";
      context.fillText(meta.emoji, brick.x + brick.width / 2, brick.y + brick.height / 2 + 1);
    }
  }
}

function drawPaddle(context: CanvasRenderingContext2D, paddle: BreakPaddle) {
  context.fillStyle = "#70b8b3";
  context.beginPath();
  context.roundRect(paddle.x, paddle.y, paddle.width, paddle.height, 999);
  context.fill();
}

function drawBall(context: CanvasRenderingContext2D, ball: BreakBall) {
  context.beginPath();
  context.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
  context.fillStyle = "#3d2a1d";
  context.shadowColor = "rgba(61, 42, 29, 0.25)";
  context.shadowBlur = 8;
  context.fill();
  context.shadowBlur = 0;
}

function spawnParticles(state: BreakState, brick: BreakBrick) {
  const meta = brickMeta[brick.type];
  for (let i = 0; i < 8; i += 1) {
    state.particles.push({
      x: brick.x + brick.width / 2 + (Math.random() - 0.5) * brick.width,
      y: brick.y + brick.height / 2,
      life: 1,
      color: meta.color
    });
  }
}

function updateParticles(state: BreakState) {
  state.particles = state.particles
    .map((particle) => ({
      ...particle,
      y: particle.y + 0.8,
      life: particle.life - 0.035
    }))
    .filter((particle) => particle.life > 0);
}

function drawParticles(context: CanvasRenderingContext2D, particles: BreakParticle[]) {
  for (const particle of particles) {
    context.globalAlpha = particle.life;
    context.fillStyle = particle.color;
    context.beginPath();
    context.arc(particle.x, particle.y, 2.4, 0, Math.PI * 2);
    context.fill();
  }
  context.globalAlpha = 1;
}

function getBallSpeed(ball: BreakBall) {
  return Math.hypot(ball.vx, ball.vy);
}

function scaleBallSpeed(ball: BreakBall, factor: number, minSpeed = BREAK_INITIAL_BALL_SPEED) {
  const speed = getBallSpeed(ball);
  if (speed === 0) return;
  const nextSpeed = clamp(speed * factor, minSpeed, BREAK_MAX_BALL_SPEED);
  const scale = nextSpeed / speed;
  ball.vx *= scale;
  ball.vy *= scale;
}

function shuffle<T>(items: T[]) {
  return [...items].sort(() => Math.random() - 0.5);
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}
