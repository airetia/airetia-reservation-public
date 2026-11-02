// src/pages/SecurityPolicy.tsx
import { Link } from "react-router-dom";
import { useScrollReveal } from "../hooks/useScrollReveal";

const sections = [
  {
    title: "第1条（基本方針）",
    content:
      "airetia運営事務局（以下「当社」）は、お客様が安心してサービスをご利用いただけるよう、情報セキュリティの確保を重要な経営課題として位置づけ、適切な対策を講じてまいります。",
  },
  {
    title: "第2条（通信の暗号化）",
    content:
      "本サービスはすべての通信においてSSL/TLS暗号化を採用しています。お客様の個人情報・パスワード・チケット情報などは暗号化された状態で送受信されます。",
  },
  {
    title: "第3条（アカウントの保護）",
    items: [
      "パスワードはbcryptアルゴリズムによりハッシュ化して保存します（平文保存は行いません）。",
      "セッション管理にはHttpOnly・SameSite属性付きのCookieを使用し、セッションハイジャックを防止します。",
      "CSRF（クロスサイトリクエストフォージェリ）対策として、CSRFトークンによる検証を実施しています。",
      "不審なログイン試行が検知された場合、アカウントをロックする機能を備えています。",
    ],
  },
  {
    title: "第4条（データ管理）",
    items: [
      "お客様のデータはMySQLデータベースに格納し、アクセス権限を最小限に制限しています。",
      "提出書類（身分証・契約書・口座情報）はAWS S3へ保存し、IAMロールによるアクセス制御を実施しています。",
      "バックアップは毎日自動実行され、7日分を保持しています。",
      "本番環境データを開発・テスト環境で使用することはありません。",
    ],
  },
  {
    title: "第5条（アクセス制御）",
    items: [
      "ロールベースのアクセス制御（RBAC）を実装しており、管理者・メンバー・プロバイダーそれぞれが必要な情報のみにアクセスできます。",
      "プロバイダーが閲覧できる利用者情報は氏名・年齢など最小限に限定されます。",
      "管理者による代理操作はすべて監査ログに記録されます。",
    ],
  },
  {
    title: "第6条（外部サービス・依存関係）",
    items: [
      "使用する外部サービスは信頼性の高いクラウドプロバイダー（AWS等）のみに限定しています。",
      "ライブラリ・依存パッケージの脆弱性チェックを定期的に実施しています。",
      "第三者への個人情報の売却・提供は一切行いません。",
    ],
  },
  {
    title: "第7条（インシデント対応）",
    content:
      "セキュリティインシデントが発生した場合、速やかに調査・原因特定を行い、影響を受けたお客様へご連絡するとともに、再発防止策を講じます。",
  },
  {
    title: "第8条（継続的改善）",
    content:
      "セキュリティ対策は技術の進化や脅威の変化に合わせて定期的に見直しを行い、継続的な改善に努めます。本ポリシーは改定される場合があります。改定時はサービス上でお知らせします。",
  },
];

const SecurityPolicy = () => {
  useScrollReveal();

  return (
    <main className="container">
      {/* ページタイトル：固定 */}
      <div style={{ textAlign: "center", marginBottom: 60 }}>
        <h1 className="page-title">セキュリティポリシー</h1>
        <p className="text-sub" style={{ fontSize: "1.1rem" }}>
          お客様の大切な情報を守るための取り組みをご説明します。
        </p>
      </div>

      {/* 各条項 */}
      {sections.map((section, i) => (
        <section
          key={i}
          className="content-card scroll-reveal"
          style={{ marginBottom: 30 }}
        >
          <h2
            style={{
              color: "var(--brand-structure)",
              fontSize: "1.6rem",
              marginBottom: 25,
              paddingBottom: 15,
              borderBottom: "2px solid var(--brand-main-line)",
            }}
          >
            {section.title}
          </h2>
          {section.content && (
            <p className="text-sub" style={{ lineHeight: 2 }}>
              {section.content}
            </p>
          )}
          {section.items && (
            <ul className="text-sub" style={{ lineHeight: 2, paddingLeft: 20 }}>
              {section.items.map((item, j) => (
                <li key={j} style={{ marginBottom: 8 }}>
                  {item}
                </li>
              ))}
            </ul>
          )}
        </section>
      ))}

      {/* 制定日 */}
      <div className="scroll-reveal" style={{ textAlign: "right", marginBottom: 60 }}>
        <p className="text-sub">制定日：2026年3月1日</p>
      </div>

      {/* CTA */}
      <section className="scroll-reveal" style={{ textAlign: "center", padding: "60px 0" }}>
        <h3 style={{ fontSize: "2rem", color: "var(--brand-structure)", marginBottom: 30 }}>
          ご不明点はお問い合わせください
        </h3>
        <div style={{ display: "flex", gap: 20, justifyContent: "center", flexWrap: "wrap" }}>
          <Link to="/contact" className="btn-main" style={{ width: 220 }}>
            お問い合わせ
          </Link>
          <Link to="/privacy" className="btn-main outline" style={{ width: 220 }}>
            プライバシーポリシー
          </Link>
        </div>
      </section>
    </main>
  );
};

export default SecurityPolicy;