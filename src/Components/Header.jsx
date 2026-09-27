import React from "react";
import AppHeader from "./layout/AppHeader";

/**
 * Legacy-compatible header wrapper.
 * Existing pages can keep using <Header title backHref right /> while the
 * presentation is provided by the 0.2.0 AppHeader component.
 */
export default function Header({ title = "마이페이지", backHref, right, className = "" }) {
  return <AppHeader title={title} backTo={backHref} right={right} className={className} />;
}
