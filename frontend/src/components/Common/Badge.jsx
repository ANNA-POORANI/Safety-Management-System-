import React from 'react';

export const RiskBadge = ({ level }) => {
  const normalized = (level || 'Medium').toLowerCase();

  switch (normalized) {
    case 'critical':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/15 text-rose-400 border border-rose-500/30">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></span>
          CRITICAL
        </span>
      );
    case 'high':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/30">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
          HIGH
        </span>
      );
    case 'medium':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-500/10 text-yellow-300 border border-yellow-500/20">
          <span className="w-1.5 h-1.5 rounded-full bg-yellow-400"></span>
          MEDIUM
        </span>
      );
    case 'low':
    default:
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
          LOW
        </span>
      );
  }
};

export const StatusBadge = ({ status }) => {
  const norm = (status || '').toLowerCase();

  // Completed / Valid / Optimal / Resolved / Closed
  if (['completed', 'valid', 'optimal', 'resolved', 'closed'].includes(norm)) {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-emerald-950/60 text-emerald-300 border border-emerald-500/30">
        {status}
      </span>
    );
  }

  // Pending / In Progress / Under Investigation / Needs Inspection / Expiring Soon
  if (['pending', 'in progress', 'under investigation', 'needs inspection', 'expiring soon'].includes(norm)) {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-amber-950/60 text-amber-300 border border-amber-500/30">
        {status}
      </span>
    );
  }

  // Contained / Under Audit
  if (['contained', 'under audit'].includes(norm)) {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-blue-950/60 text-blue-300 border border-blue-500/30">
        {status}
      </span>
    );
  }

  // Failed / Overdue / Expired / Low Stock / Reported / Over Capacity
  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-rose-950/60 text-rose-300 border border-rose-500/30">
      {status}
    </span>
  );
};
