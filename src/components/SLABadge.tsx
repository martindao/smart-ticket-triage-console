interface SLABadgeProps {
  deadline: string;
}

export function SLABadge({ deadline }: SLABadgeProps) {
  const deadlineDate = new Date(deadline);
  const now = new Date();
  const diffMs = deadlineDate.getTime() - now.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);

  let status: 'overdue' | 'warning' | 'ok' = 'ok';
  let text = '';

  if (diffHours < 0) {
    status = 'overdue';
    const hoursOverdue = Math.abs(Math.ceil(diffHours));
    text = `${hoursOverdue}h overdue`;
  } else if (diffHours < 4) {
    status = 'warning';
    const hoursLeft = Math.ceil(diffHours);
    text = `${hoursLeft}h left`;
  } else {
    status = 'ok';
    const daysLeft = Math.ceil(diffHours / 24);
    text = `${daysLeft}d left`;
  }

  const statusStyles = {
    overdue: 'sla-badge-overdue bg-[var(--accent-secondary)] text-[var(--surface-950)] border-[var(--accent-secondary)] font-semibold',
    warning: 'bg-[var(--accent-secondary-subtle)] text-[var(--accent-secondary)] border-[var(--accent-secondary-muted)]',
    ok: 'bg-[var(--semantic-success-muted)] text-[#4ade80] border-[rgba(34,197,94,0.25)]',
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${statusStyles[status]}`}
    >
      {text}
    </span>
  );
}
