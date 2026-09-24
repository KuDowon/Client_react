import React from "react";
import Icon from "./Icon";
import IconButton from "./IconButton";

export default function SearchField({
  value,
  onChange,
  onSearch,
  placeholder = "도서명, 저자명으로 검색해보세요",
  ariaLabel = "도서 검색",
  className = "",
  ...props
}) {
  const submit = () => {
    if (onSearch) onSearch((value || "").trim());
  };

  return (
    <div className={["ui-search", className].filter(Boolean).join(" ")}>
      <span className="ui-search__icon"><Icon name="search" /></span>
      <input
        type="search"
        className="ui-search__input"
        aria-label={ariaLabel}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.preventDefault();
            submit();
          }
        }}
        {...props}
      />
      {value ? (
        <IconButton
          icon="close"
          label="검색어 지우기"
          className="ui-search__clear"
          onClick={() => onChange?.({ target: { value: "" } })}
        />
      ) : null}
    </div>
  );
}
