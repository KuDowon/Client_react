import React,{useState} from "react";
import {useNavigate} from "react-router-dom";
import "../../Css/loginstyle.css";

import AuthLayout from "../../Components/layout/AuthLayout";
import Button from "../../Components/ui/Button";
import Checkbox from "../../Components/ui/Checkbox";
import Dialog from "../../Components/ui/Dialog";
import SelectField from "../../Components/ui/SelectField";
import TextField from "../../Components/ui/TextField";

export default function Signup(){
  const [formData,setFormData]=useState({name:"",role:"",id:"",password:"",passwordConfirm:"",phone:"",agreePrivacy:false});
  const [error,setError]=useState("");
  const [submitting,setSubmitting]=useState(false);
  const [successOpen,setSuccessOpen]=useState(false);
  const navigate=useNavigate();

  const handleChange=(event)=>{
    const {id,value,type,checked}=event.target;
    setFormData((previous)=>({...previous,[id]:type==="checkbox"?checked:value}));
    if(error)setError("");
  };

  const handleSignup=async(event)=>{
    event.preventDefault();
    const {name,role,id,password,passwordConfirm,phone,agreePrivacy}=formData;

    if(!name||!role||!id||!password||!phone){
      setError("모든 필수 정보를 입력해주세요.");
      return;
    }
    if(password!==passwordConfirm){
      setError("비밀번호가 일치하지 않습니다.");
      return;
    }
    if(!agreePrivacy){
      setError("개인정보 수집 및 이용에 동의해주세요.");
      return;
    }

    setSubmitting(true);
    setError("");

    try{
      const response=await fetch("https://mungo.n-e.kr/users/signup/",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({name,user_type:role,username:id,password,phone}),
      });

      if(response.ok){
        const data=await response.json();
        if(data.message==="User created successfully"||Object.keys(data).length>0){
          setSuccessOpen(true);
        }else{
          setError(data.message||"회원가입에 성공했으나 예상치 못한 응답입니다.");
        }
      }else{
        const errorData=await response.json();
        setError(errorData.message||(errorData.user_type&&errorData.user_type[0])||"회원가입 실패: 입력값을 확인해주세요.");
      }
    }catch(networkError){
      console.error("API 통신 중 오류 발생:",networkError);
      setError("서버와 연결할 수 없습니다. 인터넷 연결을 확인해주세요.");
    }finally{
      setSubmitting(false);
    }
  };

  return (
    <>
      <AuthLayout title="회원가입" description="문중문고 이용을 위한 기본 정보를 입력해주세요." backTo="/LoginPage">
        <form className="auth-form" onSubmit={handleSignup} noValidate>
          <TextField id="name" label="이름" value={formData.name} onChange={handleChange}/>
          <SelectField id="role" label="회원 구분" value={formData.role} onChange={handleChange}>
            <option value="">선택</option>
            <option value="재학생">재학생</option>
            <option value="재적생">재적생</option>
            <option value="타과생">타과생</option>
          </SelectField>
          <TextField id="id" label="아이디" value={formData.id} onChange={handleChange} autoComplete="username"/>
          <TextField id="password" label="비밀번호" type="password" value={formData.password} onChange={handleChange} autoComplete="new-password"/>
          <TextField id="passwordConfirm" label="비밀번호 확인" type="password" value={formData.passwordConfirm} onChange={handleChange} autoComplete="new-password"/>
          <TextField id="phone" label="전화번호" value={formData.phone} onChange={(event)=>{event.target.value=event.target.value.replace(/\D/g,"").slice(0,11);handleChange(event);}} inputMode="numeric" helperText="숫자만 입력해주세요."/>
          <Checkbox id="agreePrivacy" checked={formData.agreePrivacy} onChange={handleChange} label="개인정보 수집 및 알림 수신(대출 알림 등)에 동의합니다."/>
          {error?<p className="auth-form__error" role="alert">{error}</p>:null}
          <Button type="submit" size="lg" block loading={submitting}>회원가입</Button>
        </form>
      </AuthLayout>

      <Dialog open={successOpen} title="회원가입이 완료됐어요." confirmLabel="로그인하기" hideCancel onConfirm={()=>navigate("/LoginPage")} onClose={()=>navigate("/LoginPage")}>
        이제 문중문고에 로그인할 수 있어요.
      </Dialog>
    </>
  );
}
