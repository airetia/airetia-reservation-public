// src/pages/NotFound.tsx
import { Link, useNavigate } from "react-router-dom";

const quickLinks = [
  { to: "/service",  label: "サービス紹介" },
  { to: "/pricing",  label: "料金・チケット案内" },
  { to: "/faq",      label: "よくある質問" },
  { to: "/contact",  label: "お問い合わせ" },
];

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <main className="container">
      <div style={{ textAlign: "center", padding: "60px 20px" }}>
        {/* 404 数字 */}
        <p
          style={{
            fontSize: "8rem",
            fontWeight: 900,
            color: "var(--brand-main)",
            lineHeight: 1,
            margin: "0 0 10px",
            letterSpacing: -4,
            opacity: 0.85,
          }}
        >
          404
        </p>

        {/* タイトル */}
        <h1 className="page-title" style={{ marginBottom: 20 }}>
          ページが見つかりません
        </h1>

        {/* 説明 */}
        <p
          className="text-sub"
          style={{ fontSize: "1.1rem", marginBottom: 40, lineHeight: 2 }}
        >
          お探しのページは移動・削除されたか、
          <br />
          URLが間違っている可能性があります。
        </p>

        {/* ボタン */}
        <div
          style={{
            display: "flex",
            gap: 20,
            justifyContent: "center",
            flexWrap: "wrap",
            marginBottom: 60,
          }}
        >
          <button
            onClick={() => navigate(-1)}
            className="btn-main outline"
            style={{ width: 200 }}
          >
            前のページに戻る
          </button>
          <Link to="/" className="btn-main" style={{ width: 200 }}>
            トップページへ
          </Link>
        </div>

        {/* よく見られるページ */}
        <div
          className="content-card"
          style={{
            maxWidth: 500,
            margin: "0 auto",
            padding: 30,
            textAlign: "left",
          }}
        >
          <h2
            style={{
              color: "var(--brand-structure)",
              fontSize: "1.1rem",
              marginBottom: 16,
              paddingBottom: 12,
              borderBottom: "2px solid var(--brand-main-line)",
            }}
          >
            よく見られるページ
          </h2>
          <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: 8 }}>
            {quickLinks.map((link) => (
              <li key={link.to}>
                <Link
                  to={link.to}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "8px 0",
                    color: "var(--brand-structure)",
                    textDecoration: "none",
                    fontWeight: 600,
                    borderBottom: "1px solid var(--brand-main)",
                  }}
                >
                  <span style={{ color: "var(--brand-main-line)" }}>›</span>
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </main>
  );
};

export default NotFound;