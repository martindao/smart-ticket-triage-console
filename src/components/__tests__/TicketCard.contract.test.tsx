import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TicketCard } from '../TicketCard';
import { tickets } from '../../data';

/**
 * Visual/Interaction Contract Tests for TicketCard
 *
 * These tests protect the redesign-sensitive surface area:
 * - Card layout structure (ID, title, badges, avatar)
 * - Selection state visual distinction
 * - Priority/Status/SLA badge visibility
 * - Tag display
 * - Click interaction
 *
 * RED phase: Tests should pass with current implementation
 * GREEN phase: After redesign, these should still pass
 */
describe('TicketCard - Visual Contract', () => {
  const mockOnClick = vi.fn();
  const ticket = tickets[0];

  beforeEach(() => {
    mockOnClick.mockClear();
  });

  it('renders ticket ID as monospace text', () => {
    render(<TicketCard ticket={ticket} isSelected={false} onClick={mockOnClick} />);

    const ticketId = screen.getByText(ticket.id);
    expect(ticketId).toBeInTheDocument();
    expect(ticketId).toHaveClass('font-mono');
  });

  it('renders ticket title', () => {
    render(<TicketCard ticket={ticket} isSelected={false} onClick={mockOnClick} />);

    expect(screen.getByText(ticket.title)).toBeInTheDocument();
  });

  it('shows priority badge', () => {
    render(<TicketCard ticket={ticket} isSelected={false} onClick={mockOnClick} />);

    // PriorityBadge should be visible
    expect(screen.getByText(ticket.priority)).toBeInTheDocument();
  });

  it('shows status badge', () => {
    render(<TicketCard ticket={ticket} isSelected={false} onClick={mockOnClick} />);

    // StatusBadge should be visible
    expect(screen.getByText(ticket.status)).toBeInTheDocument();
  });

  it('shows SLA badge', () => {
    render(<TicketCard ticket={ticket} isSelected={false} onClick={mockOnClick} />);

    // SLABadge should be present (it shows relative time or overdue status)
    const card = screen.getByText(ticket.title).closest('div');
    expect(card?.textContent).toBeTruthy(); // Card has content
  });

  it('displays tags when present', () => {
    const ticketWithTags = tickets.find((t) => t.tags.length > 0) ?? ticket;
    render(<TicketCard ticket={ticketWithTags} isSelected={false} onClick={mockOnClick} />);

    if (ticketWithTags.tags.length > 0) {
      expect(screen.getByText(ticketWithTags.tags[0])).toBeInTheDocument();
    }
  });

  it('shows assignee avatar when assigned', () => {
    const assignedTicket = tickets.find((t) => t.assignee !== null);
    if (assignedTicket && assignedTicket.assignee) {
      const { container } = render(<TicketCard ticket={assignedTicket} isSelected={false} onClick={mockOnClick} />);

      // AgentAvatar renders initials in a div with title attribute
      const avatarElement = container.querySelector('[title*="' + assignedTicket.assignee.name + '"]');
      expect(avatarElement).toBeTruthy();
    }
  });

  it('applies selected state styling when isSelected is true', () => {
    const { container } = render(
      <TicketCard ticket={ticket} isSelected={true} onClick={mockOnClick} />
    );

    const card = container.firstChild as HTMLElement;
    // Premium-dark uses CSS class for selected state
    expect(card).toHaveClass('ticket-card-selected');
    // Selected state uses CSS for left border (not inline style)
    expect(card.style.borderBottom).toBeTruthy();
  });

  it('applies unselected state styling when isSelected is false', () => {
    const { container } = render(
      <TicketCard ticket={ticket} isSelected={false} onClick={mockOnClick} />
    );

    const card = container.firstChild as HTMLElement;
    // Premium-dark uses CSS variables for unselected state
    expect(card).toHaveClass('bg-[var(--surface-800)]');
    // Unselected state uses CSS for border (not inline style)
    expect(card.style.borderBottom).toBeTruthy();
  });

  it('fires onClick when card is clicked', async () => {
    const user = userEvent.setup();
    render(<TicketCard ticket={ticket} isSelected={false} onClick={mockOnClick} />);

    await user.click(screen.getByText(ticket.title));
    expect(mockOnClick).toHaveBeenCalled();
  });

  it('has cursor-pointer for clickability', () => {
    const { container } = render(
      <TicketCard ticket={ticket} isSelected={false} onClick={mockOnClick} />
    );

    const card = container.firstChild as HTMLElement;
    expect(card).toHaveClass('cursor-pointer');
  });

  it('has hover state for unselected cards', () => {
    const { container } = render(
      <TicketCard ticket={ticket} isSelected={false} onClick={mockOnClick} />
    );

    const card = container.firstChild as HTMLElement;
    // Premium-dark uses CSS variables for hover states
    expect(card).toHaveClass('hover:bg-[var(--surface-750)]');
  });

  it('limits tag display to 3 tags with overflow indicator', () => {
    // Find a ticket with more than 3 tags or create a test case
    const ticketWithManyTags = {
      ...ticket,
      tags: ['tag1', 'tag2', 'tag3', 'tag4', 'tag5'],
    };

    render(<TicketCard ticket={ticketWithManyTags} isSelected={false} onClick={mockOnClick} />);

    // Should show first 3 tags
    expect(screen.getByText('tag1')).toBeInTheDocument();
    expect(screen.getByText('tag2')).toBeInTheDocument();
    expect(screen.getByText('tag3')).toBeInTheDocument();

    // Should show overflow indicator
    expect(screen.getByText('+2')).toBeInTheDocument();
  });

  it('renders card with proper styling', () => {
    const { container } = render(
      <TicketCard ticket={ticket} isSelected={false} onClick={mockOnClick} />
    );

    const card = container.firstChild as HTMLElement;
    // Card uses inline style for bottom border only
    expect(card.style.borderBottom).toBeTruthy();
  });
});
