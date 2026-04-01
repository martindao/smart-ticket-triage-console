import type { Priority } from '../types/ticket';

interface PriorityBadgeProps {
  priority: Priority;
}

const priorityStyles: Record<Priority, string> = {
  Low: 'bg-[var(--surface-600)] text-[var(--text-300)] border-[var(--border-default)]',
  Medium: 'bg-[var(--semantic-info-muted)] text-[#60a5fa] border-[rgba(59,130,246,0.25)]',
  High: 'bg-[var(--accent-secondary-subtle)] text-[var(--accent-secondary)] border-[var(--accent-secondary-muted)]',
  Critical: 'bg-[var(--semantic-critical-muted)] text-[var(--semantic-critical-text)] border-[rgba(239,68,68,0.25)]',
};

export function PriorityBadge({ priority }: PriorityBadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${priorityStyles[priority]}`}
    >
      {priority}
    </span>
  );
}
