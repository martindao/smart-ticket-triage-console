import type { Ticket } from '../types/ticket';
import { Inbox, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

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
      iconBg: 'var(--accent-primary-muted)',
      iconColor: 'var(--accent-primary)',
    },
    {
      label: 'In Progress',
      count: inProgressCount,
      icon: Loader2,
      iconBg: 'var(--semantic-info-muted)',
      iconColor: 'var(--semantic-info)',
    },
    {
      label: 'Resolved',
      count: resolvedCount,
      icon: CheckCircle2,
      iconBg: 'var(--semantic-success-muted)',
      iconColor: 'var(--semantic-success)',
    },
    {
      label: 'Overdue',
      count: overdueCount,
      icon: AlertCircle,
      iconBg: 'var(--accent-secondary)',
      iconColor: 'white',
      isOverdue: true,
    },
  ];

  return (
    <div className="grid grid-cols-4 gap-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card
            key={stat.label}
            className={stat.isOverdue ? 'border-[var(--accent-secondary)]' : ''}
            style={{
              background: stat.isOverdue ? 'var(--accent-secondary-muted)' : 'var(--surface-800)',
            }}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p
                    className="text-sm font-medium"
                    style={{ color: stat.isOverdue ? 'var(--accent-secondary)' : 'var(--text-200)' }}
                  >
                    {stat.label}
                  </p>
                  <p
                    className="text-2xl font-bold mt-1"
                    style={{ color: 'var(--text-100)' }}
                  >
                    {stat.count}
                  </p>
                </div>
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ background: stat.iconBg }}
                >
                  <Icon className="w-5 h-5" style={{ color: stat.iconColor }} />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
