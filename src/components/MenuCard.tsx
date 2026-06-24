import type { Menu } from "../types";

interface MenuCardProps {
  menu: Menu | null;
  isDecided: boolean;
  forced: boolean;
}

export function MenuCard({ menu, isDecided, forced }: MenuCardProps) {
  if (!menu) {
    return (
      <section className="menu-card menu-card--empty">
        <p className="eyebrow">오늘의 추천</p>
        <h2>조건을 고르고 추천을 받아봐</h2>
        <p>아무거나를 누르면 모구가 완전히 마음대로 고른다.</p>
      </section>
    );
  }

  return (
    <section className={`menu-card ${isDecided ? "menu-card--decided" : ""}`}>
      <p className="eyebrow">{isDecided ? (forced ? "강제 결정 완료" : "결정 완료") : "모구의 추천"}</p>
      <h2>{menu.name}</h2>
      <p className="jp-name">{menu.jpName}</p>
      <p>{menu.description}</p>
      <div className="menu-meta" aria-label="메뉴 정보">
        <span>{menu.priceYen.toLocaleString("ko-KR")}엔</span>
        <span>안정감 {menu.reliability}/5</span>
        <span>새로움 {menu.novelty}/5</span>
      </div>
    </section>
  );
}
