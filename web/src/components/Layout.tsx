// src/components/Layout.tsx
import { useEffect } from "react";
import type { ReactNode } from "react";
import Header from "./Header";
import Footer from "./Footer";

type LayoutProps = {
  children: ReactNode;
  title?: string;
};

const Layout = ({ children, title }: LayoutProps) => {
  useEffect(() => {
    document.title = title ? `${title} | airetia` : "airetia";
    // ← .fullscreen-image-wrapper 参照を削除（該当要素が存在しないため）
  }, [title]);

  return (
    <>
      <Header />
      <main>{children}</main>
      <Footer />
    </>
  );
};

export default Layout;