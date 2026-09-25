import React, { useCallback, useEffect, useState } from "react";
import {useLocation} from "react-router-dom";
import "../Css/StatusPages.css";

import Footer from "../Components/Footer";
import AppHeader from "../Components/layout/AppHeader";
import AppShell from "../Components/layout/AppShell";
import PageContainer from "../Components/layout/PageContainer";
import BookListItem from "../Components/library/BookListItem";
import Dialog from "../Components/ui/Dialog";
import EmptyState from "../Components/ui/EmptyState";
import SectionHeader from "../Components/ui/SectionHeader";
import Skeleton from "../Components/ui/Skeleton";
import printnull from "../Images/printnull.png";

const API_BASE_URL=process.env.REACT_APP_API_BASE_URL;
const authHeaders=()=>{const access=localStorage.getItem("accessToken");return {"Content-Type":"application/json",...(access?{Authorization:`Bearer ${access}`}:{})};};

const fetchReservations=async()=>{
  const token=localStorage.getItem("accessToken");
  if(!token)return [];
  const response=await fetch(`${API_BASE_URL}/reservations/`,{headers:authHeaders()});
  if(!response.ok)throw new Error(`API 오류: ${response.status}`);
  return await response.json();
};

const cancelReservationAPI=async(reservationId)=>{
  const response=await fetch(`${API_BASE_URL}/reservations/${reservationId}/cancel/`,{method:"POST",headers:authHeaders()});
  const result=await response.json();
  if(!response.ok){
    const message=Array.isArray(result.message)?result.message.join(" "):result.message||`예약 취소 실패: ${response.status}`;
    throw new Error(message);
  }
  return result.message;
};

const statusInfo=(status)=>{
  if(status==="ACTIVE")return {label:"예약중",tone:"neutral"};
  if(status==="CANCELED")return {label:"예약 취소",tone:"neutral"};
  if(status==="EXPIRED")return {label:"예약 만료",tone:"neutral"};
  return {label:status||"상태 확인",tone:"neutral"};
};
const dateOnly=(value)=>value?String(value).substring(0,10):"-";

function LoadingRows(){
  return <div className="status-page__loading" aria-label="예약 목록 불러오는 중">{[0,1,2].map((i)=><div className="status-page__loading-row" key={i}><Skeleton width={72} height={108}/><div className="status-page__loading-copy"><Skeleton width={72} height={28}/><Skeleton width="65%" height={24}/><Skeleton width="48%" height={20}/></div></div>)}</div>;
}

export default function CurrentReserve(){
  const {state}=useLocation();
  const backTo=state?.from==="/MyPage"?"/MyPage":"/";
  const [reservations,setReservations]=useState([]);
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState(null);
  const [modalMessage,setModalMessage]=useState(null);
  const [confirmModalState,setConfirmModalState]=useState({isOpen:false,reservationId:null});

  const refreshReservationData=useCallback(async()=>{
    setLoading(true);setError(null);
    try{
      const data=await fetchReservations();
      setReservations(data);
      const activeCount=data.filter((item)=>item.status==="ACTIVE").length;
      localStorage.setItem("reserveCount",activeCount.toString());
    }catch(err){setError(err.message);}finally{setLoading(false);}
  },[]);

  useEffect(()=>{refreshReservationData();},[refreshReservationData]);

  const executeCancellation=async()=>{
    const reservationId=confirmModalState.reservationId;
    setConfirmModalState({isOpen:false,reservationId:null});
    if(!reservationId)return;
    try{
      const message=await cancelReservationAPI(reservationId);
      setModalMessage(message||"예약이 취소되었습니다.");
      refreshReservationData();
    }catch(err){setModalMessage(err.message||"예약 취소 중 알 수 없는 오류가 발생했습니다.");}
  };

  return (
    <AppShell>
      <AppHeader title="현재 예약 도서" backTo={backTo}/>
      <PageContainer>
        <section className="status-page">
          <div className="status-page__intro">
            <SectionHeader title="예약 중인 도서"/>
            <p className="status-page__description">예약 상태와 관련 일정을 확인할 수 있어요.</p>
          </div>
          {loading?<LoadingRows/>:null}
          {error?<EmptyState icon="alert" title="예약 정보를 불러오지 못했어요." description={error}/>:null}
          {!loading&&!error&&reservations.length===0?<EmptyState icon="clock" title="현재 예약 중인 도서가 없어요." description="대출 중인 도서를 예약하면 이곳에서 확인할 수 있어요."/>:null}
          {!loading&&!error&&reservations.length>0?(
            <div className="status-page__list">
              {reservations.map((item)=>{
                const bookCode=item.book?.book_code||item.id;
                const book={id:item.book?.id||item.id,title:item.book?.title||item.book?.book_title||`도서 ${bookCode}`,author:item.book?.author||"",publisher:item.book?.publisher||"",code:bookCode,location:item.book?.location||""};
                const status=statusInfo(item.status);
                const meta=[`예약일: ${dateOnly(item.reservation_date)}`,`예약 만료일: ${dateOnly(item.due_date)}`,item.cancel_date?`예약 취소일: ${dateOnly(item.cancel_date)}`:null].filter(Boolean);
                return <BookListItem key={item.id} book={book} cover={item.book?.image_url||printnull} detailTo={`/BookPage/${bookCode}`} statusLabel={status.label} statusTone={status.tone} meta={meta} actionLabel={item.status==="ACTIVE"?"예약 취소":null} actionVariant="danger" onAction={()=>setConfirmModalState({isOpen:true,reservationId:item.id})}/>;
              })}
            </div>
          ):null}
        </section>
      </PageContainer>
      <Footer/>
      <Dialog open={confirmModalState.isOpen} title="예약을 취소할까요?" confirmLabel="예약 취소" cancelLabel="유지하기" destructive onConfirm={executeCancellation} onClose={()=>setConfirmModalState({isOpen:false,reservationId:null})}>취소한 예약은 다시 신청해야 해요.</Dialog>
      <Dialog open={Boolean(modalMessage)} title="예약 처리 결과" confirmLabel="확인" hideCancel onConfirm={()=>setModalMessage(null)} onClose={()=>setModalMessage(null)}>{modalMessage}</Dialog>
    </AppShell>
  );
}
