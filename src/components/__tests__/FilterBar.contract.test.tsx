import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { FilterBar } from '../FilterBar';
import { agents } from '../../data';

/**
 * Visual/Interaction Contract Tests for FilterBar
 *
 * These tests protect the redesign-sensitive surface area:
 * - Search input visibility and placeholder
 * - Dropdown filter controls (Priority, Status, Assignee)
 * - Active filter chips display
 * - Clear filters button visibility
 *
 * RED phase: Tests should pass with current implementation
 * GREEN phase: After redesign, these should still pass
 */
describe('FilterBar - Visual Contract', () => {
  const agentNames = agents.map((a) => a.name);
  const mockOnPriorityChange = vi.fn();
  const mockOnStatusChange = vi.fn();
  const mockOnAssigneeChange = vi.fn();
  const mockOnSearchChange = vi.fn();
  const mockOnClearFilters = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders search input with correct placeholder', () => {
    render(
      <FilterBar
        priorityFilter="All"
        statusFilter="All"
        assigneeFilter="All"
        searchQuery=""
        onPriorityChange={mockOnPriorityChange}
        onStatusChange={mockOnStatusChange}
        onAssigneeChange={mockOnAssigneeChange}
        onSearchChange={mockOnSearchChange}
        onClearFilters={mockOnClearFilters}
        agentNames={agentNames}
        activeFiltersCount={0}
      />
    );

    const searchInput = screen.getByPlaceholderText('Search tickets...');
    expect(searchInput).toBeInTheDocument();
    expect(searchInput).toHaveValue('');
  });

  it('renders all three dropdown filter controls', () => {
    render(
      <FilterBar
        priorityFilter="All"
        statusFilter="All"
        assigneeFilter="All"
        searchQuery=""
        onPriorityChange={mockOnPriorityChange}
        onStatusChange={mockOnStatusChange}
        onAssigneeChange={mockOnAssigneeChange}
        onSearchChange={mockOnSearchChange}
        onClearFilters={mockOnClearFilters}
        agentNames={agentNames}
        activeFiltersCount={0}
      />
    );

    // All three dropdowns exist
    const selects = screen.getAllByRole('combobox');
    expect(selects).toHaveLength(3); // Priority, Status, Assignee
  });

  it('shows priority dropdown with all options', () => {
    render(
      <FilterBar
        priorityFilter="All"
        statusFilter="All"
        assigneeFilter="All"
        searchQuery=""
        onPriorityChange={mockOnPriorityChange}
        onStatusChange={mockOnStatusChange}
        onAssigneeChange={mockOnAssigneeChange}
        onSearchChange={mockOnSearchChange}
        onClearFilters={mockOnClearFilters}
        agentNames={agentNames}
        activeFiltersCount={0}
      />
    );

    // Check priority options exist
    expect(screen.getByRole('option', { name: 'All Priorities' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Critical' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'High' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Medium' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Low' })).toBeInTheDocument();
  });

  it('shows status dropdown with all options', () => {
    render(
      <FilterBar
        priorityFilter="All"
        statusFilter="All"
        assigneeFilter="All"
        searchQuery=""
        onPriorityChange={mockOnPriorityChange}
        onStatusChange={mockOnStatusChange}
        onAssigneeChange={mockOnAssigneeChange}
        onSearchChange={mockOnSearchChange}
        onClearFilters={mockOnClearFilters}
        agentNames={agentNames}
        activeFiltersCount={0}
      />
    );

    expect(screen.getByRole('option', { name: 'All Statuses' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Open' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'In Progress' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Resolved' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Closed' })).toBeInTheDocument();
  });

  it('shows clear button when filters are active', () => {
    render(
      <FilterBar
        priorityFilter="Critical"
        statusFilter="All"
        assigneeFilter="All"
        searchQuery=""
        onPriorityChange={mockOnPriorityChange}
        onStatusChange={mockOnStatusChange}
        onAssigneeChange={mockOnAssigneeChange}
        onSearchChange={mockOnSearchChange}
        onClearFilters={mockOnClearFilters}
        agentNames={agentNames}
        activeFiltersCount={1}
      />
    );

    expect(screen.getByRole('button', { name: /Clear/i })).toBeInTheDocument();
  });

  it('hides clear button when no filters are active', () => {
    render(
      <FilterBar
        priorityFilter="All"
        statusFilter="All"
        assigneeFilter="All"
        searchQuery=""
        onPriorityChange={mockOnPriorityChange}
        onStatusChange={mockOnStatusChange}
        onAssigneeChange={mockOnAssigneeChange}
        onSearchChange={mockOnSearchChange}
        onClearFilters={mockOnClearFilters}
        agentNames={agentNames}
        activeFiltersCount={0}
      />
    );

    expect(screen.queryByRole('button', { name: /Clear/i })).not.toBeInTheDocument();
  });

  it('displays active filter chips when filters are set', () => {
    render(
      <FilterBar
        priorityFilter="Critical"
        statusFilter="Open"
        assigneeFilter="All"
        searchQuery="API"
        onPriorityChange={mockOnPriorityChange}
        onStatusChange={mockOnStatusChange}
        onAssigneeChange={mockOnAssigneeChange}
        onSearchChange={mockOnSearchChange}
        onClearFilters={mockOnClearFilters}
        agentNames={agentNames}
        activeFiltersCount={2}
      />
    );

    // Active filter chips should be visible
    expect(screen.getByText(/Search: "API"/)).toBeInTheDocument();
    expect(screen.getByText(/Priority: Critical/)).toBeInTheDocument();
    expect(screen.getByText(/Status: Open/)).toBeInTheDocument();
  });

  it('fires onSearchChange when typing in search input', async () => {
    const user = userEvent.setup();
    render(
      <FilterBar
        priorityFilter="All"
        statusFilter="All"
        assigneeFilter="All"
        searchQuery=""
        onPriorityChange={mockOnPriorityChange}
        onStatusChange={mockOnStatusChange}
        onAssigneeChange={mockOnAssigneeChange}
        onSearchChange={mockOnSearchChange}
        onClearFilters={mockOnClearFilters}
        agentNames={agentNames}
        activeFiltersCount={0}
      />
    );

    await user.type(screen.getByPlaceholderText('Search tickets...'), 'login');
    expect(mockOnSearchChange).toHaveBeenCalled();
  });

  it('fires onClearFilters when clear button is clicked', async () => {
    const user = userEvent.setup();
    render(
      <FilterBar
        priorityFilter="Critical"
        statusFilter="All"
        assigneeFilter="All"
        searchQuery=""
        onPriorityChange={mockOnPriorityChange}
        onStatusChange={mockOnStatusChange}
        onAssigneeChange={mockOnAssigneeChange}
        onSearchChange={mockOnSearchChange}
        onClearFilters={mockOnClearFilters}
        agentNames={agentNames}
        activeFiltersCount={1}
      />
    );

    await user.click(screen.getByRole('button', { name: /Clear/i }));
    expect(mockOnClearFilters).toHaveBeenCalled();
  });

  it('allows removing individual filter chips', async () => {
    const user = userEvent.setup();
    render(
      <FilterBar
        priorityFilter="Critical"
        statusFilter="All"
        assigneeFilter="All"
        searchQuery=""
        onPriorityChange={mockOnPriorityChange}
        onStatusChange={mockOnStatusChange}
        onAssigneeChange={mockOnAssigneeChange}
        onSearchChange={mockOnSearchChange}
        onClearFilters={mockOnClearFilters}
        agentNames={agentNames}
        activeFiltersCount={1}
      />
    );

    // Find the priority chip and click its X button
    const priorityChip = screen.getByText(/Priority: Critical/).parentElement;
    const removeButton = priorityChip?.querySelector('button');
    if (removeButton) {
      await user.click(removeButton);
      expect(mockOnPriorityChange).toHaveBeenCalledWith('All');
    }
  });
});
