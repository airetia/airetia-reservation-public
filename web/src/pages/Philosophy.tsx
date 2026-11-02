// src/pages/Philosophy.tsx
import { Link } from "react-router-dom";
import { useScrollReveal } from "../hooks/useScrollReveal";

const Philosophy = () => {
  useScrollReveal();

  return (
    <main className="container">
      {/* ページタイトル：固定 */}
      <div style={{ textAlign: "center", marginBottom: 60 }}>
        <h1 className="page-title">airetiaの理念</h1>
        <p className="text-sub" style={{ fontSize: "1.2rem" }}>
          教育を、もっと自由に。もっと身近に。
        </p>
      </div>

      {/* 理念内容 */}
      <section
        className="content-card scroll-reveal"
        style={{ maxWidth: 800, margin: "0 auto 80px" }}
      >
        <p className="text-sub" style={{ lineHeight: 1.9, marginBottom: 25 }}>
          私たちは、学びたい人と教えたい人が自由につながれる社会を目指します。
        </p>
        <p className="text-sub" style={{ lineHeight: 1.9, marginBottom: 25 }}>
          一問だけの質問でも、本格的な継続指導でも、
          必要なときに、必要な分だけ支援を受けられる。
        </p>
        <p className="text-sub" style={{ lineHeight: 1.9, marginBottom: 25 }}>
          先生の知識と経験は、正当に評価され、実績として積み重なり、
          誰かの未来を支える資産になる。
        </p>
        <p
          className="text-sub"
          style={{
            lineHeight: 1.9,
            fontWeight: 700,
            color: "var(--brand-structure)",
            paddingTop: 20,
            borderTop: "2px solid var(--brand-main-line)",
          }}
        >
          それが、airetiaの描く未来です。
        </p>
      </section>

      {/* CTA */}
      <section
        className="scroll-reveal"
        style={{ textAlign: "center", padding: "60px 0" }}
      >
        <h3
          style={{
            fontSize: "2rem",
            color: "var(--brand-structure)",
            marginBottom: 30,
          }}
        >
          私たちの想いに共感しませんか？
        </h3>
        <Link to="/contact" className="btn-main" style={{ width: 250 }}>
          お問い合わせはこちら
        </Link>
      </section>
    </main>
  );
};

export default Philosophy;