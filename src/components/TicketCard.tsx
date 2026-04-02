import type { Ticket } from '../types/ticket';
import { PriorityBadge } from './PriorityBadge';
import { StatusBadge } from './StatusBadge';
import { AgentAvatar } from './AgentAvatar';
import { SLABadge } from './SLABadge';
import { Tag, GripVertical } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

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

  const isCritical = ticket.priority === 'Critical';
  const isOverdue = new Date(ticket.slaDeadline) < new Date();

  // Determine card styling based on state
  const getCardStyle = (): React.CSSProperties => {
    if (isSelected) {
      return {
        background: 'var(--accent-primary-muted)',
        border: '2px solid var(--accent-primary)',
        boxShadow: '0 0 0 1px var(--accent-primary), 0 4px 12px rgba(16, 185, 129, 0.15)',
      };
    }
    if (isOverdue) {
      return {
        background: 'var(--accent-secondary-muted)',
        border: '1px solid var(--accent-secondary)',
      };
    }
    if (isCritical) {
      return {
        background: 'var(--semantic-critical-muted)',
        border: '1px solid var(--semantic-critical)',
      };
    }
    return {
      background: 'var(--surface-800)',
      border: '1px solid var(--border-subtle)',
    };
  };

  return (
    <Card
      onClick={onClick}
      className={`group relative cursor-pointer transition-all duration-150 ${
        isSelected ? 'ring-2 ring-[var(--accent-primary)]' : 'hover:shadow-md'
      }`}
      style={{
        ...getCardStyle(),
        borderBottom: '1px solid var(--border-subtle)',
      }}
    >
      <CardContent className="px-3 py-2.5">
        {/* Drag handle hint on hover */}
        <div
          className="absolute left-0 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-40 transition-opacity"
          style={{ marginLeft: '4px' }}
        >
          <GripVertical className="w-3 h-3" style={{ color: 'var(--text-400)' }} />
        </div>

        {/* Header row: ID + Priority + Avatar */}
        <div className="flex items-center gap-2 mb-1.5">
          <span
            className="text-[11px] font-mono tracking-wide"
            style={{ color: isSelected ? 'var(--accent-primary-text)' : 'var(--text-500)' }}
          >
            {ticket.id}
          </span>
          <PriorityBadge priority={ticket.priority} />
          <div className="flex-1" />
          <AgentAvatar agent={ticket.assignee} size="sm" />
        </div>

        {/* Title */}
        <h3
          className="line-clamp-2 mb-2 text-sm font-medium"
          style={{ color: isSelected ? 'var(--accent-primary-text)' : 'var(--text-100)' }}
        >
          {ticket.title}
        </h3>

        {/* Footer row: Status + SLA + Date */}
        <div className="flex items-center gap-2">
          <StatusBadge status={ticket.status} />
          <SLABadge deadline={ticket.slaDeadline} />
          <div className="flex-1" />
          <Badge variant="outline" className="text-[11px]">
            {createdDate}
          </Badge>
        </div>

        {/* Tags - compact inline */}
        {ticket.tags.length > 0 && (
          <div
            className="flex items-center gap-1.5 mt-2 pt-2"
            style={{ borderTop: '1px solid var(--border-subtle)' }}
          >
            <Tag className="w-3 h-3" style={{ color: 'var(--text-500)' }} />
            {ticket.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="secondary" className="text-[11px]">
                {tag}
              </Badge>
            ))}
            {ticket.tags.length > 3 && (
              <span className="text-[11px]" style={{ color: 'var(--text-500)' }}>
                +{ticket.tags.length - 3}
              </span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
