// src/pages/TermsOfService.tsx
import { useScrollReveal } from "../hooks/useScrollReveal";

const TermsOfService = () => {
  useScrollReveal();

  return (
    <main className="container">
      {/* ページタイトル：固定 */}
      <div style={{ textAlign: "center", marginBottom: 60 }}>
        <h1 className="page-title">利用規約</h1>
        <p className="text-sub" style={{ fontSize: "1.2rem" }}>Terms of Service</p>
      </div>

      {/* 各条項 */}
      {[
        {
          title: "第1条（適用）",
          content: (
            <ol className="text-sub" style={{ lineHeight: 2, paddingLeft: 25 }}>
              <li style={{ marginBottom: 10 }}>
                本規約は、ユーザーと当社との間の本サービスの利用に関わる一切の関係に適用されるものとします。
              </li>
              <li style={{ marginBottom: 10 }}>
                当社は本サービスに関し、本規約のほか、ご利用にあたってのルール等、各種の定め（以下「個別規定」といいます。）をすることがあります。これら個別規定はその名称のいかんに関わらず、本規約の一部を構成するものとします。
              </li>
              <li>
                本規約の規定が前条の個別規定の規定と矛盾する場合には、個別規定において特段の定めなき限り、個別規定の規定が優先されるものとします。
              </li>
            </ol>
          ),
        },
        {
          title: "第2条（利用登録）",
          content: (
            <ol className="text-sub" style={{ lineHeight: 2, paddingLeft: 25 }}>
              <li style={{ marginBottom: 10 }}>
                本サービスにおいては、登録希望者が本規約に同意の上、当社の定める方法によって利用登録を申請し、当社がこれを承認することによって、利用登録が完了するものとします。
              </li>
              <li style={{ marginBottom: 10 }}>
                当社は、利用登録の申請者に以下の事由があると判断した場合、利用登録の申請を承認しないことがあり、その理由については一切の開示義務を負わないものとします。
                <ul style={{ marginTop: 10, paddingLeft: 20 }}>
                  <li>利用登録の申請に際して虚偽の事項を届け出た場合</li>
                  <li>本規約に違反したことがある者からの申請である場合</li>
                  <li>その他、当社が利用登録を相当でないと判断した場合</li>
                </ul>
              </li>
            </ol>
          ),
        },
      ].map((section, index) => (
        <section key={index} className="content-card scroll-reveal" style={{ marginBottom: 40 }}>
          <h2 style={{ color: "var(--brand-structure)", fontSize: "1.6rem", marginBottom: 25, paddingBottom: 15, borderBottom: "2px solid var(--brand-main)" }}>
            {section.title}
          </h2>
          {section.content}
        </section>
      ))}

      {/* 制定日 ← CTA削除・制定日のみ残す */}
      <div className="scroll-reveal" style={{ textAlign: "right", marginBottom: 60 }}>
        <p className="text-sub">制定日：2020年4月1日</p>
        <p className="text-sub">最終改定日：2024年12月1日</p>
      </div>
    </main>
  );
};

export default TermsOfService;