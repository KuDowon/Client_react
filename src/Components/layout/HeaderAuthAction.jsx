import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Button from "../ui/Button";

const getLoggedIn = () => Boolean(localStorage.getItem("accessToken"));

const clearAuthStorage = () => {
  [
    "access_token",
    "accessToken",
    "refreshToken",
    "userID",
    "username",
    "borrowCount",
    "reserveCount",
    "overdueCount"
  ].forEach((key) => localStorage.removeItem(key));
};

export default function HeaderAuthAction({ className = "" }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [loggedIn, setLoggedIn] = useState(getLoggedIn);

  useEffect(() => {
    const sync = () => setLoggedIn(getLoggedIn());
    window.addEventListener("storage", sync);
    window.addEventListener("mungo-auth-change", sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("mungo-auth-change", sync);
    };
  }, []);

  const handleClick = () => {
    if (!loggedIn) {
      navigate("/LoginPage", {
        state: { returnTo: location.pathname + location.search }
      });
      return;
    }

    clearAuthStorage();
    setLoggedIn(false);
    window.dispatchEvent(new Event("mungo-auth-change"));
    navigate("/", { replace: true });
  };

  return (
    <div className={["app-header__account", className].filter(Boolean).join(" ")}>
      <Button variant="tertiary" size="sm" onClick={handleClick}>
        {loggedIn ? "로그아웃" : "로그인"}
      </Button>
    </div>
  );
}
