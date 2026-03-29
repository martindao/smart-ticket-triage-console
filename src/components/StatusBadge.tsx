import type { Status } from '../types/ticket';

interface StatusBadgeProps {
  status: Status;
}

const statusStyles: Record<Status, string> = {
  Open: 'bg-gray-100 text-gray-700 border-gray-200',
  'In Progress': 'bg-blue-50 text-blue-700 border-blue-200',
  Resolved: 'bg-green-50 text-green-700 border-green-200',
  Closed: 'bg-slate-100 text-slate-600 border-slate-200',
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
