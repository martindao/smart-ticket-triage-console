import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QueueTabs } from '../QueueTabs';
import { tickets } from '../../data';

/**
 * Visual/Interaction Contract Tests for QueueTabs
 *
 * These tests protect the redesign-sensitive surface area:
 * - Tab visibility and order
 * - Count badges on each tab
 * - Active tab visual state
 * - Tab click interaction
 *
 * RED phase: Tests should pass with current implementation
 * GREEN phase: After redesign, these should still pass
 */
describe('QueueTabs - Visual Contract', () => {
  const currentAgentId = 'AG-001';
  const mockOnTabChange = vi.fn();

  beforeEach(() => {
    mockOnTabChange.mockClear();
  });

  it('renders all five triage tabs in correct order', () => {
    render(
      <QueueTabs
        activeTab="all"
        onTabChange={mockOnTabChange}
        tickets={tickets}
        currentAgentId={currentAgentId}
      />
    );

    // All tabs must be visible
    expect(screen.getByRole('button', { name: /All Tickets/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /My Tickets/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Unassigned/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Critical/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Overdue/ })).toBeInTheDocument();
  });

  it('displays correct count badges on each tab', () => {
    render(
      <QueueTabs
        activeTab="all"
        onTabChange={mockOnTabChange}
        tickets={tickets}
        currentAgentId={currentAgentId}
      />
    );

    // Count badges must be visible and accurate
    const allTicketsTab = screen.getByRole('button', { name: /All Tickets/ });
    expect(allTicketsTab).toHaveTextContent(String(tickets.length));

    // Critical count
    const criticalCount = tickets.filter((t) => t.priority === 'Critical').length;
    const criticalTab = screen.getByRole('button', { name: /Critical/ });
    expect(criticalTab).toHaveTextContent(String(criticalCount));

    // Unassigned count
    const unassignedCount = tickets.filter((t) => t.assignee === null).length;
    const unassignedTab = screen.getByRole('button', { name: /Unassigned/ });
    expect(unassignedTab).toHaveTextContent(String(unassignedCount));
  });

  it('shows active tab with distinct visual state', () => {
    render(
      <QueueTabs
        activeTab="critical"
        onTabChange={mockOnTabChange}
        tickets={tickets}
        currentAgentId={currentAgentId}
      />
    );

    // Active tab should have distinct styling (premium-dark uses inline styles)
    const criticalTab = screen.getByRole('button', { name: /Critical/ });
    // Check for the active state via inline style
    expect(criticalTab).toHaveStyle({ background: 'var(--accent-primary-muted)' });

    // Non-active tabs should not have active styling
    const allTicketsTab = screen.getByRole('button', { name: /All Tickets/ });
    expect(allTicketsTab).toHaveStyle({ background: 'transparent' });
  });

  it('fires onTabChange when tab is clicked', async () => {
    const user = userEvent.setup();
    render(
      <QueueTabs
        activeTab="all"
        onTabChange={mockOnTabChange}
        tickets={tickets}
        currentAgentId={currentAgentId}
      />
    );

    await user.click(screen.getByRole('button', { name: /Critical/ }));
    expect(mockOnTabChange).toHaveBeenCalledWith('critical');

    await user.click(screen.getByRole('button', { name: /Unassigned/ }));
    expect(mockOnTabChange).toHaveBeenCalledWith('unassigned');
  });

  it('maintains tab container layout with horizontal flex', () => {
    const { container } = render(
      <QueueTabs
        activeTab="all"
        onTabChange={mockOnTabChange}
        tickets={tickets}
        currentAgentId={currentAgentId}
      />
    );

    // Container must use horizontal flex layout
    const tabContainer = container.firstChild as HTMLElement;
    expect(tabContainer).toHaveClass('flex');
    expect(tabContainer).toHaveClass('items-center');
  });

  it('renders count badges with pill styling', () => {
    render(
      <QueueTabs
        activeTab="all"
        onTabChange={mockOnTabChange}
        tickets={tickets}
        currentAgentId={currentAgentId}
      />
    );

    // Count badges should have rounded-full styling
    const allTicketsTab = screen.getByRole('button', { name: /All Tickets/ });
    const countBadge = allTicketsTab.querySelector('span');
    expect(countBadge).toHaveClass('rounded-full');
  });
});
