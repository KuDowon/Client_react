import React from "react";
import { Link, useNavigate } from "react-router-dom";
import Icon from "../ui/Icon";
import IconButton from "../ui/IconButton";

export default function AppHeader({
  title = "문중문고",
  backTo,
  onBack,
  right,
  main = false,
  className = ""
}) {
  const navigate = useNavigate();

  const backControl = main ? null : backTo ? (
    <Link to={backTo} className="ui-icon-button" aria-label="뒤로가기">
      <Icon name="arrow-left" />
    </Link>
  ) : (
    <IconButton icon="arrow-left" label="뒤로가기" onClick={onBack || (() => navigate(-1))} />
  );

  return (
    <header className={["app-header", main ? "app-header--main" : "", className].filter(Boolean).join(" ")}>
      <div className="app-header__inner">
        {backControl}
        <div className="app-header__title">{title}</div>
        <div className="app-header__right">{right || null}</div>
      </div>
    </header>
  );
}
