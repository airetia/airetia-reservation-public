// src/pages/Faq.tsx
import { useState, useRef, useCallback } from "react";
import { Link } from "react-router-dom";

interface FaqItem {
  question: string;
  answer: string;
}

const faqData: { [section: string]: FaqItem[] } = {
  "サービス全般について（オンライン家庭教師・単発質問）": [
    {
      question: "airetiaとはどのようなオンライン家庭教師サービスですか？",
      answer:
        "airetiaは、オンライン家庭教師レッスンに加え、「1問だけ解説してほしい」といった単発質問にも対応する学習プラットフォームです。定期指導・スポット利用・解説教材購入まで対応しています。",
    },
    {
      question: "1問だけの質問も本当に可能ですか？",
      answer:
        "はい、可能です。「この問題だけ分からない」「テスト前にここだけ確認したい」といった単発依頼ができます。必要な分だけ利用できるのが特徴です。",
    },
    {
      question: "どの教科に対応していますか？",
      answer:
        "主要5教科を中心に、受験対策・資格対策・専門分野まで幅広く対応しています。講師ごとに対応科目が異なります。",
    },
    {
      question: "レッスン形式はオンラインのみですか？",
      answer:
        "基本はオンライン形式の家庭教師サービスです。将来的に対面対応エリアの拡張も検討しています。",
    },
  ],
  "料金について（オンライン家庭教師の料金体系）": [
    {
      question: "料金体系はどうなっていますか？",
      answer:
        "レッスンは講師ごとの時間単価制、単発質問は問題単位の価格設定、解説教材はデジタル教材単品購入形式です。価格は講師ごとに設定されています。",
    },
    {
      question: "支払い方法は何がありますか？",
      answer:
        "クレジットカード決済を中心に導入予定です。今後、電子決済や法人請求にも対応予定です。",
    },
    {
      question: "キャンセルは可能ですか？",
      answer:
        "レッスン開始前であればキャンセル可能です。キャンセルポリシーは講師ごとに設定されています。",
    },
  ],
  "教材・安全性について（問題解説サービス・教材販売）": [
    {
      question: "教材を購入すると他の人も見られますか？",
      answer:
        "はい。公開設定された解説教材は他の利用者も購入可能です。そのため、質の高い教材が蓄積されていく仕組みになっています。",
    },
    {
      question: "講師はどのように選ばれていますか？",
      answer:
        "登録審査・実績確認・プロフィール公開により透明性を確保しています。過去に作成した教材や解説も実績として確認できます。",
    },
    {
      question: "安全面は大丈夫ですか？",
      answer:
        "メッセージ管理・決済管理・レビュー制度により安全性を確保しています。個人間の直接取引は禁止しています。",
    },
  ],
  "講師向けFAQ（登録・報酬・差別化）": [
    {
      question: "登録に費用はかかりますか？",
      answer:
        "登録は無料です。売上が発生した場合のみ、所定の手数料が発生します。",
    },
    {
      question: "単発質問だけ受けることもできますか？",
      answer:
        "可能です。オンラインレッスンを行わず、問題解説のみの提供もできます。",
    },
    {
      question: "教材販売のみの利用は可能ですか？",
      answer:
        "はい。過去に作成した解説資料をアップロードし、デジタル教材として販売できます。",
    },
    {
      question: "価格は自由に設定できますか？",
      answer:
        "基本的には自由設定です。ただし市場バランスを考慮したガイドラインは提示予定です。",
    },
    {
      question: "報酬の支払いタイミングは？",
      answer: "月次締め・翌月払いを想定しています。",
    },
    {
      question: "実績は公開されますか？",
      answer:
        "販売数・レビュー・作成教材はプロフィールに反映されます。これが講師にとっての信用資産となります。",
    },
    {
      question: "どんな講師が有利ですか？",
      answer:
        "資格よりも「分かりやすい解説」「再現性のある教材」が評価されます。過程より結果を重視する設計です。",
    },
    {
      question: "他社プラットフォームとの違いは？",
      answer:
        "airetiaは、単発1問対応・解説教材の資産化・講師実績の可視化を重視しています。オンライン家庭教師と教材販売を統合した構造が特徴です。",
    },
  ],
};

const SECTION_LABELS: { [key: string]: string } = {
  "サービス全般について（オンライン家庭教師・単発質問）": "サービス全般",
  "料金について（オンライン家庭教師の料金体系）": "料金",
  "教材・安全性について（問題解説サービス・教材販売）": "教材・安全性",
  "講師向けFAQ（登録・報酬・差別化）": "講師向け",
};

const ALL_SECTIONS = "__all__";

function normalize(str: string): string {
  return str
    .toLowerCase()
    .replace(/[Ａ-Ｚａ-ｚ０-９]/g, (s) =>
      String.fromCharCode(s.charCodeAt(0) - 0xfee0)
    )
    // U+3000（全角スペース）を半角スペースに変換
    // リテラルで書くと ESLint no-irregular-whitespace エラーになるため \u3000 で指定
    .replace(/\u3000/g, " ");
}

