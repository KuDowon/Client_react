import React from "react";
import { Link } from "react-router-dom";
import Skeleton from "../ui/Skeleton";
import Icon from "../ui/Icon";

function StatusItem({ label, value, to, icon, danger = false }) {
  const loading=value===null||value===undefined;
  return (
    <Link className={["library-summary__item",danger?"library-summary__item--danger":""].filter(Boolean).join(" ")} to={to}>
      <span className="library-summary__label"><Icon name={icon} size={18}/>{label}</span>
      <span className="library-summary__value">
        {loading?<Skeleton width={28} height={27} radius={6}/>:<>{value}<small>권</small></>}
      </span>
    </Link>
  );
}

export default function LibraryStatusSummary({ borrowCount, reserveCount, overdueCount }) {
  return (
    <section className="library-summary" aria-label="나의 이용 현황">
      <StatusItem label="대출" value={borrowCount} to="/CurrentBorrow" icon="book"/>
      <StatusItem label="예약" value={reserveCount} to="/CurrentReserve" icon="clock"/>
      <StatusItem label="연체" value={overdueCount} to="/CurrentOverdue" icon="alert" danger={Number(overdueCount)>0}/>
    </section>
  );
}
