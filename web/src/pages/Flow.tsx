// src/pages/Flow.tsx
import { useScrollReveal } from "../hooks/useScrollReveal";

const steps = [
  {
    step: 1,
    title: "お問い合わせ",
    desc: "お問い合わせフォームまたはお電話にて、まずはお気軽にご連絡ください。",
    infoTitle: "📝 必要な情報",
    infoList: [
      "ご担当者様のお名前・連絡先",
      "ご相談内容（簡単で構いません）",
      "ご希望の連絡方法・時間帯",
    ],
    duration: "⏱️ 所要時間: 約5分",
  },
  {
    step: 2,
    title: "初回ヒアリング",
    desc: "担当者がオンラインまたは訪問にて、お客様の課題やご要望を詳しくお伺いします。",
    infoTitle: "💬 ヒアリング内容",
    infoList: [
      "現在の課題・お悩み",
      "実現したいこと・目標",
      "予算感・導入時期",
      "既存システムの状況",
    ],
    duration: "⏱️ 所要時間: 1〜2時間程度",
  },
  {
    step: 3,
    title: "ご提案・お見積もり",
    desc: "ヒアリング内容を元に、最適なソリューションと詳細なお見積もりをご提示します。",
    infoTitle: "📋 提案内容",
    infoList: [
      "課題解決のアプローチ",
      "実施内容・スケジュール",
      "期待される効果",
      "詳細なお見積もり",
    ],
    duration: "⏱️ 所要時間: ヒアリングから1週間程度",
  },
  {
    step: 4,
    title: "ご契約",
    desc: "ご提案内容にご納得いただけましたら、契約手続きを進めます。",
    infoTitle: "📝 契約手続き",
    infoList: [
      "契約書の作成・確認",
      "秘密保持契約（必要な場合）",
      "キックオフミーティングの日程調整",
    ],
    duration: "⏱️ 所要時間: 1〜2週間程度",
  },
  {
    step: 5,
    title: "プロジェクト開始",
    desc: "キックオフミーティングを実施し、プロジェクトを開始します。",
    infoTitle: "🚀 実施内容",
    infoList: [
      "キックオフミーティング",
      "詳細設計・開発",
      "定期的な進捗報告",
      "中間レビュー",
    ],
    duration: "⏱️ 所要時間: プロジェクトにより異なります",
  },
  {
    step: 6,
    title: "導入・運用サポート",
    desc: "成果物の納品後も、安定稼働まで継続的にサポートします。",
    infoTitle: "🔧 サポート内容",
    infoList: [
      "システム導入支援",
      "操作研修・マニュアル提供",
      "運用中のトラブル対応",
      "継続的な改善提案",
    ],
    duration: "💝 長期的にお客様をサポートします",
  },
];

const Flow = () => {
  useScrollReveal();

  return (
    <main className="container">
      {/* ページタイトル：固定 */}
      <div style={{ textAlign: "center", marginBottom: 60 }}>
        <h1 className="page-title">ご利用の流れ</h1>
        <p className="text-sub" style={{ fontSize: "1.2rem" }}>
          お問い合わせから導入までの流れをご紹介します
        </p>
      </div>

      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        {steps.map((s, idx) => (
          <section
            key={idx}
            className="content-card scroll-reveal"
            style={{ marginBottom: 40 }}
          >
            {/* ステップ番号バッジ */}
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 12,
                marginBottom: 16,
              }}
            >
              <span
                style={{
                  background: "var(--brand-main)",
                  color: "var(--brand-structure)",
                  fontWeight: 900,
                  fontSize: "1rem",
                  width: 40,
                  height: 40,
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                {s.step}
              </span>
              <h2
                style={{
                  color: "var(--brand-structure)",
                  fontSize: "1.5rem",
                  margin: 0,
                  paddingBottom: 6,
                  borderBottom: "2px solid var(--brand-main-line)",
                }}
              >
                STEP {s.step}：{s.title}
              </h2>
            </div>

            <p className="text-sub" style={{ marginBottom: 16 }}>{s.desc}</p>

            {/* 詳細情報 */}
            <div
              style={{
                background: "var(--bg-brand)",
                border: "1px solid var(--brand-main)",
                borderRadius: 12,
                padding: "16px 20px",
              }}
            >
              <p
                style={{
                  fontWeight: 700,
                  color: "var(--brand-structure)",
                  marginBottom: 10,
                }}
              >
                {s.infoTitle}
              </p>
              <ul
                className="text-sub"
                style={{ paddingLeft: 20, lineHeight: 2, margin: 0 }}
              >
                {s.infoList.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
              <p
                style={{
                  marginTop: 12,
                  color: "var(--brand-main-line)",
                  fontWeight: 600,
                  fontSize: "0.9rem",
                }}
              >
                {s.duration}
              </p>
            </div>
          </section>
        ))}
      </div>
    </main>
  );
};

export default Flow;