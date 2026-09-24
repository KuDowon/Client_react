import { Routes, Route, Link } from 'react-router-dom';
import './Css/tokens.css';
import './Css/font.css';
import './Css/base.css';
import './Css/layout.css';
import './Css/toolkit.css';
import './Css/ui.css';
import './Css/library.css';

/* MainPage */
import MainPage from './Pages/MainPage.jsx';
import NoticePage from './Pages/NoticePage.jsx';
import CurationPage from './Pages/CurationPage.jsx';
import GuidePage from './Pages/GuidePage.jsx';
/*Current*/
import CurrentBorrow from './Pages/CurrentBorrow.jsx';
import CurrentOverdue from './Pages/CurrentOverdue.jsx';
import CurrentReserve from './Pages/CurrentReserve.jsx';

/* Login */
import LoginPage from './Pages/Login/LoginPage.jsx';
import ResetPassword from './Pages/Login/ResetPassword.jsx';
import FindId from './Pages/Login/FindId.jsx';
import SignUp from './Pages/Login/SignUp.jsx';

/* Search */
import SearchPage from './Pages/SearchPage.jsx';
import BookPage from './Pages/BookPage.jsx';

/* MyPage */
import MyPage from './Pages/MyPage/MyPage.jsx';
import MyReviewsPage from './Pages/MyPage/MyReviewsPage.jsx';
import EditProfilePage from './Pages/MyPage/EditProfilePage.jsx';

/* Loan */
import LoanChoice from './Pages/LoanPage/LoanChoice.jsx';
import LoanLoan from './Pages/LoanPage/LoanLoan.jsx';
import LoanReturn from './Pages/LoanPage/LoanReturn.jsx';

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<MainPage />} />

        {/* 현재 대출/연체/예약 */}
        <Route path="/CurrentBorrow" element={<CurrentBorrow />} />
        <Route path="/CurrentOverdue" element={<CurrentOverdue />} />
        <Route path="/CurrentReserve" element={<CurrentReserve/>} />
        <Route
          path="/current_reserve"
          element={
            <>
              <div className="top-bar">
                <Link to="/" className="back-btn" aria-label="뒤로가기">←</Link>
                <span className="top-tittle">현재 예약 중인 도서</span>
              </div>
              
            </>
          }
        />

        {/* 일반 페이지 */}
        <Route path="/NoticePage" element={<NoticePage />} />
        <Route path="/CurationPage" element={<CurationPage />} />
        <Route path="/GuidePage" element={<GuidePage />} />

        {/* 로그인/회원 */}
        <Route path="/LoginPage" element={<LoginPage />} />
        <Route path="/ResetPassword" element={<ResetPassword />} />
        <Route path="/FindId" element={<FindId />} />
        <Route path="/SignUp" element={<SignUp />} />

        {/* 검색 결과 */}
        <Route path="/search" element={<SearchPage />} />
        {/* ✅ bookId만 받음 */}
        <Route path="/BookPage/:bookId" element={<BookPage />} />


        {/* 마이페이지 */}
        <Route path="/MyPage" element={<MyPage />} />
        <Route path="/EditProfilePage" element={<EditProfilePage />} />
        <Route path="/MyReviewsPage" element={<MyReviewsPage />} />

        {/* 대출/반납 */}
        <Route path="/LoanChoice" element={<LoanChoice />} />
        <Route path="/LoanLoan" element={<LoanLoan />} />
        <Route path="/LoanReturn" element={<LoanReturn />} />
      </Routes>
    </div>
  );
}

export default App;
