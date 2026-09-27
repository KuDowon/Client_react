import React,{useState} from "react";
import {useNavigate} from "react-router-dom";
import {submitLoanRequest} from "../../Api/loan.js";
import "../../Css/Loan.css";

import Footer from "../../Components/Footer";
import LoanForm from "../../Components/LoanForm";
import AppHeader from "../../Components/layout/AppHeader";
import AppShell from "../../Components/layout/AppShell";
import PageContainer from "../../Components/layout/PageContainer";
import Dialog from "../../Components/ui/Dialog";

export default function LoanLoan(){
  const [isModalOpen,setIsModalOpen]=useState(false);
  const [modalMessage,setModalMessage]=useState("");
  const [resultKind,setResultKind]=useState("success");
  const navigate=useNavigate();

  const openModal=(message,kind)=>{
    setModalMessage(message);
    setResultKind(kind);
    setIsModalOpen(true);
  };

  const handleLoanSubmit=async(bookId)=>{
    try{
      await submitLoanRequest(bookId);
      openModal("대출이 완료되었습니다.","success");
    }catch(error){
      openModal(error.message?.replace(/^❌\s*/,"")||"대출 처리 중 오류가 발생했습니다.","error");
      console.error("[LoanLoan] Error caught in UI:",error.message);
    }
  };

  const caption=(
    <>
      <p>대출 기간과 연장 가능 여부는 도서관 운영 정책을 따릅니다.</p>
      <p>예약자가 있는 도서는 연속 대출이 제한될 수 있어요.</p>
      <p>연체 시 연체 기간에 따라 대출이 제한될 수 있어요.</p>
    </>
  );

  return (
    <AppShell>
      <AppHeader title="대출하기" backTo="/LoanChoice"/>
      <PageContainer>
        <section className="loan-action">
          <div className="loan-action__intro">
            <h1>도서 등록번호를 입력해주세요.</h1>
            <p>책에 표시된 MJ로 시작하는 등록번호를 확인해주세요.</p>
          </div>
          <LoanForm onSubmit={handleLoanSubmit} buttonText="대출하기" caption={caption}/>
        </section>
      </PageContainer>
      <Footer/>

      <Dialog
        open={isModalOpen}
        title={resultKind==="success"?"대출이 완료됐어요.":"대출을 처리하지 못했어요."}
        confirmLabel={resultKind==="success"?"메인으로":"확인"}
        cancelLabel={resultKind==="success"?"더 대출하기":"닫기"}
        hideCancel={resultKind!=="success"}
        onClose={()=>setIsModalOpen(false)}
        onConfirm={()=>resultKind==="success"?navigate("/"):setIsModalOpen(false)}
      >
        {modalMessage}
      </Dialog>
    </AppShell>
  );
}
