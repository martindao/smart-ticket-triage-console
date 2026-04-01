import { useState } from 'react';
import type { Ticket, Agent } from '../types/ticket';
import { PriorityBadge } from './PriorityBadge';
import { StatusBadge } from './StatusBadge';
import { AgentAvatar } from './AgentAvatar';
import { SLABadge } from './SLABadge';
import { NoteItem } from './NoteItem';
import {
  User,
  ArrowUpRight,
  Link as LinkIcon,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  XCircle,
  MessageSquare,
  Clock,
  Tag,
  FileText,
  AlertTriangle,
  Activity,
} from 'lucide-react';

interface TicketDetailProps {
  ticket: Ticket | null;
  agents: Agent[];
  currentAgent: Agent;
  onAssign: (ticketId: string, agentId: string) => void;
  onEscalate: (ticketId: string) => void;
  onResolve: (ticketId: string, rca: string) => void;
  onClose: (ticketId: string) => void;
  onAddNote: (ticketId: string, content: string, isInternal: boolean) => void;
  onSelectTicket: (ticketId: string) => void;
}

export function TicketDetail({
  ticket,
  agents,
  currentAgent: _currentAgent,
  onAssign,
  onEscalate,
  onResolve,
  onClose,
  onAddNote,
  onSelectTicket,
}: TicketDetailProps) {
  const [noteContent, setNoteContent] = useState('');
  const [isInternalNote, setIsInternalNote] = useState(false);
  const [rcaContent, setRcaContent] = useState('');
  const [showRcaInput, setShowRcaInput] = useState(false);
  const [showRcaDetails, setShowRcaDetails] = useState(false);

  if (!ticket) {
    return (
      <div className="h-full flex items-center justify-center empty-ticket-detail">
        <div className="text-center max-w-xs">
          <div className="empty-ticket-detail-icon w-16 h-16 mx-auto mb-4 rounded-xl flex items-center justify-center">
            <MessageSquare className="w-8 h-8 text-[var(--text-400)]" />
          </div>
          <p className="text-sm font-medium text-[var(--text-300)] mb-1">No ticket selected</p>
          <p className="text-xs text-[var(--text-500)]">Select a ticket from the queue to view details</p>
          <div className="mt-4 flex items-center justify-center gap-2 text-[10px] text-[var(--text-500)]">
            <kbd className="px-1.5 py-0.5 rounded bg-[var(--surface-700)] font-mono">j</kbd>
            <span>/</span>
            <kbd className="px-1.5 py-0.5 rounded bg-[var(--surface-700)] font-mono">k</kbd>
            <span>to navigate</span>
          </div>
        </div>
      </div>
    );
  }

  const handleAddNote = () => {
    if (noteContent.trim()) {
      onAddNote(ticket.id, noteContent.trim(), isInternalNote);
      setNoteContent('');
      setIsInternalNote(false);
    }
  };

  const handleResolve = () => {
    if (rcaContent.trim()) {
      onResolve(ticket.id, rcaContent.trim());
      setRcaContent('');
      setShowRcaInput(false);
    }
  };

  const createdDate = new Date(ticket.createdAt).toLocaleString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });

  const slaDate = new Date(ticket.slaDeadline).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });

  const canAssign = ticket.status !== 'Closed' && ticket.status !== 'Resolved';
  const canEscalate = ticket.priority !== 'Critical' && ticket.status !== 'Closed' && ticket.status !== 'Resolved';
  const canResolve = ticket.status === 'In Progress';
  const canClose = ticket.status === 'Resolved' || ticket.status === 'In Progress';

  return (
    <div className="h-full flex flex-col" style={{ background: 'var(--surface-900)' }}>
      {/* Header */}
      <div className="px-5 py-4" style={{ borderBottom: '1px solid var(--border-subtle)', background: 'var(--surface-800)' }}>
        {/* Top row: ID + Badges + Actions */}
        <div className="flex items-start justify-between gap-4 mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="text-xs font-mono tracking-wide text-[var(--text-500)]">{ticket.id}</span>
              <PriorityBadge priority={ticket.priority} />
              <StatusBadge status={ticket.status} />
              {ticket.escalatedFrom && (
                <button
                  onClick={() => onSelectTicket(ticket.escalatedFrom!)}
                  className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded transition-colors"
                  style={{
                    background: 'var(--accent-secondary-subtle)',
                    color: 'var(--accent-secondary)',
                    border: '1px solid var(--accent-secondary-muted)',
                  }}
                >
                  <LinkIcon className="w-3 h-3" />
                  Escalated from {ticket.escalatedFrom}
                </button>
              )}
            </div>
            <h2 className="text-lg font-semibold text-[var(--text-100)] leading-snug">{ticket.title}</h2>
          </div>
        </div>

        {/* Action buttons - workflow-first layout */}
        <div className="flex items-center gap-2 flex-wrap">
          {canAssign && (
            <div className="relative group">
              <button
                className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md transition-colors"
                style={{
                  background: 'var(--surface-700)',
                  color: 'var(--text-200)',
                  border: '1px solid var(--border-default)',
                }}
              >
                <User className="w-3.5 h-3.5" />
                Assign
              </button>
              <div
                className="absolute left-0 top-full mt-1 w-44 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-20"
                style={{
                  background: 'var(--surface-700)',
                  border: '1px solid var(--border-default)',
                }}
              >
                {agents.map((agent) => (
        <button
          key={agent.id}
          onClick={() => onAssign(ticket.id, agent.id)}
          className="agent-dropdown-item w-full flex items-center gap-2 px-3 py-2 text-xs text-left transition-colors first:rounded-t-lg last:rounded-b-lg"
          style={{ color: 'var(--text-200)' }}
        >
                    <AgentAvatar agent={agent} size="sm" />
                    <span>{agent.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
          {canEscalate && (
            <button
              onClick={() => onEscalate(ticket.id)}
              className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md transition-colors"
              style={{
                background: 'var(--accent-secondary-subtle)',
                color: 'var(--accent-secondary)',
                border: '1px solid var(--accent-secondary-muted)',
              }}
            >
              <ArrowUpRight className="w-3.5 h-3.5" />
              Escalate
            </button>
          )}
          {canResolve && (
            <button
              onClick={() => setShowRcaInput(true)}
              className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md transition-colors"
              style={{
                background: 'var(--semantic-success-muted)',
                color: 'var(--semantic-success)',
                border: '1px solid rgba(34,197,94,0.25)',
              }}
            >
              <CheckCircle className="w-3.5 h-3.5" />
              Resolve
            </button>
          )}
          {canClose && (
            <button
              onClick={() => onClose(ticket.id)}
              className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md transition-colors"
              style={{
                background: 'var(--surface-700)',
                color: 'var(--text-400)',
                border: '1px solid var(--border-default)',
              }}
            >
              <XCircle className="w-3.5 h-3.5" />
              Close
            </button>
          )}
        </div>
      </div>

      {/* Meta info bar */}
      <div className="px-5 py-3 flex flex-wrap items-center gap-4 text-xs" style={{ borderBottom: '1px solid var(--border-subtle)', background: 'var(--surface-850)' }}>
        <div className="flex items-center gap-1.5 text-[var(--text-400)]">
          <Clock className="w-3.5 h-3.5" />
          <span>Created {createdDate}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <AlertTriangle className="w-3.5 h-3.5 text-[var(--accent-secondary)]" />
          <span className="text-[var(--text-400)]">SLA: {slaDate}</span>
          <SLABadge deadline={ticket.slaDeadline} />
        </div>
        {ticket.assignee && (
          <div className="flex items-center gap-1.5 text-[var(--text-400)]">
            <User className="w-3.5 h-3.5" />
            <span>{ticket.assignee.name}</span>
          </div>
        )}
      </div>

      {/* Tags */}
      {ticket.tags.length > 0 && (
        <div className="px-5 py-2 flex items-center gap-2" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
          <Tag className="w-3.5 h-3.5 text-[var(--text-500)]" />
          {ticket.tags.map((tag) => (
            <span
              key={tag}
              className="text-[11px] text-[var(--text-400)] px-2 py-0.5 rounded"
              style={{ background: 'var(--surface-700)' }}
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-5 py-4">
        {/* Description */}
        <div className="mb-5">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-500)] mb-2 flex items-center gap-2">
            <FileText className="w-3.5 h-3.5" />
            Description
          </h3>
          <p className="text-sm text-[var(--text-300)] leading-relaxed">{ticket.description}</p>
        </div>

        {/* RCA */}
        {ticket.rca && (
          <div
            className="mb-5 p-3 rounded-lg"
            style={{
              background: 'var(--semantic-success-muted)',
              border: '1px solid rgba(34,197,94,0.25)',
            }}
          >
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--semantic-success)] flex items-center gap-2">
                <CheckCircle className="w-3.5 h-3.5" />
                Root Cause Analysis
              </h3>
              <button
                onClick={() => setShowRcaDetails((prev) => !prev)}
                className="inline-flex items-center gap-1 text-[11px] text-[var(--semantic-success)] hover:opacity-80 transition-opacity"
              >
                {showRcaDetails ? 'Hide' : 'View'}
                {showRcaDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            </div>
            {showRcaDetails && (
              <div className="mt-3 text-xs text-[var(--text-200)] space-y-2">
                <p><strong className="text-[var(--text-100)]">Summary:</strong> {ticket.rca}</p>
                <p><strong className="text-[var(--text-100)]">Customer Impact:</strong> Service behavior restored and user-facing symptoms no longer reproducible.</p>
                <p><strong className="text-[var(--text-100)]">Follow-up:</strong> Monitoring thresholds and response runbook updated to reduce repeat incidents.</p>
              </div>
            )}
          </div>
        )}

        {ticket.escalatedFrom && (
          <div
            className="mb-5 p-3 rounded-lg"
            style={{
              background: 'var(--accent-secondary-subtle)',
              border: '1px solid var(--accent-secondary-muted)',
            }}
          >
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--accent-secondary)] mb-2 flex items-center gap-2">
              <ArrowUpRight className="w-3.5 h-3.5" />
              Escalation Context
            </h3>
            <p className="text-xs text-[var(--text-200)] mb-3">
              This ticket was escalated from <strong className="text-[var(--accent-secondary)]">{ticket.escalatedFrom}</strong> to increase priority and route deeper technical investigation.
            </p>
            <button
              onClick={() => onSelectTicket(ticket.escalatedFrom!)}
              className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md transition-colors"
              style={{
                color: 'var(--accent-secondary)',
                background: 'var(--surface-700)',
                border: '1px solid var(--accent-secondary-muted)',
              }}
            >
              <LinkIcon className="w-3.5 h-3.5" />
              View Original
            </button>
          </div>
        )}

        {/* RCA Input for Resolve */}
        {showRcaInput && (
          <div
            className="mb-5 p-4 rounded-lg"
            style={{
              background: 'var(--accent-primary-subtle)',
              border: '1px solid var(--accent-primary-muted)',
            }}
          >
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--accent-primary-text)] mb-3 flex items-center gap-2">
              <Activity className="w-3.5 h-3.5" />
              Add Root Cause Analysis
            </h3>
            <textarea
              value={rcaContent}
              onChange={(e) => setRcaContent(e.target.value)}
              placeholder="Describe the root cause and resolution..."
              className="w-full px-3 py-2 text-sm rounded-md focus:outline-none resize-none"
              style={{
                background: 'var(--surface-700)',
                border: '1px solid var(--border-default)',
                color: 'var(--text-200)',
              }}
              rows={3}
            />
            <div className="flex gap-2 mt-3">
              <button
                onClick={handleResolve}
                disabled={!rcaContent.trim()}
                className="px-4 py-2 text-xs font-medium rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  background: 'var(--accent-primary)',
                  color: 'var(--surface-950)',
                }}
              >
                Confirm Resolve
              </button>
              <button
                onClick={() => setShowRcaInput(false)}
                className="px-4 py-2 text-xs font-medium rounded-md transition-colors"
                style={{
                  background: 'var(--surface-700)',
                  color: 'var(--text-300)',
                  border: '1px solid var(--border-default)',
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Notes */}
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-500)] mb-3 flex items-center gap-2">
            <MessageSquare className="w-3.5 h-3.5" />
            Notes ({ticket.notes.length})
          </h3>

          {ticket.notes.length > 0 && (
            <div className="space-y-2 mb-4">
              {ticket.notes.map((note) => (
                <NoteItem key={note.id} note={note} />
              ))}
            </div>
          )}

          {/* Add Note */}
          {ticket.status !== 'Closed' && (
            <div
              className="p-3 rounded-lg"
              style={{
                background: 'var(--surface-800)',
                border: '1px solid var(--border-default)',
              }}
            >
              <textarea
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                placeholder="Add a note..."
                className="w-full px-3 py-2 text-sm rounded-md focus:outline-none resize-none"
                style={{
                  background: 'var(--surface-700)',
                  border: '1px solid var(--border-default)',
                  color: 'var(--text-200)',
                }}
                rows={3}
              />
              <div className="flex items-center justify-between mt-2">
                <label className="flex items-center gap-2 text-xs text-[var(--text-400)] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isInternalNote}
                    onChange={(e) => setIsInternalNote(e.target.checked)}
                    className="rounded"
                    style={{
                      borderColor: 'var(--border-default)',
                      accentColor: 'var(--accent-primary)',
                    }}
                  />
                  Internal note
                </label>
                <button
                  onClick={handleAddNote}
                  disabled={!noteContent.trim()}
                  className="px-4 py-1.5 text-xs font-medium rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    background: 'var(--accent-primary)',
                    color: 'var(--surface-950)',
                  }}
                >
                  Add Note
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
