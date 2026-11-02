// src/pages/Privacy.tsx
import { useScrollReveal } from "../hooks/useScrollReveal";

const Privacy = () => {
  useScrollReveal();

  return (
    <main className="container">
      {/* ページタイトル：固定 */}
      <div style={{ textAlign: "center", marginBottom: 60 }}>
        <h1 className="page-title">プライバシーポリシー</h1>
        <p className="text-sub" style={{ fontSize: "1.1rem" }}>個人情報保護方針</p>
      </div>

      {/* 前文 */}
      <section className="content-card scroll-reveal" style={{ marginBottom: 40 }}>
        <p className="text-sub" style={{ lineHeight: 2 }}>
          株式会社airetia（以下「当社」）は、お客様の個人情報保護の重要性について認識し、
          個人情報の保護に関する法律（以下「個人情報保護法」）を遵守すると共に、以下のプライバシーポリシー（以下「本ポリシー」）に従い、
          適切な取扱い及び保護に努めます。
        </p>
      </section>

      {/* 各条項 */}
      {[
        {
          title: "第1条（個人情報の定義）",
          content: "「個人情報」とは、個人情報保護法にいう「個人情報」を指すものとし、生存する個人に関する情報であって、当該情報に含まれる氏名、生年月日、住所、電話番号、メールアドレス、その他の記述等により特定の個人を識別できる情報及び容貌、指紋、声紋にかかるデータ、健康保険証の保険者番号などの当該情報単体から特定の個人を識別できる情報（個人識別情報）を指します。",
        },
        {
          title: "第2条（個人情報の収集方法）",
          content: "当社は、お客様が利用登録をする際に氏名、メールアドレス、電話番号、住所などの個人情報をお尋ねすることがあります。また、お客様と提携先などとの間でなされた取引記録や決済に関する情報を、当社の提携先（情報提供元、広告主、広告配信先などを含みます。以下「提携先」といいます。）などから収集することがあります。",
        },
        {
          title: "第3条（個人情報を収集・利用する目的）",
          content: [
            "当社が個人情報を収集・利用する目的は、以下のとおりです。",
            [
              "当社サービスの提供・運営のため",
              "お客様からのお問い合わせに回答するため（本人確認を行うことを含む）",
              "お客様が利用中のサービスの新機能、更新情報、キャンペーン等及び当社が提供する他のサービスの案内のメールを送付するため",
              "メンテナンス、重要なお知らせなど必要に応じたご連絡のため",
              "利用規約に違反したお客様や、不正・不当な目的でサービスを利用しようとするお客様の特定をし、ご利用をお断りするため",
              "お客様にご自身の登録情報の閲覧や変更、削除、ご利用状況の閲覧を行っていただくため",
              "サービスの改善及び新サービスの開発のため",
              "上記の利用目的に付随する目的",
            ],
          ],
        },
      ].map((item, i) => (
        <section key={i} className="content-card scroll-reveal" style={{ marginBottom: 40 }}>
          <h2 style={{ color: "var(--brand-structure)", fontSize: "1.6rem", marginBottom: 25, paddingBottom: 15, borderBottom: "2px solid var(--brand-main)" }}>
            {item.title}
          </h2>
          {Array.isArray(item.content) ? (
            <>
              <p className="text-sub" style={{ lineHeight: 2, marginBottom: 15 }}>{item.content[0]}</p>
              <ol className="text-sub" style={{ lineHeight: 2, paddingLeft: 25 }}>
                {(item.content[1] as string[]).map((li, j) => (
                  <li key={j} style={{ marginBottom: 10 }}>{li}</li>
                ))}
              </ol>
            </>
          ) : (
            <p className="text-sub" style={{ lineHeight: 2 }}>{item.content as string}</p>
          )}
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

export default Privacy;