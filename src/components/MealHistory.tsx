import type { MealRecord } from "../types";

interface MealHistoryProps {
  records: MealRecord[];
}

export function MealHistory({ records }: MealHistoryProps) {
  if (records.length === 0) return null;

  return (
    <section className="history" aria-label="최근 식사 기록">
      <div className="section-heading">
        <p className="eyebrow">최근 기록</p>
        <h2>모구가 기억하는 점심</h2>
      </div>
      <ul>
        {records.slice(0, 5).map((record) => (
          <li key={record.id}>
            <span>{record.menuName}</span>
            <time dateTime={record.decidedAt}>
              {new Intl.DateTimeFormat("ko-KR", { month: "numeric", day: "numeric" }).format(
                new Date(record.decidedAt)
              )}
            </time>
          </li>
        ))}
      </ul>
    </section>
  );
}
