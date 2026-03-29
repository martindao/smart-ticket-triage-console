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
  created: 'bg-blue-50 text-blue-600',
  assigned: 'bg-indigo-50 text-indigo-600',
  escalated: 'bg-orange-50 text-orange-600',
  resolved: 'bg-green-50 text-green-600',
  closed: 'bg-gray-50 text-gray-600',
  note_added: 'bg-purple-50 text-purple-600',
};

export function ActivityFeed({ activities }: ActivityFeedProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      <div className="divide-y divide-gray-100">
        {activities.length === 0 ? (
          <div className="p-6 text-center text-gray-400">
            <p>No recent activity</p>
          </div>
        ) : (
          activities.slice(0, 10).map((activity) => {
            const Icon = activityIcons[activity.type];
            const colorClass = activityColors[activity.type];

            return (
              <div key={activity.id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex gap-3">
                  <div className={`w-8 h-8 rounded-lg ${colorClass} flex items-center justify-center flex-shrink-0`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900">
                      <span className="font-medium">{activity.agent.name}</span>{' '}
                      {activity.description}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(activity.timestamp).toLocaleString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit',
                      })}
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
