import React from "react";
import Icon from "./Icon";

const iconForTone = { success: "check", warning: "alert", danger: "alert", info: "info" };

export default function Toast({
  tone = "info",
  children,
  role = "status",
  actionLabel,
  onAction,
  onClose,
  closeLabel = "알림 닫기",
  className = ""
}) {
  return (
    <div className={[`ui-toast ui-toast--${tone}`, className].filter(Boolean).join(" ")} role={role}>
      <Icon name={iconForTone[tone] || "info"} />
      <div className="ui-toast__message">{children}</div>
      {(actionLabel || onClose) ? (
        <div className="ui-toast__actions">
          {actionLabel && onAction ? (
            <button type="button" className="ui-toast__action" onClick={onAction}>
              {actionLabel}
            </button>
          ) : null}
          {onClose ? (
            <button type="button" className="ui-toast__close" aria-label={closeLabel} onClick={onClose}>
              <Icon name="close" size={18} />
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
