// src/pages/Contact.tsx
import { useState } from "react";
import { Link } from "react-router-dom";
import { useScrollReveal } from "../hooks/useScrollReveal";

const Contact = () => {
  useScrollReveal();

  const [form, setForm] = useState({ name: "", email: "", category: "", content: "" });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("送信内容:", form);
  };

  return (
    <main className="container">
      {/* ページタイトル：固定 */}
      <div style={{ textAlign: "center", marginBottom: 50 }}>
        <h1 className="page-title">お問い合わせ</h1>
      </div>

      {/* FAQ 再確認 + 返信目安 */}
      <div className="info-box scroll-reveal" style={{ maxWidth: 800, margin: "0 auto 30px", textAlign: "center", padding: "28px 32px" }}>
        <p style={{ color: "var(--brand-structure)", fontWeight: 700, fontSize: "1.05rem", marginBottom: 10 }}>
          ご返信は７営業日以内を目安としております
        </p>
        <p className="text-sub" style={{ fontSize: "0.95rem", marginBottom: 20 }}>
          お急ぎの場合は、よくある質問で解決できる場合があります。
          <br />
          送信前にもう一度ご確認ください。
        </p>
        <Link to="/faq" className="btn-main">
          よくある質問を確認する
        </Link>
      </div>

      {/* お問い合わせフォーム */}
      <div className="content-card scroll-reveal" style={{ maxWidth: 800, margin: "0 auto" }}>
        <h2 className="section-title" style={{ fontSize: "1.8rem" }}>お問い合わせフォーム</h2>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">
              お名前 <span className="form-required">*</span>
            </label>
            <input type="text" name="name" value={form.name} onChange={handleChange} className="form-control" required placeholder="山田 太郎" />
          </div>

          <div className="form-group">
            <label className="form-label">
              メールアドレス <span className="form-required">*</span>
            </label>
            <input type="email" name="email" value={form.email} onChange={handleChange} className="form-control" required placeholder="example@example.com" />
          </div>

          <div className="form-group">
            <label className="form-label">お問い合わせ種別</label>
            <select name="category" value={form.category} onChange={handleChange} className="form-control">
              <option value="">選択してください</option>
              <option value="サービスについて">サービスについて</option>
              <option value="料金について">料金について</option>
              <option value="技術的な質問">技術的な質問</option>
              <option value="採用について">採用について</option>
              <option value="その他">その他</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">
              お問い合わせ内容 <span className="form-required">*</span>
            </label>
            <textarea name="content" value={form.content} onChange={handleChange} className="form-control" style={{ height: 150, resize: "vertical" }} required placeholder="ご質問やご相談内容を詳しくご記入ください（10文字以上）" />
          </div>

          <div style={{ textAlign: "center", marginTop: 10 }}>
            <button type="submit" className="btn-main">
              入力内容を確認する
            </button>
          </div>
        </form>

        <p style={{ textAlign: "center", marginTop: 30, color: "var(--text-sub)", fontSize: "0.9rem" }}>
          <Link to="/privacy">プライバシーポリシー</Link>
          に基づき、お預かりした情報は適切に管理いたします。
        </p>
      </div>
    </main>
  );
};

export default Contact;