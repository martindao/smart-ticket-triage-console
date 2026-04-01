import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { TicketDetail } from '../TicketDetail';
import { agents, tickets } from '../../data';

describe('TicketDetail', () => {
  it('fires action callbacks from buttons', async () => {
    const user = userEvent.setup();
    const onAssign = vi.fn();
    const onEscalate = vi.fn();
    const onResolve = vi.fn();
    const onClose = vi.fn();
    const onAddNote = vi.fn();
    const onSelectTicket = vi.fn();

    render(
      <TicketDetail
        ticket={tickets.find((t) => t.id === 'TKT-002') ?? null}
        agents={agents}
        currentAgent={agents[0]}
        onAssign={onAssign}
        onEscalate={onEscalate}
        onResolve={onResolve}
        onClose={onClose}
        onAddNote={onAddNote}
        onSelectTicket={onSelectTicket}
      />
    );

    await user.click(screen.getByRole('button', { name: 'Escalate' }));
    expect(onEscalate).toHaveBeenCalledWith('TKT-002');

    await user.click(screen.getByRole('button', { name: 'Resolve' }));
    await user.type(screen.getByPlaceholderText('Describe the root cause and resolution...'), 'Provider timeout fixed');
    await user.click(screen.getByRole('button', { name: 'Confirm Resolve' }));
    expect(onResolve).toHaveBeenCalledWith('TKT-002', 'Provider timeout fixed');

    await user.click(screen.getByRole('button', { name: /Mike Rodriguez/i }));
    expect(onAssign).toHaveBeenCalledWith('TKT-002', 'AG-002');

    await user.type(screen.getByPlaceholderText('Add a note...'), 'Escalation path verified');
    await user.click(screen.getByRole('button', { name: 'Add Note' }));
    expect(onAddNote).toHaveBeenCalledWith('TKT-002', 'Escalation path verified', false);
  });

  it('shows view-original navigation for escalated tickets', async () => {
    const user = userEvent.setup();
    const onSelectTicket = vi.fn();
    const escalatedTicket = {
      ...tickets[0],
      id: 'TKT-010',
      escalatedFrom: 'TKT-004',
    };

    render(
      <TicketDetail
        ticket={escalatedTicket}
        agents={agents}
        currentAgent={agents[0]}
        onAssign={vi.fn()}
        onEscalate={vi.fn()}
        onResolve={vi.fn()}
        onClose={vi.fn()}
        onAddNote={vi.fn()}
        onSelectTicket={onSelectTicket}
      />
    );

    await user.click(screen.getByRole('button', { name: /View Original/i }));
    expect(onSelectTicket).toHaveBeenCalledWith('TKT-004');
    expect(screen.getByText(/Escalated from TKT-004/i)).toBeInTheDocument();
  });

  it('reveals stored RCA details and supports closing a resolved ticket', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();

    render(
      <TicketDetail
        ticket={tickets.find((t) => t.id === 'TKT-001') ?? null}
        agents={agents}
        currentAgent={agents[0]}
        onAssign={vi.fn()}
        onEscalate={vi.fn()}
        onResolve={vi.fn()}
        onClose={onClose}
        onAddNote={vi.fn()}
        onSelectTicket={vi.fn()}
      />
    );

    expect(screen.getByText('Root Cause Analysis')).toBeInTheDocument();
    expect(screen.queryByText(/Customer Impact:/i)).not.toBeInTheDocument();

    // Button was renamed from "View Details" to "View"
    await user.click(screen.getByRole('button', { name: /View$/i }));

    expect(screen.getByText(/Customer Impact:/i)).toBeInTheDocument();
    expect(screen.getByText(/Monitoring thresholds and response runbook updated/i)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Close' }));
    expect(onClose).toHaveBeenCalledWith('TKT-001');
  });
});
