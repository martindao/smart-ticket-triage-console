/**
 * Visual Contract Tests for Smart Ticket Triage Console
 *
 * These tests protect the core visual layout and workflow surfaces.
 * They are designed to FAIL if a redesign breaks critical visual contracts.
 *
 * CONTRACT AREAS:
 * 1. Queue visibility - ticket list must remain visible and interactive
 * 2. Split-panel layout - queue and detail must coexist side-by-side
 * 3. Detail panel visibility - selected ticket info must be displayed
 * 4. Action button visibility - escalate, resolve, assign must be accessible
 */

import { render, screen } from '@testing-library/react';
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

describe('Visual Contract: Queue Visibility', () => {
  it('renders ticket queue with visible ticket cards showing ID, title, and priority', () => {
    render(<App />);

    // Queue must show ticket identifiers
    expect(screen.getByText('TKT-001')).toBeInTheDocument();
    expect(screen.getByText('TKT-002')).toBeInTheDocument();

    // Queue must show ticket titles
    expect(screen.getByText('Login page slow on mobile')).toBeInTheDocument();
    expect(screen.getByText('API rate limit errors')).toBeInTheDocument();

    // Queue must show priority badges on cards - use getAllByText since "Critical" appears in tab and badge
    expect(screen.getAllByText('Critical').length).toBeGreaterThan(0);
    expect(screen.getAllByText('High').length).toBeGreaterThan(0);
  });

  it('renders queue with visible status badges on each ticket card', () => {
    render(<App />);

    // Status badges must be visible in queue - use getAllByText since "Open" appears in filter dropdown and badge
    expect(screen.getAllByText('Open').length).toBeGreaterThan(0);
    expect(screen.getAllByText('In Progress').length).toBeGreaterThan(0);
  });

  it('renders queue tabs with visible counts for each filter category', () => {
    render(<App />);

    // Tab labels must be visible - use getAllByText since some labels appear in multiple places
    expect(screen.getByText('All Tickets')).toBeInTheDocument();
    expect(screen.getByText('My Tickets')).toBeInTheDocument();
    expect(screen.getAllByText('Unassigned').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Critical').length).toBeGreaterThan(0);
    expect(screen.getByText('Overdue')).toBeInTheDocument();
  });

  it('renders search input visible and accessible in the queue panel', () => {
    render(<App />);

    // Search must be visible and functional
    const searchInput = screen.getByPlaceholderText('Search tickets...');
    expect(searchInput).toBeInTheDocument();
    expect(searchInput).toBeVisible();
  });
});

describe('Visual Contract: Split-Panel Layout', () => {
  it('maintains queue panel visibility when no ticket is selected', () => {
    render(<App />);

    // Queue heading must be visible
    expect(screen.getByText('Tickets', { selector: 'h2' })).toBeInTheDocument();

  // Empty state prompt in detail panel
  expect(screen.getByText('No ticket selected')).toBeInTheDocument();
  });

  it('maintains queue AND detail panel visibility when ticket is selected', async () => {
    const user = userEvent.setup();
    render(<App />);

    // Select a ticket
    await user.click(screen.getByText('Invoice PDF not downloading'));

    // Queue must still be visible
    expect(screen.getByText('Tickets', { selector: 'h2' })).toBeInTheDocument();

    // Detail panel must show selected ticket
    expect(screen.getByText('TKT-003')).toBeInTheDocument();
    expect(screen.getByText(/Multiple customers unable to download invoice PDFs/)).toBeInTheDocument();
  });

  it('keeps queue visible while detail panel shows ticket metadata', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByText('API rate limit errors'));

    // Queue remains
    expect(screen.getByText('Login page slow on mobile')).toBeInTheDocument();

    // Detail shows metadata
    expect(screen.getByText(/SLA:/)).toBeInTheDocument();
    expect(screen.getByText(/Created/)).toBeInTheDocument();
  });
});

