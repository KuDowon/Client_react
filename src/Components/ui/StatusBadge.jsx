import React from "react";

export default function StatusBadge({ tone = "neutral", children, className = "" }) {
  return (
    <span className={[`ui-status ui-status--${tone}`, className].filter(Boolean).join(" ")}>
      {children}
    </span>
  );
}
