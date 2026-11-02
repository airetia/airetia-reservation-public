// src/pages/ForProviders.tsx
import { Link } from "react-router-dom";
import { useScrollReveal } from "../hooks/useScrollReveal";

const reasons = [
  { icon: "🕐", title: "自分のスケジュールで",        desc: "空き時間を自由に登録して提供。週1時間からでも始められます。副業・複業としても最適です。" },
  { icon: "💰", title: "安定した報酬",               desc: "サービス提供ごとに報酬が発生。月末締め・翌月10日払いで安心して続けられます。" },
  { icon: "🌐", title: "オンライン・対面どちらでも",  desc: "オンラインレッスンに対応。場所を選ばず全国のご家庭にサービスを提供できます。" },
  { icon: "🛡️", title: "安心の審査制度",             desc: "書類審査・管理者承認を経て登録。質の高い先生のみが活動できる安全な環境です。" },
  { icon: "📊", title: "専用ダッシュボード",          desc: "予約状況・報告書・収益をまとめて管理。煩雑な事務作業をシステムがサポートします。" },
  { icon: "👨‍👩‍👧", title: "保護者との直接やり取り不要", desc: "予約・連絡・決済はすべてプラットフォーム経由。先生はサービスに集中できます。" },
];

const steps = [
  { step: 1, title: "会員登録",               desc: "メールアドレスとパスワードで無料登録。数分で完了します。" },
  { step: 2, title: "プロバイダー申請",        desc: "基本情報・資格・実績を入力し、必要書類（身分証・契約書・口座情報）をアップロードします。" },
  { step: 3, title: "審査（3営業日以内）",     desc: "管理者が書類を確認し、承認・却下をメールでご連絡します。" },
  { step: 4, title: "サービス・空き枠の登録",  desc: "提供するサービス内容と、提供可能な日時を登録します。" },
  { step: 5, title: "活動開始・報酬受取",      desc: "予約が入ったらサービスを提供し、月末に報酬を受け取ります。" },
];

const documents = [
  { icon: "🪪", title: "身分証明書",     desc: "運転免許証・マイナンバーカード・パスポートなど（JPG / PNG / PDF・10MB以内）" },
  { icon: "📄", title: "署名済み契約書", desc: "airetiaとの業務委託契約書（PDF・10MB以内）。申請後にお送りします。" },
  { icon: "🏦", title: "口座情報",       desc: "報酬振込先の口座が確認できる書類（通帳の写しなど）（JPG / PNG / PDF・10MB以内）" },
];

const faqItems = [
  {
    question: "副業として登録できますか？",
    answer: "はい、副業・複業として登録いただけます。ただし、ご自身の雇用先の就業規則等をご確認ください。",
  },
  {
    question: "対応可能なサービスの種類は？",
    answer: "現在はレッスン形式のサービスに対応しています。オンライン・対面どちらでも可能です。",
  },
  {
    question: "一度に何件まで予約を受けられますか？",
    answer: "空き枠として登録した時間帯に予約が入る形式です。同一時間帯に予約が重複することはありません。",
  },
  {
    question: "利用者の個人情報はどこまで開示されますか？",
    answer: "予約確定後に氏名・年齢などの最小限情報のみ開示されます。住所・電話番号・メールは開示されません。",
  },
];

