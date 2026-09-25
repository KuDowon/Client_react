import React, { useEffect, useId, useRef } from "react";
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
  hideCancel = false,
  confirmLoading = false,
  confirmDisabled = false
}) {
  const titleId = useId();
  const dialogRef = useRef(null);
  const cancelRef = useRef(null);
  const confirmRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;

    const previousActive = document.activeElement;
    const focusTimer = window.setTimeout(() => {
      (hideCancel ? confirmRef.current : cancelRef.current)?.focus();
    }, 0);

    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        if (!confirmLoading) onClose?.();
        return;
      }

      if (event.key !== "Tab" || !dialogRef.current) return;

      const focusable = Array.from(
        dialogRef.current.querySelectorAll(
          'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        )
      );

      if (!focusable.length) {
        event.preventDefault();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);

    return () => {
      window.clearTimeout(focusTimer);
      document.removeEventListener("keydown", onKeyDown);
      if (previousActive && typeof previousActive.focus === "function") {
        previousActive.focus();
      }
    };
  }, [open, hideCancel, onClose, confirmLoading]);

  if (!open) return null;

  return (
    <div
      className="ui-dialog-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !confirmLoading) onClose?.();
      }}
    >
      <section
        ref={dialogRef}
        className="ui-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <div>
          <h2 id={titleId} className="ui-dialog__title">{title}</h2>
          {children ? <div className="ui-dialog__body">{children}</div> : null}
        </div>
        <div className="ui-dialog__actions">
          {!hideCancel ? (
            <Button ref={cancelRef} variant="secondary" onClick={onClose} disabled={confirmLoading}>
              {cancelLabel}
            </Button>
          ) : null}
          <Button
            ref={confirmRef}
            variant={destructive ? "danger" : "primary"}
            onClick={onConfirm || onClose}
            loading={confirmLoading}
            disabled={confirmDisabled}
          >
            {confirmLabel}
          </Button>
        </div>
      </section>
    </div>
  );
}
