// src/pages/Pricing.tsx
import { Link } from "react-router-dom";
import { useScrollReveal } from "../hooks/useScrollReveal";

const cancellationPolicy = [
  { timing: "サービス開始の24時間以上前",   rate: "100%", rateColor: "var(--brand-main-line)", note: "元の有効期限を維持" },
  { timing: "サービス開始の12〜24時間前",   rate: "50%",  rateColor: "var(--brand-structure)", note: "返還チケットの有効期限：キャンセル日＋7日" },
  { timing: "サービス開始の30分〜12時間前", rate: "20%",  rateColor: "var(--brand-structure)", note: "返還チケットの有効期限：キャンセル日＋7日" },
  { timing: "サービス開始の30分未満",       rate: "0%",   rateColor: "var(--brand-error)",     note: "返還なし" },
  { timing: "無断キャンセル（連絡なし）",   rate: "0%",   rateColor: "var(--brand-error)",     note: "返還なし・ペナルティあり" },
];

const faqItems = [
  {
    question: "チケットに有効期限はありますか？",
    answer: "購入日から1年間有効です。有効期限が近いチケットから優先して消費されます。期限超過後は使用できません。",
  },
  {
    question: "チケットは何枚でも購入できますか？",
    answer: "購入枚数に上限はありません。まとめて購入しておくと、好きなタイミングでご利用いただけます。",
  },
  {
    question: "1回のサービスに必要なチケット枚数は？",
    answer: "サービスの種類・時間・予約人数によって異なります。各サービスページで必要枚数をご確認ください。",
  },
  {
    question: "子どもと一緒に予約する場合は？",
    answer: "お子様を利用者（パーティシパント）として登録することで、お子様分のサービスをご予約いただけます。予約人数×必要枚数が消費されます。",
  },
];

const Pricing = () => {
  useScrollReveal();

  return (
    <main className="container">
      {/* ページタイトル：固定 */}
      <div style={{ textAlign: "center", marginBottom: 60 }}>
        <h1 className="page-title">料金・チケット案内</h1>
        <p className="text-sub" style={{ fontSize: "1.2rem" }}>
          チケット制だから、必要な分だけ。自分のペースで使える。
        </p>
      </div>

      {/* チケットとは */}
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
          チケットとは
        </h2>
        <p className="text-sub" style={{ lineHeight: 2, marginBottom: 30 }}>
          airetiaではサービスの予約に「チケット」を使用します。
          月額固定ではないため、受けたい分だけ柔軟にご利用いただけます。
          チケットは1枚単位で購入でき、有効期限内であればいつでも使えます。
        </p>

        <div className="grid-3">
          {[
            { icon: "🎫", title: "1枚 ¥500（税抜）",   desc: "1枚単位で購入可能。まとめ買いも少量購入もOKです。" },
            { icon: "📅", title: "有効期限 1年間",     desc: "購入日から1年間有効。期限が近いチケットから自動で消費されます。" },
            { icon: "🔄", title: "キャンセル時に返還",  desc: "一定条件を満たしたキャンセルでは、チケットが返還されます。" },
          ].map((item, i) => (
            <div
              key={i}
              style={{
                textAlign: "center",
                padding: 30,
                background: "var(--bg-brand)",
                border: "1px solid var(--brand-main)",
                borderRadius: 12,
              }}
            >
              <div style={{ fontSize: "3rem", marginBottom: 15 }}>{item.icon}</div>
              <h3
                style={{
                  color: "var(--brand-structure)",
                  fontSize: "1.1rem",
                  marginBottom: 10,
                  paddingBottom: 8,
                  borderBottom: "2px solid var(--brand-main-line)",
                  display: "inline-block",
                }}
              >
                {item.title}
              </h3>
              <p className="text-sub">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 購入の流れ */}
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
          チケット購入の流れ
        </h2>
        <p className="text-sub" style={{ marginBottom: 25 }}>
          現在はお振込み確認後に管理者がチケットを付与する形式です。オンライン決済は近日対応予定です。
        </p>

        <div style={{ display: "grid", gap: 16 }}>
          {[
            { step: 1, title: "購入枚数を決める",               desc: "ご希望のチケット枚数をお決めください。1枚500円（税抜）です。" },
            { step: 2, title: "お問い合わせフォームから申請",    desc: "お問い合わせページより「チケット購入希望」としてご連絡ください。" },
            { step: 3, title: "指定口座へ振込",                 desc: "ご案内する口座へお振込みください。" },
            { step: 4, title: "チケット付与・予約開始",          desc: "振込確認後、マイページのチケット残高に反映されます。すぐにご予約いただけます。" },
          ].map((s) => (
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

      {/* キャンセルポリシー */}
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
          キャンセルポリシー
        </h2>
        <p className="text-sub" style={{ marginBottom: 25 }}>
          キャンセルのタイミングによって、チケットの返還率が異なります。
        </p>

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.95rem" }}>
            <thead>
              <tr style={{ background: "var(--brand-structure)", color: "#fff" }}>
                <th style={{ padding: "12px 16px", textAlign: "left" }}>キャンセルのタイミング</th>
                <th style={{ padding: "12px 16px", textAlign: "center", width: 100 }}>返還率</th>
                <th style={{ padding: "12px 16px", textAlign: "left" }}>備考</th>
              </tr>
            </thead>
            <tbody>
              {cancellationPolicy.map((row, i) => (
                <tr
                  key={i}
                  style={{
                    background: i % 2 === 0 ? "var(--bg-card)" : "var(--bg-brand)",
                    borderBottom: "1px solid var(--brand-main)",
                  }}
                >
                  <td style={{ padding: "12px 16px", color: "var(--text-main)" }}>{row.timing}</td>
                  <td
                    style={{
                      padding: "12px 16px",
                      textAlign: "center",
                      fontWeight: 900,
                      color: row.rateColor,
                      fontSize: "1.1rem",
                    }}
                  >
                    {row.rate}
                  </td>
                  <td style={{ padding: "12px 16px", color: "var(--text-sub)", fontSize: "0.9rem" }}>
                    {row.note}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="text-sub" style={{ marginTop: 20, fontSize: "0.9rem", lineHeight: 2 }}>
          ※ 返還チケットの有効期限は「キャンセル日＋7日」と「元の有効期限」の短い方が適用されます。<br />
          ※ 提供者都合のキャンセルは、時期に関わらず100%返還・有効期限の短縮なし。
        </p>
      </section>

      {/* FAQ */}
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
          よくある質問
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
          まずは会員登録してチケットを購入
        </h3>
        <p className="text-sub" style={{ fontSize: "1.1rem", marginBottom: 30 }}>
          登録はメールアドレスだけ。チケットの購入は登録後からです。
        </p>
        <div style={{ display: "flex", gap: 20, justifyContent: "center", flexWrap: "wrap" }}>
          <Link to="/contact" className="btn-main" style={{ width: 240 }}>
            チケット購入を申し込む
          </Link>
          <Link to="/faq" className="btn-main outline" style={{ width: 240 }}>
            その他の質問を見る
          </Link>
        </div>
      </section>
    </main>
  );
};

export default Pricing;