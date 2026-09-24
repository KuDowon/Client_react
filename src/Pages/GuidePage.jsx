import React,{useState} from "react";
import "../Css/GuidePage.css";

import Footer from "../Components/Footer";
import AppHeader from "../Components/layout/AppHeader";
import AppShell from "../Components/layout/AppShell";
import PageContainer from "../Components/layout/PageContainer";

import info1 from "../Images/info1.png";
import info2 from "../Images/info2.png";
import info3 from "../Images/info3.png";
import info4 from "../Images/info4.png";
import info5 from "../Images/info5.png";

const UseContent=()=>{
  const images=[info1,info2,info3,info4,info5];
  return <div className="guide-images">{images.map((src,index)=><img key={index} src={src} alt={`이용안내 이미지 ${index+1}`}/>)}</div>;
};

const SitemapContent=()=>(
  <div className="guide-prose">
    <h2>사이트맵</h2>
    <p>추후 업데이트 될 예정입니다!</p>
  </div>
);

const InfouseContent=()=>(
  <div className="guide-prose">
    <h2>이용약관 및 개인정보처리방침</h2>
    <p>중앙대학교 문헌정보학과 문중문고(이하 “문중문고”라 한다.)는 정보주체의 자유와 권리 보호를 위해 「개인정보 보호법」 및 관계 법령이 정한 바를 준수하여, 적법하게 개인정보를 처리하고 안전하게 관리하고 있습니다.

이에 「개인정보 보호법」 제30조에 따라 정보주체에게 개인정보 처리에 관한 절차 및 기준을 안내하고, 이와 관련된 고충을 신속하고 원활하게 처리할 수 있도록 하기 위하여 다음과 같이 개인정보 처리방침을 수립·공개합니다.

이 방침은 별도의 설명이 없는 한 문중문고에서 운용하는 모든 웹 사이트에 적용됨을 알려드립니다.</p>
    <p>- 개인정보의 처리 목적
 문중문고는 다음의 목적을 위하여 개인정보를 처리하며, 처리하고 있는 개인정보는 서비스 제공, 서비스 제공을 위한 알림 이외의 용도로는 이용되지 않으며, 이용 목적이 변경되는 경우에는 개인정보 보호법 제18조에 따라 별도의 동의를 받는 등 필요한 조치를 이행할 예정입니다.</p>
    <p>- 개인정보의 처리 및 보유 기간
 문중문고에서 처리하는 개인정보는 법령에 따른 개인정보 보유․이용 기간 또는 정보주체로부터 개인정보를 수집 시에 동의받은 개인정보 보유․이용 기간 내에서 개인정보를 처리․보유합니다.</p>
    <p>- 처리하는 개인정보의 항목
 문중문고에서 처리하는 개인정보항목은 소관업무 및 법령에서 정한 최소한의 개인정보 항목만을 처리하며, 정보주체의 동의를 받아 개인정보를 수집하는 경우 필요한 최소한의 정보 외의 개인정보 수집에는 동의하지 아니할 수 있다는 사실을 구체적으로 알리고 개인정보를 수집합니다.
수집목적 : 문중문고의 대출, 반납, 예약, 리뷰 등의 문중문고 서비스 총체의 제공
수집 항목 : 이름, 아이디, 비밀번호, 전화번호
보유 및 이용기간: 회원 탈퇴 혹은 정보주체의 파기 요청 전
모든 개인정보는 문중문고 사이트 회원 탈퇴 시 혹은 개인의 요청 전까지 보관합니다. 사이트 회원 탈퇴 및 개인의 요청은 '마이페이지-오류 문의'항목에서 가능합니다.</p>
    <p>- 개인정보의 제3자 제공에 관한 사항
 문중문고는 정보주체의 개인정보를 제1조(개인정보의 처리 목적)에서 명시한 범위 내에서만 처리하며, 정보주체의 동의, 법률의 특별한 규정 등 ｢개인정보 보호법｣ 제17조 및 제18조에 해당하는 경우에만 개인정보를 제3자에게 제공합니다.</p>
    <p>- 개인정보의 파기절차 및 파기방법
 문중문고는 개인정보 보유기간의 경과하거나, 처리 목적이 달성된 경우에는 지체없이 해당 개인정보를 파기합니다.
개인정보 파기의 절차 및 방법은 다음과 같습니다.
1. 파기절차
1) 문중문고는 불필요한 개인정보는 개인정보파기 계획을 수립하여 파기합니다.
2) 문중문고는 파기 사유가 발생한 개인정보를 선정하고, 문중문고 개인정보 보호책임자의 승인을 받아 개인정보를 파기합니다.
2. 파기방법
1) 문중문고는 전자적 파일 형태로 기록·저장된 개인정보는 기록을 재생할 수 없는 기술적 방법을 사용합니다.
2) 종이 문서에 기록․저장된 개인정보는 분쇄기로 분쇄하거나 소각하여 파기합니다.
- 정보주체와 법정대리인의 권리‧의무 및 그 행사방법에 관한 사항
1) 정보주체는 문중문고에 대해 언제든지 개인정보 열람․정정․삭제․처리정지 요구 등의 권리를 행사할 수 있습니다.
2) 문중문고는 정보주체 권리에 따른 열람의 요구, 정정·삭제의 요구, 처리정지의 요구 시 열람 등 요구를 한 자가 본인이거나 정당한 대리인인지를 확인합니다.</p>
    <p>- 개인정보 보호책임자에 관한 사항
 문중문고는 개인정보 처리에 관한 업무를 총괄해서 책임지고, 개인정보 처리와 관련한 정보주체의 불만처리 및 피해구제 등을 위하여 아래와 같이 개인정보 보호책임자 및 개인정보 담당자를 지정하고 있습니다.
