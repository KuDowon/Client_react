import React, { useId } from "react";

export default function Checkbox({ label, id, className = "", ...props }) {
  const generatedId=useId();
  const inputId=id||generatedId;
  return (
    <label className={["ui-checkbox",className].filter(Boolean).join(" ")} htmlFor={inputId}>
      <input id={inputId} type="checkbox" className="ui-checkbox__input" {...props}/>
      <span className="ui-checkbox__box" aria-hidden="true"/>
      <span className="ui-checkbox__label">{label}</span>
    </label>
  );
}
