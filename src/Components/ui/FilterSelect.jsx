import React, { useEffect, useId, useRef, useState } from "react";
import Icon from "./Icon";

export default function FilterSelect({
  label = "필터",
  value,
  options,
  onChange,
  className = ""
}) {
  const [open,setOpen]=useState(false);
  const rootRef=useRef(null);
  const listboxId=useId();
  const selected=options.find((option)=>option.value===value) ?? options[0];

  useEffect(()=>{
    const handlePointerDown=(event)=>{
      if(rootRef.current&&!rootRef.current.contains(event.target))setOpen(false);
    };
    const handleKeyDown=(event)=>{
      if(event.key==="Escape")setOpen(false);
    };
    document.addEventListener("pointerdown",handlePointerDown);
    document.addEventListener("keydown",handleKeyDown);
    return()=>{
      document.removeEventListener("pointerdown",handlePointerDown);
      document.removeEventListener("keydown",handleKeyDown);
    };
  },[]);

  return (
    <div className={["ui-filter-select",open?"ui-filter-select--open":"",className].filter(Boolean).join(" ")} ref={rootRef}>
      <button
        type="button"
        className="ui-filter-select__trigger"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listboxId}
        onClick={()=>setOpen((current)=>!current)}
      >
        <span className="ui-filter-select__label">{label}</span>
        <span className="ui-filter-select__value">{selected?.label ?? value}</span>
        <Icon name="chevron-down" size={16}/>
      </button>

      {open?(
        <div className="ui-filter-select__menu" role="listbox" id={listboxId} aria-label={label}>
          {options.map((option)=>{
            const active=option.value===value;
            return (
              <button
                key={option.value}
                type="button"
                role="option"
                aria-selected={active}
                className="ui-filter-select__option"
                onClick={()=>{
                  onChange(option.value);
                  setOpen(false);
                }}
              >
                <span>{option.label}</span>
                {active?<Icon name="check" size={16}/>:null}
              </button>
            );
          })}
        </div>
      ):null}
    </div>
  );
}
