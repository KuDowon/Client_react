import React, { useId } from "react";

export default function SelectField({ label, helperText, error, id, children, className = "", ...props }) {
  const generatedId=useId();
  const selectId=id||generatedId;
  const message=typeof error==="string"?error:helperText;
  const messageId=message?`${selectId}-message`:undefined;
  return (
    <div className={["ui-field",error?"ui-field--error":"",className].filter(Boolean).join(" ")}>
      {label?<label className="ui-field__label" htmlFor={selectId}>{label}</label>:null}
      <select id={selectId} className="ui-field__control" aria-invalid={Boolean(error)||undefined} aria-describedby={messageId} {...props}>{children}</select>
      {message?<p id={messageId} className="ui-field__message">{message}</p>:null}
    </div>
  );
}
