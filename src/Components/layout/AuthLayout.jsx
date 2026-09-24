import React from "react";
import AppHeader from "./AppHeader";
import AppShell from "./AppShell";
import PageContainer from "./PageContainer";

export default function AuthLayout({title,description,backTo="/",children,footer}){
  return (
    <AppShell>
      <AppHeader title={title} backTo={backTo} showNavigation={false}/>
      <PageContainer>
        <section className="auth-layout">
          <div className="auth-layout__brand">문중문고</div>
          <div className="auth-layout__intro">
            <h1>{title}</h1>
            {description?<p>{description}</p>:null}
          </div>
          {children}
          {footer?<div className="auth-layout__footer">{footer}</div>:null}
        </section>
      </PageContainer>
    </AppShell>
  );
}
