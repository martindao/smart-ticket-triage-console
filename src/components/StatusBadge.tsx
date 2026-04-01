import type { Status } from '../types/ticket';

interface StatusBadgeProps {
  status: Status;
}

const statusStyles: Record<Status, string> = {
  Open: 'bg-[var(--surface-600)] text-[var(--text-300)] border-[var(--border-default)]',
  'In Progress': 'bg-[var(--accent-primary-subtle)] text-[var(--accent-primary-text)] border-[var(--accent-primary-muted)]',
  Resolved: 'bg-[var(--semantic-success-muted)] text-[#4ade80] border-[rgba(34,197,94,0.25)]',
  Closed: 'bg-[var(--surface-700)] text-[var(--text-400)] border-[var(--border-subtle)]',
};

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusStyles[status]}`}
    >
      {status}
    </span>
  );
}
