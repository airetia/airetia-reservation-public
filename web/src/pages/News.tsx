// src/pages/News.tsx
import { useScrollReveal } from "../hooks/useScrollReveal";

type NewsCategory = "お知らせ" | "サービス" | "メンテナンス" | "プレスリリース";

interface NewsItem {
  id: number;
  date: string;
  category: NewsCategory;
  title: string;
  body?: string;
}

// 実際の運用ではAPIやCMSから取得する
const newsItems: NewsItem[] = [
  {
    id: 1,
    date: "2026-03-01",
    category: "サービス",
    title: "airetiaの正式サービスを開始しました",
    body: "長らくお待たせいたしました。本日よりairetiaの正式サービスを開始いたします。まずはお子様向けのオンライン・対面レッスンからスタートし、順次サービスを拡充してまいります。",
  },
  {
    id: 2,
    date: "2026-02-15",
    category: "お知らせ",
    title: "先生・講師（プロバイダー）の募集を開始しました",
    body: "airetiaでサービスを提供してくださる先生・講師の方の募集を開始しました。詳細は「先生の方へ」ページをご覧ください。",
  },
  {
    id: 3,
    date: "2026-02-01",
    category: "プレスリリース",
    title: "airetiaのベータ版テストを終了しました",
    body: "ベータ版テストにご参加いただいた皆様、ありがとうございました。いただいたフィードバックをもとに、正式版の開発を進めてまいりました。",
  },
];

const categoryStyle: Record<NewsCategory, { background: string; color: string; border: string }> = {
  お知らせ:       { background: "var(--bg-brand)",      color: "var(--brand-main-line)",  border: "1px solid var(--brand-main)" },
  サービス:       { background: "#e8fff4",               color: "#1a7a50",                 border: "1px solid #4caf82" },
  メンテナンス:   { background: "#fffde7",               color: "#8a6a00",                 border: "1px solid var(--brand-warning)" },
  プレスリリース: { background: "#f0f0ff",               color: "var(--brand-structure)",  border: "1px solid var(--brand-accent)" },
};

const formatDate = (dateStr: string): string => {
  const d = new Date(dateStr);
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
};

const News = () => {
  useScrollReveal();

  return (
    <main className="container">
      {/* ページタイトル：固定 */}
      <div style={{ textAlign: "center", marginBottom: 60 }}>
        <h1 className="page-title">ニュース・お知らせ</h1>
        <p className="text-sub" style={{ fontSize: "1.2rem" }}>
          airetiaに関する最新情報をお届けします。
        </p>
      </div>

      {/* ニュース一覧 */}
      {newsItems.length === 0 ? (
        <section
          className="content-card scroll-reveal"
          style={{ textAlign: "center", padding: "60px 40px" }}
        >
          <p className="text-sub" style={{ fontSize: "1.1rem" }}>
            現在、新しいお知らせはありません。
          </p>
        </section>
      ) : (
        <div style={{ display: "grid", gap: 20, maxWidth: 800, margin: "0 auto" }}>
          {newsItems.map((item) => (
            <section
              key={item.id}
              className="content-card scroll-reveal"
              style={{ padding: 30 }}
            >
              {/* メタ情報 */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  marginBottom: 16,
                  flexWrap: "wrap",
                }}
              >
                <time
                  dateTime={item.date}
                  style={{
                    color: "var(--text-sub)",
                    fontSize: "0.9rem",
                    fontWeight: 600,
                  }}
                >
                  {formatDate(item.date)}
                </time>
                <span
                  style={{
                    ...categoryStyle[item.category],
                    padding: "3px 12px",
                    borderRadius: 20,
                    fontSize: "0.8rem",
                    fontWeight: 700,
                  }}
                >
                  {item.category}
                </span>
              </div>

              {/* タイトル */}
              <h2
                style={{
                  color: "var(--brand-structure)",
                  fontSize: "1.2rem",
                  fontWeight: 700,
                  margin: item.body ? "0 0 12px" : 0,
                }}
              >
                {item.title}
              </h2>

              {/* 本文 */}
              {item.body && (
                <p className="text-sub" style={{ lineHeight: 2, margin: 0 }}>
                  {item.body}
                </p>
              )}
            </section>
          ))}
        </div>
      )}

      {/* 過去のお知らせへの案内 */}
      <div
        className="scroll-reveal"
        style={{ textAlign: "center", marginTop: 50, color: "var(--text-sub)" }}
      >
        <p>
          ご不明点は
          <a href="/contact">お問い合わせ</a>
          よりお気軽にご連絡ください。
        </p>
      </div>
    </main>
  );
};

export default News;