const ForProviders = () => {
  useScrollReveal();

  return (
    <main className="container">
      {/* ページタイトル：固定 */}
      <div style={{ textAlign: "center", marginBottom: 60 }}>
        <p className="text-sub" style={{ fontSize: "1rem", marginBottom: 10 }}>
          先生・講師の方へ
        </p>
        <h1 className="page-title">あなたの知識と経験を、<br />子どもたちの力に変えよう。</h1>
        <p className="text-sub" style={{ fontSize: "1.2rem", marginTop: 20 }}>
          airetiaは、スキルを持つ先生と学びたい子どもたちをつなぐプラットフォームです。
          <br />
          空いている時間に、自分のペースで教えることができます。
        </p>
        <div
          style={{
            display: "flex",
            gap: 20,
            justifyContent: "center",
            flexWrap: "wrap",
            marginTop: 40,
          }}
        >
          <Link to="/contact" className="btn-main" style={{ width: 240 }}>
            先生として登録する（無料）
          </Link>
        </div>
      </div>

      {/* 選ばれる理由 */}
      <section className="content-card scroll-reveal" style={{ marginBottom: 40 }}>
        <h2
          style={{
            color: "var(--brand-structure)",
            fontSize: "1.8rem",
            marginBottom: 30,
            paddingBottom: 15,
            borderBottom: "2px solid var(--brand-main-line)",
          }}
        >
          airetiaが選ばれる理由
        </h2>
        <div className="grid-3">
          {reasons.map((item, i) => (
            <div
              key={i}
              style={{
                padding: 25,
                background: "var(--bg-brand)",
                border: "1px solid var(--brand-main)",
                borderRadius: 12,
              }}
            >
              <div style={{ fontSize: "2.5rem", marginBottom: 12 }}>{item.icon}</div>
              <h3
                style={{
                  color: "var(--brand-structure)",
                  fontSize: "1.05rem",
                  marginBottom: 8,
                  paddingBottom: 6,
                  borderBottom: "1px solid var(--brand-main)",
                }}
              >
                {item.title}
              </h3>
              <p className="text-sub" style={{ margin: 0 }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 報酬のしくみ */}
      <section className="content-card scroll-reveal" style={{ marginBottom: 40 }}>
        <h2
          style={{
            color: "var(--brand-structure)",
            fontSize: "1.8rem",
            marginBottom: 10,
            paddingBottom: 15,
            borderBottom: "2px solid var(--brand-main-line)",
          }}
        >
          報酬のしくみ
        </h2>
        <p className="text-sub" style={{ marginBottom: 30 }}>
          サービスが完了するたびに報酬が発生します。難しい計算は不要、システムが自動で集計します。
        </p>

        <div className="grid-3">
          {[
            { label: "チケット単価",     value: "¥500",  unit: "/ 枚（税抜）" },
            { label: "先生への報酬率",   value: "40",    unit: "%" },
            { label: "支払いサイクル",   value: "月末締", unit: "・翌月10日払" },
          ].map((item, i) => (
            <div
              key={i}
              style={{
                textAlign: "center",
                padding: "30px 20px",
                background: i === 1 ? "var(--brand-structure)" : "var(--bg-brand)",
                border: `2px solid ${i === 1 ? "var(--brand-structure)" : "var(--brand-main)"}`,
                borderRadius: 16,
              }}
            >
              <p
                style={{
                  fontSize: "0.9rem",
                  fontWeight: 600,
                  marginBottom: 10,
                  color: i === 1 ? "rgba(255,255,255,0.7)" : "var(--text-sub)",
                }}
              >
                {item.label}
              </p>
              <p
                style={{
                  fontSize: i === 1 ? "3rem" : "2.2rem",
                  fontWeight: 900,
                  color: i === 1 ? "#fff" : "var(--brand-main-line)",
                  margin: "0 0 4px",
                }}
              >
                {item.value}
                <span style={{ fontSize: "1rem", fontWeight: 600 }}>{item.unit}</span>
              </p>
            </div>
          ))}
        </div>

        <p className="text-sub" style={{ marginTop: 20, fontSize: "0.9rem", lineHeight: 2 }}>
          ※ 振込手数料は別途差し引かれます。<br />
          ※ 無断キャンセルの場合も、消費予定枚数が6枚以上であれば補償報酬が発生します。
        </p>
      </section>

      {/* 登録の流れ */}
      <section className="content-card scroll-reveal" style={{ marginBottom: 40 }}>
        <h2
          style={{
            color: "var(--brand-structure)",
            fontSize: "1.8rem",
            marginBottom: 25,
            paddingBottom: 15,
            borderBottom: "2px solid var(--brand-main-line)",
          }}
        >
          登録から活動開始までの流れ
        </h2>
        <div style={{ display: "grid", gap: 16 }}>
          {steps.map((s) => (
            <div
              key={s.step}
              className="info-box"
              style={{ display: "flex", alignItems: "flex-start", gap: 16 }}
            >
              <span className="step-badge" style={{ flexShrink: 0 }}>{s.step}</span>
              <div>
                <p className="info-box__title">{s.title}</p>
                <p className="text-sub" style={{ margin: 0 }}>{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 必要書類 */}
      <section className="content-card scroll-reveal" style={{ marginBottom: 40 }}>
        <h2
          style={{
            color: "var(--brand-structure)",
            fontSize: "1.8rem",
            marginBottom: 25,
            paddingBottom: 15,
            borderBottom: "2px solid var(--brand-main-line)",
          }}
        >
          審査に必要な書類
        </h2>
        <div className="grid-3">
          {documents.map((doc, i) => (
            <div
              key={i}
              style={{
                textAlign: "center",
                padding: 25,
                background: "var(--bg-brand)",
                border: "1px solid var(--brand-main)",
                borderRadius: 12,
              }}
            >
              <div style={{ fontSize: "2.5rem", marginBottom: 12 }}>{doc.icon}</div>
              <h3
                style={{
                  color: "var(--brand-structure)",
                  fontSize: "1.05rem",
                  marginBottom: 10,
                }}
              >
                {doc.title}
              </h3>
              <p className="text-sub" style={{ fontSize: "0.9rem", margin: 0 }}>{doc.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* よくある質問 */}
      <section className="content-card scroll-reveal" style={{ marginBottom: 40 }}>
        <h2
          style={{
            color: "var(--brand-structure)",
            fontSize: "1.8rem",
            marginBottom: 25,
            paddingBottom: 15,
            borderBottom: "2px solid var(--brand-main-line)",
          }}
        >
          先生からよくある質問
        </h2>
        <div style={{ display: "grid", gap: 15 }}>
          {faqItems.map((item, i) => (
            <div key={i} className="faq-item">
              <p className="faq-item__question">
                <span className="faq-item__label--q">Q.</span>
                {item.question}
              </p>
              <p className="faq-item__answer">
                <span className="faq-item__label--a">A.</span>
                {item.answer}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="scroll-reveal cta-section" style={{ borderRadius: 20, marginTop: 20 }}>
        <h3 style={{ fontSize: "2rem", color: "var(--brand-structure)", marginBottom: 20 }}>
          あなたの経験を、次の世代へ。
        </h3>
        <p className="text-sub" style={{ fontSize: "1.1rem", marginBottom: 30 }}>
          登録・審査申請は無料です。まずはアカウントを作成してください。
        </p>
        <div style={{ display: "flex", gap: 20, justifyContent: "center", flexWrap: "wrap" }}>
          <Link to="/contact" className="btn-main" style={{ width: 220 }}>
            無料で登録する
          </Link>
          <Link to="/contact" className="btn-main outline" style={{ width: 220 }}>
            まず相談する
          </Link>
        </div>
      </section>
    </main>
  );
};

export default ForProviders;