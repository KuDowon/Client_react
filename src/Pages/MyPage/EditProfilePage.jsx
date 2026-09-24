import React,{useEffect,useState} from "react";
import "../../Css/MyPage.css";
import {getMyPage,updateMyPage} from "../../Api/user";

import Footer from "../../Components/Footer";
import AppHeader from "../../Components/layout/AppHeader";
import AppShell from "../../Components/layout/AppShell";
import PageContainer from "../../Components/layout/PageContainer";
import Button from "../../Components/ui/Button";
import Dialog from "../../Components/ui/Dialog";
import EmptyState from "../../Components/ui/EmptyState";
import SelectField from "../../Components/ui/SelectField";
import Skeleton from "../../Components/ui/Skeleton";
import TextField from "../../Components/ui/TextField";

export default function EditProfilePage(){
  const [loading,setLoading]=useState(true);
  const [saving,setSaving]=useState(false);
  const [loadError,setLoadError]=useState("");
  const [feedback,setFeedback]=useState("");
  const [errors,setErrors]=useState({});

  const [name,setName]=useState("");
  const [phone,setPhone]=useState("");
  const [userType,setUserType]=useState("");
  const [currentPassword,setCurrentPassword]=useState("");
  const [newPassword,setNewPassword]=useState("");

  useEffect(()=>{
    (async()=>{
      try{
        const me=await getMyPage();
        setName(me.name??"");
        setPhone(me.phone??"");
        setUserType(me.userType??me.user_type??"");
      }catch(error){
        console.warn(error);
        setLoadError("정보를 불러오지 못했습니다.");
      }finally{setLoading(false);}
    })();
  },[]);

  const validate=()=>{
    const next={};
    if(!name.trim())next.name="이름을 입력해주세요.";
    if(!phone.trim())next.phone="전화번호를 입력해주세요.";
    else if(!/^\d{11}$/.test(phone.trim()))next.phone="전화번호는 숫자 11자리로 입력해주세요.";
    if(!userType.trim())next.userType="회원 구분을 선택해주세요.";
    if((currentPassword&&!newPassword)||(!currentPassword&&newPassword)){
      next.currentPassword="비밀번호를 변경하려면 현재 비밀번호와 새 비밀번호를 모두 입력해주세요.";
      next.newPassword="비밀번호를 변경하려면 두 항목을 모두 입력해주세요.";
    }
    setErrors(next);
    return Object.keys(next).length===0;
  };

  const onSave=async(event)=>{
    event.preventDefault();
    if(!validate())return;

    try{
      setSaving(true);
      const result=await updateMyPage({
        name:name.trim(),
        phone:phone.trim(),
        user_type:userType.trim(),
        current_password:currentPassword||undefined,
        password:newPassword||undefined,
      });
      setFeedback(result?.message||"회원정보가 수정되었습니다.");
      setCurrentPassword("");
      setNewPassword("");
      setErrors({});
    }catch(error){
      console.error(error);
      setFeedback(error.message||"저장에 실패했습니다.");
    }finally{setSaving(false);}
  };

  return (
    <AppShell>
      <AppHeader title="회원정보 수정" backTo="/MyPage"/>
      <PageContainer>
        {loading?(
          <div className="profile-edit"><Skeleton width={180} height={36}/><Skeleton width="100%" height={320} radius={12}/></div>
        ):loadError?(
          <EmptyState icon="alert" title="회원정보를 불러오지 못했어요." description={loadError}/>
        ):(
          <section className="profile-edit">
            <div className="profile-edit__intro">
              <h1>내 정보를 수정할 수 있어요.</h1>
              <p>필수 정보를 확인하고 변경할 내용만 수정해주세요.</p>
            </div>

            <form className="profile-edit__form" onSubmit={onSave} noValidate>
              <TextField label="이름" value={name} onChange={(event)=>{setName(event.target.value);setErrors((prev)=>({...prev,name:""}));}} error={errors.name} placeholder="홍길동"/>
              <TextField label="전화번호" value={phone} onChange={(event)=>{setPhone(event.target.value.replace(/\D/g,"").slice(0,11));setErrors((prev)=>({...prev,phone:""}));}} error={errors.phone} helperText="숫자만 11자리로 입력해주세요." inputMode="numeric" placeholder="01012345678"/>
              <SelectField label="회원 구분" value={userType} onChange={(event)=>{setUserType(event.target.value);setErrors((prev)=>({...prev,userType:""}));}} error={errors.userType}>
                <option value="">선택</option>
                <option value="재학생">재학생</option>
                <option value="재적생">재적생</option>
                <option value="타과생">타과생</option>
              </SelectField>

              <hr className="profile-edit__divider"/>

              <div className="profile-edit__password-group">
                <TextField label="현재 비밀번호" type="password" value={currentPassword} onChange={(event)=>{setCurrentPassword(event.target.value);setErrors((prev)=>({...prev,currentPassword:""}));}} error={errors.currentPassword} helperText="비밀번호를 변경할 때만 입력해주세요." autoComplete="current-password"/>
                <TextField label="새 비밀번호" type="password" value={newPassword} onChange={(event)=>{setNewPassword(event.target.value);setErrors((prev)=>({...prev,newPassword:""}));}} error={errors.newPassword} autoComplete="new-password"/>
              </div>

              <Button type="submit" size="lg" block loading={saving}>저장하기</Button>
            </form>
          </section>
        )}
      </PageContainer>
      <Footer/>
      <Dialog open={Boolean(feedback)} title="회원정보 수정" confirmLabel="확인" hideCancel onConfirm={()=>setFeedback("")} onClose={()=>setFeedback("")}>{feedback}</Dialog>
    </AppShell>
  );
}
