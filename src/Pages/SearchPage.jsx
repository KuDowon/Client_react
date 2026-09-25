import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import "../Css/SearchPage.css";

import Footer from "../Components/Footer";
import SearchBar from "../Components/SearchBar";
import { submitLoanRequest } from "../Api/loan";
import AppShell from "../Components/layout/AppShell";
import AppHeader from "../Components/layout/AppHeader";
import Button from "../Components/ui/Button";
import PageContainer from "../Components/layout/PageContainer";
import BookListItem from "../Components/library/BookListItem";
import Dialog from "../Components/ui/Dialog";
import EmptyState from "../Components/ui/EmptyState";
import SectionHeader from "../Components/ui/SectionHeader";
import Skeleton from "../Components/ui/Skeleton";
import FilterSelect from "../Components/ui/FilterSelect";
import Toast from "../Components/ui/Toast";

import printnull from "../Images/printnull.png";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const authHeaders = () => {
  const accessToken = localStorage.getItem("accessToken");
  return {
    "Content-Type": "application/json",
    ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
  };
};

const isLoggedIn = () => Boolean(localStorage.getItem("accessToken"));

async function withRefreshRetry(requestFn) {
  let res = await requestFn();
  if (res.status !== 401) return res;

  const refresh = localStorage.getItem("refreshToken");
  if (!refresh) return res;

  const refreshResponse = await fetch(`${API_BASE_URL}/users/token/refresh/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh }),
  });
  if (!refreshResponse.ok) return res;

  const { access } = await refreshResponse.json().catch(() => ({}));
  if (access) localStorage.setItem("accessToken", access);

  return requestFn();
}

async function searchBooksAPI(query, page = 1) {
  const callA = () =>
    fetch(`${API_BASE_URL}/books/?search=${encodeURIComponent(query)}&page=${page}`, {
      headers: authHeaders(),
    });

  let res = await withRefreshRetry(callA);
  if (!res.ok && (res.status === 404 || res.status === 405)) {
    const callB = () =>
      fetch(`${API_BASE_URL}/search/?q=${encodeURIComponent(query)}&page=${page}`, {
        headers: authHeaders(),
      });
    res = await withRefreshRetry(callB);
  }
  if (!res.ok) throw new Error(`검색 실패: ${res.status}`);

  const data = await res.json();
  const list = Array.isArray(data) ? data : data.results ?? [];

  return list.map((book) => ({
    id: book.id ?? book.book_id ?? book.pk,
    title: book.title ?? "",
    author: book.author ?? "",
    publisher: book.publisher ?? "",
    code: book.book_code ?? book.code ?? book.call_number ?? "",
    cover: book.cover ?? book.image_url ?? "",
    liked: Boolean(book.liked ?? book.is_liked),
    status: book.book_status ?? "AVAILABLE",
    popularity: book.popularity ?? 0,
    location: book.location ?? "",
  }));
}

async function toggleLikeAPI(bookId) {
  const request = () =>
    fetch(`${API_BASE_URL}/books/${bookId}/like/`, {
      method: "POST",
      headers: authHeaders(),
    });

  const res = await withRefreshRetry(request);
  if (!res.ok) throw new Error(`좋아요 실패: ${res.status}`);
  return res.json().catch(() => ({}));
}

function getStatusInfo(status) {
  switch (status) {
    case "AVAILABLE":
      return { label: "대출가능", tone: "success", actionLabel: "대출신청", disabled: false };
    case "RENTED":
      return { label: "대출중", tone: "neutral", actionLabel: "예약하기", disabled: false };
    case "RESERVED":
      return { label: "예약중", tone: "neutral", actionLabel: "예약중", disabled: true };
    case "UNAVAILABLE":
      return { label: "대출불가", tone: "neutral", actionLabel: "대출불가", disabled: true };
    default:
      return { label: "상태확인", tone: "neutral", actionLabel: "상태확인", disabled: false };
  }
}

function SearchSkeleton() {
  return (
    <div className="search-results__skeleton" aria-label="검색 결과 불러오는 중">
      {[0, 1, 2].map((item) => (
        <div className="search-results__skeleton-row" key={item}>
          <Skeleton width={72} height={108} radius={8} />
          <div className="search-results__skeleton-copy">
            <Skeleton width={78} height={28} radius={14} />
            <Skeleton width="72%" height={24} radius={6} />
            <Skeleton width="45%" height={21} radius={6} />
            <Skeleton width="56%" height={18} radius={6} />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function SearchPage() {
  const [books, setBooks] = useState([]);
  const [queryParams] = useSearchParams();
  const q = queryParams.get("query") || "";
  const [sortMode, setSortMode] = useState("오름차순");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);
  const [retryKey, setRetryKey] = useState(0);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [confirmLoanState, setConfirmLoanState] = useState({ isOpen: false, book: null });
  const [confirmReserveState, setConfirmReserveState] = useState({ isOpen: false, book: null });
  const [toast, setToast] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    if (!toast) return undefined;
    const timer = window.setTimeout(() => setToast(null), 2400);
    return () => window.clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    let alive = true;
    if (!q) {
      setBooks([]);
      return undefined;
    }

    (async () => {
      setLoading(true);
      setErr(null);
      try {
        const list = await searchBooksAPI(q);
        if (alive) setBooks(list);
      } catch (error) {
        if (alive) setErr(error);
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [q, retryKey]);

  const executeLoan = async () => {
    const book = confirmLoanState.book;
    setConfirmLoanState({ isOpen: false, book: null });

    if (!book || !book.code) {
      setModalMessage("❌ 도서 등록 정보가 누락되어 대출할 수 없습니다.");
      setIsModalOpen(true);
      return;
    }

    try {
      await submitLoanRequest(book.code);
      setModalMessage("✅ 대출되었습니다");
      setIsModalOpen(true);
      const list = await searchBooksAPI(q);
      setBooks(list);
    } catch (error) {
      setModalMessage(error.message);
      setIsModalOpen(true);
      console.error("[SearchPage] Loan Error:", error.message);
    }
  };

  async function submitReserveRequest(bookId) {
    try {
      const response = await fetch(`${API_BASE_URL}/books/${bookId}/reserve/`, {
        method: "POST",
        headers: authHeaders(),
      });

      const result = await response.json();

      if (!response.ok) {
        const errorMessage = result.message || `예약 실패: ${response.status}`;
        const error = new Error("❌ " + errorMessage);
        error.status = response.status;
        error.payload = result;
        throw error;
      }

      return result;
    } catch (error) {
      if (!error.message.startsWith("❌")) {
        error.message = "❌ " + (error.message || "예약 요청 중 알 수 없는 오류가 발생했습니다.");
      }
      throw error;
    }
  }

  const executeReserve = async () => {
    const book = confirmReserveState.book;
    setConfirmReserveState({ isOpen: false, book: null });

    if (!book || !book.id) {
      setModalMessage("❌ 예약에 필요한 도서 정보가 누락되었습니다.");
      setIsModalOpen(true);
      return;
    }

    try {
      await submitReserveRequest(book.id);
      setModalMessage("✅ 예약이 완료되었습니다");
      setIsModalOpen(true);
      const list = await searchBooksAPI(q);
      setBooks(list);
    } catch (error) {
      setModalMessage(error.message);
      setIsModalOpen(true);
      console.error("[SearchPage] Reserve Error:", error.message);
    }
  };

  const handleReserveClick = (book) => {
    if (!isLoggedIn()) {
      setIsLoginModalOpen(true);
      return;
    }
    if (!book.id) {
      setModalMessage("❌ 예약에 필요한 도서 정보가 누락되었습니다.");
      setIsModalOpen(true);
      return;
    }
    setConfirmReserveState({ isOpen: true, book });
  };

  const handleLoanClick = (book) => {
    if (!isLoggedIn()) {
      setIsLoginModalOpen(true);
      return;
    }
    if (!book.code || book.code.length === 0) {
      setModalMessage("❌ 대출에 필요한 도서 등록 정보(Code)가 누락되었습니다.");
      setIsModalOpen(true);
      return;
    }
    setConfirmLoanState({ isOpen: true, book });
  };

  const closeConfirmModal = () => {
    setIsLoginModalOpen(false);
    setConfirmLoanState({ isOpen: false, book: null });
    setConfirmReserveState({ isOpen: false, book: null });
  };

  const closeModal = () => setIsModalOpen(false);

  const MainPageNavigate = () => {
    setIsModalOpen(false);
    navigate("/");
  };

  const navigateToLogin = () => {
    setIsLoginModalOpen(false);
    navigate("/LoginPage");
  };

  const sorted = useMemo(() => {
    const list = [...books];
    if (sortMode === "오름차순") {
      list.sort((a, b) => (a.title || "").localeCompare(b.title || "", "ko"));
    } else {
      list.sort((a, b) => (b.popularity ?? 0) - (a.popularity ?? 0));
    }
    return list;
  }, [books, sortMode]);

  const onToggleHeart = async (id) => {
    if (!isLoggedIn()) {
      setIsLoginModalOpen(true);
      return;
    }

    const currentBook = books.find((book) => book.id === id);
    if (!currentBook) return;
    const nextLiked = !currentBook.liked;

    setBooks((prev) => prev.map((book) => (book.id === id ? { ...book, liked: nextLiked } : book)));

    try {
      await toggleLikeAPI(id);
      setToast({
        tone: "success",
        message: nextLiked ? "관심도서에 저장했어요." : "관심도서에서 삭제했어요."
      });
    } catch (error) {
      setBooks((prev) => prev.map((book) => (book.id === id ? { ...book, liked: currentBook.liked } : book)));
      setToast({ tone: "danger", message: "관심도서 저장에 실패했어요. 잠시 후 다시 시도해주세요." });
      console.error("좋아요 실패:", error);
    }
  };

  const handleBookAction = (book) => {
    if (book.status === "AVAILABLE") {
      handleLoanClick(book);
    } else if (book.status === "RENTED") {
      handleReserveClick(book);
    }
  };

  const modalIsError = modalMessage.trim().startsWith("❌");
  const displayModalMessage = modalMessage.replace(/^[✅❌]\s*/, "");

  return (
    <AppShell>
      <AppHeader title="검색 결과" backTo="/" />

      <PageContainer>
        <div className="search-results layout-stack">
          <div className="search-results__search">
            <SearchBar />
          </div>

          <section className="search-results__section" aria-labelledby="search-results-title">
            <div className="search-results__toolbar">
              <SectionHeader title={q ? `“${q}” 검색 결과` : "검색 결과"} />
              <FilterSelect
                label="정렬"
                value={sortMode}
                options={[
                  {value:"오름차순",label:"제목순"},
                  {value:"내림차순",label:"인기순"}
                ]}
                onChange={setSortMode}
              />
            </div>

            {!loading && !err ? (
              <p id="search-results-title" className="search-results__count">
                {sorted.length}권의 도서를 찾았어요.
              </p>
            ) : null}

            {loading ? <SearchSkeleton /> : null}

            {err ? (
              <EmptyState
                icon="alert"
                title="검색 결과를 불러오지 못했어요."
                description={String(err.message || err)}
                action={<Button variant="secondary" onClick={() => setRetryKey((value) => value + 1)}>다시 시도</Button>}
              />
            ) : null}

            {!loading && !err && sorted.length === 0 ? (
              <EmptyState
                icon="search"
                title={q ? "검색 결과가 없어요." : "검색어를 입력해주세요."}
                description={q ? "다른 제목이나 저자명으로 다시 검색해보세요." : "도서명 또는 저자명을 검색할 수 있어요."}
              />
            ) : null}

            {!loading && !err && sorted.length > 0 ? (
              <div className="search-results__list">
                {sorted.map((book) => {
                  const status = getStatusInfo(book.status);
                  return (
                    <BookListItem
                      key={book.id}
                      book={book}
                      cover={book.cover && book.cover !== "" ? book.cover : printnull}
                      detailTo={`/BookPage/${book.id || book.code}`}
                      statusLabel={status.label}
                      statusTone={status.tone}
                      actionLabel={status.actionLabel}
                      actionDisabled={status.disabled}
                      onAction={handleBookAction}
                      onToggleFavorite={onToggleHeart}
                    />
                  );
                })}
              </div>
            ) : null}
          </section>
        </div>
      </PageContainer>

      <Footer />

      <Dialog
        open={confirmLoanState.isOpen}
        title="이 도서를 대출할까요?"
        confirmLabel="대출하기"
        cancelLabel="취소"
        onConfirm={executeLoan}
        onClose={closeConfirmModal}
      >
        {confirmLoanState.book
          ? `[${confirmLoanState.book.code}] ${confirmLoanState.book.title}`
          : "도서 정보를 확인할 수 없습니다."}
      </Dialog>

      <Dialog
        open={confirmReserveState.isOpen}
        title="이 도서를 예약할까요?"
        confirmLabel="예약하기"
        cancelLabel="취소"
        onConfirm={executeReserve}
        onClose={closeConfirmModal}
      >
        {confirmReserveState.book
          ? `[${confirmReserveState.book.code}] ${confirmReserveState.book.title}`
          : "도서 정보를 확인할 수 없습니다."}
      </Dialog>

      <Dialog
        open={isModalOpen}
        title={modalIsError ? "요청을 처리하지 못했어요." : "처리가 완료됐어요."}
        confirmLabel="메인으로"
        cancelLabel="닫기"
        onConfirm={MainPageNavigate}
        onClose={closeModal}
      >
        {displayModalMessage}
      </Dialog>

      <Dialog
        open={isLoginModalOpen}
        title="로그인이 필요한 서비스예요"
        confirmLabel="로그인"
        cancelLabel="닫기"
        onConfirm={navigateToLogin}
        onClose={closeConfirmModal}
      >
        대출·예약·관심도서 기능을 이용하려면 먼저 로그인해주세요.
      </Dialog>

      {toast ? (
        <div className="ui-toast-stack" aria-live="polite">
          <Toast tone={toast.tone}>{toast.message}</Toast>
        </div>
      ) : null}
    </AppShell>
  );
}
