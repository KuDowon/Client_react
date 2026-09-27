import React, { forwardRef } from "react";

const Button = forwardRef(function Button({
  variant = "primary",
  size = "md",
  block = false,
  loading = false,
  className = "",
  children,
  disabled,
  type = "button",
  ...props
}, ref) {
  const classes = [
    "ui-button",
    `ui-button--${variant}`,
    `ui-button--${size}`,
    block ? "ui-button--block" : "",
    className
  ].filter(Boolean).join(" ");

  return (
    <button
      ref={ref}
      type={type}
      className={classes}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading ? "처리 중…" : children}
    </button>
  );
});

export default Button;
