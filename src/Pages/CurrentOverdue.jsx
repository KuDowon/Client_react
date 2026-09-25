import React, { useEffect, useState } from "react";
import {useLocation} from "react-router-dom";
import "../Css/StatusPages.css";

import Footer from "../Components/Footer";
import AppHeader from "../Components/layout/AppHeader";
import AppShell from "../Components/layout/AppShell";
import PageContainer from "../Components/layout/PageContainer";
import BookListItem from "../Components/library/BookListItem";
import EmptyState from "../Components/ui/EmptyState";
import SectionHeader from "../Components/ui/SectionHeader";
import Skeleton from "../Components/ui/Skeleton";
import printnull from "../Images/printnull.png";

const API_BASE_URL=process.env.REACT_APP_API_BASE_URL;

const fetchOverdueRentals=async()=>{
  const token=localStorage.getItem("accessToken");
  if(!token)return [];
  try{
    const response=await fetch(`${API_BASE_URL}/rentals/overdue/`,{headers:{"Content-Type":"application/json",Authorization:`Bearer ${token}`}});
    if(!response.ok)throw new Error(`API 오류: ${response.status}`);
    const data=await response.json();
    return Array.isArray(data)?data:data?.results??[];
  }catch(error){console.error("현재 연체 도서 정보 불러오기 실패:",error);throw error;}
};

function LoadingRows(){
  return <div className="status-page__loading" aria-label="연체 목록 불러오는 중">{[0,1].map((i)=><div className="status-page__loading-row" key={i}><Skeleton width={72} height={108}/><div className="status-page__loading-copy"><Skeleton width={72} height={28}/><Skeleton width="65%" height={24}/><Skeleton width="48%" height={20}/></div></div>)}</div>;
}

export default function CurrentOverdue(){
  const {state}=useLocation();
  const backTo=state?.from==="/MyPage"?"/MyPage":"/";
  const [rentals,setRentals]=useState([]);
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState(null);

  useEffect(()=>{
    const getRentals=async()=>{
      try{
        const overdue=await fetchOverdueRentals();
        setRentals(overdue);
        localStorage.setItem("overdueCount",overdue.length.toString());
      }catch(err){setError(err.message);}finally{setLoading(false);}
    };
    getRentals();
  },[]);

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
          {error?<EmptyState icon="alert" title="연체 정보를 불러오지 못했어요." description={error}/>:null}
          {!loading&&!error&&rentals.length===0?<EmptyState icon="check" title="연체 중인 도서가 없어요." description="현재 반납이 필요한 연체 도서가 없습니다."/>:null}
          {!loading&&!error&&rentals.length>0?(
            <div className="status-page__list">
              {rentals.map((item)=>{
                const bookCode=item.book?.book_code||item.id;
                const book={id:item.book?.id||item.id,title:item.book?.title||item.book?.book_title||`도서 ${bookCode}`,author:item.book?.author||"",publisher:item.book?.publisher||"",code:bookCode,location:item.book?.location||""};
                const meta=[`대출일: ${item.rental_date||"-"}`,`반납 예정일: ${item.due_date||"-"}`,item.book?.book_status==="RESERVED"?"다음 예약자가 있어 빠른 반납이 필요해요.":null].filter(Boolean);
                return <BookListItem key={item.id} book={book} cover={item.book?.image_url||printnull} detailTo={`/BookPage/${bookCode}`} statusLabel={`${item.overdue_days||0}일 연체`} statusTone="danger" meta={meta}/>;
              })}
            </div>
          ):null}
        </section>
      </PageContainer>
      <Footer/>
    </AppShell>
  );
}
