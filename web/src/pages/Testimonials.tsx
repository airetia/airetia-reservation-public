// src/pages/Testimonials.tsx
import { Link } from "react-router-dom";
import { useScrollReveal } from "../hooks/useScrollReveal";

interface Testimonial {
  id: number;
  name: string;
  role: string;
  comment: string;
  rating: number;
}

const testimonials: Testimonial[] = [
  {
    id: 1,
    name: "T.M さん",
    role: "お子様（小学3年生）の保護者",
    comment: "子どもが自分から「またやりたい！」と言うほど楽しんでいます。先生の対応も丁寧で、安心して任せられます。チケット制なので無理なく続けられるのも助かっています。",
    rating: 5,
  },
  {
    id: 2,
    name: "K.S さん",
    role: "本人（中学生）",
    comment: "オンラインでも先生との距離が近くて、質問しやすいです。自分のペースで進められるのが気に入っています。",
    rating: 5,
  },
  {
    id: 3,
    name: "Y.H さん",
    role: "お子様（小学6年生）の保護者",
    comment: "プロバイダーの審査がしっかりしているので安心感があります。予約もキャンセルもアプリから簡単にできて便利です。",
    rating: 4,
  },
  {
    id: 4,
    name: "A.N さん",
    role: "講師（プロバイダー）",
    comment: "自分のスケジュールに合わせて空き枠を登録できるので、本業と両立しながら続けられています。報酬の支払いも毎月きっちりしていただけるので信頼できます。",
    rating: 5,
  },
  {
    id: 5,
    name: "R.F さん",
    role: "お子様2名の保護者",
    comment: "2人の子どもをそれぞれ登録できて、管理がまとめてできるのがとても便利です。チケットも一つのアカウントで管理できます。",
    rating: 5,
  },
  {
    id: 6,
    name: "M.T さん",
    role: "講師（プロバイダー）",
    comment: "登録時の書類審査は少し手間でしたが、それがあることで利用者の方に信頼してもらえていると感じます。ダッシュボードも使いやすいです。",
    rating: 4,
  },
];

const stats = [
  { value: "200+",  label: "登録メンバー数" },
  { value: "50+",   label: "提供先生・講師数" },
  { value: "1,000+", label: "累計サービス提供回数" },
  { value: "98%",   label: "利用者満足度" },
];

const Testimonials = () => {
  useScrollReveal();

  return (
    <main className="container">
      {/* ページタイトル：固定 */}
      <div style={{ textAlign: "center", marginBottom: 60 }}>
        <h1 className="page-title">利用者の声・実績</h1>
        <p className="text-sub" style={{ fontSize: "1.2rem" }}>
          airetiaをご利用いただいた保護者・お子様・講師の方々からの声をご紹介します。
        </p>
      </div>

      {/* 実績数字 */}
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
          airetiaの実績
        </h2>
        <div className="grid-2" style={{ gap: 20 }}>
          {stats.map((stat) => (
            <div
              key={stat.label}
              style={{
                textAlign: "center",
                padding: "30px 20px",
                background: "var(--bg-brand)",
                border: "1px solid var(--brand-main)",
                borderRadius: 12,
              }}
            >
              <p
                style={{
                  fontSize: "3rem",
                  fontWeight: 900,
                  color: "var(--brand-main-line)",
                  margin: "0 0 8px",
                  lineHeight: 1,
                }}
              >
                {stat.value}
              </p>
              <p
                style={{
                  color: "var(--brand-structure)",
                  fontWeight: 700,
                  fontSize: "0.95rem",
                  margin: 0,
                }}
              >
                {stat.label}
              </p>
            </div>
          ))}
        </div>
        <p className="text-sub" style={{ marginTop: 16, fontSize: "0.85rem" }}>
          ※ 数値はサービス開始以来の累計です（2026年3月時点）。
        </p>
      </section>

      {/* 利用者の声 */}
      <section style={{ marginBottom: 40 }}>
        <h2
          className="scroll-reveal"
          style={{
            color: "var(--brand-structure)",
            fontSize: "2rem",
            marginBottom: 30,
            textAlign: "center",
            paddingBottom: 12,
            borderBottom: "3px solid var(--brand-main-line)",
            display: "inline-block",
            width: "100%",
          }}
        >
          みなさまの声
        </h2>

        <div className="grid-2" style={{ gap: 25 }}>
          {testimonials.map((t) => (
            <div key={t.id} className="content-card scroll-reveal" style={{ padding: 30 }}>
              {/* 星評価 */}
              <div style={{ marginBottom: 12, fontSize: "1.2rem" }}>
                {Array.from({ length: 5 }, (_, i) => (
                  <span
                    key={i}
                    style={{ color: i < t.rating ? "var(--brand-warning)" : "#ddd" }}
                  >
                    ★
                  </span>
                ))}
              </div>

              {/* コメント */}
              <p
                className="text-sub"
                style={{
                  lineHeight: 2,
                  marginBottom: 20,
                  paddingLeft: 12,
                  borderLeft: "3px solid var(--brand-main)",
                }}
              >
                「{t.comment}」
              </p>

              {/* 投稿者 */}
              <div
                style={{
                  paddingTop: 16,
                  borderTop: "1px solid var(--brand-main)",
                }}
              >
                <p style={{ fontWeight: 700, color: "var(--brand-structure)", margin: "0 0 4px" }}>
                  {t.name}
                </p>
                <p className="text-sub" style={{ fontSize: "0.85rem", margin: 0 }}>
                  {t.role}
                </p>
              </div>
            </div>
          ))}
        </div>

        <p className="text-sub" style={{ marginTop: 20, fontSize: "0.85rem", textAlign: "center" }}>
          ※ ご本人の同意を得て掲載しています。氏名はイニシャルで表示しています。
        </p>
      </section>

      {/* CTA */}
      <section className="scroll-reveal cta-section" style={{ borderRadius: 20, marginTop: 20 }}>
        <h3 style={{ fontSize: "2rem", color: "var(--brand-structure)", marginBottom: 20 }}>
          あなたも始めてみませんか？
        </h3>
        <p className="text-sub" style={{ fontSize: "1.1rem", marginBottom: 30 }}>
          無料登録で、airetiaのサービスをすぐにご利用いただけます。
        </p>
        <div style={{ display: "flex", gap: 20, justifyContent: "center", flexWrap: "wrap" }}>
          <Link to="/contact" className="btn-main" style={{ width: 220 }}>
            無料で会員登録する
          </Link>
          <Link to="/service" className="btn-main outline" style={{ width: 220 }}>
            サービスを見る
          </Link>
        </div>
      </section>
    </main>
  );
};

export default Testimonials;