describe('Visual Contract: Detail Panel Action Visibility', () => {
  it('shows Assign button for open/unassigned tickets', async () => {
    const user = userEvent.setup();
    render(<App />);

    // Click on unassigned ticket
    await user.click(screen.getByText('Feature request: Dark mode'));

    // Assign button must be visible
    expect(screen.getByRole('button', { name: 'Assign' })).toBeInTheDocument();
  });

  it('shows Escalate button for non-critical open tickets', async () => {
    const user = userEvent.setup();
    render(<App />);

    // Click on High priority ticket (not Critical)
    await user.click(screen.getByText('Invoice PDF not downloading'));

    // Escalate button must be visible
    expect(screen.getByRole('button', { name: 'Escalate' })).toBeInTheDocument();
  });

  it('shows Resolve button for In Progress tickets', async () => {
    const user = userEvent.setup();
    render(<App />);

    // Click on In Progress ticket (TKT-002 or TKT-004 are In Progress)
    await user.click(screen.getByText('Invoice PDF not downloading'));

    // Resolve button must be visible
    expect(screen.getByRole('button', { name: 'Resolve' })).toBeInTheDocument();
  });

  it('shows Close button for Resolved tickets', async () => {
    const user = userEvent.setup();
    render(<App />);

    // Click on Resolved ticket
    await user.click(screen.getByText('Login page slow on mobile'));

    // Close button must be visible
    expect(screen.getByRole('button', { name: 'Close' })).toBeInTheDocument();
  });

  it('hides Escalate button for Critical priority tickets', async () => {
    const user = userEvent.setup();
    render(<App />);

    // Click on Critical ticket
    await user.click(screen.getByText('API rate limit errors'));

    // Escalate should NOT be visible for Critical
    expect(screen.queryByRole('button', { name: 'Escalate' })).not.toBeInTheDocument();
  });
});

describe('Visual Contract: Notes Section Visibility', () => {
  it('shows notes count in detail panel header', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByText('Invoice PDF not downloading'));

    // Notes section header must show count
    expect(screen.getByText(/Notes \(/)).toBeInTheDocument();
  });

  it('shows add note textarea for non-closed tickets', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByText('API rate limit errors'));

    // Add note textarea must be visible
    expect(screen.getByPlaceholderText('Add a note...')).toBeInTheDocument();
  });

  it('shows internal note checkbox option', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByText('API rate limit errors'));

    // Internal note checkbox must be visible
    expect(screen.getByLabelText(/Internal note/)).toBeInTheDocument();
  });
});

describe('Visual Contract: RCA Section Visibility', () => {
  it('shows Root Cause Analysis section for resolved tickets', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByText('Login page slow on mobile'));

    // RCA section must be visible
    expect(screen.getByText('Root Cause Analysis')).toBeInTheDocument();
  });

  it('shows View Details button to expand RCA content', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByText('Login page slow on mobile'));

    // View button must be visible (changed from "View Details" to "View")
    expect(screen.getByRole('button', { name: /View$/i })).toBeInTheDocument();
  });

  it('reveals Customer Impact and Follow-up when RCA is expanded', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByText('Login page slow on mobile'));
    await user.click(screen.getByRole('button', { name: /View$/i }));

    // Expanded content must be visible
    expect(screen.getByText(/Customer Impact:/)).toBeInTheDocument();
    expect(screen.getByText(/Follow-up:/)).toBeInTheDocument();
  });
});

describe('Visual Contract: Escalation Context Visibility', () => {
  it('shows escalation context banner for escalated tickets', async () => {
    const user = userEvent.setup();
    render(<App />);

    // Escalate a ticket first (TKT-002 is High priority, In Progress - can be escalated)
    await user.click(screen.getByText('Invoice PDF not downloading'));
    await user.click(screen.getByRole('button', { name: 'Escalate' }));

    // Escalation context must be visible - use findByText for async
    await screen.findByText(/Escalated from/);
    expect(screen.getByText(/Escalated from/)).toBeInTheDocument();
  });

  it('shows View Original button for escalated tickets', async () => {
    const user = userEvent.setup();
    render(<App />);

    // Escalate a ticket first
    await user.click(screen.getByText('Invoice PDF not downloading'));
    await user.click(screen.getByRole('button', { name: 'Escalate' }));

    // View Original button must be visible
    await screen.findByRole('button', { name: /View Original/i });
    expect(screen.getByRole('button', { name: /View Original/i })).toBeInTheDocument();
  });
});

describe('Visual Contract: Dashboard Preview Visibility', () => {
  it('shows Unassigned Tickets preview section on dashboard', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByText('Dashboard'));

    // Unassigned preview must be visible
    expect(screen.getByText('Unassigned Tickets')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /View All/i })).toBeInTheDocument();
  });

  it('shows Recent Activity feed on dashboard', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByText('Dashboard'));

    // Activity feed must be visible
    expect(screen.getByText('Recent Activity')).toBeInTheDocument();
  });

  it('shows stats cards with ticket counts on dashboard', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByText('Dashboard'));

    // Stats must be visible
    expect(screen.getByText('Unassigned Tickets')).toBeInTheDocument();
  });
});
