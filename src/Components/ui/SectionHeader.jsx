import React from "react";

export default function SectionHeader({ title, action, className = "" }) {
  return (
    <div className={["ui-section-header", className].filter(Boolean).join(" ")}>
      <h2 className="ui-section-header__title">{title}</h2>
      {action || null}
    </div>
  );
}
