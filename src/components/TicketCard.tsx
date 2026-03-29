import type { Ticket } from '../types/ticket';
import { PriorityBadge } from './PriorityBadge';
import { StatusBadge } from './StatusBadge';
import { AgentAvatar } from './AgentAvatar';
import { SLABadge } from './SLABadge';
import { Tag } from 'lucide-react';

interface TicketCardProps {
  ticket: Ticket;
  isSelected: boolean;
  onClick: () => void;
  compact?: boolean;
}

export function TicketCard({ ticket, isSelected, onClick, compact: _compact }: TicketCardProps) {
  const createdDate = new Date(ticket.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });

  return (
    <div
      onClick={onClick}
      className={`
        p-4 rounded-lg border cursor-pointer transition-all duration-200
        ${isSelected 
          ? 'bg-blue-50 border-blue-300 shadow-sm' 
          : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-sm'
        }
      `}
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono text-gray-500">{ticket.id}</span>
            <PriorityBadge priority={ticket.priority} />
          </div>
          <h3 className="font-medium text-gray-900 text-sm leading-tight line-clamp-2">
            {ticket.title}
          </h3>
        </div>
        <AgentAvatar agent={ticket.assignee} size="sm" />
      </div>

      <div className="flex items-center justify-between gap-2 mt-3">
        <div className="flex items-center gap-2">
          <StatusBadge status={ticket.status} />
          <SLABadge deadline={ticket.slaDeadline} />
        </div>
        <span className="text-xs text-gray-400">{createdDate}</span>
      </div>

      {ticket.tags.length > 0 && (
        <div className="flex items-center gap-1 mt-2 flex-wrap">
          <Tag className="w-3 h-3 text-gray-400" />
          {ticket.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="text-xs text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded"
            >
              {tag}
            </span>
          ))}
          {ticket.tags.length > 3 && (
            <span className="text-xs text-gray-400">+{ticket.tags.length - 3}</span>
          )}
        </div>
      )}
    </div>
  );
}
