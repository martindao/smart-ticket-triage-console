import {
  Ticket,
  UserPlus,
  ArrowUpRight,
  CheckCircle2,
  MessageSquare,
  XCircle,
} from 'lucide-react';
import type { Activity } from '../types/ticket';

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
  return (
    <div className="activity-feed">
      <div>
        {activities.length === 0 ? (
          <div className="p-6 text-center" style={{ color: 'var(--text-400)' }}>
            <p>No recent activity</p>
          </div>
        ) : (
          activities.slice(0, 10).map((activity) => {
            const Icon = activityIcons[activity.type];
            const bgColor = activityColors[activity.type];
            const iconColor = activityIconColors[activity.type];

            return (
              <div key={activity.id} className="activity-item">
                <div className="flex gap-3">
                  <div
                    className="activity-icon-wrap"
                    style={{ background: bgColor }}
                  >
                    <Icon className="w-4 h-4" style={{ color: iconColor }} />
                  </div>
                  <div className="activity-content">
                    <p className="text-sm">
                      <span className="activity-agent">{activity.agent.name}</span>{' '}
                      <span className="activity-action">{activity.description}</span>
                    </p>
                    <p className="activity-time">
                      {getRelativeTime(activity.timestamp)}
                    </p>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
