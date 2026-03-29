import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { QueueTabs } from '../QueueTabs';
import { tickets } from '../../data';
import { agents } from '../../data';

describe('QueueTabs', () => {
  it('renders all tabs with correct counts', () => {
    const onTabChange = vi.fn();

    render(
      <QueueTabs
        activeTab="all"
        onTabChange={onTabChange}
        tickets={tickets}
        currentAgentId={agents[0].id}
      />
    );

    expect(screen.getByText('All Tickets')).toBeInTheDocument();
    expect(screen.getByText('My Tickets')).toBeInTheDocument();
    expect(screen.getByText('Unassigned')).toBeInTheDocument();
    expect(screen.getByText('Critical')).toBeInTheDocument();
    expect(screen.getByText('Overdue')).toBeInTheDocument();

    // All Tickets count matches seed data
    expect(screen.getByText(String(tickets.length))).toBeInTheDocument();
  });

  it('calls onTabChange when a tab is clicked', async () => {
    const user = userEvent.setup();
    const onTabChange = vi.fn();

    render(
      <QueueTabs
        activeTab="all"
        onTabChange={onTabChange}
        tickets={tickets}
        currentAgentId={agents[0].id}
      />
    );

    await user.click(screen.getByText('Critical'));
    expect(onTabChange).toHaveBeenCalledWith('critical');

    await user.click(screen.getByText('My Tickets'));
    expect(onTabChange).toHaveBeenCalledWith('mine');
  });
});
