import React, { useCallback, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../../Css/MyPage.css";

import Footer from "../../Components/Footer";
import AppHeader from "../../Components/layout/AppHeader";
import AppShell from "../../Components/layout/AppShell";
import PageContainer from "../../Components/layout/PageContainer";
import BookListItem from "../../Components/library/BookListItem";
import Button from "../../Components/ui/Button";
import EmptyState from "../../Components/ui/EmptyState";
import Skeleton from "../../Components/ui/Skeleton";
import Toast from "../../Components/ui/Toast";
import printnull from "../../Images/printnull.png";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "https://mungo.n-e.kr";

const authHeaders = () => {
  const token = localStorage.getItem("accessToken");
  return {
    Accept: "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
};

const normalizeBook = (book) => ({
  id: book.id ?? book.book_id ?? book.pk,
  title: book.title ?? "",
  author: book.author ?? "",
  publisher: book.publisher ?? "",
  code: book.book_code ?? book.code ?? book.call_number ?? "",
  cover: book.cover ?? book.image_url ?? "",
  liked: Boolean(book.liked ?? book.is_liked),
  location: book.location ?? ""
});

async function fetchLikedBooks() {
  if (!localStorage.getItem("accessToken")) return [];

  const collected = [];
  let page = 1;
  let hasNext = true;

  while (hasNext && page <= 20) {
    const response = await fetch(`${API_BASE_URL}/books/?page=${page}`, {
      headers: authHeaders()
    });

    if (!response.ok) {
      const error = new Error("관심도서를 불러오지 못했어요.");
      error.status = response.status;
      throw error;
    }

    const data = await response.json();
    const list = Array.isArray(data) ? data : data.results ?? [];
    collected.push(...list);

    if (Array.isArray(data) || !data.next) {
      hasNext = false;
    } else {
      page += 1;
    }
  }

  return collected.map(normalizeBook).filter((book) => book.liked);
}

async function toggleLikeAPI(bookId) {
  const response = await fetch(`${API_BASE_URL}/books/${bookId}/like/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders()
    }
  });

  if (!response.ok) throw new Error("관심도서 변경에 실패했어요.");
}

function InterestSkeleton() {
  return (
    <div className="interest-page__loading" aria-label="관심도서 불러오는 중">
      {[0, 1, 2].map((item) => (
        <div className="status-page__loading-row" key={item}>
          <Skeleton width={72} height={108} radius={8} />
          <div className="status-page__loading-copy">
            <Skeleton width="70%" height={24} radius={6} />
            <Skeleton width="45%" height={20} radius={6} />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function Interest() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [toast, setToast] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const loggedIn = Boolean(localStorage.getItem("accessToken"));

  const loadBooks = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const list = await fetchLikedBooks();
      setBooks(list);
    } catch (err) {
      console.error("[Interest] load failed:", err);
      setError("관심도서를 불러오지 못했어요. 잠시 후 다시 시도해주세요.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBooks();
  }, [loadBooks]);

  useEffect(() => {
    if (!toast) return undefined;
    const timer = window.setTimeout(() => setToast(null), 2400);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const handleToggleFavorite = async (bookId) => {
    const current = books.find((book) => book.id === bookId);
    if (!current) return;

    setBooks((previous) => previous.filter((book) => book.id !== bookId));
    try {
      await toggleLikeAPI(bookId);
      setToast({ tone: "success", message: "관심도서에서 삭제했어요." });
    } catch (err) {
      console.error("[Interest] unlike failed:", err);
      setBooks((previous) => [current, ...previous]);
      setToast({ tone: "danger", message: "관심도서 변경에 실패했어요. 잠시 후 다시 시도해주세요." });
    }
  };

  return (
    <AppShell>
      <AppHeader title="관심도서" backTo="/MyPage" />
      <PageContainer>
        <section className="interest-page">
          {!loggedIn ? (
            <EmptyState
              icon="heart"
              title="로그인이 필요한 서비스예요."
              description="관심도서에 저장한 책을 확인하려면 로그인해주세요."
              action={
                <Button onClick={() => navigate("/LoginPage", { state: { returnTo: location.pathname } })}>
                  로그인하기
                </Button>
              }
            />
          ) : loading ? (
            <InterestSkeleton />
          ) : error ? (
            <EmptyState
              icon="alert"
              title="관심도서를 불러오지 못했어요."
              description={error}
              action={<Button variant="secondary" onClick={loadBooks}>다시 시도</Button>}
            />
          ) : books.length === 0 ? (
            <EmptyState
              icon="heart"
              title="저장한 관심도서가 없어요."
              description="검색하거나 도서 상세에서 하트를 누르면 이곳에 모아볼 수 있어요."
              action={<Button variant="secondary" onClick={() => navigate("/")}>도서 검색하기</Button>}
            />
          ) : (
            <>
              <div className="interest-page__intro">
                <h1>관심도서 {books.length}</h1>
                <p>나중에 다시 보고 싶은 책을 모아볼 수 있어요.</p>
              </div>
              <div className="interest-page__list">
                {books.map((book) => (
                  <BookListItem
                    key={book.id}
                    book={book}
                    cover={book.cover || printnull}
                    detailTo={`/BookPage/${book.id || book.code}`}
                    onToggleFavorite={handleToggleFavorite}
                  />
                ))}
              </div>
            </>
          )}
        </section>
      </PageContainer>
      <Footer />

      {toast ? (
        <div className="ui-toast-stack" aria-live="polite">
          <Toast tone={toast.tone} onClose={() => setToast(null)}>{toast.message}</Toast>
        </div>
      ) : null}
    </AppShell>
  );
}
