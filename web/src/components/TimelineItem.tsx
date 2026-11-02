// src/components/TimelineItem.tsx
import React from "react";

interface TimelineItemProps {
  date: string;
  description: string;
  isLast?: boolean;
}

const TimelineItem: React.FC<TimelineItemProps> = ({ date, description, isLast }) => (
  <div
    style={{
      padding: "20px",
      borderLeft: "3px solid var(--brand-main-line)", // ← 修正: --accent-color は存在しない
      marginBottom: isLast ? 0 : "30px",
    }}
  >
    <p style={{ fontWeight: "bold", color: "var(--brand-main-line)", marginBottom: "10px" }}>
      {date}
    </p>
    <p style={{ color: "var(--text-sub)" }}>{description}</p>
  </div>
);

export default TimelineItem;