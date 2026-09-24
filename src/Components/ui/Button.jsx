import React from "react";

export default function Button({
  variant = "primary",
  size = "md",
  block = false,
  loading = false,
  className = "",
  children,
  disabled,
  type = "button",
  ...props
}) {
  const classes = [
    "ui-button",
    `ui-button--${variant}`,
    `ui-button--${size}`,
    block ? "ui-button--block" : "",
    className
  ].filter(Boolean).join(" ");

  return (
    <button
      type={type}
      className={classes}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading ? "처리 중…" : children}
    </button>
  );
}
