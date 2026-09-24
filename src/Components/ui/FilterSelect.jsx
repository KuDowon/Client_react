import React, { useEffect, useId, useRef, useState } from "react";
import Icon from "./Icon";

export default function FilterSelect({
  label = "필터",
  value,
  options,
  onChange,
  disabled = false,
  className = ""
}) {
  const [open,setOpen]=useState(false);
  const rootRef=useRef(null);
  const triggerRef=useRef(null);
  const optionRefs=useRef([]);
  const listboxId=useId();
  const selectedIndex=Math.max(0,options.findIndex((option)=>option.value===value));
  const selected=options[selectedIndex] ?? options[0];

  const focusOption=(index)=>{
    const safeIndex=(index+options.length)%options.length;
    window.setTimeout(()=>optionRefs.current[safeIndex]?.focus(),0);
  };

  const openAndFocus=(index=selectedIndex)=>{
    if(disabled)return;
    setOpen(true);
    focusOption(index);
  };

  useEffect(()=>{
    const handlePointerDown=(event)=>{
      if(rootRef.current&&!rootRef.current.contains(event.target))setOpen(false);
    };
    const handleKeyDown=(event)=>{
      if(event.key==="Escape"&&open){
        setOpen(false);
        triggerRef.current?.focus();
      }
    };
    document.addEventListener("pointerdown",handlePointerDown);
    document.addEventListener("keydown",handleKeyDown);
    return()=>{
      document.removeEventListener("pointerdown",handlePointerDown);
      document.removeEventListener("keydown",handleKeyDown);
    };
  },[open]);

  useEffect(()=>{
    if(disabled&&open)setOpen(false);
  },[disabled,open]);

  return (
    <div
      className={[
        "ui-filter-select",
        open?"ui-filter-select--open":"",
        disabled?"ui-filter-select--disabled":"",
        className
      ].filter(Boolean).join(" ")}
      ref={rootRef}
    >
      <button
        ref={triggerRef}
        type="button"
        className="ui-filter-select__trigger"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open?listboxId:undefined}
        disabled={disabled}
        onClick={()=>setOpen((current)=>!current)}
        onKeyDown={(event)=>{
          if(event.key==="ArrowDown"){
            event.preventDefault();
            openAndFocus(selectedIndex);
          }else if(event.key==="ArrowUp"){
            event.preventDefault();
            openAndFocus(selectedIndex);
          }
        }}
      >
        <span className="ui-filter-select__label">{label}</span>
        <span className="ui-filter-select__value">{selected?.label ?? value}</span>
        <Icon name="chevron-down" size={16}/>
      </button>

      {open?(
        <div className="ui-filter-select__menu" role="listbox" id={listboxId} aria-label={label}>
          {options.map((option,index)=>{
            const active=option.value===value;
            return (
              <button
                ref={(node)=>{optionRefs.current[index]=node;}}
                key={option.value}
                type="button"
                role="option"
                aria-selected={active}
                className="ui-filter-select__option"
                onClick={()=>{
                  onChange(option.value);
                  setOpen(false);
                  triggerRef.current?.focus();
                }}
                onKeyDown={(event)=>{
                  if(event.key==="ArrowDown"){
                    event.preventDefault();
                    focusOption(index+1);
                  }else if(event.key==="ArrowUp"){
                    event.preventDefault();
                    focusOption(index-1);
                  }else if(event.key==="Home"){
                    event.preventDefault();
                    focusOption(0);
                  }else if(event.key==="End"){
                    event.preventDefault();
                    focusOption(options.length-1);
                  }else if(event.key==="Escape"){
                    event.preventDefault();
                    setOpen(false);
                    triggerRef.current?.focus();
                  }
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
