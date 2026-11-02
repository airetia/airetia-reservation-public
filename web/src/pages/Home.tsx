// src/pages/Home.tsx
// ← import パスを UseScrollReveal → useScrollReveal に修正（大文字起因のビルドエラー解消）
import { Link } from "react-router-dom";
import { useScrollReveal } from "../hooks/useScrollReveal";

const Home = () => {
  useScrollReveal();

  return (
    <main className="container">
      {/* ─── HERO ───
          タイトルは固定表示（scroll-reveal なし）
          サブコピー・ボタンはフェードイン
      ─────────────── */}
      <section className="hero-section" style={{ position: "relative" }}>
        <div className="hero-logo" style={{ marginBottom: 40 }}>
          <img src="/images/logo.png" alt="airetia ロゴ" />
        </div>

        {/* タイトル：固定・即表示 */}
        <h1
          style={{
            fontSize: "3.5rem",
            color: "var(--brand-structure)",
            marginBottom: 20,
            letterSpacing: 2,
            paddingBottom: 12,
            borderBottom: "3px solid var(--brand-main-line)",
          }}
        >
          Welcome to airetia
        </h1>

        {/* サブコピー：スクロールアニメ */}
        <p
          className="scroll-reveal"
          style={{ color: "var(--text-sub)", fontSize: "1.3rem", marginBottom: 50 }}
        >
          親の愛を子どもの可能性に
        </p>

        <div
          className="scroll-reveal hero-buttons"
          style={{ display: "flex", gap: 20, justifyContent: "center", flexWrap: "wrap" }}
        >
          <Link to="/service" className="btn-main" style={{ width: 200 }}>
            サービスを見る
          </Link>
          <Link to="/about" className="btn-main outline" style={{ width: 200 }}>
            新規会員登録
          </Link>
        </div>
      </section>

     {/* ─── OUR SERVICES ─── */}
<section style={{ padding: "80px 0", background: "var(--bg-page)" }}>
  <h2 className="section-title">OUR SERVICES</h2>

  <div
    style={{
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
      gap: 40,
      maxWidth: 1200,
      margin: "0 auto",
    }}
  >
    {[
      {
        icon: "📈",
        title: "成績を伸ばす個別伴走",
        desc: "オンライン・対面対応の完全マンツーマン指導。学習設計から進捗管理まで一貫サポートし、着実な成果へ導きます。",
      },
      {
        icon: "🧠",
        title: "今すぐ解決サポート",
        desc: "わからない問題を1問から解説。思考プロセスまで丁寧に言語化し、短時間で理解を深めます。",
      },
      {
        icon: "💪",
        title: "能力を伸ばすレッスン",
        desc: "スポーツ・身体能力・習慣形成など、学力以外の成長を支援。人間力を育てる実践型プログラムです。",
      },
    ].map((item, index) => (
      <div
        key={index}
        className="content-card scroll-reveal"
        style={{ textAlign: "center", padding: 40 }}
      >
        <div style={{ fontSize: "4rem", marginBottom: 20 }}>{item.icon}</div>
        <h3
          style={{
            color: "var(--brand-structure)",
            fontSize: "1.5rem",
            marginBottom: 15,
            paddingBottom: 8,
            borderBottom: "2px solid var(--brand-main-line)",
            display: "inline-block",
          }}
        >
          {item.title}
        </h3>
        <p className="text-sub" style={{ lineHeight: 1.8 }}>
          {item.desc}
        </p>
      </div>
    ))}
  </div>

  <div className="scroll-reveal" style={{ textAlign: "center", marginTop: 50 }}>
    <Link to="/service" className="btn-main" style={{ width: 250 }}>
      詳しく見る
    </Link>
  </div>
</section>

   {/* ─── FEATURES ─── */}
<section style={{ padding: "80px 0" }}>
  <h2 className="section-title">FEATURES</h2>

  <div style={{ maxWidth: 800, margin: "0 auto" }}>
    {[
      {
        title: "🎯 完全個別最適設計",
        desc: "一人ひとりの学力・目標・性格に合わせて指導内容を最適化。画一的ではないオーダーメイド型サポートを提供します。",
      },
      {
        title: "🤝 継続伴走サポート",
        desc: "学習計画の立案から進捗管理まで一貫支援。短期的な点数向上だけでなく、継続できる力を育てます。",
      },
      {
        title: "⚡ 柔軟で迅速な対応力",
        desc: "単問解説や教材作成にも対応。必要なときに必要な支援を受けられる柔軟なサポート体制を整えています。",
      },
    ].map((item, index) => (
      <div
        key={index}
        className="content-card scroll-reveal"
        style={{ marginBottom: index !== 2 ? 30 : 0, padding: 30 }}
      >
        <h3
          style={{
            color: "var(--brand-structure)",
            fontSize: "1.2rem",
            marginBottom: 10,
          }}
        >
          {item.title}
        </h3>
        <p className="text-sub" style={{ lineHeight: 1.8 }}>
          {item.desc}
        </p>
      </div>
    ))}
  </div>
</section>

    </main>
  );
};

export default Home;