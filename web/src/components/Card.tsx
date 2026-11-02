// src/components/Card.tsx
// ← import "../styles/common.css" を削除（main.tsx で読み込み済み・二重適用を防ぐ）
import React from "react";

interface CardProps {
  children: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({ children }) => {
  return <div className="content-card">{children}</div>;
};