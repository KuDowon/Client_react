import React,{useCallback,useEffect,useState} from "react";
import "../../Css/MyPage.css";

import Footer from "../../Components/Footer";
import AppHeader from "../../Components/layout/AppHeader";
import AppShell from "../../Components/layout/AppShell";
import PageContainer from "../../Components/layout/PageContainer";
import Button from "../../Components/ui/Button";
import Dialog from "../../Components/ui/Dialog";
import EmptyState from "../../Components/ui/EmptyState";
import Icon from "../../Components/ui/Icon";
import Skeleton from "../../Components/ui/Skeleton";

const BASE_URL="https://mungo.n-e.kr";
const authHeaders=()=>{
  const access=localStorage.getItem("accessToken");
  return {"Content-Type":"application/json",...(access?{Authorization:`Bearer ${access}`}:{})};
};

const fetchJSON=async(path,{method="GET",body,auth=true,headers={}}={})=>{
  const response=await fetch(`${BASE_URL}${path}`,{
    method,
    headers:{Accept:"application/json",...(auth?authHeaders():{}),...headers},
    body:body?JSON.stringify(body):undefined,
  });
  const text=await response.text();
  const json=text?JSON.parse(text):null;
  if(!response.ok){
    const message=json?.detail||json?.message||`HTTP ${response.status}`;
    const error=new Error(message);
    error.status=response.status;
    error.payload=json;
    throw error;
  }
  return json;
};

const fetchReviews=async()=>{
  const token=localStorage.getItem("accessToken");
  if(!token)return [];
  try{
    const data=await fetchJSON("/reviews/",{method:"GET",auth:true});
    return data.map((item)=>({
      id:item.id,
      bookTitle:item.book_title||"제목 없음",
      content:item.content||"내용 없음",
      date:item.created_at?item.created_at.substring(0,10):"날짜 미상",
    }));
  }catch(error){
    console.error("내 리뷰 정보 불러오기 실패:",error);
    return [];
  }
};

export default function MyReviewsPage(){
  const [reviews,setReviews]=useState([]);
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState(null);
  const [alertMessage,setAlertMessage]=useState("");
  const [editingReview,setEditingReview]=useState(null);
  const [editContent,setEditContent]=useState("");
  const [editError,setEditError]=useState("");

  const loadReviews=useCallback(async()=>{
    try{
      const list=await fetchReviews();
      setReviews(list);
    }catch(err){setError(err.message);}finally{setLoading(false);}
  },[]);

  useEffect(()=>{loadReviews();},[loadReviews]);

  const handleEditClick=(review)=>{
    setEditingReview({id:review.id,title:review.bookTitle});
    setEditContent(review.content);
    setEditError("");
  };

  const handleUpdateReview=()=>{
    if(!editContent.trim()){
      setEditError("리뷰 내용을 입력해주세요.");
      return;
    }

    const reviewId=editingReview.id;
    setReviews((previous)=>previous.map((review)=>review.id===reviewId?{...review,content:editContent.trim()}:review));
    setEditingReview(null);
    setEditContent("");
    setAlertMessage("현재 화면의 리뷰 내용을 수정했습니다. 서버 저장 API가 연결되어 있지 않아 새로고침하면 원래 내용이 표시될 수 있어요.");
  };

  return (
    <AppShell>
      <AppHeader title={`내 도서 리뷰 ${reviews.length}`} backTo="/MyPage"/>
      <PageContainer>
        <section className="review-page">
          {loading?(
            <div className="mypage-v2__loading"><Skeleton width="100%" height={96}/><Skeleton width="100%" height={96}/></div>
          ):error?(
            <EmptyState icon="alert" title="리뷰를 불러오지 못했어요." description={error}/>
          ):reviews.length===0?(
            <EmptyState icon="edit" title="작성한 리뷰가 없어요." description="도서 상세 페이지에서 읽은 책의 리뷰를 남겨보세요."/>
          ):(
            <div className="review-page__list">
              {reviews.map((review)=>(
                <article className="review-page__item" key={review.id}>
                  <div className="review-page__meta">
                    <div>
                      <h2 className="review-page__book">{review.bookTitle}</h2>
                      <time className="review-page__date">{review.date}</time>
                    </div>
                    <Button variant="tertiary" size="sm" onClick={()=>handleEditClick(review)}>
                      <Icon name="edit" size={16}/>수정
                    </Button>
                  </div>
                  <p className="review-page__content">{review.content}</p>
                </article>
              ))}
            </div>
          )}
        </section>
      </PageContainer>
      <Footer/>

      <Dialog
        open={Boolean(editingReview)}
        title={editingReview?`${editingReview.title} 리뷰 수정`:"리뷰 수정"}
        confirmLabel="수정"
        cancelLabel="취소"
        onConfirm={handleUpdateReview}
        onClose={()=>{setEditingReview(null);setEditError("");}}
      >
        <div className="review-page__editor">
          <textarea value={editContent} onChange={(event)=>{setEditContent(event.target.value);if(editError)setEditError("");}} rows={5} placeholder="수정할 리뷰 내용을 입력하세요." aria-label="리뷰 내용"/>
          {editError?<p className="review-page__editor-error" role="alert">{editError}</p>:null}
        </div>
      </Dialog>

      <Dialog open={Boolean(alertMessage)} title="리뷰 수정 안내" confirmLabel="확인" hideCancel onConfirm={()=>setAlertMessage("")} onClose={()=>setAlertMessage("")}>{alertMessage}</Dialog>
    </AppShell>
  );
}
