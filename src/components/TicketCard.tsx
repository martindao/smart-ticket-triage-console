import type { Ticket } from '../types/ticket';
import { PriorityBadge } from './PriorityBadge';
import { StatusBadge } from './StatusBadge';
import { AgentAvatar } from './AgentAvatar';
import { SLABadge } from './SLABadge';
import { Tag, GripVertical } from 'lucide-react';

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

  // Determine if critical for special styling
  const isCritical = ticket.priority === 'Critical';
  const isOverdue = new Date(ticket.slaDeadline) < new Date();

  // Determine card state class
  const getCardClassName = () => {
    let classes = 'group relative px-3 py-2.5 cursor-pointer transition-all duration-150';
    if (isSelected) {
      classes += ' ticket-card-selected';
    } else if (isOverdue) {
      classes += ' ticket-card-overdue';
    } else if (isCritical) {
      classes += ' ticket-card-critical';
    } else {
      classes += ' bg-[var(--surface-800)] hover:bg-[var(--surface-750)]';
    }
    return classes;
  };

  return (
    <div
      onClick={onClick}
      className={getCardClassName()}
      style={{
        borderBottom: '1px solid var(--border-subtle)',
      }}
    >

      {/* Drag handle hint on hover */}
      <div
        className="absolute left-0 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-40 transition-opacity"
        style={{ marginLeft: '4px' }}
      >
        <GripVertical className="w-3 h-3 text-[var(--text-400)]" />
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
      <h3 className="ticket-title line-clamp-2 mb-2">
        {ticket.title}
      </h3>

      {/* Footer row: Status + SLA + Date */}
      <div className="flex items-center gap-2">
        <StatusBadge status={ticket.status} />
        <SLABadge deadline={ticket.slaDeadline} />
        <div className="flex-1" />
        <span className="text-[11px] text-[var(--text-500)]">{createdDate}</span>
      </div>

      {/* Tags - compact inline */}
      {ticket.tags.length > 0 && (
        <div className="flex items-center gap-1.5 mt-2 pt-2" style={{ borderTop: '1px solid var(--border-subtle)' }}>
          <Tag className="w-3 h-3 text-[var(--text-500)]" />
          {ticket.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="text-[11px] text-[var(--text-400)] bg-[var(--surface-600)] px-1.5 py-0.5 rounded"
            >
              {tag}
            </span>
          ))}
          {ticket.tags.length > 3 && (
            <span className="text-[11px] text-[var(--text-500)]">+{ticket.tags.length - 3}</span>
          )}
        </div>
      )}
    </div>
  );
}
