import React,{useState} from "react";
import "../Css/Curation.css";

import Footer from "../Components/Footer";
import AppHeader from "../Components/layout/AppHeader";
import AppShell from "../Components/layout/AppShell";
import PageContainer from "../Components/layout/PageContainer";
import EmptyState from "../Components/ui/EmptyState";

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

          <div className="curation-tabs" role="tablist" aria-label="큐레이션 종류">
            <button type="button" role="tab" aria-selected={activeTab==="guide"} className={activeTab==="guide"?"active":""} onClick={()=>handleTabClick("guide")}>강의 교재·자료</button>
            <button type="button" role="tab" aria-selected={activeTab==="notice"} className={activeTab==="notice"?"active":""} onClick={()=>handleTabClick("notice")}>추천도서</button>
          </div>

          {activeTab==="guide"?(
            <div className="curation-subtabs" role="tablist" aria-label="교재 분야">
              {[
                ["basic","전공기초"],["required","전공필수"],["major","전공"],["liberal","교양"],["related","타전공"]
              ].map(([key,label])=>(
                <button key={key} type="button" role="tab" aria-selected={activeSubTab===key} className={activeSubTab===key?"active":""} onClick={()=>setActiveSubTab(key)}>{label}</button>
              ))}
            </div>
          ):null}

          <div className="curation-page__content">
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
