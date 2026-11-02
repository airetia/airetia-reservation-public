// src/components/Footer.tsx  （LP 外部向け Web 仕様）
// inline style を全廃し、common.css のクラスに統一
import { Link } from "react-router-dom";

const footerLinks = [
  { label: "採用情報",               to: "/recruit" },
  { label: "利用規約",               to: "/termsOfService" },
  { label: "プライバシーポリシー",   to: "/privacy" },
  { label: "お問い合わせ",           to: "/contact" },
];

const Footer = () => (
  <footer>
    <div className="footer-inner">
      {/* ブランドエリア */}
      <div className="footer-brand-wrap">
        <p className="footer-brand">airetia</p>
        <p className="footer-tagline">AIの力で、もっと優しく、もっと便利な未来へ。</p>
      </div>

      {/* ナビ */}
      <nav className="footer-nav">
        {footerLinks.map((item) => (
          <Link key={item.to} to={item.to} className="footer-link">
            {item.label}
          </Link>
        ))}
      </nav>

      {/* 区切り + コピーライト */}
      <hr className="footer-divider" />
      <p className="footer-copy">© 2025 airetia All Rights Reserved.</p>
    </div>
  </footer>
);

export default Footer;