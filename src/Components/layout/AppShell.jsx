import React from "react";

export default function AppShell({ children, className = "" }) {
  return (
    <div className={["app-shell", className].filter(Boolean).join(" ")}>
      <main className="app-shell__main">{children}</main>
    </div>
  );
}
