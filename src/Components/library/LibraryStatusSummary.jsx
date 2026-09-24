import React from "react";
import { Link, useLocation } from "react-router-dom";
import Skeleton from "../ui/Skeleton";
import Icon from "../ui/Icon";

function StatusItem({ label, value, to, icon, danger = false, from }) {
  const loading=value===null||value===undefined;
  return (
    <Link
      className={["library-summary__item",danger?"library-summary__item--danger":""].filter(Boolean).join(" ")}
      to={to}
      state={{from}}
    >
      <span className="library-summary__label"><Icon name={icon} size={18}/>{label}</span>
      <span className="library-summary__value">
        {loading?<Skeleton width={28} height={27} radius={6}/>:<>{value}<small>권</small></>}
      </span>
    </Link>
  );
}

export default function LibraryStatusSummary({ borrowCount, reserveCount, overdueCount }) {
  const {pathname}=useLocation();
  return (
    <section className="library-summary" aria-label="나의 이용 현황">
      <StatusItem label="대출" value={borrowCount} to="/CurrentBorrow" icon="loan-return" from={pathname}/>
      <StatusItem label="예약" value={reserveCount} to="/CurrentReserve" icon="clock" from={pathname}/>
      <StatusItem label="연체" value={overdueCount} to="/CurrentOverdue" icon="overdue" danger={Number(overdueCount)>0} from={pathname}/>
    </section>
  );
}
