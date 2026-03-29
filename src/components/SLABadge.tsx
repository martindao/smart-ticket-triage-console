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
    overdue: 'bg-red-50 text-red-700 border-red-200 animate-pulse',
    warning: 'bg-orange-50 text-orange-700 border-orange-200',
    ok: 'bg-green-50 text-green-700 border-green-200',
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${statusStyles[status]}`}
    >
      {text}
    </span>
  );
}
