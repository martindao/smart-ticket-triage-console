import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect } from 'vitest';
import App from '../../App';

describe('App integration', () => {
  it('renders the main layout with sidebar, header, and ticket queue', () => {
    render(<App />);

    // Header brand
    expect(screen.getAllByText('TicketTriage').length).toBeGreaterThanOrEqual(1);

    // Current agent displayed (appears in header + filter dropdown)
    expect(screen.getAllByText('Sarah Chen').length).toBeGreaterThanOrEqual(1);

    // Sidebar navigation items (Tickets appears in sidebar + queue heading)
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getAllByText('Tickets').length).toBeGreaterThanOrEqual(1);

    // Ticket queue renders seed tickets
    expect(screen.getByText('Login page slow on mobile')).toBeInTheDocument();
    expect(screen.getByText('API rate limit errors')).toBeInTheDocument();
  });

  it('switches between tickets and dashboard views via sidebar', async () => {
    const user = userEvent.setup();
    render(<App />);

    // Default view is tickets — queue heading visible
    expect(screen.getByText('Tickets', { selector: 'h2' })).toBeInTheDocument();

    // Switch to dashboard
    await user.click(screen.getByText('Dashboard'));

    // Dashboard stats should appear
    expect(screen.getByText('Unassigned Tickets')).toBeInTheDocument();
    expect(screen.getByText('Recent Activity')).toBeInTheDocument();
  });

  it('selects a ticket and shows detail panel', async () => {
    const user = userEvent.setup();
    render(<App />);

    // Click on a ticket in the queue
    await user.click(screen.getByText('Invoice PDF not downloading'));

    // Detail panel should show the ticket description
    expect(
      screen.getByText(/Multiple customers unable to download invoice PDFs/)
    ).toBeInTheDocument();
  });

  it('filters the queue through support triage tabs', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('button', { name: /Critical1/i }));

    expect(screen.getByText('API rate limit errors')).toBeInTheDocument();
    expect(screen.queryByText('Feature request: Dark mode')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /Unassigned1/i }));

    expect(screen.getByText('Feature request: Dark mode')).toBeInTheDocument();
    expect(screen.queryByText('Password reset email delayed')).not.toBeInTheDocument();
  });

  it('opens ticket detail from the dashboard unassigned queue preview', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByText('Dashboard'));
    await user.click(screen.getByText('Feature request: Dark mode'));

    expect(screen.getByText('Tickets', { selector: 'h2' })).toBeInTheDocument();
    expect(
      screen.getByText(/Customer requesting dark mode for the dashboard/i)
    ).toBeInTheDocument();
  });
});
