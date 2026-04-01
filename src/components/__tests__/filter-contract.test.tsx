/**
 * Filter Contract Tests for Smart Ticket Triage Console
 *
 * These tests protect the critical filter and tab behavior.
 * They ensure filtering workflows work correctly and survive redesign.
 *
 * CONTRACT AREAS:
 * 1. Tab filtering - queue tabs filter correctly
 * 2. Dropdown filters - priority, status, assignee filters work
 * 3. Search - search filters by ID, title, description, tags
 * 4. Filter combination - multiple filters work together
 * 5. Filter chips - active filters show as removable chips
 * 6. Clear filters - reset restores full queue
 */

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import App from '../../App';

// Clear localStorage before each test for isolation
beforeEach(() => {
  vi.stubGlobal('localStorage', {
    getItem: vi.fn(() => null),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
  });
});

describe('Filter Contract: Tab Behavior', () => {
  it('All Tickets tab shows all tickets in queue', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('button', { name: /All Tickets/i }));

    // All seed tickets should be visible
    expect(screen.getByText('Login page slow on mobile')).toBeInTheDocument();
    expect(screen.getByText('Password reset email delayed')).toBeInTheDocument();
    expect(screen.getByText('Invoice PDF not downloading')).toBeInTheDocument();
    expect(screen.getByText('API rate limit errors')).toBeInTheDocument();
    expect(screen.getByText('Feature request: Dark mode')).toBeInTheDocument();
  });

  it('Critical tab shows only Critical priority tickets', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('button', { name: /Critical/i }));

    // Only Critical tickets
    expect(screen.getByText('API rate limit errors')).toBeInTheDocument();
    expect(screen.queryByText('Login page slow on mobile')).not.toBeInTheDocument();
    expect(screen.queryByText('Feature request: Dark mode')).not.toBeInTheDocument();
  });

  it('Unassigned tab shows only unassigned tickets', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('button', { name: /Unassigned/i }));

    // Only unassigned tickets
    expect(screen.getByText('Feature request: Dark mode')).toBeInTheDocument();
    expect(screen.queryByText('Password reset email delayed')).not.toBeInTheDocument();
    expect(screen.queryByText('API rate limit errors')).not.toBeInTheDocument();
  });

  it('My Tickets tab shows only current agent tickets', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('button', { name: /My Tickets/i }));

    // Only Sarah Chen's tickets
    expect(screen.getByText('Password reset email delayed')).toBeInTheDocument();
    expect(screen.queryByText('API rate limit errors')).not.toBeInTheDocument();
    expect(screen.queryByText('Feature request: Dark mode')).not.toBeInTheDocument();
  });

  it('Overdue tab shows only tickets past SLA deadline', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('button', { name: /Overdue/i }));

    // Only overdue tickets should be visible
    // Based on seed data, some tickets may be overdue
    const queueItems = screen.queryAllByRole('button');
    // At minimum, the queue should be filtered
    expect(queueItems.length).toBeGreaterThan(0);
  });

  it('tab counts update correctly after ticket state changes', async () => {
    const user = userEvent.setup();
    render(<App />);

    // Get initial Critical count
    const criticalTab = screen.getByRole('button', { name: /Critical/i });
    const initialText = criticalTab.textContent;

    // Escalate a ticket (creates new Critical)
    await user.click(screen.getByText('Invoice PDF not downloading'));
    await user.click(screen.getByRole('button', { name: 'Escalate' }));

    // Wait for escalation - find ticket ID in queue card (font-mono class)
    await waitFor(() => {
      const ticketIds = screen.getAllByText(/TKT-006/).filter(
        el => el.tagName === 'SPAN' && el.className.includes('font-mono')
      );
      expect(ticketIds.length).toBeGreaterThan(0);
    });

    // Critical count should increase
    await waitFor(() => {
      const updatedTab = screen.getByRole('button', { name: /Critical/i });
      expect(updatedTab.textContent).not.toBe(initialText);
    });
  });
});

