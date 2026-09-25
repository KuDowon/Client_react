import React, { useCallback, useEffect, useState } from "react";
import {useLocation} from "react-router-dom";
import "../Css/StatusPages.css";

import Footer from "../Components/Footer";
import AppHeader from "../Components/layout/AppHeader";
import AppShell from "../Components/layout/AppShell";
import PageContainer from "../Components/layout/PageContainer";
import BookListItem from "../Components/library/BookListItem";
import Button from "../Components/ui/Button";
import Dialog from "../Components/ui/Dialog";
import EmptyState from "../Components/ui/EmptyState";
import SectionHeader from "../Components/ui/SectionHeader";
import Skeleton from "../Components/ui/Skeleton";
import printnull from "../Images/printnull.png";

const API_BASE_URL=process.env.REACT_APP_API_BASE_URL;

const authHeaders=()=>{
  const token=localStorage.getItem("accessToken");
  return {"Content-Type":"application/json",...(token?{Authorization:`Bearer ${token}`}:{})};
};

const fetchOverdueRentals=async()=>{
  const token=localStorage.getItem("accessToken");
  if(!token)return [];
  const response=await fetch(`${API_BASE_URL}/rentals/overdue/`,{headers:authHeaders()});
  if(!response.ok)throw new Error(`API 오류: ${response.status}`);
  const data=await response.json();
  return Array.isArray(data)?data:data?.results??[];
};

const returnBookAPI=async(rentalId)=>{
  const response=await fetch(`${API_BASE_URL}/rentals/${rentalId}/`,{
    method:"PATCH",
    headers:authHeaders(),
    body:JSON.stringify({is_returned:true}),
  });
  const result=await response.json().catch(()=>({}));
  if(!response.ok){
    const message=Array.isArray(result.message)?result.message.join(" "):result.message||"반납 요청을 처리하지 못했어요.";
    throw new Error(message);
  }
  return result.message||"반납이 완료됐어요.";
};

function LoadingRows(){
  return <div className="status-page__loading" aria-label="연체 목록 불러오는 중">{[0,1].map((i)=><div className="status-page__loading-row" key={i}><Skeleton width={72} height={108}/><div className="status-page__loading-copy"><Skeleton width={72} height={28}/><Skeleton width="65%" height={24}/><Skeleton width="48%" height={20}/></div></div>)}</div>;
}

export default function CurrentOverdue(){
  const {state}=useLocation();
  const backTo=state?.from||"/";
  const [rentals,setRentals]=useState([]);
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState(null);
  const [confirmState,setConfirmState]=useState({isOpen:false,rentalId:null});
  const [returning,setReturning]=useState(false);
  const [resultMessage,setResultMessage]=useState("");

  const loadRentals=useCallback(async()=>{
    setLoading(true);
    setError(null);
    try{
      const overdue=await fetchOverdueRentals();
      setRentals(overdue);
      localStorage.setItem("overdueCount",overdue.length.toString());
    }catch(err){
      console.error("현재 연체 도서 정보 불러오기 실패:",err);
      setError("연체 정보를 불러오지 못했어요. 잠시 후 다시 시도해주세요.");
    }finally{
      setLoading(false);
    }
  },[]);

  useEffect(()=>{loadRentals();},[loadRentals]);

  const executeReturn=async()=>{
    if(!confirmState.rentalId||returning)return;
    setReturning(true);
    try{
      const message=await returnBookAPI(confirmState.rentalId);
      setConfirmState({isOpen:false,rentalId:null});
      setResultMessage(message);
      await loadRentals();
    }catch(err){
      console.error("연체 도서 반납 실패:",err);
      setConfirmState({isOpen:false,rentalId:null});
      setResultMessage("반납을 완료하지 못했어요. 잠시 후 다시 시도해주세요.");
    }finally{
      setReturning(false);
    }
  };

  return (
    <AppShell>
      <AppHeader title="현재 연체 도서" backTo={backTo}/>
      <PageContainer>
        <section className="status-page">
          <div className="status-page__intro">
            <SectionHeader title="연체 중인 도서"/>
            <p className="status-page__description">연체 도서는 가능한 빨리 반납해주세요.</p>
          </div>
          {loading?<LoadingRows/>:null}
          {error?<EmptyState icon="alert" title="연체 정보를 불러오지 못했어요." description={error} action={<Button variant="secondary" onClick={loadRentals}>다시 시도</Button>}/>:null}
          {!loading&&!error&&rentals.length===0?<EmptyState icon="check" title="연체 중인 도서가 없어요." description="현재 반납이 필요한 연체 도서가 없습니다."/>:null}
          {!loading&&!error&&rentals.length>0?(
            <div className="status-page__list">
              {rentals.map((item)=>{
                const bookCode=item.book?.book_code||item.id;
                const book={id:item.book?.id||item.id,title:item.book?.title||item.book?.book_title||`도서 ${bookCode}`,author:item.book?.author||"",publisher:item.book?.publisher||"",code:bookCode,location:item.book?.location||""};
                const meta=[`대출일: ${item.rental_date||"-"}`,`반납 예정일: ${item.due_date||"-"}`,item.book?.book_status==="RESERVED"?"다음 예약자가 있어 빠른 반납이 필요해요.":null].filter(Boolean);
                return <BookListItem key={item.id} book={book} cover={item.book?.image_url||printnull} detailTo={`/BookPage/${bookCode}`} statusLabel={`${item.overdue_days||0}일 연체`} statusTone="danger" meta={meta} actionLabel="반납하기" actionVariant="danger" onAction={()=>setConfirmState({isOpen:true,rentalId:item.id})}/>;
              })}
            </div>
          ):null}
        </section>
      </PageContainer>
      <Footer/>

      <Dialog
        open={confirmState.isOpen}
        title="연체 도서를 반납할까요?"
        confirmLabel="반납하기"
        cancelLabel="취소"
        destructive
        confirmLoading={returning}
        onConfirm={executeReturn}
        onClose={()=>{if(!returning)setConfirmState({isOpen:false,rentalId:null});}}
      >
        반납이 완료되면 연체 현황이 갱신돼요.
      </Dialog>

      <Dialog
        open={Boolean(resultMessage)}
        title={resultMessage.includes("완료")||resultMessage.includes("반납")?"반납 처리 결과":"요청을 처리하지 못했어요."}
        confirmLabel="확인"
        hideCancel
        onConfirm={()=>setResultMessage("")}
        onClose={()=>setResultMessage("")}
      >
        {resultMessage}
      </Dialog>
    </AppShell>
  );
}
