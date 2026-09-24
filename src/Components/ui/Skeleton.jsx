import React from "react";

export default function Skeleton({ width="100%", height=16, radius=8, className="" }) {
  return <span className={["ui-skeleton",className].filter(Boolean).join(" ")} style={{width,height,borderRadius:radius}} aria-hidden="true"/>;
}
