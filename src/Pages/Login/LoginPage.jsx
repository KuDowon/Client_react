import React,{useState} from "react";
import {Link,useNavigate} from "react-router-dom";
import "../../Css/loginstyle.css";

import AuthLayout from "../../Components/layout/AuthLayout";
import Button from "../../Components/ui/Button";
import TextField from "../../Components/ui/TextField";

export default function LoginPage(){
  const [loginId,setLoginId]=useState("");
  const [password,setPassword]=useState("");
  const [error,setError]=useState("");
  const [submitting,setSubmitting]=useState(false);
  const navigate=useNavigate();

  const handleLogin=async(event)=>{
    event.preventDefault();
    if(!loginId.trim()||!password){
      setError("아이디와 비밀번호를 모두 입력해주세요.");
      return;
    }

    setSubmitting(true);
    setError("");
    const apiUrl="https://mungo.n-e.kr/users/login/";

    try{
      const response=await fetch(apiUrl,{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({username:loginId,password}),
      });

      if(response.ok){
        const data=await response.json();
        const loggedInUsername=data.name||loginId;
        if(data.access&&data.refresh){
          localStorage.setItem("accessToken",data.access);
          localStorage.setItem("refreshToken",data.refresh);
          localStorage.setItem("userID",loggedInUsername);
          navigate("/");
        }else{
          setError(data.message||"로그인 처리 중 예기치 않은 응답이 발생했습니다.");
          console.error("로그인 실패 - 예상치 못한 응답:",data);
        }
      }else{
        const errorData=await response.json();
        setError(errorData.detail||errorData.message||"아이디 또는 비밀번호가 올바르지 않습니다.");
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
      title="로그인"
      description="문중문고의 대출·예약 서비스를 이용하려면 로그인해주세요."
      backTo="/"
      footer={
        <div className="auth-links">
          <p><Link to="/FindId">아이디 찾기</Link><span aria-hidden="true">·</span><a href="http://pf.kakao.com/_pHxbDn" target="_blank" rel="noopener noreferrer">비밀번호 문의</a></p>
          <p>아직 계정이 없으신가요? <Link to="/SignUp">회원가입</Link></p>
        </div>
      }
    >
      <form className="auth-form" onSubmit={handleLogin} noValidate>
        <TextField label="아이디" value={loginId} onChange={(event)=>{setLoginId(event.target.value);if(error)setError("");}} autoComplete="username"/>
        <TextField label="비밀번호" type="password" value={password} onChange={(event)=>{setPassword(event.target.value);if(error)setError("");}} autoComplete="current-password"/>
        {error?<p className="auth-form__error" role="alert">{error}</p>:null}
        <Button type="submit" size="lg" block loading={submitting}>로그인</Button>
      </form>
    </AuthLayout>
  );
}
