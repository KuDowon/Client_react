import React,{useState} from "react";
import "../Css/NoticePage.css";

import Footer from "../Components/Footer";
import AppHeader from "../Components/layout/AppHeader";
import AppShell from "../Components/layout/AppShell";
import PageContainer from "../Components/layout/PageContainer";
import EmptyState from "../Components/ui/EmptyState";
import Icon from "../Components/ui/Icon";

import info1 from "../Images/info1.png";
import info2 from "../Images/info2.png";
import info3 from "../Images/info3.png";
import info4 from "../Images/info4.png";
import info5 from "../Images/info5.png";

const initialPosts=[{
  id:1,
  title:"문중문고 개관안내",
  content:[info1,info2,info3,info4,info5],
  date:"2025-10-13",
  isPinned:"True",
}];

export default function NoticePage(){
  const [posts]=useState(initialPosts);
  const [openPostId,setOpenPostId]=useState(null);
  const togglePost=(id)=>setOpenPostId((current)=>current===id?null:id);

  return (
    <AppShell>
      <AppHeader title="공지사항" backTo="/"/>
      <PageContainer>
        <section className="notice-page">
          <div className="notice-page__intro">
            <h1>공지사항</h1>
            <p>문중문고 운영과 이용에 필요한 소식을 확인하세요.</p>
          </div>

          {posts.length===0?(
            <EmptyState icon="info" title="등록된 공지가 없어요." description="새로운 소식이 등록되면 이곳에서 확인할 수 있어요."/>
          ):(
            <div className="notice-page__list">
              {posts.map((post)=>{
                const open=openPostId===post.id;
                const panelId=`notice-panel-${post.id}`;
                return (
                  <article className="notice-page__item" key={post.id}>
                    <button className="notice-page__trigger" type="button" aria-expanded={open} aria-controls={panelId} onClick={()=>togglePost(post.id)}>
                      <span>
                        {post.isPinned==="True"?<small>공지</small>:null}
                        <strong>{post.title}</strong>
                        <time>{post.date}</time>
                      </span>
                      <Icon name={open?"chevron-down":"chevron-right"}/>
                    </button>
                    {open?(
                      <div className="notice-page__content" id={panelId}>
                        {Array.isArray(post.content)
                          ?post.content.map((imageSrc,index)=><img key={index} src={imageSrc} alt={`공지 안내 이미지 ${index+1}`} />)
                          :<p>{post.content}</p>}
                      </div>
                    ):null}
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </PageContainer>
      <Footer/>
    </AppShell>
  );
}
