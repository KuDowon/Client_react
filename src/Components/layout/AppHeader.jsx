import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Icon from "../ui/Icon";
import IconButton from "../ui/IconButton";

function navActive(pathname, key) {
  if (key === "home") return pathname === "/";
  if (key === "loan") return pathname.startsWith("/Loan");
  return pathname.startsWith("/My") || pathname.startsWith("/Current") || pathname.startsWith("/EditProfile");
}

export default function AppHeader({
  title = "문중문고",
  backTo,
  onBack,
  right,
  main = false,
  showNavigation = true,
  className = ""
}) {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const backControl = main ? null : backTo ? (
    <Link to={backTo} className="ui-icon-button" aria-label="뒤로가기">
      <Icon name="arrow-left" />
    </Link>
  ) : (
    <IconButton icon="arrow-left" label="뒤로가기" onClick={onBack || (() => navigate(-1))} />
  );

  const goToLoan = () => {
    navigate(localStorage.getItem("accessToken") ? "/LoanChoice" : "/LoginPage");
  };

  return (
    <header className={["app-header", main ? "app-header--main" : "", className].filter(Boolean).join(" ")}>
      <div className="app-header__inner">
        {backControl}
        <div className="app-header__title">{title}</div>
        {showNavigation ? <nav className="app-header__desktop-nav" aria-label="주요 메뉴">
          <Link to="/" aria-current={navActive(pathname, "home") ? "page" : undefined}>홈</Link>
          <button type="button" onClick={goToLoan} aria-current={navActive(pathname, "loan") ? "page" : undefined}>대출·반납</button>
          <Link to="/MyPage" aria-current={navActive(pathname, "my") ? "page" : undefined}>마이</Link>
        </nav> : null}
        <div className="app-header__right">{right || null}</div>
      </div>
    </header>
  );
}
