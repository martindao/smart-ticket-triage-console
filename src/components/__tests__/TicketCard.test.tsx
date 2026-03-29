import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { TicketCard } from '../TicketCard';
import { agents } from '../../data';

describe('TicketCard', () => {
  it('renders ticket information with priority and status badges', () => {
    render(
      <TicketCard
        ticket={{
          id: 'TKT-100',
          title: 'Critical API outage',
          description: 'API returns 500 for all traffic',
          priority: 'Critical',
          status: 'In Progress',
          assignee: agents[1],
          tags: ['api', 'outage', 'production'],
          createdAt: new Date().toISOString(),
          slaDeadline: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
          notes: [],
        }}
        isSelected={false}
        onClick={vi.fn()}
      />
    );

    expect(screen.getByText('TKT-100')).toBeInTheDocument();
    expect(screen.getByText('Critical API outage')).toBeInTheDocument();
    expect(screen.getByText('Critical')).toBeInTheDocument();
    expect(screen.getByText('In Progress')).toBeInTheDocument();
    expect(screen.getByText('api')).toBeInTheDocument();
  });
});
