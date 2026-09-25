import React from "react";
import Icon from "./Icon";

export default function IconButton({
  icon,
  label,
  variant = "ghost",
  selected = null,
  className = "",
  ...props
}) {
  return (
    <button
      type="button"
      className={[
        "ui-icon-button",
        variant === "outline" ? "ui-icon-button--outline" : "",
        selected === true ? "ui-icon-button--selected" : "",
        className
      ].filter(Boolean).join(" ")}
      aria-label={label}
      aria-pressed={selected === null ? undefined : Boolean(selected)}
      {...props}
    >
      <Icon name={icon} />
    </button>
  );
}
