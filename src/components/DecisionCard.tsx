import type { MealRecord } from "../types";

interface DecisionCardProps {
  record: MealRecord | null;
}

export function DecisionCard({ record }: DecisionCardProps) {
  if (!record) return null;

  const time = new Intl.DateTimeFormat("ko-KR", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(record.decidedAt));

  return (
    <section className="decision-card" aria-label="결정 완료 카드">
      <img src="/images/mogu-celebrate.png" alt="축하하는 모구" />
      <div>
        <p className="eyebrow">{record.forced ? "모구가 대신 결정" : "오늘 점심 확정"}</p>
        <h2>{record.menuName}</h2>
        <p>{time}에 저장했어. 내일도 다시 열면 기록이 남아 있어.</p>
      </div>
    </section>
  );
}