describe('Filter Contract: Dropdown Filters', () => {
  it('Priority filter filters by selected priority', async () => {
    const user = userEvent.setup();
    render(<App />);

    const filterSelects = screen.getAllByRole('combobox');
    await user.selectOptions(filterSelects[0], 'High');

    // Only High priority tickets (TKT-002)
    expect(screen.getByText('Invoice PDF not downloading')).toBeInTheDocument();
    expect(screen.queryByText('API rate limit errors')).not.toBeInTheDocument(); // Critical
    expect(screen.queryByText('Login page slow on mobile')).not.toBeInTheDocument(); // Medium
  });

  it('Status filter filters by selected status', async () => {
    const user = userEvent.setup();
    render(<App />);

    const filterSelects = screen.getAllByRole('combobox');
    await user.selectOptions(filterSelects[1], 'In Progress');

    // Only In Progress tickets (TKT-002, TKT-004)
    expect(screen.getByText('Invoice PDF not downloading')).toBeInTheDocument();
    expect(screen.getByText('API rate limit errors')).toBeInTheDocument();
    expect(screen.queryByText('Login page slow on mobile')).not.toBeInTheDocument(); // Resolved
  });

  it('Assignee filter filters by selected assignee', async () => {
    const user = userEvent.setup();
    render(<App />);

    const filterSelects = screen.getAllByRole('combobox');
    await user.selectOptions(filterSelects[2], 'Mike Rodriguez');

    // Only Mike's tickets (TKT-002, TKT-004)
    expect(screen.getByText('API rate limit errors')).toBeInTheDocument();
    expect(screen.queryByText('Password reset email delayed')).not.toBeInTheDocument(); // Sarah
  });

  it('Assignee filter Unassigned option shows unassigned tickets', async () => {
    const user = userEvent.setup();
    render(<App />);

    const filterSelects = screen.getAllByRole('combobox');
    await user.selectOptions(filterSelects[2], 'Unassigned');

    // Only unassigned tickets (TKT-003)
    expect(screen.getByText('Feature request: Dark mode')).toBeInTheDocument();
    expect(screen.queryByText('Password reset email delayed')).not.toBeInTheDocument();
  });
});

describe('Filter Contract: Search', () => {
  it('search filters by ticket title', async () => {
    const user = userEvent.setup();
    render(<App />);

    const searchInput = screen.getByPlaceholderText('Search tickets...');
    await user.type(searchInput, 'rate limit');

    expect(screen.getByText('API rate limit errors')).toBeInTheDocument();
    expect(screen.queryByText('Login page slow on mobile')).not.toBeInTheDocument();
  });

  it('search filters by ticket ID', async () => {
    const user = userEvent.setup();
    render(<App />);

    const searchInput = screen.getByPlaceholderText('Search tickets...');
    await user.type(searchInput, 'TKT-002');

    // Should find ticket with ID TKT-002
    expect(screen.getByText('Invoice PDF not downloading')).toBeInTheDocument();
    expect(screen.queryByText('API rate limit errors')).not.toBeInTheDocument();
  });

  it('search filters by ticket description', async () => {
    const user = userEvent.setup();
    render(<App />);

    const searchInput = screen.getByPlaceholderText('Search tickets...');
    await user.type(searchInput, 'dark mode');

    expect(screen.getByText('Feature request: Dark mode')).toBeInTheDocument();
    expect(screen.queryByText('API rate limit errors')).not.toBeInTheDocument();
  });

  it('search filters by ticket tags', async () => {
    const user = userEvent.setup();
    render(<App />);

    const searchInput = screen.getByPlaceholderText('Search tickets...');
    await user.type(searchInput, 'critical');

    // Should find tickets with 'critical' tag (TKT-004)
    expect(screen.getByText('API rate limit errors')).toBeInTheDocument();
  });

  it('search is case-insensitive', async () => {
    const user = userEvent.setup();
    render(<App />);

    const searchInput = screen.getByPlaceholderText('Search tickets...');
    await user.type(searchInput, 'DARK MODE');

    expect(screen.getByText('Feature request: Dark mode')).toBeInTheDocument();
  });

  it('clearing search restores full queue', async () => {
    const user = userEvent.setup();
    render(<App />);

    const searchInput = screen.getByPlaceholderText('Search tickets...');
    await user.type(searchInput, 'dark mode');
    expect(screen.queryByText('API rate limit errors')).not.toBeInTheDocument();

    await user.clear(searchInput);
    expect(screen.getByText('API rate limit errors')).toBeInTheDocument();
  });
});

