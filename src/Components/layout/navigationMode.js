import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";

export const WIDE_NAV_BREAKPOINT = 960;

export function getPrimaryNavActive(pathname, state, key) {
  if (pathname.startsWith("/Current")) {
    if (state?.from === "/") return key === "home";
    return key === "my";
  }

  if (key === "home") return pathname === "/";
  if (key === "loan") return pathname.startsWith("/Loan");
  return pathname.startsWith("/My") || pathname.startsWith("/EditProfile") || pathname.startsWith("/Interest");
}

const getResponsiveMode = () => {
  if (typeof window === "undefined") return "bottom";
  return window.matchMedia(`(min-width: ${WIDE_NAV_BREAKPOINT}px)`).matches ? "top" : "bottom";
};

export function useNavigationMode() {
  const { search } = useLocation();
  const param = useMemo(() => new URLSearchParams(search).get("navMode"), [search]);
  const validParam = param === "top" || param === "bottom" ? param : null;
  const [responsiveMode, setResponsiveMode] = useState(getResponsiveMode);

  useEffect(() => {
    if (typeof window === "undefined") return undefined;
    const media = window.matchMedia(`(min-width: ${WIDE_NAV_BREAKPOINT}px)`);
    const handleChange = () => setResponsiveMode(media.matches ? "top" : "bottom");
    handleChange();
    media.addEventListener?.("change", handleChange);
    return () => media.removeEventListener?.("change", handleChange);
  }, []);

  return validParam || responsiveMode;
}
