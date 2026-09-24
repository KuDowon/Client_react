import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const STORAGE_KEY = "mungoNavigationMode";
export const WIDE_NAV_BREAKPOINT = 960;

export function getPrimaryNavActive(pathname, state, key) {
  if (pathname.startsWith("/Current")) {
    if (state?.from === "/") return key === "home";
    return key === "my";
  }

  if (key === "home") return pathname === "/";
  if (key === "loan") return pathname.startsWith("/Loan");
  return pathname.startsWith("/My") || pathname.startsWith("/EditProfile");
}

export function useNavigationMode() {
  const { search } = useLocation();
  const param = new URLSearchParams(search).get("navMode");
  const validParam = param === "top" || param === "bottom" ? param : null;

  let stored = "bottom";
  if (typeof window !== "undefined") {
    const saved = window.sessionStorage.getItem(STORAGE_KEY);
    if (saved === "top" || saved === "bottom") stored = saved;
  }

  const mode = validParam || stored;

  useEffect(() => {
    if (validParam && typeof window !== "undefined") {
      window.sessionStorage.setItem(STORAGE_KEY, validParam);
    }
  }, [validParam]);

  return mode;
}
