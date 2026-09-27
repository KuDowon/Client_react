import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Dialog from "../ui/Dialog";
import { getPrimaryNavActive } from "./navigationMode";

export default function TopNavigation() {
  const { pathname, search, state } = useLocation();
  const navigate = useNavigate();
  const [loginPrompt, setLoginPrompt] = useState(null);

  const itemProps = (key) => ({
    className: "app-top-nav__item",
    "aria-current": getPrimaryNavActive(pathname, state, key) ? "page" : undefined
  });

  const openProtectedRoute = (target, service) => {
    if (localStorage.getItem("accessToken")) {
      navigate(target);
      return;
    }

    setLoginPrompt({ target, service });
  };

  const handleLoanReturn = () => {
    openProtectedRoute("/LoanChoice", "대출·반납");
  };

  const handleMy = () => {
    openProtectedRoute("/MyPage", "마이");
  };

  const handleLoginNavigate = () => {
    if (!loginPrompt) return;

    const target = loginPrompt.target;
    setLoginPrompt(null);
    navigate("/LoginPage", {
      state: {
        returnTo: target,
        from: pathname + search
      }
    });
  };

  return (
    <>
      <nav className="app-top-nav" aria-label="주요 메뉴">
        <Link to="/" {...itemProps("home")}>홈</Link>
        <button type="button" onClick={handleLoanReturn} {...itemProps("loan")}>대출·반납</button>
        <button type="button" onClick={handleMy} {...itemProps("my")}>마이</button>
      </nav>

      <Dialog
        open={Boolean(loginPrompt)}
        title="로그인이 필요한 서비스예요"
        confirmLabel="로그인"
        cancelLabel="닫기"
        onClose={() => setLoginPrompt(null)}
        onConfirm={handleLoginNavigate}
      >
        {loginPrompt?.service}를 이용하려면 먼저 로그인해주세요.
      </Dialog>
    </>
  );
}
