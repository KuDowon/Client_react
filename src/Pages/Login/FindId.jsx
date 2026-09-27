import React,{useState} from "react";
import {Link} from "react-router-dom";
import "../../Css/loginstyle.css";

import AuthLayout from "../../Components/layout/AuthLayout";
import Button from "../../Components/ui/Button";
import TextField from "../../Components/ui/TextField";

export default function FindId(){
  const [name,setName]=useState("");
  const [phone,setPhone]=useState("");
  const [foundId,setFoundId]=useState("");
  const [error,setError]=useState("");
  const [submitting,setSubmitting]=useState(false);

  const handleFindId=async(event)=>{
    event.preventDefault();
    if(!name.trim()||!phone.trim()){
      setError("이름과 전화번호를 모두 입력해주세요.");
      return;
    }

    setSubmitting(true);
    setError("");
    setFoundId("");

    try{
      const response=await fetch("https://mungo.n-e.kr/users/find-username/",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({name,phone}),
      });

      if(response.ok){
        const data=await response.json();
        const username=data.username||data.id;
        if(username)setFoundId(username);
        else setError(data.message||"아이디를 찾았으나 표시할 수 없습니다.");
      }else{
        const errorData=await response.json();
        setError(errorData.detail||errorData.message||"일치하는 회원 정보가 없습니다. 이름과 전화번호를 다시 확인해주세요.");
      }
    }catch(networkError){
      console.error("API 통신 중 오류 발생:",networkError);
      setError("네트워크 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
    }finally{
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="아이디 찾기"
      description="가입할 때 입력한 이름과 전화번호를 확인해주세요."
      backTo="/LoginPage"
      footer={<p className="auth-simple-link"><Link to="/LoginPage">로그인으로 돌아가기</Link></p>}
    >
      <form className="auth-form" onSubmit={handleFindId} noValidate>
        <TextField label="이름" value={name} onChange={(event)=>{setName(event.target.value);if(error)setError("");}}/>
        <TextField label="전화번호" value={phone} onChange={(event)=>{setPhone(event.target.value.replace(/\D/g,"").slice(0,11));if(error)setError("");}} inputMode="numeric"/>
        {error?<p className="auth-form__error" role="alert">{error}</p>:null}
        <Button type="submit" size="lg" block loading={submitting}>아이디 찾기</Button>
      </form>

      {foundId?(
        <div className="auth-result" role="status">
          <span>찾은 아이디</span>
          <strong>{foundId}</strong>
        </div>
      ):null}
    </AuthLayout>
  );
}
