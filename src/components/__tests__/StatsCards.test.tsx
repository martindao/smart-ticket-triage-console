import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { StatsCards } from '../StatsCards';
import type { Ticket } from '../../types/ticket';

const makeTicket = (overrides: Partial<Ticket>): Ticket => ({
  id: 'TKT-TEST',
  title: 'Test ticket',
  description: 'desc',
  priority: 'Medium',
  status: 'Open',
  assignee: null,
  tags: [],
  createdAt: new Date().toISOString(),
  slaDeadline: new Date(Date.now() + 86400000).toISOString(),
  notes: [],
  ...overrides,
});

describe('StatsCards', () => {
  it('renders correct counts for each status category', () => {
    const testTickets: Ticket[] = [
      makeTicket({ id: 'T1', status: 'Open' }),
      makeTicket({ id: 'T2', status: 'Open' }),
      makeTicket({ id: 'T3', status: 'In Progress' }),
      makeTicket({ id: 'T4', status: 'Resolved' }),
      makeTicket({
        id: 'T5',
        status: 'Open',
        slaDeadline: new Date(Date.now() - 86400000).toISOString(),
      }),
    ];

    render(<StatsCards tickets={testTickets} />);

    // Labels present
    expect(screen.getByText('Open')).toBeInTheDocument();
    expect(screen.getByText('In Progress')).toBeInTheDocument();
    expect(screen.getByText('Resolved')).toBeInTheDocument();
    expect(screen.getByText('Overdue')).toBeInTheDocument();

    // Open = 3 (T1, T2, T5), In Progress = 1, Resolved = 1, Overdue = 1 (T5)
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getAllByText('1')).toHaveLength(3);
  });

  it('shows zero counts when no tickets', () => {
    render(<StatsCards tickets={[]} />);

    const zeros = screen.getAllByText('0');
    expect(zeros).toHaveLength(4);
  });
});
