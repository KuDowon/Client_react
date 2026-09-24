import React from "react";
import Icon from "./Icon";

export default function IconButton({ icon, label, variant = "ghost", className = "", ...props }) {
  return (
    <button
      type="button"
      className={[`ui-icon-button`, variant === "outline" ? "ui-icon-button--outline" : "", className].filter(Boolean).join(" ")}
      aria-label={label}
      {...props}
    >
      <Icon name={icon} />
    </button>
  );
}
