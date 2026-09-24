import React, { useEffect, useRef } from "react";
import Button from "./Button";

export default function Dialog({
  open,
  title,
  children,
  confirmLabel = "확인",
  cancelLabel = "취소",
  onConfirm,
  onClose,
  destructive = false,
  hideCancel = false
}) {
  const cancelRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const onKeyDown = (event) => {
      if (event.key === "Escape") onClose?.();
    };
    document.addEventListener("keydown", onKeyDown);
    window.setTimeout(() => cancelRef.current?.focus(), 0);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="ui-dialog-backdrop" onMouseDown={(event) => {
      if (event.target === event.currentTarget) onClose?.();
    }}>
      <section className="ui-dialog" role="dialog" aria-modal="true" aria-labelledby="ui-dialog-title">
        <div>
          <h2 id="ui-dialog-title" className="ui-dialog__title">{title}</h2>
          {children ? <div className="ui-dialog__body">{children}</div> : null}
        </div>
        <div className="ui-dialog__actions">
          {!hideCancel ? (
            <Button ref={cancelRef} variant="secondary" onClick={onClose}>{cancelLabel}</Button>
          ) : null}
          <Button variant={destructive ? "danger" : "primary"} onClick={onConfirm || onClose}>
            {confirmLabel}
          </Button>
        </div>
      </section>
    </div>
  );
}
