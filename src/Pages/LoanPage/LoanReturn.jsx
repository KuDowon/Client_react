import React,{useState} from "react";
import {useNavigate} from "react-router-dom";
import "../../Css/Loan.css";

import Footer from "../../Components/Footer";
import LoanForm from "../../Components/LoanForm";
import AppHeader from "../../Components/layout/AppHeader";
import AppShell from "../../Components/layout/AppShell";
import PageContainer from "../../Components/layout/PageContainer";
import Dialog from "../../Components/ui/Dialog";

const BASE_URL="https://mungo.n-e.kr";
const getAuthHeaders=()=>{
  const token=localStorage.getItem("accessToken");
  return token?{Authorization:`Bearer ${token}`}:{};
};

async function fetchJSON(path,{method="GET",body,auth=false,headers={},timeoutMs=8000}={}){
  const controller=new AbortController();
  const timer=setTimeout(()=>controller.abort("timeout"),timeoutMs);
  const baseHeaders={Accept:"application/json",...(auth?getAuthHeaders():{}),...headers};
  if(method!=="GET"||body!=null)baseHeaders["Content-Type"]="application/json";

  let response;
  try{
    response=await fetch(`${BASE_URL}${path}`,{
      method,
      headers:baseHeaders,
      body:body?JSON.stringify(body):undefined,
      signal:controller.signal,
    });
  }finally{
    clearTimeout(timer);
  }

  const contentType=response.headers.get("content-type")||"";
  const text=await response.text();
  if(!contentType.includes("application/json")){
    throw new Error(`Expected JSON but got ${contentType} ${response.status} at ${response.url}. Body: ${text.slice(0,120)}`);
  }

  const json=text?JSON.parse(text):null;
  if(!response.ok){
    const message=json?.detail||json?.message||`HTTP ${response.status}`;
    const error=new Error(message);
    error.status=response.status;
    error.payload=json;
    throw error;
  }
  return json;
}

export default function LoanReturn(){
  const [isModalOpen,setIsModalOpen]=useState(false);
  const [modalMessage,setModalMessage]=useState("");
  const [resultKind,setResultKind]=useState("success");
  const navigate=useNavigate();

  const openModal=(message,kind)=>{
    setModalMessage(message);
    setResultKind(kind);
    setIsModalOpen(true);
  };

  const handleReturnSubmit=async(bookCode)=>{
    const normalizedCode=(bookCode||"").trim();
    if(!normalizedCode){
      openModal("도서 코드를 입력해주세요.","error");
      return;
    }

    try{
      const rentalsData=await fetchJSON("/rentals/current/",{auth:true});
      const rentalItem=rentalsData.find((item)=>!item.is_returned&&item.book?.book_code===normalizedCode);

      if(!rentalItem){
        openModal("대출 중인 도서가 아닙니다.","error");
        return;
      }

      const response=await fetchJSON(`/rentals/${rentalItem.id}/`,{
        method:"PATCH",
        auth:true,
        body:{is_returned:true},
      });

      const returnMessage=response.message||"반납되었습니다.";
      const returnDate=response.data?.return_date||new Date().toISOString().substring(0,10);
      const overdueDays=response.data?.is_overdue&&response.data?.overdue_days>0?response.data.overdue_days:0;
      openModal(
        overdueDays>0
          ? `${returnMessage} 반납일: ${returnDate} · ${overdueDays}일 연체`
          : `${returnMessage} 반납일: ${returnDate}`,
        "success"
      );
    }catch(error){
      console.error("[RETURN] fail:",error);
      let message="반납 중 알 수 없는 오류가 발생했습니다. 잠시 후 다시 시도해주세요.";
      if(error.payload&&Array.isArray(error.payload.message)){
        message=error.payload.message[0];
      }else if(error.status){
        message=error.payload?.detail||error.payload?.message||`HTTP ${error.status} 오류`;
      }
      openModal(message,"error");
    }
  };

  const caption=(
    <>
      <p>예약자가 있는 도서는 반납 후 연속 대출이 제한될 수 있어요.</p>
      <p>연체된 도서는 반납 후 연체 기간에 따라 대출이 제한될 수 있어요.</p>
    </>
  );

  return (
    <AppShell>
      <AppHeader title="반납하기" backTo="/LoanChoice"/>
      <PageContainer>
        <section className="loan-action">
          <div className="loan-action__intro">
            <h1>반납할 도서의 등록번호를 입력해주세요.</h1>
            <p>현재 대출 중인 도서인지 확인한 뒤 반납을 처리해요.</p>
          </div>
          <LoanForm onSubmit={handleReturnSubmit} buttonText="반납하기" caption={caption}/>
        </section>
      </PageContainer>
      <Footer/>

      <Dialog
        open={isModalOpen}
        title={resultKind==="success"?"반납이 완료됐어요.":"반납을 처리하지 못했어요."}
        confirmLabel={resultKind==="success"?"메인으로":"확인"}
        cancelLabel={resultKind==="success"?"더 반납하기":"닫기"}
        hideCancel={resultKind!=="success"}
        onClose={()=>setIsModalOpen(false)}
        onConfirm={()=>resultKind==="success"?navigate("/"):setIsModalOpen(false)}
      >
        {modalMessage}
      </Dialog>
    </AppShell>
  );
}