/**
 * 検索ワードのハイライト
 *
 * アクセシビリティ方針（WCAG 1.4.1 / 色への依存禁止）:
 *   色覚多様性の方にも伝わるよう「色」だけに頼らず
 *   「薄い背景色 + 太字 + ブランドカラーの下線」の
 *   3つの視覚的手がかりを組み合わせる。
 *
 *   - background: rgba(237,83,163,0.12) … 薄ピンク（--brand-main の 12%）
 *   - fontWeight: 700                   … 太字
 *   - borderBottom: 2px solid …         … --brand-main-line の下線
 *   - color: var(--brand-structure)     … ネイビー（十分なコントラスト比を確保）
 */
function highlight(text: string, keyword: string): React.ReactNode {
  if (!keyword.trim()) return text;
  const nText = normalize(text);
  const nKey = normalize(keyword);
  const idx = nText.indexOf(nKey);
  if (idx === -1) return text;
  return (
    <>
      {text.slice(0, idx)}
      <mark
        style={{
          background: "rgba(237, 83, 163, 0.12)",
          color: "var(--brand-structure)",
          fontWeight: 700,
          borderBottom: "2px solid var(--brand-main-line)",
          borderRadius: "2px 2px 0 0",
          padding: "0 1px",
        }}
      >
        {text.slice(idx, idx + keyword.length)}
      </mark>
      {text.slice(idx + keyword.length)}
    </>
  );
}

const makeKey = (sectionIdx: number, itemIdx: number) =>
  `${sectionIdx}-${itemIdx}`;

