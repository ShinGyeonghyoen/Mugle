import type { CSSProperties } from "react";
import { REQUIRED_EXP_PER_LEVEL, getMoguStageLabel, getProgressPercent } from "../lib/storage";
import type { MoguGrowthStage, MoguProgress, MoodStage } from "../types";

interface MoguStageProps {
  stage: MoodStage;
  message: string;
  progress: MoguProgress;
  expGain: number | null;
}

type VisualState = "main" | "thinking" | "loading" | "recommend" | "celebrate";

const fallbackImages: Record<VisualState, string> = {
  main: "/images/mogu-main_bg_removed.png",
  thinking: "/images/mogu-thinking_bg_removed.png",
  loading: "/images/mogu-loading.png",
  recommend: "/images/mogu-recommend_bg_removed.png",
  celebrate: "/images/mogu-celebrate.png"
};

const stageImages: Record<MoguGrowthStage, Record<VisualState, string>> = {
  baby: fallbackImages,
  child: fallbackImages,
  teen: fallbackImages,
  youngAdult: fallbackImages,
  mature: fallbackImages
};

const danceFrames = Array.from({ length: 9 }, (_, index) => `/images/mogu-dance/mogu-dance-${index + 1}.png`);

export function MoguStage({ stage, message, progress, expGain }: MoguStageProps) {
  const isCelebrating = stage === "celebrate";
  const visualState = getVisualState(stage);
  const fallbackImage = fallbackImages[visualState];
  const imageSrc = stageImages[progress.stage]?.[visualState] ?? fallbackImage;
  const expPercent = getProgressPercent(progress.exp);
  const progressStyle = { "--mogu-progress": `${expPercent}%` } as CSSProperties;

  return (
    <section className={`mogu-stage mogu-stage--${stage}`} data-mogu-growth-stage={progress.stage} aria-label="Mogu status">
      <div className="mogu-spotlight" aria-hidden="true" />
      <div className="mogu-motion" key={`${stage}-${message}`}>
        {isCelebrating ? (
          <div className="mogu-dance" aria-label="Celebrating Mogu">
            {danceFrames.map((frame, index) => (
              <img
                key={frame}
                className="mogu-dance-frame"
                src={frame}
                alt={index === 0 ? "Celebrating Mogu" : ""}
                aria-hidden={index === 0 ? undefined : true}
              />
            ))}
          </div>
        ) : (
          <img
            className="mogu-image"
            src={imageSrc}
            alt="Mogu character"
            onError={(event) => {
              event.currentTarget.src = fallbackImage;
            }}
          />
        )}
        <span className="mogu-effect mogu-effect--left" aria-hidden="true" />
        <span className="mogu-effect mogu-effect--right" aria-hidden="true" />
      </div>
      <div className="mogu-growth-panel" aria-label={`Lv.${progress.level} ${progress.exp} / ${REQUIRED_EXP_PER_LEVEL}`}>
        <div className="mogu-progress-head">
          <span id="moguStageLabel" className="mogu-stage-label">
            {getMoguStageLabel(progress.stage)}가 성장 중
          </span>
          {expGain !== null && <span className="mogu-exp-gain">EXP +{expGain}</span>}
        </div>
        <div className="mogu-progress-bar" aria-hidden="true">
          <div id="moguProgressFill" className="mogu-progress-fill" style={progressStyle} />
        </div>
        <div className="mogu-progress-meta">
          <span>Lv.{progress.level}</span>
          <span>
            {progress.exp} / {REQUIRED_EXP_PER_LEVEL}
          </span>
          <span>{progress.streakDays} streak</span>
        </div>
      </div>
      <div className="speech-bubble" role="status" aria-live="polite">
        {message}
      </div>
    </section>
  );
}

function getVisualState(stage: MoodStage): VisualState {
  if (stage === "calm") return "main";
  if (stage === "celebrate") return "celebrate";
  if (stage === "recommend" || stage === "annoyed_lv1") return "recommend";
  if (stage === "thinking" || stage === "annoyed_lv2") return "thinking";
  return "loading";
}
