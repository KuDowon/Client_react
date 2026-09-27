import React from "react";
import { useNavigate } from "react-router-dom";
import Footer from "../Components/Footer";
import AppHeader from "../Components/layout/AppHeader";
import AppShell from "../Components/layout/AppShell";
import PageContainer from "../Components/layout/PageContainer";
import Button from "../Components/ui/Button";
import EmptyState from "../Components/ui/EmptyState";

export default function NotFoundPage(){
  const navigate=useNavigate();

  return (
    <AppShell>
      <AppHeader title="페이지 없음" backTo="/"/>
      <PageContainer>
        <EmptyState
          icon="search"
          title="페이지를 찾을 수 없어요."
          description="주소를 다시 확인하거나 홈으로 이동해주세요."
          action={<Button onClick={()=>navigate("/")}>홈으로</Button>}
        />
      </PageContainer>
      <Footer/>
    </AppShell>
  );
}
