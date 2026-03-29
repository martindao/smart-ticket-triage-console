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
  AlertCircle,
  FileText,
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
      <div className="h-full flex items-center justify-center text-gray-400">
        <div className="text-center">
          <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>Select a ticket to view details</p>
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
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-mono text-gray-500">{ticket.id}</span>
              <PriorityBadge priority={ticket.priority} />
              <StatusBadge status={ticket.status} />
              {ticket.escalatedFrom && (
                <button
                  onClick={() => onSelectTicket(ticket.escalatedFrom!)}
                  className="inline-flex items-center gap-1 text-xs bg-amber-50 text-amber-700 px-2 py-0.5 rounded border border-amber-200 hover:bg-amber-100"
                >
                  <LinkIcon className="w-3 h-3" />
                  Escalated from {ticket.escalatedFrom}
                </button>
              )}
            </div>
            <h2 className="text-xl font-semibold text-gray-900">{ticket.title}</h2>
          </div>
          <div className="flex items-center gap-2">
            {canAssign && (
              <div className="relative group">
                <button className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
                  <User className="w-4 h-4" />
                  Assign
                </button>
                <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                  {agents.map((agent) => (
                    <button
                      key={agent.id}
                      onClick={() => onAssign(ticket.id, agent.id)}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-left hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg"
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
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-orange-700 bg-orange-50 border border-orange-200 rounded-lg hover:bg-orange-100"
              >
                <ArrowUpRight className="w-4 h-4" />
                Escalate
              </button>
            )}
            {canResolve && (
              <button
                onClick={() => setShowRcaInput(true)}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-green-700 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100"
              >
                <CheckCircle className="w-4 h-4" />
                Resolve
              </button>
            )}
            {canClose && (
              <button
                onClick={() => onClose(ticket.id)}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <XCircle className="w-4 h-4" />
                Close
              </button>
            )}
          </div>
        </div>

        {/* Meta info */}
        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>Created {createdDate}</span>
          </div>
          <div className="flex items-center gap-1">
            <AlertCircle className="w-4 h-4" />
            <span>SLA: {slaDate}</span>
            <SLABadge deadline={ticket.slaDeadline} />
          </div>
          {ticket.assignee && (
            <div className="flex items-center gap-1">
              <User className="w-4 h-4" />
              <span>Assigned to {ticket.assignee.name}</span>
            </div>
          )}
        </div>

        {/* Tags */}
        {ticket.tags.length > 0 && (
          <div className="flex items-center gap-2 mt-3">
            <Tag className="w-4 h-4 text-gray-400" />
            {ticket.tags.map((tag) => (
              <span
                key={tag}
                className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {/* Description */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-900 mb-2 flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Description
          </h3>
          <p className="text-gray-700 leading-relaxed">{ticket.description}</p>
        </div>

        {/* RCA */}
        {ticket.rca && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-sm font-medium text-green-900 flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                Root Cause Analysis
              </h3>
              <button
                onClick={() => setShowRcaDetails((prev) => !prev)}
                className="inline-flex items-center gap-1 text-sm text-green-800 hover:text-green-900"
              >
                {showRcaDetails ? 'Hide Details' : 'View Details'}
                {showRcaDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
            </div>
            {showRcaDetails && (
              <div className="mt-3 text-sm text-green-800 space-y-2">
                <p><strong>Summary:</strong> {ticket.rca}</p>
                <p><strong>Customer Impact:</strong> Service behavior restored and user-facing symptoms no longer reproducible.</p>
                <p><strong>Follow-up:</strong> Monitoring thresholds and response runbook updated to reduce repeat incidents.</p>
              </div>
            )}
          </div>
        )}

        {ticket.escalatedFrom && (
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <h3 className="text-sm font-medium text-amber-900 mb-2">Escalation Context</h3>
            <p className="text-sm text-amber-800 mb-3">
              This ticket was escalated from <strong>{ticket.escalatedFrom}</strong> to increase priority and route deeper technical investigation.
            </p>
            <button
              onClick={() => onSelectTicket(ticket.escalatedFrom!)}
              className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-amber-900 bg-white border border-amber-300 rounded-lg hover:bg-amber-100"
            >
              <LinkIcon className="w-4 h-4" />
              View Original
            </button>
          </div>
        )}

        {/* RCA Input for Resolve */}
        {showRcaInput && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="text-sm font-medium text-blue-900 mb-2">
              Add Root Cause Analysis
            </h3>
            <textarea
              value={rcaContent}
              onChange={(e) => setRcaContent(e.target.value)}
              placeholder="Describe the root cause and resolution..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              rows={3}
            />
            <div className="flex gap-2 mt-2">
              <button
                onClick={handleResolve}
                disabled={!rcaContent.trim()}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Confirm Resolve
              </button>
              <button
                onClick={() => setShowRcaInput(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Notes */}
        <div>
          <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            Notes ({ticket.notes.length})
          </h3>

          {ticket.notes.length > 0 && (
            <div className="space-y-3 mb-4">
              {ticket.notes.map((note) => (
                <NoteItem key={note.id} note={note} />
              ))}
            </div>
          )}

          {/* Add Note */}
          {ticket.status !== 'Closed' && (
            <div className="border border-gray-200 rounded-lg p-3">
              <textarea
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                placeholder="Add a note..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none text-sm"
                rows={3}
              />
              <div className="flex items-center justify-between mt-2">
                <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isInternalNote}
                    onChange={(e) => setIsInternalNote(e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  Internal note
                </label>
                <button
                  onClick={handleAddNote}
                  disabled={!noteContent.trim()}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
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
