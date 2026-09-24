import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { getPrimaryNavActive } from "./navigationMode";

export default function TopNavigation() {
  const { pathname, state } = useLocation();
  const navigate = useNavigate();

  const itemProps = (key) => ({
    className: "app-top-nav__item",
    "aria-current": getPrimaryNavActive(pathname, state, key) ? "page" : undefined
  });

  const handleLoanReturn = () => {
    navigate(localStorage.getItem("accessToken") ? "/LoanChoice" : "/LoginPage");
  };

  return (
    <nav className="app-top-nav" aria-label="주요 메뉴">
      <div className="app-top-nav__inner">
        <div className="app-top-nav__menu">
          <Link to="/" {...itemProps("home")}>홈</Link>
          <button type="button" onClick={handleLoanReturn} {...itemProps("loan")}>대출·반납</button>
          <Link to="/MyPage" {...itemProps("my")}>마이</Link>
        </div>
      </div>
    </nav>
  );
}
