// src/pages/Service.tsx
import { Link } from "react-router-dom";
import { useScrollReveal } from "../hooks/useScrollReveal";

const services = [
  {
    icon: "📘",
    title: "パーソナル指導プログラム",
    desc: "オンライン・対面の完全個別指導。学力・目標・性格に合わせて最適化された学習設計を行い、中長期的に成果へ導く伴走型プログラムです。",
    points: [
      "オンライン／対面対応",
      "完全マンツーマン指導",
      "受験・定期テスト対策",
      "学習計画設計・進捗管理",
      "勉強以外の個別指導も対応可",
    ],
  },
  {
    icon: "✏️",
    title: "スポット解決サポート",
    desc: "『この問題だけ解説してほしい』『オリジナル教材を作ってほしい』など、必要な部分だけを依頼できる単発型サービス。効率的に疑問を解消します。",
    points: [
      "1問単位で依頼可能",
      "記述・計算問題の詳細解説",
      "思考プロセスまで言語化",
      "オリジナル教材作成",
      "オンライン完結",
    ],
  },
  {
    icon: "🏅",
    title: "スキル育成レッスン",
    desc: "学力以外の能力開発を目的とした個別レッスン。スポーツ・身体能力・表現力・習慣形成など、人間力を高めるための実践型プログラムです。",
    points: [
      "スポーツ個別指導",
      "身体能力向上トレーニング",
      "メンタル・習慣形成サポート",
      "技能特化レッスン",
      "継続型／単発型どちらも対応",
    ],
  },
];

const Service = () => {
  useScrollReveal();

  return (
    <main className="container">
      {/* ページタイトル */}
      <div style={{ textAlign: "center", marginBottom: 60 }}>
        <h1 className="page-title">サービス紹介</h1>
        <p className="text-sub" style={{ fontSize: "1.2rem" }}>
          airetiaが提供する3つの成長支援サービス
        </p>
      </div>

      {/* サービスカード */}
      {services.map((s, idx) => (
        <section
          key={idx}
          className="content-card scroll-reveal"
          style={{ marginBottom: 40 }}
        >
          <div style={{ display: "flex", alignItems: "flex-start", gap: 24 }}>
            <div style={{ fontSize: "3.5rem", flexShrink: 0 }}>{s.icon}</div>
            <div style={{ flex: 1 }}>
              <h2
                style={{
                  color: "var(--brand-structure)",
                  fontSize: "1.8rem",
                  marginBottom: 16,
                  paddingBottom: 10,
                  borderBottom: "2px solid var(--brand-main-line)",
                  display: "inline-block",
                }}
              >
                {s.title}
              </h2>
              <p
                className="text-sub"
                style={{ marginBottom: 20, lineHeight: 1.9 }}
              >
                {s.desc}
              </p>
              <ul
                style={{
                  paddingLeft: 0,
                  listStyle: "none",
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 10,
                }}
              >
                {s.points.map((p, i) => (
                  <li
                    key={i}
                    style={{
                      background: "var(--bg-brand)",
                      border: "1px solid var(--brand-main)",
                      color: "var(--brand-structure)",
                      fontWeight: 600,
                      fontSize: "0.85rem",
                      padding: "4px 14px",
                      borderRadius: 20,
                    }}
                  >
                    {p}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      ))}

      {/* CTA */}
      <section
        className="scroll-reveal cta-section"
        style={{ borderRadius: 20, marginTop: 20 }}
      >
        <h3
          style={{
            fontSize: "2rem",
            color: "var(--brand-structure)",
            marginBottom: 30,
          }}
        >
          まずは無料相談から
        </h3>
        <Link to="/contact" className="btn-main" style={{ width: 250 }}>
          無料相談を申し込む
        </Link>
      </section>
    </main>
  );
};

export default Service;