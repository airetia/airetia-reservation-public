// src/components/Button.tsx
// ← import "../styles/common.css" を削除（main.tsx で読み込み済み・二重適用を防ぐ）
import React from "react";

interface ButtonProps {
  text: string;
  onClick?: () => void;
  outline?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ text, onClick, outline }) => {
  return (
    <button
      className={outline ? "btn-main outline" : "btn-main"}
      onClick={onClick}
    >
      {text}
    </button>
  );
};