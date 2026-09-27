import React, { useId } from "react";

export default function TextField({
  label,
  helperText,
  error,
  id,
  className = "",
  ...inputProps
}) {
  const generatedId = useId();
  const inputId = id || generatedId;
  const message = typeof error === "string" ? error : helperText;
  const messageId = message ? `${inputId}-message` : undefined;

  return (
    <div className={["ui-field", error ? "ui-field--error" : "", className].filter(Boolean).join(" ")}>
      {label ? <label className="ui-field__label" htmlFor={inputId}>{label}</label> : null}
      <input
        id={inputId}
        className="ui-field__control"
        aria-invalid={Boolean(error) || undefined}
        aria-describedby={messageId}
        {...inputProps}
      />
      {message ? <p id={messageId} className="ui-field__message">{message}</p> : null}
    </div>
  );
}
