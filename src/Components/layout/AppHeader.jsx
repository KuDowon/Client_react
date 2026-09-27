import React from "react";
import { Link, useNavigate } from "react-router-dom";
import Icon from "../ui/Icon";
import IconButton from "../ui/IconButton";
import HeaderAuthAction from "./HeaderAuthAction";
import TopNavigation from "./TopNavigation";
import { useNavigationMode } from "./navigationMode";

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
  const navigationMode = useNavigationMode();
  const desktopMode = navigationMode === "top";

  const backControl = main ? null : backTo ? (
    <Link to={backTo} className="ui-icon-button" aria-label="뒤로가기">
      <Icon name="arrow-left" />
    </Link>
  ) : (
    <IconButton icon="arrow-left" label="뒤로가기" onClick={onBack || (() => navigate(-1))} />
  );

  return (
    <header
      className={[
        "app-header",
        main ? "app-header--main" : "",
        desktopMode ? "app-header--top-mode" : "app-header--bottom-mode",
        className
      ].filter(Boolean).join(" ")}
    >
      <div className="app-header__inner">
        <div className="app-header__leading">
          {backControl}
          <div className="app-header__title">{title}</div>
        </div>

        {desktopMode ? (
          <div className="app-header__desktop-cluster">
            {showNavigation ? <TopNavigation /> : null}
            {right ? <div className="app-header__desktop-extra">{right}</div> : null}
            <HeaderAuthAction />
          </div>
        ) : (
          <div className="app-header__right">
            {right || (main ? <HeaderAuthAction className="app-header__account--mobile" /> : null)}
          </div>
        )}
      </div>
    </header>
  );
}
