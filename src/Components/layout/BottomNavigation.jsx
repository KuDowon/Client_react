import React from "react";
import { Link, useLocation } from "react-router-dom";
import Icon from "../ui/Icon";
import { getPrimaryNavActive, useNavigationMode } from "./navigationMode";

export default function BottomNavigation({ onLoanReturn }) {
  const { pathname, state } = useLocation();
  const navigationMode = useNavigationMode();

  const itemProps = (key) => ({
    className: "app-bottom-nav__item",
    "aria-current": getPrimaryNavActive(pathname, state, key) ? "page" : undefined
  });

  return (
    <nav className={`app-bottom-nav app-bottom-nav--${navigationMode}-mode`} aria-label="주요 메뉴">
      <div className="app-bottom-nav__inner">
        <Link to="/" {...itemProps("home")}>
          <Icon name="home" size={24} />
          <span>홈</span>
        </Link>
        <button type="button" onClick={onLoanReturn} {...itemProps("loan")}>
          <Icon name="loan-return" size={24} />
          <span>대출·반납</span>
        </button>
        <Link to="/MyPage" {...itemProps("my")}>
          <Icon name="user" size={24} />
          <span>마이</span>
        </Link>
      </div>
    </nav>
  );
}
