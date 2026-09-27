import React, { useId, useRef } from "react";

export default function Tabs({
  tabs,
  value,
  onChange,
  ariaLabel,
  className = "",
  idPrefix
}) {
  const generatedId = useId().replace(/:/g, "");
  const prefix = idPrefix || `tabs-${generatedId}`;
  const refs = useRef([]);

  const moveFocus = (index) => {
    const safeIndex = (index + tabs.length) % tabs.length;
    const next = tabs[safeIndex];
    onChange(next.value);
    window.setTimeout(() => refs.current[safeIndex]?.focus(), 0);
  };

  return (
    <div className={className} role="tablist" aria-label={ariaLabel}>
      {tabs.map((tab, index) => {
        const selected = tab.value === value;
        return (
          <button
            key={tab.value}
            ref={(node) => { refs.current[index] = node; }}
            type="button"
            role="tab"
            id={`${prefix}-tab-${tab.value}`}
            aria-selected={selected}
            aria-controls={`${prefix}-panel-${tab.value}`}
            tabIndex={selected ? 0 : -1}
            className={selected ? "active" : ""}
            onClick={() => onChange(tab.value)}
            onKeyDown={(event) => {
              if (event.key === "ArrowRight") {
                event.preventDefault();
                moveFocus(index + 1);
              } else if (event.key === "ArrowLeft") {
                event.preventDefault();
                moveFocus(index - 1);
              } else if (event.key === "Home") {
                event.preventDefault();
                moveFocus(0);
              } else if (event.key === "End") {
                event.preventDefault();
                moveFocus(tabs.length - 1);
              }
            }}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}

export function TabPanel({ tabValue, activeValue, idPrefix, children, className = "" }) {
  const selected = tabValue === activeValue;
  if (!selected) return null;

  return (
    <div
      className={className}
      role="tabpanel"
      id={`${idPrefix}-panel-${tabValue}`}
      aria-labelledby={`${idPrefix}-tab-${tabValue}`}
      tabIndex={0}
    >
      {children}
    </div>
  );
}
