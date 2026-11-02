// src/components/Header.tsx
import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";

const Header = () => {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
    document.body.style.overflow = "";
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <>
      <header className={scrolled ? "header-compact" : ""}>
        <div className="header-inner">
          <Link to="/" className="logo-text">
            <img src="/images/logo.png" alt="airetia" className="logo-img" />
          </Link>

          <nav className="nav-desktop">
            <ul className="nav-menu">
              <li><Link to="/about"   className="nav-link">airetiaについて</Link></li>
              <li><Link to="/service" className="nav-link">サービス</Link></li>
              <li><Link to="/flow"    className="nav-link">ご利用の流れ</Link></li>
              <li><Link to="/faq"     className="nav-link">よくある質問</Link></li>
              <li><a href="http://localhost:5173/login" className="btn-header-cta">
  ログイン
</a></li>
            </ul>
          </nav>

          <button
            className="hamburger"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "メニューを閉じる" : "メニューを開く"}
            aria-expanded={open}
          >
            <span className={`hb-bar${open ? " hb-open-1" : ""}`} />
            <span className={`hb-bar${open ? " hb-open-2" : ""}`} />
            <span className={`hb-bar${open ? " hb-open-3" : ""}`} />
          </button>
        </div>
      </header>

      {open && (
        <div className="drawer-overlay" onClick={() => setOpen(false)} aria-hidden="true" />
      )}

      <nav className={`drawer${open ? " drawer-open" : ""}`} aria-hidden={!open}>
        <button className="drawer-close" onClick={() => setOpen(false)} aria-label="メニューを閉じる">
          ✕
        </button>
        <ul className="drawer-nav">
          <li><Link to="/about"   className="drawer-link">airetiaについて</Link></li>
          <li><Link to="/service" className="drawer-link">サービス</Link></li>
          <li><Link to="/flow"    className="drawer-link">ご利用の流れ</Link></li>
          <li><Link to="/faq"     className="drawer-link">よくある質問</Link></li>
        </ul>
       <div className="drawer-cta-wrap">
  <a
    href="http://localhost:5173/login"
    className="btn-header-cta"
    style={{ display: "block", textAlign: "center", width: "100%" }}
  >
    ログイン
  </a>
</div>
      </nav>
    </>
  );
};

export default Header;