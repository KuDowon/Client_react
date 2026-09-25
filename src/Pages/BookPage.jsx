import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import "../Css/BookPage.css";

import Footer from "../Components/Footer";
import AppHeader from "../Components/layout/AppHeader";
import AppShell from "../Components/layout/AppShell";
import PageContainer from "../Components/layout/PageContainer";
import Button from "../Components/ui/Button";
import Dialog from "../Components/ui/Dialog";
import EmptyState from "../Components/ui/EmptyState";
import Icon from "../Components/ui/Icon";
import IconButton from "../Components/ui/IconButton";
import SectionHeader from "../Components/ui/SectionHeader";
import Skeleton from "../Components/ui/Skeleton";
import StatusBadge from "../Components/ui/StatusBadge";
import Toast from "../Components/ui/Toast";
import printnull from "../Images/printnull.png";

const BASE = "https://mungo.n-e.kr";

const getAuthHeaders = () => {
  const token = localStorage.getItem("accessToken");
  if (!token) console.warn("[getAuthHeaders] access token을 찾을 수 없습니다.");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

async function fetchJSON(
  path,
  { method = "GET", body, auth = false, headers = {}, timeoutMs = 8000 } = {}
) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort("timeout"), timeoutMs);

  const baseHeaders = {
    Accept: "application/json",
    ...headers,
    ...(auth ? getAuthHeaders() : {}),
  };

  if (method !== "GET" && !("Content-Type" in baseHeaders)) {
    baseHeaders["Content-Type"] = "application/json";
  }

  let res;
  try {
    res = await fetch(`${BASE}${path}`, {
      method,
      headers: baseHeaders,
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timer);
  }

  const contentType = res.headers.get("content-type") || "";
  const text = await res.text();

  if (!contentType.includes("application/json")) {
    throw new Error(
      `Expected JSON but got ${contentType} ${res.status} at ${res.url}. Body: ${text.slice(0, 120)}`
    );
  }

  const json = text ? JSON.parse(text) : null;
  if (!res.ok) {
    const message = json?.detail || json?.message || `HTTP ${res.status}`;
    const error = new Error(message);
    error.status = res.status;
    error.payload = json;
    throw error;
  }

  return json;
}

const FALLBACK_BOOK = {
  title: "-",
  author: "-",
  edition: "-",
  publisher: "-",
  format: "-",
  callNumber: "-",
  location: "-",
  status: null,
  series: "-",
  details: "-",
  notes: "-",
  coverUrl: "",
  code: "",
  MJcode: "-",
};

const toText = (value) =>
  Array.isArray(value) ? value.filter(Boolean).join(" ; ") : value ?? "-";

const isLoggedIn = () => Boolean(localStorage.getItem("accessToken"));

function statusPresentation(status) {
  if (!status) return null;
  const normalized = String(status).toUpperCase();
  if (normalized === "AVAILABLE") return { label: "대출 가능", tone: "success" };
  if (normalized === "RENTED") return { label: "대출 중", tone: "neutral" };
  if (normalized === "RESERVED") return { label: "예약 중", tone: "neutral" };
  if (normalized === "UNAVAILABLE") return { label: "대출 불가", tone: "neutral" };
  return { label: String(status), tone: "neutral" };
}

function primaryActionPresentation(status) {
  const normalized = String(status || "").toUpperCase();
  if (normalized === "AVAILABLE") return { label: "대출하기", kind: "rent", disabled: false };
  if (normalized === "RENTED") return { label: "예약하기", kind: "reserve", disabled: false };
  if (normalized === "RESERVED") return { label: "예약 중", kind: null, disabled: true };
  if (normalized === "UNAVAILABLE") return { label: "대출 불가", kind: null, disabled: true };
  return { label: "상태 확인", kind: null, disabled: true };
}

