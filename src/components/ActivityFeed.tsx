import {
  Ticket,
  UserPlus,
  ArrowUpRight,
  CheckCircle2,
  MessageSquare,
  XCircle,
} from 'lucide-react';
import type { Activity } from '../types/ticket';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ActivityFeedProps {
  activities: Activity[];
}

const activityIcons: Record<Activity['type'], typeof Ticket> = {
  created: Ticket,
  assigned: UserPlus,
  escalated: ArrowUpRight,
  resolved: CheckCircle2,
  closed: XCircle,
  note_added: MessageSquare,
};

const activityColors: Record<Activity['type'], string> = {
  created: 'rgba(59, 130, 246, 0.15)',
  assigned: 'rgba(99, 102, 241, 0.15)',
  escalated: 'rgba(249, 115, 22, 0.15)',
  resolved: 'rgba(34, 197, 94, 0.15)',
  closed: 'rgba(107, 114, 128, 0.15)',
  note_added: 'rgba(168, 85, 247, 0.15)',
};

const activityIconColors: Record<Activity['type'], string> = {
  created: '#60a5fa',
  assigned: '#818cf8',
  escalated: '#fb923c',
  resolved: '#4ade80',
  closed: '#9ca3af',
  note_added: '#c084fc',
};

function getRelativeTime(timestamp: string): string {
  const now = new Date();
  const then = new Date(timestamp);
  const diffMs = now.getTime() - then.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return then.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function ActivityFeed({ activities }: ActivityFeedProps) {
  if (activities.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center" style={{ color: 'var(--text-400)' }}>
          <p>No recent activity</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <ScrollArea className="h-[400px]">
        <div className="space-y-1">
          {activities.slice(0, 10).map((activity, index) => {
            const Icon = activityIcons[activity.type];
            const bgColor = activityColors[activity.type];
            const iconColor = activityIconColors[activity.type];

            return (
              <div key={activity.id}>
                <div className="flex gap-3 p-3">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: bgColor }}
                  >
                    <Icon className="w-4 h-4" style={{ color: iconColor }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <Avatar className="w-5 h-5">
                        <AvatarFallback
                          className="text-[10px]"
                          style={{
                            background: 'var(--surface-600)',
                            color: 'var(--text-300)',
                          }}
                        >
                          {activity.agent.name
                            .split(' ')
                            .map((n) => n[0])
                            .join('')}
                        </AvatarFallback>
                      </Avatar>
                      <p className="text-sm" style={{ color: 'var(--text-200)' }}>
                        <span className="font-medium" style={{ color: 'var(--text-100)' }}>
                          {activity.agent.name}
                        </span>{' '}
                        <span style={{ color: 'var(--text-400)' }}>
                          {activity.description}
                        </span>
                      </p>
                    </div>
                    <p
                      className="text-xs mt-1"
                      style={{ color: 'var(--text-500)' }}
                    >
                      {getRelativeTime(activity.timestamp)}
                    </p>
                  </div>
                </div>
                {index < Math.min(activities.length, 10) - 1 && (
                  <Separator className="mx-3" />
                )}
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </Card>
  );
}
