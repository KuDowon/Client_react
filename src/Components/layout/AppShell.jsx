import React from "react";
import { useNavigationMode } from "./navigationMode";

export default function AppShell({ children, className = "" }) {
  const navigationMode = useNavigationMode();

  return (
    <div className={["app-shell", `app-shell--${navigationMode}-mode`, className].filter(Boolean).join(" ")}>
      <main className="app-shell__main">{children}</main>
    </div>
  );
}
