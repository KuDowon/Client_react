import React from "react";

export default function PageContainer({ children, className = "", as: Component = "div" }) {
  return <Component className={["layout-page", className].filter(Boolean).join(" ")}>{children}</Component>;
}