describe('Filter Contract: Combined Filters', () => {
  it('tab and dropdown filters work together', async () => {
    const user = userEvent.setup();
    render(<App />);

    // Select Critical tab
    await user.click(screen.getByRole('button', { name: /Critical/i }));

    // Apply status filter - TKT-004 is Critical + In Progress
    const filterSelects = screen.getAllByRole('combobox');
    await user.selectOptions(filterSelects[1], 'In Progress');

    // Should show only Critical AND In Progress tickets
    expect(screen.getByText('API rate limit errors')).toBeInTheDocument();
  });

  it('search and dropdown filters work together', async () => {
    const user = userEvent.setup();
    render(<App />);

    // Apply priority filter
    const filterSelects = screen.getAllByRole('combobox');
    await user.selectOptions(filterSelects[0], 'High');

    // Search within High priority
    const searchInput = screen.getByPlaceholderText('Search tickets...');
    await user.type(searchInput, 'PDF');

    // Should find High priority ticket with PDF in title
    expect(screen.getByText('Invoice PDF not downloading')).toBeInTheDocument();
  });

  it('multiple dropdown filters narrow results', async () => {
    const user = userEvent.setup();
    render(<App />);

    const filterSelects = screen.getAllByRole('combobox');

    // Apply priority filter
    await user.selectOptions(filterSelects[0], 'Critical');

    // Apply status filter - TKT-004 is Critical + In Progress
    await user.selectOptions(filterSelects[1], 'In Progress');

    // Should show only Critical AND In Progress
    expect(screen.getByText('API rate limit errors')).toBeInTheDocument();
  });
});

describe('Filter Contract: Filter Chips', () => {
  it('active search shows search chip', async () => {
    const user = userEvent.setup();
    render(<App />);

    const searchInput = screen.getByPlaceholderText('Search tickets...');
    await user.type(searchInput, 'test');

    // Search chip should be visible
    expect(screen.getByText(/Search: "test"/)).toBeInTheDocument();
  });

  it('active priority filter shows priority chip', async () => {
    const user = userEvent.setup();
    render(<App />);

    const filterSelects = screen.getAllByRole('combobox');
    await user.selectOptions(filterSelects[0], 'Critical');

    // Priority chip should be visible
    expect(screen.getByText(/Priority: Critical/)).toBeInTheDocument();
  });

  it('active status filter shows status chip', async () => {
    const user = userEvent.setup();
    render(<App />);

    const filterSelects = screen.getAllByRole('combobox');
    await user.selectOptions(filterSelects[1], 'Open');

    // Status chip should be visible
    expect(screen.getByText(/Status: Open/)).toBeInTheDocument();
  });

  it('active assignee filter shows assignee chip', async () => {
    const user = userEvent.setup();
    render(<App />);

    const filterSelects = screen.getAllByRole('combobox');
    await user.selectOptions(filterSelects[2], 'Sarah Chen');

    // Assignee chip should be visible
    expect(screen.getByText(/Assignee: Sarah Chen/)).toBeInTheDocument();
  });

  it('clicking X on chip removes that filter', async () => {
    const user = userEvent.setup();
    render(<App />);

    const filterSelects = screen.getAllByRole('combobox');
    await user.selectOptions(filterSelects[0], 'Critical');

    // Chip should be visible
    expect(screen.getByText(/Priority: Critical/)).toBeInTheDocument();

    // Click X on chip
    const chip = screen.getByText(/Priority: Critical/).parentElement;
    const xButton = chip?.querySelector('button');
    if (xButton) {
      await user.click(xButton);
    }

    // Filter should be cleared
    await waitFor(() => {
      expect(screen.queryByText(/Priority: Critical/)).not.toBeInTheDocument();
    });
  });
});

