import React,{useState} from "react";
import "../../Css/loginstyle.css";

import AuthLayout from "../../Components/layout/AuthLayout";
import Button from "../../Components/ui/Button";
import Dialog from "../../Components/ui/Dialog";
import TextField from "../../Components/ui/TextField";

export default function ResetPassword(){
  const [name,setName]=useState("");
  const [userId,setUserId]=useState("");
  const [phone,setPhone]=useState("");
  const [error,setError]=useState("");
  const [noticeOpen,setNoticeOpen]=useState(false);

  const handleFindPassword=(event)=>{
    event.preventDefault();
    if(!name.trim()||!userId.trim()||!phone.trim()){
      setError("이름, 아이디, 전화번호를 모두 입력해주세요.");
      return;
    }
    setError("");
    setNoticeOpen(true);
  };

  return (
    <>
      <AuthLayout title="비밀번호 찾기" description="현재 비밀번호 변경 기능은 관리자 확인을 통해 진행돼요." backTo="/LoginPage">
        <form className="auth-form" onSubmit={handleFindPassword} noValidate>
          <TextField label="이름" value={name} onChange={(event)=>{setName(event.target.value);if(error)setError("");}}/>
          <TextField label="아이디" value={userId} onChange={(event)=>{setUserId(event.target.value);if(error)setError("");}}/>
          <TextField label="전화번호" value={phone} onChange={(event)=>{setPhone(event.target.value.replace(/\D/g,"").slice(0,11));if(error)setError("");}} inputMode="numeric"/>
          {error?<p className="auth-form__error" role="alert">{error}</p>:null}
          <Button type="submit" size="lg" block>확인하기</Button>
        </form>
        <p className="auth-support">비밀번호 변경 API가 현재 화면에 연결되어 있지 않아 자동 변경은 진행하지 않아요.</p>
      </AuthLayout>

      <Dialog open={noticeOpen} title="관리자 문의가 필요해요." confirmLabel="확인" hideCancel onConfirm={()=>setNoticeOpen(false)} onClose={()=>setNoticeOpen(false)}>
        입력 정보는 서버로 전송되지 않았어요. 비밀번호 변경은 문중문고 관리자에게 문의해주세요.
      </Dialog>
    </>
  );
}
