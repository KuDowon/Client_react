import React from "react";
import { Link } from "react-router-dom";
import Button from "../ui/Button";
import IconButton from "../ui/IconButton";
import StatusBadge from "../ui/StatusBadge";

export default function BookListItem({
  book,
  cover,
  detailTo,
  statusLabel,
  statusTone="neutral",
  meta=[],
  actionLabel,
  actionVariant="secondary",
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
        {statusLabel ? (
          <div className="book-list-item__meta-top">
            <StatusBadge tone={statusTone}>{statusLabel}</StatusBadge>
          </div>
        ) : null}
        <Link className="book-list-item__title-link" to={detailTo}>
          <h2 className="book-list-item__title">{book.title}</h2>
        </Link>
        {book.author ? <p className="book-list-item__author">{book.author}</p> : null}
        {book.publisher ? <p className="book-list-item__metadata">{book.publisher}</p> : null}
        {meta.map((line,index)=><p className="book-list-item__metadata" key={`${line}-${index}`}>{line}</p>)}
        <div className="book-list-item__submeta">
          {book.code ? <span>{book.code}</span> : null}
          {book.location ? <span>{book.location}</span> : null}
        </div>
      </div>

      {(onToggleFavorite || actionLabel) ? (
        <div className="book-list-item__actions">
          {onToggleFavorite ? (
            <IconButton
              icon={book.liked ? "heart-filled" : "heart"}
              label={book.liked ? "관심도서 취소" : "관심도서 설정"}
              selected={Boolean(book.liked)}
              onClick={() => onToggleFavorite(book.id)}
            />
          ) : null}
          {actionLabel ? (
            <Button
              variant={actionVariant}
              size="sm"
              disabled={actionDisabled}
              onClick={() => onAction?.(book)}
            >
              {actionLabel}
            </Button>
          ) : null}
        </div>
      ) : null}
    </article>
  );
}
