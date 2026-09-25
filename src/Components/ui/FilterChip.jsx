import React from "react";

export default function FilterChip({ selected = false, children, className = "", ...props }) {
  return (
    <button
      type="button"
      className={["ui-filter-chip", selected ? "ui-filter-chip--selected" : "", className].filter(Boolean).join(" ")}
      aria-pressed={selected}
      {...props}
    >
      {children}
    </button>
  );
}
