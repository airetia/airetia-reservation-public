// src/hooks/useScrollReveal.ts
import { useEffect } from "react";

/**
 * .scroll-reveal クラスを持つ要素が画面内に入ったとき
 * .is-visible を付与してフェードインアップさせる
 *
 * 使い方:
 *   import { useScrollReveal } from "../hooks/useScrollReveal";
 *   const MyPage = () => {
 *     useScrollReveal();
 *     return (
 *       <>
 *         <h1 className="page-title">タイトル（固定・アニメなし）</h1>
 *         <div className="scroll-reveal">コンテンツ</div>
 *       </>
 *     );
 *   };
 */
export const useScrollReveal = () => {
  useEffect(() => {
    const targets = document.querySelectorAll<HTMLElement>(".scroll-reveal");
    if (!targets.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target); // 一度だけ発火
          }
        });
      },
      {
        threshold: 0.12,
        rootMargin: "0px 0px -40px 0px",
      }
    );

    targets.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);
};