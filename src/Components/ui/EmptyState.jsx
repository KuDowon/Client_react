import React from "react";
import Icon from "./Icon";

export default function EmptyState({ icon="book", title, description, action, className="" }) {
  return (
    <div className={["ui-empty",className].filter(Boolean).join(" ")}>
      <span className="ui-empty__icon"><Icon name={icon} size={24}/></span>
      <div className="ui-empty__copy">
        <h2 className="ui-empty__title">{title}</h2>
        {description?<p className="ui-empty__description">{description}</p>:null}
      </div>
      {action?<div className="ui-empty__action">{action}</div>:null}
    </div>
  );
}
