import React from "react";
import { Link } from "react-router-dom";
import Button from "../ui/Button";
import Icon from "../ui/Icon";
import IconButton from "../ui/IconButton";
import StatusBadge from "../ui/StatusBadge";

export default function BookListItem({
  book,
  cover,
  detailTo,
  statusLabel,
  statusTone="neutral",
  actionLabel,
  actionDisabled=false,
  onAction,
  onToggleFavorite
}) {
  return (
    <article className="book-list-item">
      <Link className="book-list-item__cover-link" to={detailTo} aria-label={`${book.title} 상세보기`}>
        <img className="book-list-item__cover" src={cover} alt={`${book.title} 책 표지`} />
      </Link>

      <div className="book-list-item__content">
        <div className="book-list-item__meta-top">
          <StatusBadge tone={statusTone}>{statusLabel}</StatusBadge>
        </div>
        <Link className="book-list-item__title-link" to={detailTo}>
          <h2 className="book-list-item__title">{book.title}</h2>
        </Link>
        <p className="book-list-item__author">{book.author || "저자 정보 없음"}</p>
        {book.publisher ? <p className="book-list-item__metadata">{book.publisher}</p> : null}
        <div className="book-list-item__submeta">
          {book.code ? <span>{book.code}</span> : null}
          {book.location ? <span>{book.location}</span> : null}
        </div>
      </div>

      <div className="book-list-item__actions">
        <IconButton
          icon={book.liked ? "heart-filled" : "heart"}
          label={book.liked ? "관심도서 취소" : "관심도서 설정"}
          onClick={() => onToggleFavorite?.(book.id)}
        />
        <Button
          variant="secondary"
          size="sm"
          disabled={actionDisabled}
          onClick={() => onAction?.(book)}
        >
          {actionLabel}
        </Button>
      </div>
    </article>
  );
}