개인정보보호책임자 및 담당자 연락처 : '마이페이지-오류 문의' 창구 이용</p>
    <p>- 개인정보 처리방침의 변경에 관한 사항
이 개인정보처리방침은 2025. 09. 01.부터 적용됩니다.</p>
  </div>
);

const MakeContent=()=>(
  <div className="guide-prose">
    <h2>만든 사람들</h2>
    <p>1.0.0</p>
    <h3>프론트엔드</h3>
    <p>구도원 | 팀장<br/>정희은 | HTML 취합, 공지사항 및 큐레이션<br/>고다연 | REACT 검색결과<br/>심규리 | 메인페이지<br/>이다은 | 회원가입<br/>구도언 | 마이페이지<br/>김민서 | 상세서지<br/>오은성 | REACT</p>
    <h3>백엔드</h3>
    <p>정현수 | 팀장<br/>이서현 | 리뷰 작성 기능 + 기본 대출 기능 일부<br/>남수정 | 검색 기능 + 리뷰 조회 기능<br/>김민채 | 예약 기능</p>
  </div>
);

export default function GuidePage(){
  const [activeTab,setActiveTab]=useState("use");
  const contentMap={use:<UseContent/>,sitemap:<SitemapContent/>,infouse:<InfouseContent/>,make:<MakeContent/>};

  return (
    <AppShell>
      <AppHeader title="이용안내" backTo="/"/>
      <PageContainer>
        <section className="guide-page">
          <div className="guide-page__intro">
            <h1>문중문고 이용안내</h1>
            <p>서비스 이용 방법과 운영 정보를 확인할 수 있어요.</p>
          </div>

          <div className="guide-tabs" role="tablist" aria-label="이용안내 메뉴">
            {[
              ["use","이용안내"],["sitemap","사이트맵"],["infouse","이용약관·개인정보"],["make","만든 사람들"]
            ].map(([key,label])=>(
              <button key={key} type="button" role="tab" aria-selected={activeTab===key} className={activeTab===key?"active":""} onClick={()=>setActiveTab(key)}>{label}</button>
            ))}
          </div>

          <div className="guide-page__content">{contentMap[activeTab]}</div>
        </section>
      </PageContainer>
      <Footer/>
    </AppShell>
  );
}
