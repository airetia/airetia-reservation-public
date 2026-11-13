// src/pages/LegalNotice.tsx
import { Link } from "react-router-dom";
import { useScrollReveal } from "../hooks/useScrollReveal";

interface LegalRow {
  label: string;
  value: string | string[];
}

const legalData: LegalRow[] = [
  { label: "販売事業者名",   value: "airetia運営事務局" },
  { label: "運営責任者",     value: "(代表者氏名を入力)" },
  { label: "所在地",         value: "(住所を入力)" },
  { label: "電話番号",       value: "(電話番号を入力)（お問い合わせはメールにて承ります）" },
  { label: "メールアドレス", value: "(メールアドレスを入力)" },
  { label: "サービスURL",    value: "(サービスURLを入力)" },
  {
    label: "販売価格",
    value: [
      "チケット：1枚 500円（税抜）",
      "消費税は別途申し受けます。",
      "価格はサービス内容によって異なる場合があります。",
    ],
  },
  { label: "商品代金以外の費用", value: "振込手数料はお客様のご負担となります。" },
  { label: "支払い方法",         value: "銀行振込（現在）" },
  { label: "支払い期限",         value: "購入申請後、7日以内にお振込みください。" },
  { label: "チケット有効期限",   value: "購入日から1年間（翌年同日の23:59:59まで）" },
  { label: "サービスの提供時期", value: "チケット付与後、即時ご利用いただけます。" },
  {
    label: "キャンセル・返品について",
    value: [
      "チケットの購入後のキャンセル・返金は原則お受けしておりません。",
      "サービス予約のキャンセルについては、以下のポリシーに基づきチケットを返還します。",
      "・サービス開始の24時間以上前：100%返還",
      "・サービス開始の12〜24時間前：50%返還",
      "・サービス開始の30分〜12時間前：20%返還",
      "・サービス開始の30分未満：返還なし",
      "・無断キャンセル：返還なし（ペナルティが適用される場合があります）",
    ],
  },
  {
    label: "動作環境",
    value: [
      "本サービスはウェブブラウザ上でご利用いただけます。",
      "推奨ブラウザ：Google Chrome / Safari / Mozilla Firefox（最新版）",
    ],
  },
];

const LegalNotice = () => {
  useScrollReveal();

  return (
    <main className="container">
      {/* ページタイトル：固定 */}
      <div style={{ textAlign: "center", marginBottom: 60 }}>
        <h1 className="page-title">特定商取引法に基づく表記</h1>
        <p className="text-sub" style={{ fontSize: "1.1rem" }}>
          特定商取引に関する法律第11条に基づき記載しています。
        </p>
      </div>

      {/* 表記テーブル */}
      <section className="content-card scroll-reveal" style={{ marginBottom: 40 }}>
        <dl className="dl-grid">
          {legalData.map((row, i) => (
            <div
              key={i}
              style={{
                display: "grid",
                gridTemplateColumns: "200px 1fr",
                gap: 20,
                padding: "18px 0",
                borderBottom:
                  i < legalData.length - 1 ? "1px solid var(--brand-main)" : undefined,
              }}
            >
              <dt style={{ fontWeight: "bold", color: "var(--brand-structure)" }}>
                {row.label}
              </dt>
              <dd className="text-sub" style={{ margin: 0, lineHeight: 1.9 }}>
                {Array.isArray(row.value) ? (
                  <ul style={{ paddingLeft: 0, listStyle: "none", margin: 0, display: "grid", gap: 4 }}>
                    {row.value.map((v, j) => (
                      <li key={j}>{v}</li>
                    ))}
                  </ul>
                ) : (
                  row.value
                )}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <div className="scroll-reveal" style={{ marginBottom: 50 }}>
        <div
          className="info-box"
          style={{ background: "var(--bg-brand)", border: "1px solid var(--brand-warning)" }}
        >
          <p
            className="info-box__title"
            style={{ color: "var(--brand-structure)" }}
          >
            ⚠️ 運用開始前にご確認ください
          </p>
          <p className="text-sub" style={{ margin: 0, lineHeight: 2 }}>
            ( ) 内の項目は正式運用開始前に実際の情報へ差し替えてください。<br />
            特定商取引法では、販売事業者の氏名・所在地・電話番号の明示が義務付けられています。
          </p>
        </div>
      </div>

      {/* CTA */}
      <section className="scroll-reveal" style={{ textAlign: "center", padding: "60px 0" }}>
        <h3 style={{ fontSize: "2rem", color: "var(--brand-structure)", marginBottom: 30 }}>
          ご不明点はお問い合わせください
        </h3>
        <Link to="/contact" className="btn-main" style={{ width: 250 }}>
          お問い合わせ
        </Link>
      </section>
    </main>
  );
};

export default LegalNotice;