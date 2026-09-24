import React, { useCallback, useEffect, useState } from "react";
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

const fetchCurrentRentals=async()=>{
  const token=localStorage.getItem("accessToken");
  if(!token)return [];
  try{
    const response=await fetch(`${API_BASE_URL}/rentals/current/`,{headers:{"Content-Type":"application/json",Authorization:`Bearer ${token}`}});
    if(!response.ok)throw new Error(`API 오류: ${response.status}`);
    return await response.json();
  }catch(error){
    console.error("현재 대출 도서 정보 불러오기 실패:",error);
    return [];
  }
};

const returnBookAPI=async(rentalId)=>{
  const token=localStorage.getItem("accessToken");
  if(!token)throw new Error("인증 토큰이 없습니다.");
  const response=await fetch(`${API_BASE_URL}/rentals/${rentalId}/`,{
    method:"PATCH",
    headers:{"Content-Type":"application/json",Authorization:`Bearer ${token}`},
    body:JSON.stringify({is_returned:true}),
  });
  const result=await response.json();
  if(!response.ok){
    const message=Array.isArray(result.message)?result.message.join(" "):result.message||`반납 요청 실패: ${response.status}`;
    throw new Error(message);
  }
  return result.message||"반납되었습니다.";
};

function LoadingRows(){
  return <div className="status-page__loading" aria-label="대출 목록 불러오는 중">{[0,1,2].map((i)=><div className="status-page__loading-row" key={i}><Skeleton width={72} height={108}/><div className="status-page__loading-copy"><Skeleton width={72} height={28}/><Skeleton width="65%" height={24}/><Skeleton width="48%" height={20}/></div></div>)}</div>;
}

export default function CurrentBorrow(){
  const [rentals,setRentals]=useState([]);
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState(null);
  const [modalMessage,setModalMessage]=useState(null);
  const [confirmModalState,setConfirmModalState]=useState({isOpen:false,rentalId:null});

  const refreshRentalData=useCallback(async()=>{
    setLoading(true);setError(null);
    try{
      const data=await fetchCurrentRentals();
      const current=data.filter((item)=>!item.is_overdue&&!item.is_returned);
      setRentals(current);
      localStorage.setItem("borrowCount",current.length.toString());
    }catch(err){setError(err.message);}finally{setLoading(false);}
  },[]);

  useEffect(()=>{refreshRentalData();},[refreshRentalData]);

  const executeReturn=async()=>{
    const rentalId=confirmModalState.rentalId;
    setConfirmModalState({isOpen:false,rentalId:null});
    if(!rentalId)return;
    try{
      const message=await returnBookAPI(rentalId);
      setModalMessage(message);
      refreshRentalData();
    }catch(err){setModalMessage(err.message||"반납 처리 중 알 수 없는 오류가 발생했습니다.");}
  };

  return (
    <AppShell>
      <AppHeader title="현재 대출 도서" backTo="/"/>
      <PageContainer>
        <section className="status-page">
          <div className="status-page__intro">
            <SectionHeader title="대출 중인 도서"/>
            <p className="status-page__description">반납 예정일과 예약 여부를 확인할 수 있어요.</p>
          </div>
          {loading?<LoadingRows/>:null}
          {error?<EmptyState icon="alert" title="대출 정보를 불러오지 못했어요." description={error}/>:null}
          {!loading&&!error&&rentals.length===0?<EmptyState icon="book" title="대출 중인 도서가 없어요." description="새로운 도서를 검색해보세요."/>:null}
          {!loading&&!error&&rentals.length>0?(
            <div className="status-page__list">
              {rentals.map((item)=>{
                const bookCode=item.book?.book_code||item.id;
                const reservationMessage=item.book?.book_status==="RESERVED"?"다음 예약자가 있어 빠른 반납이 필요해요.":null;
                const book={id:item.book?.id||item.id,title:item.book?.title||item.book?.book_title||`도서 ${bookCode}`,author:item.book?.author||"",publisher:item.book?.publisher||"",code:bookCode,location:item.book?.location||""};
                const meta=[`대출일: ${item.rental_date||"-"}`,`반납 예정일: ${item.due_date||"-"}`,reservationMessage].filter(Boolean);
                return <BookListItem key={item.id} book={book} cover={item.book?.image_url||printnull} detailTo={`/BookPage/${bookCode}`} statusLabel="대출중" statusTone="neutral" meta={meta} actionLabel="반납하기" onAction={()=>setConfirmModalState({isOpen:true,rentalId:item.id})}/>;
              })}
            </div>
          ):null}
        </section>
      </PageContainer>
      <Footer/>
      <Dialog open={confirmModalState.isOpen} title="이 도서를 반납할까요?" confirmLabel="반납하기" cancelLabel="취소" onConfirm={executeReturn} onClose={()=>setConfirmModalState({isOpen:false,rentalId:null})}>반납 후에는 다시 대출해야 이용할 수 있어요.</Dialog>
      <Dialog open={Boolean(modalMessage)} title="반납 처리 결과" confirmLabel="확인" hideCancel onConfirm={()=>setModalMessage(null)} onClose={()=>setModalMessage(null)}>{modalMessage}</Dialog>
    </AppShell>
  );
}
