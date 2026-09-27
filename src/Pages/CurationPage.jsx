import React,{useState} from "react";
import "../Css/Curation.css";

import Footer from "../Components/Footer";
import AppHeader from "../Components/layout/AppHeader";
import AppShell from "../Components/layout/AppShell";
import PageContainer from "../Components/layout/PageContainer";
import EmptyState from "../Components/ui/EmptyState";
import Tabs from "../Components/ui/Tabs";

const CURATION_DATA={
  guide:{
    basic:{title:"25-10-31 업데이트 예정",books:[]},
    required:{title:"전공필수",books:[]},
    major:{title:"전공",books:[]},
    liberal:{title:"교양",books:[]},
    related:{title:"타전공",books:[]},
  },
  notice:{title:"11월 큐레이션 예정",books:[]},
};

export default function CurationPage(){
  const [activeTab,setActiveTab]=useState("guide");
  const [activeSubTab,setActiveSubTab]=useState("basic");

  const handleTabClick=(tab)=>{
    setActiveTab(tab);
    if(tab==="guide")setActiveSubTab("basic");
  };

  const data=activeTab==="notice"?CURATION_DATA.notice:CURATION_DATA.guide[activeSubTab];

  return (
    <AppShell>
      <AppHeader title="북큐레이션" backTo="/"/>
      <PageContainer>
        <section className="curation-page">
          <div className="curation-page__intro">
            <h1>북큐레이션</h1>
            <p>수업과 관심사에 맞는 도서를 둘러보세요.</p>
          </div>

          <Tabs
            idPrefix="curation-main"
            className="curation-tabs"
            ariaLabel="큐레이션 종류"
            value={activeTab}
            onChange={handleTabClick}
            tabs={[
              {value:"guide",label:"강의 교재·자료"},
              {value:"notice",label:"추천도서"}
            ]}
          />

          {activeTab==="guide"?(
            <Tabs
              idPrefix="curation-sub"
              className="curation-subtabs"
              ariaLabel="교재 분야"
              value={activeSubTab}
              onChange={setActiveSubTab}
              tabs={[
                {value:"basic",label:"전공기초"},
                {value:"required",label:"전공필수"},
                {value:"major",label:"전공"},
                {value:"liberal",label:"교양"},
                {value:"related",label:"타전공"}
              ]}
            />
          ):null}

          <div className="curation-page__content" role="tabpanel" id={`curation-main-panel-${activeTab}`} aria-labelledby={`curation-main-tab-${activeTab}`} tabIndex={0}>
            {data.books.length===0?(
              <EmptyState icon="book" title={data.title} description="도서 목록을 준비하고 있어요."/>
            ):(
              <div className="curation-books">
                {data.books.map((book)=>(
                  <article className="curation-book" key={book.id}>
                    <img src={book.img} alt={`${book.title} 표지`}/>
                    <div><strong>{book.title}</strong><span>{book.author}</span></div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>
      </PageContainer>
      <Footer/>
    </AppShell>
  );
}
