import React from "react";
import "../../Css/loginstyle.css";

import AuthLayout from "../../Components/layout/AuthLayout";

const KAKAO_SUPPORT_URL="http://pf.kakao.com/_pHxbDn";

export default function ResetPassword(){
  return (
    <AuthLayout
      title="비밀번호 찾기"
      description="비밀번호 변경은 관리자 확인 후 진행하고 있어요."
      backTo="/LoginPage"
    >
      <div className="auth-inquiry">
        <div className="auth-inquiry__copy">
          <strong>비밀번호를 잊으셨나요?</strong>
          <p>문중문고 카카오톡으로 문의해주시면 본인 확인 후 비밀번호 변경을 도와드려요.</p>
        </div>
        <a
          className="ui-button ui-button--primary ui-button--lg ui-button--block auth-inquiry__cta"
          href={KAKAO_SUPPORT_URL}
          target="_blank"
          rel="noopener noreferrer"
        >
          카카오톡으로 문의하기
        </a>
        <p className="auth-support">이 화면에서는 이름, 아이디, 전화번호를 별도로 입력받거나 서버로 전송하지 않아요.</p>
      </div>
    </AuthLayout>
  );
}
