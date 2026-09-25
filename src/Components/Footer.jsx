import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import BottomNavigation from "./layout/BottomNavigation";
import Dialog from "./ui/Dialog";

const isLoggedIn = () => Boolean(localStorage.getItem("accessToken"));

function Footer() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleLoanReturn = () => {
    if (isLoggedIn()) {
      navigate("/LoanChoice");
    } else {
      setIsModalOpen(true);
    }
  };

  const handleLoginNavigate = () => {
    setIsModalOpen(false);
    navigate("/LoginPage", {
      state: {
        returnTo: "/LoanChoice",
        from: location.pathname + location.search
      }
    });
  };

  return (
    <>
      <BottomNavigation onLoanReturn={handleLoanReturn} />
      <Dialog
        open={isModalOpen}
        title="로그인이 필요한 서비스예요"
        confirmLabel="로그인"
        cancelLabel="닫기"
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleLoginNavigate}
      >
        대출·반납을 이용하려면 먼저 로그인해주세요.
      </Dialog>
    </>
  );
}

export default Footer;