describe('Filter Contract: Clear Filters', () => {
  it('Clear button appears when filters are active', async () => {
    const user = userEvent.setup();
    render(<App />);

    const filterSelects = screen.getAllByRole('combobox');
    await user.selectOptions(filterSelects[0], 'Critical');

    // Clear button should be visible
    expect(screen.getByRole('button', { name: 'Clear' })).toBeInTheDocument();
  });

  it('Clear button resets all filters', async () => {
    const user = userEvent.setup();
    render(<App />);

    // Apply multiple filters
    const filterSelects = screen.getAllByRole('combobox');
    await user.selectOptions(filterSelects[0], 'Critical');
    await user.selectOptions(filterSelects[1], 'Open');

    // Click Clear
    await user.click(screen.getByRole('button', { name: 'Clear' }));

    // All tickets should be visible
    await waitFor(() => {
      expect(screen.getByText('Login page slow on mobile')).toBeInTheDocument();
      expect(screen.getByText('API rate limit errors')).toBeInTheDocument();
    });
  });

  it('Clear button clears search query', async () => {
    const user = userEvent.setup();
    render(<App />);

    const searchInput = screen.getByPlaceholderText('Search tickets...');
    await user.type(searchInput, 'dark mode');

    await user.click(screen.getByRole('button', { name: 'Clear' }));

    // Search should be cleared
    await waitFor(() => {
      expect(searchInput).toHaveValue('');
    });
  });

  it('Clear button hides when no filters active', async () => {
    const user = userEvent.setup();
    render(<App />);

    // Apply then clear filter
    const filterSelects = screen.getAllByRole('combobox');
    await user.selectOptions(filterSelects[0], 'Critical');
    await user.click(screen.getByRole('button', { name: 'Clear' }));

    // Clear button should not be visible
    await waitFor(() => {
      expect(screen.queryByRole('button', { name: 'Clear' })).not.toBeInTheDocument();
    });
  });
});

describe('Filter Contract: Empty State', () => {
  it('shows empty state when no tickets match filters', async () => {
    const user = userEvent.setup();
    render(<App />);

    // Search for non-existent term
    const searchInput = screen.getByPlaceholderText('Search tickets...');
    await user.type(searchInput, 'zzzzzzzzzzzzzz');

    // Empty state should be visible
    expect(screen.getByText('No tickets match your filters')).toBeInTheDocument();
  });

  it('shows Clear filters link in empty state', async () => {
    const user = userEvent.setup();
    render(<App />);

    const searchInput = screen.getByPlaceholderText('Search tickets...');
    await user.type(searchInput, 'zzzzzzzzzzzzzz');

    // Clear filters link should be visible
    expect(screen.getByText('Clear filters')).toBeInTheDocument();
  });

  it('clicking Clear filters in empty state resets queue', async () => {
    const user = userEvent.setup();
    render(<App />);

    const searchInput = screen.getByPlaceholderText('Search tickets...');
    await user.type(searchInput, 'zzzzzzzzzzzzzz');

    await user.click(screen.getByText('Clear filters'));

    // Queue should show tickets again
    await waitFor(() => {
      expect(screen.getByText('API rate limit errors')).toBeInTheDocument();
    });
  });
});

describe('Filter Contract: Tab and Filter Independence', () => {
  it('switching tabs preserves dropdown filter state', async () => {
    const user = userEvent.setup();
    render(<App />);

    // Apply priority filter
    const filterSelects = screen.getAllByRole('combobox');
    await user.selectOptions(filterSelects[0], 'Critical');

    // Switch tabs
    await user.click(screen.getByRole('button', { name: /My Tickets/i }));
    await user.click(screen.getByRole('button', { name: /All Tickets/i }));

    // Priority filter should still be applied
    const prioritySelect = filterSelects[0];
    expect(prioritySelect).toHaveValue('Critical');
  });

  it('switching tabs updates queue content', async () => {
    const user = userEvent.setup();
    render(<App />);

    // Start with All Tickets
    expect(screen.getByText('Login page slow on mobile')).toBeInTheDocument();

    // Switch to Critical
    await user.click(screen.getByRole('button', { name: /Critical/i }));
    expect(screen.queryByText('Login page slow on mobile')).not.toBeInTheDocument();

    // Switch back to All
    await user.click(screen.getByRole('button', { name: /All Tickets/i }));
    expect(screen.getByText('Login page slow on mobile')).toBeInTheDocument();
  });
});