export default function BookPage() {
  const { bookId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [pk, setPk] = useState(null);
  const [resolving, setResolving] = useState(true);
  const [bookData, setBookData] = useState(FALLBACK_BOOK);
  const [isLiked, setIsLiked] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMsg, setModalMsg] = useState("");
  const [isReviewBoxOpen, setIsReviewBoxOpen] = useState(false);
  const [newReviewText, setNewReviewText] = useState("");
  const [loginPromptOpen, setLoginPromptOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const [confirmAction, setConfirmAction] = useState(null);
  const [pendingAction, setPendingAction] = useState(null);

  const openModal = (message) => {
    setModalMsg(message);
    setIsModalOpen(true);
  };

  useEffect(() => {
    if (!toast) return undefined;
    const timer = window.setTimeout(() => setToast(null), 2400);
    return () => window.clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    const ac = new AbortController();

    async function resolvePk() {
      setResolving(true);
      setPk(null);
      try {
        const raw = String(bookId ?? "").trim();
        if (!raw) return;

        if (/^\d+$/.test(raw)) {
          setPk(Number(raw));
          return;
        }

        if (/^MJ\d{6}$/i.test(raw)) {
          const code = raw.toUpperCase();
          const data = await fetchJSON(`/books/?search=${encodeURIComponent(code)}`, {
            auth: false,
            timeoutMs: 8000,
          });

          const list = Array.isArray(data) ? data : data?.results ?? [];
          const exact = list.find((book) => (book?.book_code ?? book?.bookCode) === code);
          if (exact?.id) {
            setPk(exact.id);
            return;
          }
        }
        setPk(null);
      } catch (error) {
        if (error.name !== "AbortError") {
          console.error("[resolvePk] error:", error);
          setPk(null);
        }
      } finally {
        setResolving(false);
      }
    }

    resolvePk();
    return () => ac.abort();
  }, [bookId]);

  const invalidId = !Number.isFinite(pk) || pk <= 0;

  useEffect(() => {
    if (resolving || invalidId) return undefined;
    const ac = new AbortController();

    async function load() {
      try {
        const detail = await fetchJSON(`/books/${pk}/`, { auth: true, timeoutMs: 8000 });

        setBookData({
          title: toText(detail?.title),
          author: toText(detail?.author),
          edition: toText(detail?.edition),
          publisher: toText(detail?.publisher),
          format: toText(detail?.physical ?? detail?.format),
          callNumber: toText(detail?.call_number ?? detail?.callNumber ?? detail?.callnumber),
          location: toText(detail?.location ?? detail?.shelf_location ?? detail?.shelfLocation),
          status: detail?.book_status ?? detail?.status ?? null,
          series: toText(detail?.series),
          details: toText(detail?.details),
          notes: toText(detail?.notes),
          coverUrl: detail?.image_url || "",
          code: detail?.book_code || detail?.code || "",
          MJcode: toText(detail?.book_code),
        });

        const liked = detail?.is_liked ?? detail?.liked;
        if (typeof liked === "boolean") setIsLiked(liked);
      } catch (error) {
        if (error.name !== "AbortError") {
          console.error("[BOOK DETAIL] fail:", error);
          openModal("도서 상세 정보를 불러오지 못했습니다.");
        }
      }

      try {
        const data = await fetchJSON(`/reviews/?bookId=${pk}`, {
          auth: false,
          timeoutMs: 8000,
        });
        if (ac.signal.aborted) return;

        const list = (Array.isArray(data) ? data : data?.results ?? []).map((review, index) => ({
          id: review.id ?? index,
          author: review.user_username ?? review.author ?? review.username ?? "익명",
          date: review.date
            ? review.date.replaceAll("-", "/")
            : (review.created_at || "").slice(0, 10).replaceAll("-", "/"),
          content: review.content ?? "",
        }));
        setReviews(list);
      } catch (error) {
        if (error.name !== "AbortError") console.error("[REVIEWS LIST] fail:", error);
      }
    }

    load();
    return () => ac.abort();
  }, [pk, invalidId, resolving]);

  const handleLikeToggle = async () => {
    if (invalidId) return;
    if (!isLoggedIn()) {
      setLoginPromptOpen(true);
      return;
    }

    const previous = isLiked;
    const nextLiked = !previous;
    setIsLiked(nextLiked);
    try {
      await fetchJSON(`/books/${pk}/like/`, { method: "POST", auth: true });
      setToast({
        tone: "success",
        message: nextLiked ? "관심도서에 저장했어요." : "관심도서에서 삭제했어요."
      });
    } catch (error) {
      console.error("[LIKE] fail:", error);
      setIsLiked(previous);
      setToast({ tone: "danger", message: "관심도서 저장에 실패했어요. 잠시 후 다시 시도해주세요." });
    }
  };

  const handleSubmitReview = async () => {
    if (invalidId) return;
    const content = newReviewText.trim();
    if (!content) return;

    const today = new Date();
    const optimistic = {
      id: `temp-${Date.now()}`,
      author: "나",
      date: `${today.getFullYear()}/${today.getMonth() + 1}/${today.getDate()}`,
      content,
    };

    setReviews((previous) => [optimistic, ...previous]);
    setNewReviewText("");
    setIsReviewBoxOpen(false);

    try {
      await fetchJSON("/reviews/", { method: "POST", auth: true, body: { book: pk, content } });
      const listData = await fetchJSON(`/reviews/?bookId=${pk}`, { auth: false });
      const normalized = (Array.isArray(listData) ? listData : listData?.results || []).map(
        (review, index) => ({
          id: review.id ?? index,
          author: review.user_username ?? review.author ?? review.username ?? "익명",
          date: review.date
            ? review.date.replaceAll("-", "/")
            : (review.created_at || "").slice(0, 10).replaceAll("-", "/"),
          content: review.content ?? "",
        })
      );
      setReviews(normalized);
      setToast({ tone: "success", message: "리뷰를 등록했어요." });
    } catch (error) {
      console.error("[REVIEW CREATE] fail:", error);
      setReviews((previous) => previous.filter((review) => review.id !== optimistic.id));
      openModal("리뷰를 등록하지 못했어요. 잠시 후 다시 시도해주세요.");
    }
  };

  const openPrimaryActionConfirm = () => {
    if (invalidId) return;
    if (!isLoggedIn()) {
      setLoginPromptOpen(true);
      return;
    }

    const action = primaryActionPresentation(bookData.status);
    if (action.kind === "rent" || action.kind === "reserve") {
      setConfirmAction(action.kind);
    }
  };

  const executePrimaryAction = async () => {
    if (!confirmAction || pendingAction) return;

    setPendingAction(confirmAction);
    try {
      if (confirmAction === "rent") {
        const bookCode = bookData?.code || bookData?.book_code || bookData?.bookCode;
        if (!bookCode) {
          throw new Error("missing-book-code");
        }

        await fetchJSON("/rentals/", {
          method: "POST",
          auth: true,
          body: { code: bookCode },
        });
        setBookData((previous) => ({ ...previous, status: "RENTED" }));
        setToast({
          tone: "success",
          message: "대출이 완료됐어요.",
          actionLabel: "대출 현황 보기",
          actionTo: "/CurrentBorrow"
        });
      } else {
        await fetchJSON(`/books/${pk}/reserve/`, {
          method: "POST",
          auth: true,
        });
        setBookData((previous) => ({ ...previous, status: "RESERVED" }));
        setToast({
          tone: "success",
          message: "예약이 완료됐어요.",
          actionLabel: "예약 현황 보기",
          actionTo: "/CurrentReserve"
        });
      }
      setConfirmAction(null);
    } catch (error) {
      console.error("[BOOK ACTION] fail:", error);
      setConfirmAction(null);
      openModal(
        pendingAction === "reserve" || confirmAction === "reserve"
          ? "예약을 완료하지 못했어요. 잠시 후 다시 시도해주세요."
          : "대출을 완료하지 못했어요. 잠시 후 다시 시도해주세요."
      );
    } finally {
      setPendingAction(null);
    }
  };

  const status = statusPresentation(bookData.status);
  const primaryAction = primaryActionPresentation(bookData.status);
  const displayModalMessage = modalMsg;

  return (
    <AppShell>
      <AppHeader title="도서 상세" onBack={() => navigate(-1)} />

      <PageContainer>
        <div className="book-detail">
          {resolving ? (
            <div className="book-detail__loading">
              <Skeleton width={132} height={198} radius={8} />
              <div className="book-detail__loading-copy">
                <Skeleton width={90} height={28} radius={14} />
                <Skeleton width="80%" height={36} radius={6} />
                <Skeleton width="48%" height={24} radius={6} />
                <Skeleton width="62%" height={21} radius={6} />
              </div>
            </div>
          ) : invalidId ? (
            <EmptyState
              icon="alert"
              title="잘못된 도서 링크예요."
              description="도서 목록으로 돌아가 다시 선택해주세요."
              action={<Button variant="secondary" onClick={() => navigate(-1)}>이전 화면으로</Button>}
            />
          ) : (
            <>
              <section className="book-detail__hero">
                <div className="book-detail__cover-wrap">
                  <img
                    className="book-detail__cover"
                    src={bookData.coverUrl || printnull}
                    alt={`${bookData.title || "도서"} 표지`}
                    onError={(event) => {
                      event.currentTarget.src = printnull;
                    }}
                  />
                </div>

                <div className="book-detail__identity">
                  {status ? <StatusBadge tone={status.tone}>{status.label}</StatusBadge> : null}
                  <div className="book-detail__title-group">
                    <h1 className="book-detail__title">{bookData.title}</h1>
                    <p className="book-detail__author">{bookData.author}</p>
                    {bookData.publisher !== "-" ? <p className="book-detail__publisher">{bookData.publisher}</p> : null}
                  </div>

                  <div className="book-detail__actions">
                    <Button
                      variant="primary"
                      size="lg"
                      disabled={primaryAction.disabled}
                      onClick={openPrimaryActionConfirm}
                    >
                      {primaryAction.label}
                    </Button>
                    <IconButton
                      icon={isLiked ? "heart-filled" : "heart"}
                      label={isLiked ? "관심도서 취소" : "관심도서 설정"}
                      variant="outline"
                      selected={isLiked}
                      onClick={handleLikeToggle}
                    />
                  </div>

                  <dl className="book-detail__key-meta">
                    <div><dt>청구기호</dt><dd>{bookData.callNumber}</dd></div>
                    <div><dt>등록번호</dt><dd>{bookData.MJcode}</dd></div>
                    {bookData.location !== "-" ? <div><dt>서가 위치</dt><dd>{bookData.location}</dd></div> : null}
                    {bookData.edition !== "-" ? <div><dt>판사항</dt><dd>{bookData.edition}</dd></div> : null}
                  </dl>
                  {String(bookData.status || "").toUpperCase() === "RESERVED" ? (
                    <p className="book-detail__action-helper">현재 다른 이용자가 예약한 도서라 추가 예약할 수 없어요.</p>
                  ) : null}
                </div>
              </section>

              <section className="book-detail__section">
                <SectionHeader title="상세 장서 정보" />
                <dl className="book-detail__details">
                  <div><dt>발행사항</dt><dd>{bookData.publisher}</dd></div>
                  <div><dt>형태사항</dt><dd>{bookData.format}</dd></div>
                  <div><dt>총서정보</dt><dd>{bookData.series}</dd></div>
                  <div><dt>상세정보</dt><dd>{bookData.details}</dd></div>
                  <div><dt>주기</dt><dd>{bookData.notes}</dd></div>
                </dl>
              </section>

              <section className="book-detail__section">
                <SectionHeader
                  title={`리뷰 ${reviews.length}`}
                  action={
                    <Button
                      variant="tertiary"
                      size="sm"
                      onClick={() => {
                        if (!isLoggedIn()) {
                          setLoginPromptOpen(true);
                          return;
                        }
                        setIsReviewBoxOpen((open) => !open);
                      }}
                    >
                      <Icon name={isReviewBoxOpen ? "close" : "edit"} size={16} />
                      {isReviewBoxOpen ? "닫기" : "작성"}
                    </Button>
                  }
                />

                {isReviewBoxOpen ? (
                  <div className="book-detail__review-editor">
                    <label htmlFor="reviewInput">리뷰 내용</label>
                    <textarea
                      id="reviewInput"
                      rows="4"
                      placeholder="도서에 대한 생각을 남겨주세요."
                      value={newReviewText}
                      onChange={(event) => setNewReviewText(event.target.value)}
                      onKeyDown={(event) => {
                        if ((event.ctrlKey || event.metaKey) && event.key === "Enter") handleSubmitReview();
                      }}
                    />
                    <div className="book-detail__review-editor-actions">
                      <Button variant="primary" onClick={handleSubmitReview} disabled={!newReviewText.trim()}>
                        리뷰 등록
                      </Button>
                    </div>
                  </div>
                ) : null}

                {reviews.length ? (
                  <div className="book-detail__reviews">
                    {reviews.map((review) => (
                      <article className="book-detail__review" key={review.id}>
                        <div className="book-detail__review-meta">
                          <strong>{review.author}</strong>
                          <time>{review.date}</time>
                        </div>
                        <p>{review.content}</p>
                      </article>
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    icon="edit"
                    title="아직 작성된 리뷰가 없어요."
                    description="이 책을 읽었다면 첫 리뷰를 남겨보세요."
                  />
                )}
              </section>
            </>
          )}
        </div>
      </PageContainer>

      <Footer />

      <Dialog
        open={isModalOpen}
        title="요청을 처리하지 못했어요."
        confirmLabel="확인"
        hideCancel
        onConfirm={() => setIsModalOpen(false)}
        onClose={() => setIsModalOpen(false)}
      >
        {displayModalMessage || "잠시 후 다시 시도해주세요."}
      </Dialog>

      <Dialog
        open={loginPromptOpen}
        title="로그인이 필요한 서비스예요"
        confirmLabel="로그인"
        cancelLabel="닫기"
        onConfirm={() => {
          setLoginPromptOpen(false);
          navigate("/LoginPage", { state: { returnTo: location.pathname + location.search } });
        }}
        onClose={() => setLoginPromptOpen(false)}
      >
        대출·예약·관심도서·리뷰 기능을 이용하려면 먼저 로그인해주세요.
      </Dialog>

      <Dialog
        open={confirmAction === "rent"}
        title="이 도서를 대출할까요?"
        confirmLabel="대출하기"
        cancelLabel="취소"
        confirmLoading={pendingAction === "rent"}
        onConfirm={executePrimaryAction}
        onClose={() => { if (!pendingAction) setConfirmAction(null); }}
      >
        {bookData.title}{bookData.MJcode !== "-" ? ` · ${bookData.MJcode}` : ""}
      </Dialog>

      <Dialog
        open={confirmAction === "reserve"}
        title="이 도서를 예약할까요?"
        confirmLabel="예약하기"
        cancelLabel="취소"
        confirmLoading={pendingAction === "reserve"}
        onConfirm={executePrimaryAction}
        onClose={() => { if (!pendingAction) setConfirmAction(null); }}
      >
        {bookData.title}
      </Dialog>

      {toast ? (
        <div className="ui-toast-stack" aria-live="polite">
          <Toast
            tone={toast.tone}
            actionLabel={toast.actionLabel}
            onAction={toast.actionTo ? () => navigate(toast.actionTo, { state: { from: "/BookPage" } }) : undefined}
            onClose={() => setToast(null)}
          >
            {toast.message}
          </Toast>
        </div>
      ) : null}
    </AppShell>
  );
}
