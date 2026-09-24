import React,{useEffect,useState} from "react";
import {useNavigate} from "react-router-dom";
import {getMyPage} from "../../Api/user";
import "../../Css/MyPage.css";

import Footer from "../../Components/Footer";
import AppHeader from "../../Components/layout/AppHeader";
import AppShell from "../../Components/layout/AppShell";
import PageContainer from "../../Components/layout/PageContainer";
import LibraryStatusSummary from "../../Components/library/LibraryStatusSummary";
import Button from "../../Components/ui/Button";
import EmptyState from "../../Components/ui/EmptyState";
import Icon from "../../Components/ui/Icon";
import IconButton from "../../Components/ui/IconButton";
import SectionHeader from "../../Components/ui/SectionHeader";
import Skeleton from "../../Components/ui/Skeleton";

export default function MyPage(){
  const [user,setUser]=useState(null);
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState("");
  const [borrowCount,setBorrowCount]=useState(null);
  const [overdueCount,setOverdueCount]=useState(null);
  const [reserveCount,setReserveCount]=useState(null);
  const navigate=useNavigate();

  useEffect(()=>{
    let abort=false;
    (async()=>{
      try{
        const me=await getMyPage();
        if(!abort)setUser(me);
      }catch(error){
        if(!abort){
          console.error("마이페이지 정보 로드 중 오류 발생:",error);
          if(error.message!=="Unauthorized")setError("정보를 불러오지 못했습니다.");
        }
      }finally{
        if(!abort)setLoading(false);
      }
    })();
    return()=>{abort=true;};
  },[]);

  useEffect(()=>{
    const borrow=localStorage.getItem("borrowCount");
    const overdue=localStorage.getItem("overdueCount");
    const reserve=localStorage.getItem("reserveCount");
    setBorrowCount(borrow!==null?Number(borrow):null);
    setOverdueCount(overdue!==null?Number(overdue):null);
    setReserveCount(reserve!==null?Number(reserve):null);
  },[]);

  return (
    <AppShell>
      <AppHeader title="마이" backTo="/"/>
      <PageContainer>
        <section className="mypage-v2">
          {loading?(
            <div className="mypage-v2__loading">
              <Skeleton width={180} height={30}/>
              <Skeleton width="100%" height={120} radius={12}/>
              <Skeleton width="100%" height={160} radius={12}/>
            </div>
          ):error?(
            <EmptyState icon="alert" title="내 정보를 불러오지 못했어요." description={error}/>
          ):!user?(
            <EmptyState
              icon="user"
              title="로그인이 필요한 서비스예요."
              description="내 정보와 대출·예약 현황을 확인하려면 로그인해주세요."
              action={<Button onClick={()=>navigate("/LoginPage")}>로그인하기</Button>}
            />
          ):(
            <>
              <section className="mypage-v2__profile">
                <div className="mypage-v2__profile-top">
                  <div>
                    <p className="mypage-v2__eyebrow">내 정보</p>
                    <h1>{user.name}</h1>
                  </div>
                  <IconButton icon="settings" label="회원정보 수정" variant="outline" onClick={()=>navigate("/EditProfilePage")}/>
                </div>
                <dl className="mypage-v2__profile-meta">
                  <div><dt>아이디</dt><dd>{user.username||"-"}</dd></div>
                  <div><dt>회원 구분</dt><dd>{user.userType||"-"}</dd></div>
                  <div><dt>전화번호</dt><dd>{user.phone||"-"}</dd></div>
                </dl>
              </section>

              <section className="mypage-v2__section">
                <SectionHeader title="이용 현황"/>
                <LibraryStatusSummary borrowCount={borrowCount} reserveCount={reserveCount} overdueCount={overdueCount}/>
              </section>

              <section className="mypage-v2__section">
                <SectionHeader title="내 활동"/>
                <div className="mypage-v2__menu">
                  <button type="button" onClick={()=>navigate("/MyReviewsPage")}><span><Icon name="edit"/>내가 쓴 리뷰</span><Icon name="chevron-right"/></button>
                  <a href="https://forms.gle/bM5gdDtrqMD6v3kj9" target="_blank" rel="noopener noreferrer"><span><Icon name="book"/>희망도서 신청</span><Icon name="chevron-right"/></a>
                  <a href="http://pf.kakao.com/_pHxbDn" target="_blank" rel="noopener noreferrer"><span><Icon name="info"/>오류 문의</span><Icon name="chevron-right"/></a>
                </div>
              </section>

              <section className="mypage-v2__section">
                <SectionHeader title="도서 이용"/>
                <div className="mypage-v2__menu">
                  <button type="button" onClick={()=>navigate("/CurrentBorrow")}><span><Icon name="book"/>대출 도서</span><Icon name="chevron-right"/></button>
                  <button type="button" onClick={()=>navigate("/CurrentReserve")}><span><Icon name="clock"/>예약 도서</span><Icon name="chevron-right"/></button>
                  <button type="button" onClick={()=>navigate("/CurrentOverrdue")}><span><Icon name="alert"/>연체 도서</span><Icon name="chevron-right"/></button>
                </div>
              </section>
            </>
          )}
        </section>
      </PageContainer>
      <Footer/>
    </AppShell>
  );
}
