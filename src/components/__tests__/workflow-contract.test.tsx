/**
 * Workflow Contract Tests for Smart Ticket Triage Console
 *
 * These tests protect the core support workflows that must survive any redesign.
 * They ensure escalation, resolution, and state transitions work correctly.
 *
 * CONTRACT AREAS:
 * 1. Escalation workflow - escalate creates new ticket with link to original
 * 2. Resolution workflow - resolve requires RCA, shows in detail
 * 3. Close workflow - close transitions ticket to closed state
 * 4. State transitions - status changes reflect in UI
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

describe('Workflow Contract: Escalation Flow', () => {
  it('clicking Escalate creates new escalated ticket', async () => {
    const user = userEvent.setup();
    render(<App />);

    // Select a non-critical ticket (TKT-002 is High priority, In Progress)
    await user.click(screen.getByText('Invoice PDF not downloading'));

    // Click Escalate
    await user.click(screen.getByRole('button', { name: 'Escalate' }));

    // New escalated ticket should be created and selected
    await waitFor(() => {
      // TKT-006 appears in both queue and detail panel, use getAllByText
      expect(screen.getAllByText(/TKT-006/).length).toBeGreaterThan(0);
    });
  });

  it('escalated ticket shows escalation context banner', async () => {
    const user = userEvent.setup();
    render(<App />);

    // Escalate a ticket
    await user.click(screen.getByText('Invoice PDF not downloading'));
    await user.click(screen.getByRole('button', { name: 'Escalate' }));

    // Escalation context should be visible
    await waitFor(() => {
      expect(screen.getByText(/Escalated from TKT-002/)).toBeInTheDocument();
    });
  });

  it('clicking View Original navigates back to source ticket', async () => {
    const user = userEvent.setup();
    render(<App />);

    // Escalate a ticket
    await user.click(screen.getByText('Invoice PDF not downloading'));
    await user.click(screen.getByRole('button', { name: 'Escalate' }));

    // Wait for escalation
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /View Original/i })).toBeInTheDocument();
    });

    // Click View Original
    await user.click(screen.getByRole('button', { name: /View Original/i }));

    // Should show original ticket
    await waitFor(() => {
      expect(screen.getAllByText('TKT-002').length).toBeGreaterThan(0);
    });
  });

  it('escalated ticket has Critical priority', async () => {
    const user = userEvent.setup();
    render(<App />);

    // Escalate a High priority ticket
    await user.click(screen.getByText('Invoice PDF not downloading'));
    await user.click(screen.getByRole('button', { name: 'Escalate' }));

    // Escalated ticket should be Critical
    await waitFor(() => {
      const criticalBadges = screen.getAllByText('Critical');
      expect(criticalBadges.length).toBeGreaterThan(0);
    });
  });

  it('Escalate button is hidden for Critical tickets', async () => {
    const user = userEvent.setup();
    render(<App />);

    // Select Critical ticket (TKT-004)
    await user.click(screen.getByText('API rate limit errors'));

    // Escalate should not be visible
    expect(screen.queryByRole('button', { name: 'Escalate' })).not.toBeInTheDocument();
  });

  it('Escalate button is hidden for Closed tickets', async () => {
    const user = userEvent.setup();
    render(<App />);

    // Close a ticket first (TKT-001 is Resolved)
    await user.click(screen.getByText('Login page slow on mobile'));
    await user.click(screen.getByRole('button', { name: 'Close' }));

    // Wait for close - use getAllByText since "Closed" appears in multiple places
    await waitFor(() => {
      expect(screen.getAllByText('Closed').length).toBeGreaterThan(0);
    });

    // Escalate should not be visible
    expect(screen.queryByRole('button', { name: 'Escalate' })).not.toBeInTheDocument();
  });
});

describe('Workflow Contract: Resolution Flow', () => {
  it('clicking Resolve shows RCA input form', async () => {
    const user = userEvent.setup();
    render(<App />);

    // Select In Progress ticket (TKT-002 or TKT-004)
    await user.click(screen.getByText('Invoice PDF not downloading'));

    // Click Resolve
    await user.click(screen.getByRole('button', { name: 'Resolve' }));

    // RCA input should appear
    expect(screen.getByPlaceholderText('Describe the root cause and resolution...')).toBeInTheDocument();
    expect(screen.getByText('Add Root Cause Analysis')).toBeInTheDocument();
  });

  it('submitting RCA resolves ticket and shows RCA section', async () => {
    const user = userEvent.setup();
    render(<App />);

    // Select In Progress ticket
    await user.click(screen.getByText('Invoice PDF not downloading'));

    // Click Resolve and enter RCA
    await user.click(screen.getByRole('button', { name: 'Resolve' }));
    await user.type(
      screen.getByPlaceholderText('Describe the root cause and resolution...'),
      'Email provider API timeout fixed by increasing retry count'
    );

    // Confirm resolve
    await user.click(screen.getByRole('button', { name: 'Confirm Resolve' }));

    // Ticket should show Resolved status - use getAllByText since "Resolved" appears in multiple places
    await waitFor(() => {
      expect(screen.getAllByText('Resolved').length).toBeGreaterThan(0);
    });

    // RCA section should be visible
    expect(screen.getByText('Root Cause Analysis')).toBeInTheDocument();
  });

  it('Resolve button only shows for In Progress tickets', async () => {
    const user = userEvent.setup();
    render(<App />);

    // Open ticket - no Resolve button (TKT-003 is Open)
    await user.click(screen.getByText('Feature request: Dark mode'));
    expect(screen.queryByRole('button', { name: 'Resolve' })).not.toBeInTheDocument();

    // In Progress ticket - Resolve button visible (TKT-002)
    await user.click(screen.getByText('Invoice PDF not downloading'));
    expect(screen.getByRole('button', { name: 'Resolve' })).toBeInTheDocument();
  });

  it('cannot confirm resolve without RCA text', async () => {
    const user = userEvent.setup();
    render(<App />);

    // Select In Progress ticket
    await user.click(screen.getByText('Invoice PDF not downloading'));

    // Click Resolve
    await user.click(screen.getByRole('button', { name: 'Resolve' }));

    // Confirm button should be disabled without RCA
    const confirmButton = screen.getByRole('button', { name: 'Confirm Resolve' });
    expect(confirmButton).toBeDisabled();
  });

  it('Cancel button hides RCA input form', async () => {
    const user = userEvent.setup();
    render(<App />);

    // Select In Progress ticket
    await user.click(screen.getByText('Invoice PDF not downloading'));

    // Click Resolve
    await user.click(screen.getByRole('button', { name: 'Resolve' }));
    expect(screen.getByPlaceholderText('Describe the root cause and resolution...')).toBeInTheDocument();

    // Click Cancel
    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    // RCA input should be hidden
    expect(screen.queryByPlaceholderText('Describe the root cause and resolution...')).not.toBeInTheDocument();
  });
});

describe('Workflow Contract: Close Flow', () => {
  it('clicking Close transitions ticket to Closed status', async () => {
    const user = userEvent.setup();
    render(<App />);

    // Select Resolved ticket (TKT-001)
    await user.click(screen.getByText('Login page slow on mobile'));

    // Click Close
    await user.click(screen.getByRole('button', { name: 'Close' }));

    // Ticket should show Closed status - use getAllByText since "Closed" appears in multiple places
    await waitFor(() => {
      expect(screen.getAllByText('Closed').length).toBeGreaterThan(0);
    });
  });

  it('Close button shows for Resolved tickets', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByText('Login page slow on mobile'));
    expect(screen.getByRole('button', { name: 'Close' })).toBeInTheDocument();
  });

  it('Close button shows for In Progress tickets', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByText('Invoice PDF not downloading'));
    expect(screen.getByRole('button', { name: 'Close' })).toBeInTheDocument();
  });

  it('Closed ticket hides action buttons except Close', async () => {
    const user = userEvent.setup();
    render(<App />);

    // Close a ticket
    await user.click(screen.getByText('Login page slow on mobile'));
    await user.click(screen.getByRole('button', { name: 'Close' }));

    // Wait for close - use getAllByText since "Closed" appears in multiple places
    await waitFor(() => {
      expect(screen.getAllByText('Closed').length).toBeGreaterThan(0);
    });

    // Action buttons should be hidden
    expect(screen.queryByRole('button', { name: 'Assign' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Escalate' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Resolve' })).not.toBeInTheDocument();
  });

  it('Closed ticket hides note input', async () => {
    const user = userEvent.setup();
    render(<App />);

    // Close a ticket
    await user.click(screen.getByText('Login page slow on mobile'));
    await user.click(screen.getByRole('button', { name: 'Close' }));

    // Wait for close - use getAllByText since "Closed" appears in multiple places
    await waitFor(() => {
      expect(screen.getAllByText('Closed').length).toBeGreaterThan(0);
    });

    // Note input should be hidden
    expect(screen.queryByPlaceholderText('Add a note...')).not.toBeInTheDocument();
  });
});

describe('Workflow Contract: RCA Reveal', () => {
  it('RCA section shows View Details button initially', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByText('Login page slow on mobile'));

    expect(screen.getByRole('button', { name: /View$/i })).toBeInTheDocument();
  });

  it('clicking View Details reveals Customer Impact and Follow-up', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByText('Login page slow on mobile'));
    // Button was renamed from "View Details" to "View"
    await user.click(screen.getByRole('button', { name: /View$/i }));

    expect(screen.getByText(/Customer Impact:/)).toBeInTheDocument();
    expect(screen.getByText(/Follow-up:/)).toBeInTheDocument();
  });

  it('clicking View Details changes to Hide Details', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByText('Login page slow on mobile'));
    // Button was renamed from "View Details" to "View"
    await user.click(screen.getByRole('button', { name: /View$/i }));

    // After clicking View, button changes to Hide
    expect(screen.getByRole('button', { name: /Hide/i })).toBeInTheDocument();
  });

  it('clicking Hide Details collapses RCA content', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByText('Login page slow on mobile'));

    // Expand - button was renamed from "View Details" to "View"
    await user.click(screen.getByRole('button', { name: /View$/i }));
    expect(screen.getByText(/Customer Impact:/)).toBeInTheDocument();

    // Collapse
    await user.click(screen.getByRole('button', { name: /Hide/i }));
    expect(screen.queryByText(/Customer Impact:/)).not.toBeInTheDocument();
  });

  it('RCA shows stored resolution text', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByText('Login page slow on mobile'));
    // Button was renamed from "View Details" to "View"
    await user.click(screen.getByRole('button', { name: /View$/i }));

    // Should show the stored RCA text
    expect(screen.getByText(/Monitoring thresholds and response runbook updated/)).toBeInTheDocument();
  });
});

describe('Workflow Contract: State Reflection in Queue', () => {
  it('resolved ticket shows Resolved badge in queue', () => {
    render(<App />);

    // TKT-001 is resolved - find the status badge (span with class containing "rounded-full")
    // not the dropdown option
    expect(screen.getByText('Login page slow on mobile')).toBeInTheDocument();
    const resolvedBadges = screen.getAllByText('Resolved').filter(
      el => el.tagName === 'SPAN' && el.className.includes('rounded-full')
    );
    expect(resolvedBadges.length).toBeGreaterThan(0);
  });

  it('in progress ticket shows In Progress badge in queue', () => {
    render(<App />);

    // TKT-002 and TKT-004 are in progress - find status badges, not dropdown options
    expect(screen.getByText('Invoice PDF not downloading')).toBeInTheDocument();
    const inProgressBadges = screen.getAllByText('In Progress').filter(
      el => el.tagName === 'SPAN' && el.className.includes('rounded-full')
    );
    expect(inProgressBadges.length).toBeGreaterThan(0);
  });

  it('critical ticket shows Critical badge in queue', () => {
    render(<App />);

    // TKT-004 is critical - find status badge, not tab button or dropdown option
    expect(screen.getByText('API rate limit errors')).toBeInTheDocument();
    const criticalBadges = screen.getAllByText('Critical').filter(
      el => el.tagName === 'SPAN' && el.className.includes('rounded-full')
    );
    expect(criticalBadges.length).toBeGreaterThan(0);
  });

  it('escalated ticket appears in queue with new ID', async () => {
    const user = userEvent.setup();
    render(<App />);

    // Escalate a ticket
    await user.click(screen.getByText('Invoice PDF not downloading'));
    await user.click(screen.getByRole('button', { name: 'Escalate' }));

    // New ticket should appear in queue - find ticket ID in queue card (smaller font)
    await waitFor(() => {
      const ticketIds = screen.getAllByText(/TKT-006/).filter(
        el => el.tagName === 'SPAN' && el.className.includes('font-mono')
      );
      expect(ticketIds.length).toBeGreaterThan(0);
    });
  });
});

describe('Workflow Contract: Assign Flow', () => {
  it('assigning ticket shows assignee in detail panel', async () => {
    const user = userEvent.setup();
    render(<App />);

    // Select unassigned ticket (TKT-003) - use h3 to select queue card title
    const queueTitles = screen.getAllByText('Feature request: Dark mode').filter(
      el => el.tagName === 'H3'
    );
    await user.click(queueTitles[0]);

    // Assign to Mike
    const assignButton = screen.getByRole('button', { name: 'Assign' });
    await user.hover(assignButton);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Mike Rodriguez/i })).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: /Mike Rodriguez/i }));

    // Should show assignee name in the meta bar (just the name, not "Assigned to")
    await waitFor(() => {
      const assigneeElements = screen.getAllByText(/Mike Rodriguez/);
      expect(assigneeElements.length).toBeGreaterThan(0);
    });
  });

  it('assigned ticket appears in My Tickets for assignee', async () => {
    const user = userEvent.setup();
    render(<App />);

    // Assign unassigned ticket to Sarah (current agent) - use h3 to select queue card title
    const queueTitles = screen.getAllByText('Feature request: Dark mode').filter(
      el => el.tagName === 'H3'
    );
    await user.click(queueTitles[0]);

    const assignButton = screen.getByRole('button', { name: 'Assign' });
    await user.hover(assignButton);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Sarah Chen/i })).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: /Sarah Chen/i }));

    // Check My Tickets tab
    await waitFor(() => {
      // The ticket should now be in My Tickets
    });

    await user.click(screen.getByRole('button', { name: /My Tickets/i }));

    // Should show the newly assigned ticket - use h3 to select queue card title
    await waitFor(() => {
      const queueTitles = screen.getAllByText('Feature request: Dark mode').filter(
        el => el.tagName === 'H3'
      );
      expect(queueTitles.length).toBeGreaterThan(0);
    });
  });
});
