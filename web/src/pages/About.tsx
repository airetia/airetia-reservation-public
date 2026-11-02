// src/pages/About.tsx
// ← API未設定・取得失敗時にフォールバック表示するよう修正
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { useScrollReveal } from "../hooks/useScrollReveal";

type CompanyInfo = {
  mission: string;
  vision: string;
};

const FALLBACK: CompanyInfo = {
  mission: `AIの力で、すべての人に優しく便利な未来を創造します。
最先端の技術を身近なものにし、社会全体の幸福に貢献することを目指しています。`,
  vision: "About airetia",
};

const About = () => {
  useScrollReveal();

  const [companyInfo, setCompanyInfo] = useState<CompanyInfo>(FALLBACK);
  const apiUrl = import.meta.env.VITE_API_URL;

  useEffect(() => {
    if (!apiUrl) return; // API URL 未設定時はフォールバックを使用
    fetch(`${apiUrl}/api/company`)
      .then((res) => {
        if (!res.ok) throw new Error("API error");
        return res.json() as Promise<CompanyInfo>;
      })
      .then((data) => setCompanyInfo(data))
      .catch(() => {
        // エラー時はフォールバックを維持（コンソールエラーも出さない）
      });
  }, [apiUrl]);

  return (
    <main className="container">
      {/* ページタイトル：固定 */}
      <div style={{ textAlign: "center", marginBottom: 60 }}>
        <h1 className="page-title">会社概要</h1>
        <p className="text-sub" style={{ fontSize: "1.2rem" }}>
          {companyInfo.vision}
        </p>
      </div>

      {/* ミッション */}
      <section
        className="content-card scroll-reveal"
        style={{ marginBottom: 50, textAlign: "center", padding: "60px 40px" }}
      >
        <h2
          style={{
            color: "var(--brand-structure)",
            fontSize: "2rem",
            marginBottom: 30,
            paddingBottom: 12,
            borderBottom: "2px solid var(--brand-main-line)",
            display: "inline-block",
          }}
        >
          私たちのミッション
        </h2>
        <p
          style={{
            fontSize: "1.3rem",
            lineHeight: 2,
            color: "var(--text-main)",
            maxWidth: 680,
            margin: "0 auto",
            whiteSpace: "pre-line",
          }}
        >
          {companyInfo.mission}
        </p>
      </section>

      {/* CTA */}
      <section className="scroll-reveal" style={{ textAlign: "center", padding: "60px 0" }}>
        <h3 style={{ fontSize: "2rem", color: "var(--brand-structure)", marginBottom: 30 }}>
          一緒に未来を創りませんか？
        </h3>
        <div style={{ display: "flex", justifyContent: "center", gap: 20, flexWrap: "wrap" }}>
          <Link to="/recruit" className="btn-main" style={{ width: 200 }}>
            採用情報
          </Link>
          <Link to="/contact" className="btn-main outline" style={{ width: 200 }}>
            お問い合わせ
          </Link>
        </div>
      </section>
    </main>
  );
};

export default About;