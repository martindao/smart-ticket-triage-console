import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TicketDetail } from '../TicketDetail';
import { agents, tickets } from '../../data';

/**
 * Visual/Interaction Contract Tests for TicketDetail
 *
 * These tests protect the redesign-sensitive surface area:
 * - Action button visibility (Assign, Escalate, Resolve, Close)
 * - Escalation context display and navigation
 * - RCA reveal/hide interaction
 * - Note input and submission
 * - Empty state when no ticket selected
 *
 * RED phase: Tests should pass with current implementation
 * GREEN phase: After redesign, these should still pass
 */
describe('TicketDetail - Visual Contract', () => {
  const mockOnAssign = vi.fn();
  const mockOnEscalate = vi.fn();
  const mockOnResolve = vi.fn();
  const mockOnClose = vi.fn();
  const mockOnAddNote = vi.fn();
  const mockOnSelectTicket = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Empty State', () => {
    it('shows placeholder when no ticket is selected', () => {
      render(
        <TicketDetail
          ticket={null}
          agents={agents}
          currentAgent={agents[0]}
          onAssign={mockOnAssign}
          onEscalate={mockOnEscalate}
          onResolve={mockOnResolve}
          onClose={mockOnClose}
          onAddNote={mockOnAddNote}
          onSelectTicket={mockOnSelectTicket}
        />
      );

      expect(screen.getByText('No ticket selected')).toBeInTheDocument();
    });
  });

  describe('Action Button Visibility', () => {
    it('shows Assign button for open tickets', () => {
      const openTicket = tickets.find((t) => t.status === 'Open') ?? tickets[0];
      render(
        <TicketDetail
          ticket={openTicket}
          agents={agents}
          currentAgent={agents[0]}
          onAssign={mockOnAssign}
          onEscalate={mockOnEscalate}
          onResolve={mockOnResolve}
          onClose={mockOnClose}
          onAddNote={mockOnAddNote}
          onSelectTicket={mockOnSelectTicket}
        />
      );

      expect(screen.getByRole('button', { name: 'Assign' })).toBeInTheDocument();
    });

    it('shows Escalate button for non-critical open tickets', () => {
      const highPriorityTicket = tickets.find((t) => t.priority === 'High' && t.status === 'Open');
      if (highPriorityTicket) {
        render(
          <TicketDetail
            ticket={highPriorityTicket}
            agents={agents}
            currentAgent={agents[0]}
            onAssign={mockOnAssign}
            onEscalate={mockOnEscalate}
            onResolve={mockOnResolve}
            onClose={mockOnClose}
            onAddNote={mockOnAddNote}
            onSelectTicket={mockOnSelectTicket}
          />
        );

        expect(screen.getByRole('button', { name: 'Escalate' })).toBeInTheDocument();
      }
    });

    it('hides Escalate button for critical tickets', () => {
      const criticalTicket = tickets.find((t) => t.priority === 'Critical');
      if (criticalTicket) {
        render(
          <TicketDetail
            ticket={criticalTicket}
            agents={agents}
            currentAgent={agents[0]}
            onAssign={mockOnAssign}
            onEscalate={mockOnEscalate}
            onResolve={mockOnResolve}
            onClose={mockOnClose}
            onAddNote={mockOnAddNote}
            onSelectTicket={mockOnSelectTicket}
          />
        );

        expect(screen.queryByRole('button', { name: 'Escalate' })).not.toBeInTheDocument();
      }
    });

    it('shows Resolve button for in-progress tickets', () => {
      const inProgressTicket = tickets.find((t) => t.status === 'In Progress');
      if (inProgressTicket) {
        render(
          <TicketDetail
            ticket={inProgressTicket}
            agents={agents}
            currentAgent={agents[0]}
            onAssign={mockOnAssign}
            onEscalate={mockOnEscalate}
            onResolve={mockOnResolve}
            onClose={mockOnClose}
            onAddNote={mockOnAddNote}
            onSelectTicket={mockOnSelectTicket}
          />
        );

        expect(screen.getByRole('button', { name: 'Resolve' })).toBeInTheDocument();
      }
    });

    it('shows Close button for resolved tickets', () => {
      const resolvedTicket = tickets.find((t) => t.status === 'Resolved');
      if (resolvedTicket) {
        render(
          <TicketDetail
            ticket={resolvedTicket}
            agents={agents}
            currentAgent={agents[0]}
            onAssign={mockOnAssign}
            onEscalate={mockOnEscalate}
            onResolve={mockOnResolve}
            onClose={mockOnClose}
            onAddNote={mockOnAddNote}
            onSelectTicket={mockOnSelectTicket}
          />
        );

        expect(screen.getByRole('button', { name: 'Close' })).toBeInTheDocument();
      }
    });
  });

  describe('Escalation Context', () => {
    it('shows escalation context for escalated tickets', () => {
      const escalatedTicket = {
        ...tickets[0],
        id: 'TKT-ESCALATED',
        escalatedFrom: 'TKT-001',
      };

      render(
        <TicketDetail
          ticket={escalatedTicket}
          agents={agents}
          currentAgent={agents[0]}
          onAssign={mockOnAssign}
          onEscalate={mockOnEscalate}
          onResolve={mockOnResolve}
          onClose={mockOnClose}
          onAddNote={mockOnAddNote}
          onSelectTicket={mockOnSelectTicket}
        />
      );

      expect(screen.getByText(/Escalated from TKT-001/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /View Original/i })).toBeInTheDocument();
    });

    it('navigates to original ticket when View Original is clicked', async () => {
      const user = userEvent.setup();
      const escalatedTicket = {
        ...tickets[0],
        id: 'TKT-ESCALATED',
        escalatedFrom: 'TKT-001',
      };

      render(
        <TicketDetail
          ticket={escalatedTicket}
          agents={agents}
          currentAgent={agents[0]}
          onAssign={mockOnAssign}
          onEscalate={mockOnEscalate}
          onResolve={mockOnResolve}
          onClose={mockOnClose}
          onAddNote={mockOnAddNote}
          onSelectTicket={mockOnSelectTicket}
        />
      );

      await user.click(screen.getByRole('button', { name: /View Original/i }));
      expect(mockOnSelectTicket).toHaveBeenCalledWith('TKT-001');
    });
  });

  describe('RCA Reveal', () => {
    it('shows RCA section for resolved tickets', () => {
      const resolvedTicket = tickets.find((t) => t.status === 'Resolved' && t.rca);
      if (resolvedTicket) {
        render(
          <TicketDetail
            ticket={resolvedTicket}
            agents={agents}
            currentAgent={agents[0]}
            onAssign={mockOnAssign}
            onEscalate={mockOnEscalate}
            onResolve={mockOnResolve}
            onClose={mockOnClose}
            onAddNote={mockOnAddNote}
            onSelectTicket={mockOnSelectTicket}
          />
        );

        expect(screen.getByText('Root Cause Analysis')).toBeInTheDocument();
      }
    });

    it('hides RCA details by default', () => {
      const resolvedTicket = tickets.find((t) => t.status === 'Resolved' && t.rca);
      if (resolvedTicket) {
        render(
          <TicketDetail
            ticket={resolvedTicket}
            agents={agents}
            currentAgent={agents[0]}
            onAssign={mockOnAssign}
            onEscalate={mockOnEscalate}
            onResolve={mockOnResolve}
            onClose={mockOnClose}
            onAddNote={mockOnAddNote}
            onSelectTicket={mockOnSelectTicket}
          />
        );

        expect(screen.getByRole('button', { name: /View$/i })).toBeInTheDocument();
        expect(screen.queryByText(/Customer Impact:/i)).not.toBeInTheDocument();
      }
    });

    it('reveals RCA details when View Details is clicked', async () => {
      const user = userEvent.setup();
      const resolvedTicket = tickets.find((t) => t.status === 'Resolved' && t.rca);
      if (resolvedTicket) {
        render(
          <TicketDetail
            ticket={resolvedTicket}
            agents={agents}
            currentAgent={agents[0]}
            onAssign={mockOnAssign}
            onEscalate={mockOnEscalate}
            onResolve={mockOnResolve}
            onClose={mockOnClose}
            onAddNote={mockOnAddNote}
            onSelectTicket={mockOnSelectTicket}
          />
        );

        await user.click(screen.getByRole('button', { name: /View$/i }));
        expect(screen.getByText(/Customer Impact:/i)).toBeInTheDocument();
      }
    });
  });

  describe('Note Input', () => {
    it('shows note input for open tickets', () => {
      const openTicket = tickets.find((t) => t.status !== 'Closed');
      render(
        <TicketDetail
          ticket={openTicket ?? tickets[0]}
          agents={agents}
          currentAgent={agents[0]}
          onAssign={mockOnAssign}
          onEscalate={mockOnEscalate}
          onResolve={mockOnResolve}
          onClose={mockOnClose}
          onAddNote={mockOnAddNote}
          onSelectTicket={mockOnSelectTicket}
        />
      );

      expect(screen.getByPlaceholderText('Add a note...')).toBeInTheDocument();
    });

    it('shows Add Note button', () => {
      const openTicket = tickets.find((t) => t.status !== 'Closed');
      render(
        <TicketDetail
          ticket={openTicket ?? tickets[0]}
          agents={agents}
          currentAgent={agents[0]}
          onAssign={mockOnAssign}
          onEscalate={mockOnEscalate}
          onResolve={mockOnResolve}
          onClose={mockOnClose}
          onAddNote={mockOnAddNote}
          onSelectTicket={mockOnSelectTicket}
        />
      );

      expect(screen.getByRole('button', { name: 'Add Note' })).toBeInTheDocument();
    });

    it('shows internal note checkbox', () => {
      const openTicket = tickets.find((t) => t.status !== 'Closed');
      render(
        <TicketDetail
          ticket={openTicket ?? tickets[0]}
          agents={agents}
          currentAgent={agents[0]}
          onAssign={mockOnAssign}
          onEscalate={mockOnEscalate}
          onResolve={mockOnResolve}
          onClose={mockOnClose}
          onAddNote={mockOnAddNote}
          onSelectTicket={mockOnSelectTicket}
        />
      );

      expect(screen.getByLabelText(/Internal note/i)).toBeInTheDocument();
    });
  });

  describe('Ticket Information Display', () => {
    it('shows ticket ID', () => {
      render(
        <TicketDetail
          ticket={tickets[0]}
          agents={agents}
          currentAgent={agents[0]}
          onAssign={mockOnAssign}
          onEscalate={mockOnEscalate}
          onResolve={mockOnResolve}
          onClose={mockOnClose}
          onAddNote={mockOnAddNote}
          onSelectTicket={mockOnSelectTicket}
        />
      );

      expect(screen.getByText(tickets[0].id)).toBeInTheDocument();
    });

    it('shows ticket title', () => {
      render(
        <TicketDetail
          ticket={tickets[0]}
          agents={agents}
          currentAgent={agents[0]}
          onAssign={mockOnAssign}
          onEscalate={mockOnEscalate}
          onResolve={mockOnResolve}
          onClose={mockOnClose}
          onAddNote={mockOnAddNote}
          onSelectTicket={mockOnSelectTicket}
        />
      );

      expect(screen.getByText(tickets[0].title, { exact: false })).toBeInTheDocument();
    });

    it('shows ticket description', () => {
      render(
        <TicketDetail
          ticket={tickets[0]}
          agents={agents}
          currentAgent={agents[0]}
          onAssign={mockOnAssign}
          onEscalate={mockOnEscalate}
          onResolve={mockOnResolve}
          onClose={mockOnClose}
          onAddNote={mockOnAddNote}
          onSelectTicket={mockOnSelectTicket}
        />
      );

      expect(screen.getByText(tickets[0].description)).toBeInTheDocument();
    });

    it('shows tags when present', () => {
      const ticketWithTags = tickets.find((t) => t.tags.length > 0);
      if (ticketWithTags) {
        render(
          <TicketDetail
            ticket={ticketWithTags}
            agents={agents}
            currentAgent={agents[0]}
            onAssign={mockOnAssign}
            onEscalate={mockOnEscalate}
            onResolve={mockOnResolve}
            onClose={mockOnClose}
            onAddNote={mockOnAddNote}
            onSelectTicket={mockOnSelectTicket}
          />
        );

        expect(screen.getByText(ticketWithTags.tags[0])).toBeInTheDocument();
      }
    });
  });

  describe('Resolve Flow', () => {
    it('shows RCA input when Resolve is clicked', async () => {
      const user = userEvent.setup();
      const inProgressTicket = tickets.find((t) => t.status === 'In Progress');
      if (inProgressTicket) {
        render(
          <TicketDetail
            ticket={inProgressTicket}
            agents={agents}
            currentAgent={agents[0]}
            onAssign={mockOnAssign}
            onEscalate={mockOnEscalate}
            onResolve={mockOnResolve}
            onClose={mockOnClose}
            onAddNote={mockOnAddNote}
            onSelectTicket={mockOnSelectTicket}
          />
        );

        await user.click(screen.getByRole('button', { name: 'Resolve' }));
        expect(screen.getByPlaceholderText('Describe the root cause and resolution...')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Confirm Resolve' })).toBeInTheDocument();
      }
    });

    it('fires onResolve with RCA when Confirm Resolve is clicked', async () => {
      const user = userEvent.setup();
      const inProgressTicket = tickets.find((t) => t.status === 'In Progress');
      if (inProgressTicket) {
        render(
          <TicketDetail
            ticket={inProgressTicket}
            agents={agents}
            currentAgent={agents[0]}
            onAssign={mockOnAssign}
            onEscalate={mockOnEscalate}
            onResolve={mockOnResolve}
            onClose={mockOnClose}
            onAddNote={mockOnAddNote}
            onSelectTicket={mockOnSelectTicket}
          />
        );

        await user.click(screen.getByRole('button', { name: 'Resolve' }));
        await user.type(screen.getByPlaceholderText('Describe the root cause and resolution...'), 'Fixed the issue');
        await user.click(screen.getByRole('button', { name: 'Confirm Resolve' }));

        expect(mockOnResolve).toHaveBeenCalledWith(inProgressTicket.id, 'Fixed the issue');
      }
    });
  });
});
