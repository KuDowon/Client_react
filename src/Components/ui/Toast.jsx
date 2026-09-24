import React from "react";
import Icon from "./Icon";

const iconForTone = { success: "check", warning: "alert", danger: "alert", info: "info" };

export default function Toast({ tone = "info", children, role = "status", className = "" }) {
  return (
    <div className={[`ui-toast ui-toast--${tone}`, className].filter(Boolean).join(" ")} role={role}>
      <Icon name={iconForTone[tone] || "info"} />
      <div>{children}</div>
    </div>
  );
}
