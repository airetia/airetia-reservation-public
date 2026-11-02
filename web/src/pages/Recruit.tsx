// src/pages/Recruit.tsx
import React from "react";
import { Link } from "react-router-dom";
import { useScrollReveal } from "../hooks/useScrollReveal";

const Recruit: React.FC = () => {
  useScrollReveal();

  return (
    <main className="container">
      {/* ページタイトル：固定 */}
      <div style={{ textAlign: "center", marginBottom: 60 }}>
        <h1 className="page-title">採用情報</h1>
        <p className="text-sub" style={{ fontSize: "1.2rem" }}>
          一緒にAIで未来を創る仲間を募集しています
        </p>
      </div>

      {/* メッセージ */}
      <section className="content-card scroll-reveal" style={{ marginBottom: 50, textAlign: "center" }}>
        <h2 style={{ color: "var(--brand-structure)", fontSize: "2rem", marginBottom: 30, paddingBottom: 12, borderBottom: "2px solid var(--brand-main)", display: "inline-block" }}>
          airetiaで働く魅力
        </h2>
        <p className="text-sub" style={{ lineHeight: 2, maxWidth: 800, margin: "0 auto" }}>
          私たちは、AIという最先端技術を通じて社会に貢献することを目指しています。
          <br />
          成長意欲のある方、新しいことにチャレンジしたい方を歓迎します。
          <br />
          一緒に優しく便利な未来を創りましょう。
        </p>
      </section>

      {/* 募集職種 */}
      <section style={{ marginBottom: 50 }}>
        <h2
          className="scroll-reveal"
          style={{ color: "var(--brand-structure)", fontSize: "2rem", marginBottom: 40, textAlign: "center", paddingBottom: 12, borderBottom: "3px solid var(--brand-main)", display: "inline-block", width: "100%" }}
        >
          募集職種
        </h2>

        {[
          {
            title: "AIエンジニア / 機械学習エンジニア",
            contents: [
              { dt: "業務内容", dd: "機械学習モデルの設計・開発・実装\nクライアント企業への技術提案・コンサルティング\n最新技術の調査・研究" },
              { dt: "必須スキル", dd: "Python を用いた開発経験（2年以上）\n機械学習の基礎知識\nデータ分析・統計の基礎知識" },
              { dt: "歓迎スキル", dd: "深層学習フレームワーク（PyTorch, TensorFlow等）の使用経験\nクラウド環境（AWS, GCP等）での開発経験\n自然言語処理・画像認識の実務経験" },
              { dt: "雇用形態・待遇", dd: "正社員 / 年俸400万円〜800万円（経験・能力により優遇）\nフレックスタイム制 / リモートワーク可\n各種社会保険完備 / 交通費全額支給" },
            ],
          },
          {
            title: "データサイエンティスト",
            contents: [
              { dt: "業務内容", dd: "ビジネス課題の分析・可視化\n統計的手法を用いたデータ分析\n予測モデルの構築・評価" },
              { dt: "必須スキル", dd: "Python / R を用いたデータ分析経験（2年以上）\nSQL を用いたデータ抽出・加工スキル\n統計学の基礎知識" },
              { dt: "歓迎スキル", dd: "BIツール（Tableau, Power BI等）の使用経験\n機械学習モデルの実装経験\nビジネス課題のヒアリング・提案経験" },
              { dt: "雇用形態・待遇", dd: "正社員 / 年俸400万円〜700万円（経験・能力により優遇）\nフレックスタイム制 / リモートワーク可\n各種社会保険完備 / 交通費全額支給" },
            ],
          },
          {
            title: "営業 / プロジェクトマネージャー",
            contents: [
              { dt: "業務内容", dd: "新規顧客の開拓・既存顧客のフォロー\nプロジェクトの企画・推進・管理\nエンジニアチームとの連携" },
              { dt: "必須スキル", dd: "法人営業またはプロジェクトマネジメント経験（2年以上）\n基本的なITリテラシー\nコミュニケーション能力" },
              { dt: "歓迎スキル", dd: "IT業界での営業・PM経験\nAI/データサイエンスに関する知識\nコンサルティング経験" },
              { dt: "雇用形態・待遇", dd: "正社員 / 年俸350万円〜600万円（経験・能力により優遇）\nフレックスタイム制 / リモートワーク可\n各種社会保険完備 / 交通費全額支給" },
            ],
          },
        ].map((job, idx) => (
          <div key={idx} className="content-card scroll-reveal" style={{ marginBottom: 30 }}>
            <h3 style={{ color: "var(--brand-structure)", fontSize: "1.5rem", marginBottom: 20, paddingBottom: 15, borderBottom: "2px solid var(--brand-main)" }}>
              {job.title}
            </h3>
            <dl style={{ display: "grid", gap: 20 }}>
              {job.contents.map((item, i) => (
                <div key={i} style={{ display: "grid", gridTemplateColumns: "150px 1fr", gap: 20, padding: "15px 0", borderBottom: i < job.contents.length - 1 ? "1px solid var(--brand-main)" : undefined }}>
                  <dt style={{ fontWeight: "bold", color: "var(--brand-structure)" }}>{item.dt}</dt>
                  <dd className="text-sub">
                    {item.dd.split("\n").map((line, idx) => (
                      <React.Fragment key={idx}>{line}<br /></React.Fragment>
                    ))}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        ))}
      </section>

      {/* 福利厚生 */}
      <section className="content-card scroll-reveal" style={{ marginBottom: 50 }}>
        <h2 style={{ color: "var(--brand-structure)", fontSize: "2rem", marginBottom: 30, textAlign: "center", paddingBottom: 12, borderBottom: "2px solid var(--brand-main)", display: "inline-block", width: "100%" }}>
          福利厚生・働き方
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 30 }}>
          {[
            { icon: "⏰", title: "フレックスタイム制", text: "コアタイムなしで柔軟な働き方が可能" },
            { icon: "🏠", title: "リモートワーク可",   text: "週2〜3日在宅勤務OK" },
            { icon: "📚", title: "学習支援制度",       text: "書籍購入・セミナー参加費用を全額補助" },
            { icon: "💻", title: "最新設備",           text: "高性能PC・モニター2台支給" },
          ].map((item, i) => (
            <div key={i} style={{ textAlign: "center" }}>
              <div style={{ fontSize: "3rem", marginBottom: 15 }}>{item.icon}</div>
              <h3 style={{ color: "var(--brand-structure)", marginBottom: 10, fontSize: "1.1rem" }}>{item.title}</h3>
              <p className="text-sub">{item.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 応募方法 */}
      <section className="content-card scroll-reveal" style={{ marginBottom: 50 }}>
        <h2 style={{ color: "var(--brand-structure)", fontSize: "2rem", marginBottom: 30, textAlign: "center", paddingBottom: 12, borderBottom: "2px solid var(--brand-main)", display: "inline-block", width: "100%" }}>
          応募方法
        </h2>
        <div style={{ maxWidth: 700, margin: "0 auto" }}>
          <p className="text-sub" style={{ lineHeight: 2, marginBottom: 30, textAlign: "center" }}>
            下記のお問い合わせフォームより、応募希望職種と簡単な経歴をお送りください。
            <br />
            書類選考の上、面接日程をご連絡いたします。
          </p>
          <div className="info-box" style={{ marginBottom: 30 }}>
            <p className="info-box__title">📧 必要書類</p>
            <ul className="info-box__list">
              <li>履歴書（写真貼付）</li>
              <li>職務経歴書</li>
              <li>ポートフォリオ（エンジニア職の場合、任意）</li>
            </ul>
          </div>
          <div style={{ textAlign: "center" }}>
            <Link to="/contact" className="btn-main">
              応募・お問い合わせ
            </Link>
          </div>
        </div>
      </section>

      {/* カジュアル面談 CTA */}
      <section className="scroll-reveal content-card" style={{ marginBottom: 50, textAlign: "center", padding: "60px 30px" }}>
        <h3 style={{ fontSize: "2rem", color: "var(--brand-structure)", marginBottom: 20 }}>
          まずはカジュアル面談から
        </h3>
        <p className="text-sub" style={{ fontSize: "1.1rem", marginBottom: 40 }}>
          選考前に、気軽に話を聞きたい方も大歓迎です。
          <br />
          オンラインで30分程度、お話ししましょう。
        </p>
        {/* ← width固定を削除。テキストに合わせて自動伸縮 */}
        <Link to="/contact" className="btn-main">
          カジュアル面談を申し込む
        </Link>
      </section>
    </main>
  );
};

export default Recruit;