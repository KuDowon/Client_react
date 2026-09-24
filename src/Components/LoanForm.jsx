import { useState } from "react";
import Button from "./ui/Button";
import TextField from "./ui/TextField";

const PREFIX="MJ";

function LoanForm({onSubmit,buttonText,caption}){
  const [registerNumber,setRegisterNumber]=useState(PREFIX);
  const [error,setError]=useState("");

  const handleInputChange=(event)=>{
    let value=event.target.value;
    if(!value.startsWith(PREFIX))value=PREFIX;
    let suffix=value.slice(PREFIX.length).replace(/\D/g,"");
    if(suffix.length>6)suffix=suffix.slice(0,6);
    setRegisterNumber(PREFIX+suffix);
    if(error)setError("");
  };

  const handleKeyDown=(event)=>{
    if(event.target.selectionStart<=PREFIX.length&&event.key==="Backspace")event.preventDefault();
  };

  const handleSubmit=(event)=>{
    event.preventDefault();
    const suffix=registerNumber.slice(PREFIX.length);
    if(/^\d{6}$/.test(suffix)){
      setError("");
      onSubmit(registerNumber);
    }else{
      setError("등록번호 숫자 6자리를 정확히 입력해주세요.");
    }
  };

  return (
    <form className="loan-v2-form" onSubmit={handleSubmit} noValidate>
      <TextField
        label="도서 등록번호"
        value={registerNumber}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        autoComplete="off"
        inputMode="text"
        error={error}
        helperText="예: MJ123456"
      />
      <Button type="submit" variant="primary" size="lg" block>{buttonText}</Button>
      {caption?<div className="loan-v2-form__caption">{caption}</div>:null}
    </form>
  );
}

export default LoanForm;
