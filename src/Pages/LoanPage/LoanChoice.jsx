import React from "react";
import { Link } from "react-router-dom";
import "../../Css/Loan.css";

import Footer from "../../Components/Footer";
import AppHeader from "../../Components/layout/AppHeader";
import AppShell from "../../Components/layout/AppShell";
import PageContainer from "../../Components/layout/PageContainer";
import Icon from "../../Components/ui/Icon";

export default function LoanChoice(){
  return (
    <AppShell>
      <AppHeader title="대출·반납" backTo="/"/>
      <PageContainer>
        <section className="loan-choice">
          <div className="loan-choice__intro">
            <h1>무엇을 하시겠어요?</h1>
            <p>도서 등록번호를 준비한 뒤 원하는 작업을 선택해주세요.</p>
          </div>

          <div className="loan-choice__grid">
            <Link className="loan-choice__card" to="/LoanLoan">
              <span className="loan-choice__icon"><Icon name="book" size={28}/></span>
              <span className="loan-choice__copy">
                <strong>대출하기</strong>
                <small>도서 등록번호를 입력해 대출을 진행해요.</small>
              </span>
              <Icon name="chevron-right"/>
            </Link>

            <Link className="loan-choice__card" to="/LoanReturn">
              <span className="loan-choice__icon"><Icon name="loan" size={28}/></span>
              <span className="loan-choice__copy">
                <strong>반납하기</strong>
                <small>대출 중인 도서를 등록번호로 반납해요.</small>
              </span>
              <Icon name="chevron-right"/>
            </Link>
          </div>
        </section>
      </PageContainer>
      <Footer/>
    </AppShell>
  );
}
