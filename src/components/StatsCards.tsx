import type { Ticket } from '../types/ticket';
import { Inbox, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

interface StatsCardsProps {
  tickets: Ticket[];
}

export function StatsCards({ tickets }: StatsCardsProps) {
  const openCount = tickets.filter((t) => t.status === 'Open').length;
  const inProgressCount = tickets.filter((t) => t.status === 'In Progress').length;
  const resolvedCount = tickets.filter((t) => t.status === 'Resolved').length;
  const overdueCount = tickets.filter((t) => {
    const deadline = new Date(t.slaDeadline);
    return deadline < new Date() && t.status !== 'Closed' && t.status !== 'Resolved';
  }).length;

  const stats = [
    {
      label: 'Open',
      count: openCount,
      icon: Inbox,
      color: 'bg-blue-50 text-blue-700 border-blue-200',
      iconBg: 'bg-blue-100',
    },
    {
      label: 'In Progress',
      count: inProgressCount,
      icon: Loader2,
      color: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      iconBg: 'bg-indigo-100',
    },
    {
      label: 'Resolved',
      count: resolvedCount,
      icon: CheckCircle2,
      color: 'bg-green-50 text-green-700 border-green-200',
      iconBg: 'bg-green-100',
    },
    {
      label: 'Overdue',
      count: overdueCount,
      icon: AlertCircle,
      color: 'bg-red-50 text-red-700 border-red-200',
      iconBg: 'bg-red-100',
    },
  ];

  return (
    <div className="grid grid-cols-4 gap-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div
            key={stat.label}
            className={`p-4 rounded-xl border ${stat.color} transition-all hover:shadow-sm`}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium opacity-80">{stat.label}</p>
                <p className="text-2xl font-bold mt-1">{stat.count}</p>
              </div>
              <div className={`w-10 h-10 rounded-lg ${stat.iconBg} flex items-center justify-center`}>
                <Icon className="w-5 h-5" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
