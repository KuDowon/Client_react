import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../Css/MainPage.css";

import Footer from "../Components/Footer";
import SearchBar from "../Components/SearchBar";
import AppShell from "../Components/layout/AppShell";
import AppHeader from "../Components/layout/AppHeader";
import PageContainer from "../Components/layout/PageContainer";
import LibraryStatusSummary from "../Components/library/LibraryStatusSummary";
import Icon from "../Components/ui/Icon";
import SectionHeader from "../Components/ui/SectionHeader";

import noticebanner from "../Images/banner.png";

const BASE_URL = "https://mungo.n-e.kr";

const getAuthHeaders = (token) => ({
  "Content-Type": "application/json",
  ...(token ? { Authorization: `Bearer ${token}` } : {}),
});

const fetchApi = async (path, token) => {
  try {
    const response = await fetch(`${BASE_URL}${path}`, {
      headers: getAuthHeaders(token),
    });
    if (response.ok) return await response.json();
    return null;
  } catch (error) {
    console.error(`[API 통신 오류] ${path}:`, error);
    return null;
  }
};

const fetchUserCounts = async (token, setBorrow, setOverdue, setReserve) => {
  if (!token) return;

  try {
    const rentals = await fetchApi("/rentals/current/", token);
    let nonOverdueCount = 0;
    let overdueCount = 0;

    if (rentals && Array.isArray(rentals)) {
      nonOverdueCount = rentals.filter((item) => !item.is_overdue).length;
      overdueCount = rentals.filter((item) => item.is_overdue).length;
    }

    setBorrow(nonOverdueCount);
    setOverdue(overdueCount);
    localStorage.setItem("borrowCount", nonOverdueCount.toString());
    localStorage.setItem("overdueCount", overdueCount.toString());

    const reservations = await fetchApi("/reservations/", token);
    let activeReserveCount = 0;

    if (reservations && Array.isArray(reservations)) {
      activeReserveCount = reservations.filter((item) => item.status === "ACTIVE").length;
    }

    setReserve(activeReserveCount);
    localStorage.setItem("reserveCount", activeReserveCount.toString());
  } catch (error) {
    console.error("메인 페이지 카운트 정보 갱신 실패:", error);
    setBorrow(0);
    setOverdue(0);
    setReserve(0);
    localStorage.setItem("borrowCount", "0");
    localStorage.setItem("overdueCount", "0");
    localStorage.setItem("reserveCount", "0");
  }
};

function getLoggedInUser() {
  const accessToken = localStorage.getItem("accessToken");
  const userID = localStorage.getItem("userID");
  return accessToken && userID ? { userID, accessToken } : null;
}

function MainPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(getLoggedInUser());
  const [borrowCount, setBorrowCount] = useState(null);
  const [overdueCount, setOverdueCount] = useState(null);
  const [reserveCount, setReserveCount] = useState(null);

  useEffect(() => {
    if (user?.accessToken) {
      fetchUserCounts(
        user.accessToken,
        setBorrowCount,
        setOverdueCount,
        setReserveCount
      );
    } else {
      setBorrowCount(null);
      setOverdueCount(null);
      setReserveCount(null);
    }
  }, [user]);

  useEffect(() => {
    const syncAuthState = () => setUser(getLoggedInUser());
    window.addEventListener("mungo-auth-change", syncAuthState);
    return () => window.removeEventListener("mungo-auth-change", syncAuthState);
  }, []);


  return (
    <AppShell>
      <AppHeader main title="문중문고" />

      <PageContainer>
        <div className="main-v2 layout-stack">
          <section className="main-v2__hero" aria-labelledby="main-hero-title">
            <div className="main-v2__hero-copy">
              <p className="main-v2__eyebrow">문중문고</p>
              <h1 id="main-hero-title" className="main-v2__headline">
                {user
                  ? `${user.userID}님, 어떤 책을 찾고 계신가요?`
                  : "필요한 책을 쉽고 빠르게 찾아보세요."}
              </h1>
              <p className="main-v2__description">
                도서 검색부터 대출·예약 현황까지 한곳에서 확인할 수 있어요.
              </p>
            </div>
            <SearchBar />
          </section>

          <section className="main-v2__section" aria-labelledby="library-status-title">
            <SectionHeader
              title="나의 이용 현황"
              action={
                !user ? (
                  <button className="main-v2__text-action" type="button" onClick={() => navigate("/LoginPage")}>
                    로그인하기 <Icon name="chevron-right" size={16} />
                  </button>
                ) : null
              }
            />
            <div id="library-status-title" className="sr-only">나의 이용 현황</div>
            <LibraryStatusSummary
              borrowCount={borrowCount}
              reserveCount={reserveCount}
              overdueCount={overdueCount}
              locked={!user}
            />
            {!user ? (
              <p className="main-v2__helper">
                로그인하면 현재 대출·예약·연체 현황을 바로 확인할 수 있어요.
              </p>
            ) : null}
          </section>

          <section className="main-v2__section">
            <SectionHeader
              title="공지사항"
              action={
                <Link className="main-v2__text-action" to="/NoticePage">
                  전체보기 <Icon name="chevron-right" size={16} />
                </Link>
              }
            />
            <Link className="main-v2__notice" to="/NoticePage" aria-label="공지사항 보기">
              <img src={noticebanner} alt="" className="main-v2__notice-image" />
            </Link>
          </section>

          <section className="main-v2__quick-grid" aria-label="문중문고 콘텐츠">
            <Link className="main-v2__quick-link" to="/CurationPage">
              <span className="main-v2__quick-icon"><Icon name="book" size={24} /></span>
              <span className="main-v2__quick-copy">
                <strong>큐레이션</strong>
                <small>문중문고가 고른 책을 만나보세요.</small>
              </span>
              <Icon name="chevron-right" />
            </Link>

            <Link className="main-v2__quick-link" to="/GuidePage">
              <span className="main-v2__quick-icon"><Icon name="info" size={24} /></span>
              <span className="main-v2__quick-copy">
                <strong>이용안내</strong>
                <small>대출·반납과 문중문고 이용 방법을 확인해요.</small>
              </span>
              <Icon name="chevron-right" />
            </Link>
          </section>
        </div>
      </PageContainer>

      <Footer />
    </AppShell>
  );
}

export default MainPage;