const Faq = () => {
  const [openKey, setOpenKey] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSection, setActiveSection] = useState<string>(ALL_SECTIONS);

  const navRef = useRef<HTMLDivElement>(null);
  const sectionRefs = useRef<{ [key: string]: HTMLElement | null }>({});
  const searchInputRef = useRef<HTMLInputElement>(null);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setActiveSection(ALL_SECTIONS);
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    searchInputRef.current?.focus();
  };

  const handleSectionClick = (section: string) => {
    setActiveSection(section);
    setSearchQuery("");

    if (section === ALL_SECTIONS) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    // sticky ヘッダー + sticky ナビ分のオフセットを引いてスクロール
    setTimeout(() => {
      const el = sectionRefs.current[section];
      if (!el) return;
      const navH = navRef.current?.offsetHeight ?? 0;
      const headerH = 72; // --header-h の最大値
      const top =
        el.getBoundingClientRect().top + window.scrollY - headerH - navH - 16;
      window.scrollTo({ top, behavior: "smooth" });
    }, 50);
  };

  const getFilteredItems = useCallback(
    (sectionTitle: string, items: FaqItem[]) => {
      const matchesSection =
        activeSection === ALL_SECTIONS || activeSection === sectionTitle;
      if (!matchesSection) return [];
      if (!searchQuery.trim()) return items;
      const nQuery = normalize(searchQuery);
      return items.filter(
        (item) =>
          normalize(item.question).includes(nQuery) ||
          normalize(item.answer).includes(nQuery)
      );
    },
    [activeSection, searchQuery]
  );

  const totalVisible = Object.entries(faqData).reduce(
    (acc, [title, items]) => acc + getFilteredItems(title, items).length,
    0
  );

  const toggle = (key: string) =>
    setOpenKey((prev) => (prev === key ? null : key));

  const sections = Object.keys(faqData);

  const tabStyle = (isActive: boolean): React.CSSProperties => ({
    padding: "6px 18px",
    borderRadius: 999,
    border: "2px solid var(--brand-main)",
    background: isActive ? "var(--brand-main)" : "transparent",
    color: isActive ? "#fff" : "var(--brand-structure)",
    fontWeight: isActive ? 700 : 600,
    fontSize: "0.88rem",
    cursor: "pointer",
    transition: "background 0.2s, color 0.2s",
    fontFamily: "inherit",
    lineHeight: 1.5,
  });

  return (
    <main className="container">
      {/* ページタイトル */}
      <div style={{ textAlign: "center", marginBottom: 48 }}>
        <h1 className="page-title">よくあるご質問</h1>
        <p className="text-sub" style={{ fontSize: "1.2rem" }}>FAQ</p>
      </div>

      {/* ===== スティッキーナビゲーション ===== */}
      <div
        ref={navRef}
        style={{
          position: "sticky",
          top: 0,
          zIndex: 100,
          background: "var(--bg-page)",
          paddingTop: 12,
          paddingBottom: 12,
          marginBottom: 32,
          borderBottom: "1px solid rgba(237,83,163,0.2)",
        }}
      >
        {/* 検索バー */}
        <div style={{ position: "relative", maxWidth: 560, margin: "0 auto 14px" }}>
          <span
            aria-hidden
            style={{
              position: "absolute",
              left: 14,
              top: "50%",
              transform: "translateY(-50%)",
              fontSize: "1rem",
              color: "var(--brand-main)",
              pointerEvents: "none",
            }}
          >
            {"\uD83D\uDD0D"}
          </span>
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="キーワードで検索（例：料金、キャンセル）"
            aria-label="FAQ を検索"
            style={{
              width: "100%",
              boxSizing: "border-box",
              padding: "12px 44px 12px 40px",
              border: "2px solid var(--brand-main)",
              borderRadius: 999,
              fontSize: "1rem",
              outline: "none",
              background: "var(--bg-card)",
              color: "var(--text-main)",
              fontFamily: "inherit",
            }}
          />
          {searchQuery && (
            <button
              onClick={handleClearSearch}
              aria-label="検索をクリア"
              style={{
                position: "absolute",
                right: 14,
                top: "50%",
                transform: "translateY(-50%)",
                background: "none",
                border: "none",
                cursor: "pointer",
                fontSize: "1rem",
                color: "var(--brand-structure)",
                lineHeight: 1,
                padding: 0,
                fontFamily: "inherit",
              }}
            >
              {"\u2715"}
            </button>
          )}
        </div>

        {/* セクションタブ */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center" }}>
          <button
            onClick={() => handleSectionClick(ALL_SECTIONS)}
            style={tabStyle(activeSection === ALL_SECTIONS && !searchQuery)}
          >
            すべて
          </button>
          {sections.map((section) => (
            <button
              key={section}
              onClick={() => handleSectionClick(section)}
              style={tabStyle(activeSection === section && !searchQuery)}
            >
              {SECTION_LABELS[section] ?? section}
            </button>
          ))}
        </div>
      </div>

      {/* ===== 検索結果件数 ===== */}
      {searchQuery && (
        <p style={{ textAlign: "center", marginBottom: 24, color: "var(--brand-structure)", fontSize: "0.95rem" }}>
          「<strong>{searchQuery}</strong>」の検索結果：
          <strong style={{ color: "var(--brand-main)", marginLeft: 4 }}>{totalVisible}件</strong>
        </p>
      )}

      {/* ===== FAQ セクション一覧 =====
        * scroll-reveal は使わない。
        * IntersectionObserver はタブ切り替え・検索で再発火しないため
        * opacity:0 のまま固まるバグが起きる。
        ===== */}
      {Object.entries(faqData).map(([sectionTitle, items], sectionIdx) => {
        const filtered = getFilteredItems(sectionTitle, items);
        if (filtered.length === 0) return null;

        return (
          <section
            key={sectionIdx}
            ref={(el) => { sectionRefs.current[sectionTitle] = el; }}
            className="content-card"
            style={{ marginBottom: 40 }}
          >
            <h2 style={{
              color: "var(--brand-structure)",
              fontSize: "1.8rem",
              marginBottom: 25,
              paddingBottom: 15,
              borderBottom: "2px solid var(--brand-main)",
            }}>
              {sectionTitle}
            </h2>

            <div>
              {filtered.map((item) => {
                const originalIdx = items.indexOf(item);
                const key = makeKey(sectionIdx, originalIdx);
                const isOpen = openKey === key;

                return (
                  <div key={key} className={`faq-details${isOpen ? " is-open" : ""}`}>
                    <div
                      className="faq-details__summary"
                      onClick={() => toggle(key)}
                      role="button"
                      aria-expanded={isOpen}
                    >
                      <span style={{ display: "flex", alignItems: "flex-start", gap: 6, flex: 1 }}>
                        <span className="faq-details__q">Q.</span>
                        <span>
                          {searchQuery ? highlight(item.question, searchQuery) : item.question}
                        </span>
                      </span>
                      <span className="faq-details__arrow">▼</span>
                    </div>

                    <div className="faq-details__body">
                      <div className="faq-details__answer">
                        <span className="faq-details__a">A.</span>
                        {searchQuery ? highlight(item.answer, searchQuery) : item.answer}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        );
      })}

      {/* ===== 0件の場合 ===== */}
      {totalVisible === 0 && searchQuery && (
        <div style={{ textAlign: "center", padding: "60px 20px" }}>
          <p style={{ fontSize: "2rem", marginBottom: 12 }}>{"\uD83D\uDD0D"}</p>
          <p style={{ fontSize: "1.1rem", marginBottom: 8, color: "var(--brand-structure)" }}>
            「{searchQuery}」に一致する質問が見つかりませんでした。
          </p>
          <p style={{ fontSize: "0.95rem", color: "var(--text-sub)" }}>
            別のキーワードで試すか、
            <button
              onClick={handleClearSearch}
              style={{
                background: "none",
                border: "none",
                color: "var(--brand-main-line)",
                cursor: "pointer",
                textDecoration: "underline",
                fontSize: "inherit",
                padding: 0,
                fontFamily: "inherit",
              }}
            >
              すべての質問を表示
            </button>
            してください。
          </p>
        </div>
      )}

      {/* ===== お問い合わせ誘導 ===== */}
      {totalVisible > 0 && (
        <section style={{ textAlign: "center", padding: "40px 0 60px" }}>
          <p className="text-sub" style={{ marginBottom: 20 }}>
            上記で解決しない場合はお問い合わせください。
          </p>
          <Link to="/contact" className="btn-main">
            お問い合わせフォームへ
          </Link>
        </section>
      )}
    </main>
  );
};

export default Faq;