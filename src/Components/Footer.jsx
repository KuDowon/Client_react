import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import BottomNavigation from "./layout/BottomNavigation";
import Dialog from "./ui/Dialog";

const isLoggedIn = () => Boolean(localStorage.getItem("accessToken"));

function Footer() {
  const navigate = useNavigate();
  const location = useLocation();
  const [loginPrompt, setLoginPrompt] = useState(null);

  const openProtectedRoute = (target, service) => {
    if (isLoggedIn()) {
      navigate(target);
      return;
    }

    setLoginPrompt({ target, service });
  };

  const handleLoanReturn = () => {
    openProtectedRoute("/LoanChoice", "대출·반납");
  };

  const handleMy = () => {
    openProtectedRoute("/MyPage", "마이");
  };

  const handleLoginNavigate = () => {
    if (!loginPrompt) return;

    const target = loginPrompt.target;
    setLoginPrompt(null);
    navigate("/LoginPage", {
      state: {
        returnTo: target,
        from: location.pathname + location.search
      }
    });
  };

  return (
    <>
      <BottomNavigation onLoanReturn={handleLoanReturn} onMy={handleMy} />
      <Dialog
        open={Boolean(loginPrompt)}
        title="로그인이 필요한 서비스예요"
        confirmLabel="로그인"
        cancelLabel="닫기"
        onClose={() => setLoginPrompt(null)}
        onConfirm={handleLoginNavigate}
      >
        {loginPrompt?.service}를 이용하려면 먼저 로그인해주세요.
      </Dialog>
    </>
  );
}

export default Footer;
