import type { Priority, Status } from '../types/ticket';
import { Filter, X } from 'lucide-react';

interface FilterBarProps {
  priorityFilter: Priority | 'All';
  statusFilter: Status | 'All';
  assigneeFilter: string | 'All';
  searchQuery: string;
  onPriorityChange: (priority: Priority | 'All') => void;
  onStatusChange: (status: Status | 'All') => void;
  onAssigneeChange: (assignee: string | 'All') => void;
  onSearchChange: (query: string) => void;
  onClearFilters: () => void;
  agentNames: string[];
  activeFiltersCount: number;
}

export function FilterBar({
  priorityFilter,
  statusFilter,
  assigneeFilter,
  searchQuery,
  onPriorityChange,
  onStatusChange,
  onAssigneeChange,
  onSearchChange,
  onClearFilters,
  agentNames,
  activeFiltersCount,
}: FilterBarProps) {
  const hasActiveFilters = activeFiltersCount > 0 || searchQuery;

  const inputStyle: React.CSSProperties = {
    background: 'var(--surface-700)',
    border: '1px solid var(--border-default)',
    color: 'var(--text-200)',
    borderRadius: '0.5rem',
  };

  const selectStyle: React.CSSProperties = {
    ...inputStyle,
    cursor: 'pointer',
  };

  return (
    <div
      className="p-4"
      style={{
        background: 'var(--surface-800)',
        borderBottom: '1px solid var(--border-default)',
      }}
    >
      <div className="flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="flex-1 min-w-[200px]">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search tickets..."
            className="w-full px-3 py-2 text-sm focus:outline-none"
            style={inputStyle}
            onFocus={(e) => {
              e.target.style.borderColor = 'var(--accent-primary)';
              e.target.style.boxShadow = 'var(--focus-ring)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = 'var(--border-default)';
              e.target.style.boxShadow = 'none';
            }}
          />
        </div>

        {/* Priority Filter */}
        <select
          value={priorityFilter}
          onChange={(e) => onPriorityChange(e.target.value as Priority | 'All')}
          className="px-3 py-2 text-sm focus:outline-none"
          style={selectStyle}
          onFocus={(e) => {
            e.target.style.borderColor = 'var(--accent-primary)';
          }}
          onBlur={(e) => {
            e.target.style.borderColor = 'var(--border-default)';
          }}
        >
          <option value="All">All Priorities</option>
          <option value="Critical">Critical</option>
          <option value="High">High</option>
          <option value="Medium">Medium</option>
          <option value="Low">Low</option>
        </select>

        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={(e) => onStatusChange(e.target.value as Status | 'All')}
          className="px-3 py-2 text-sm focus:outline-none"
          style={selectStyle}
          onFocus={(e) => {
            e.target.style.borderColor = 'var(--accent-primary)';
          }}
          onBlur={(e) => {
            e.target.style.borderColor = 'var(--border-default)';
          }}
        >
          <option value="All">All Statuses</option>
          <option value="Open">Open</option>
          <option value="In Progress">In Progress</option>
          <option value="Resolved">Resolved</option>
          <option value="Closed">Closed</option>
        </select>

        {/* Assignee Filter */}
        <select
          value={assigneeFilter}
          onChange={(e) => onAssigneeChange(e.target.value)}
          className="px-3 py-2 text-sm focus:outline-none"
          style={selectStyle}
          onFocus={(e) => {
            e.target.style.borderColor = 'var(--accent-primary)';
          }}
          onBlur={(e) => {
            e.target.style.borderColor = 'var(--border-default)';
          }}
        >
          <option value="All">All Assignees</option>
          <option value="Unassigned">Unassigned</option>
          {agentNames.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>

      {/* Clear Filters */}
      {hasActiveFilters && (
        <button
          onClick={onClearFilters}
          className="filter-btn flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-lg transition-colors"
          style={{ color: 'var(--text-300)' }}
        >
            <X className="w-4 h-4" />
            Clear
          </button>
        )}
      </div>

      {/* Active Filter Chips */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2 mt-3">
          <Filter className="w-4 h-4" style={{ color: 'var(--text-400)' }} />
          {searchQuery && (
            <span className="filter-chip">
              Search: "{searchQuery}"
              <button
                onClick={() => onSearchChange('')}
                className="hover:opacity-70"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {priorityFilter !== 'All' && (
            <span className="filter-chip">
              Priority: {priorityFilter}
              <button
                onClick={() => onPriorityChange('All')}
                className="hover:opacity-70"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {statusFilter !== 'All' && (
            <span className="filter-chip">
              Status: {statusFilter}
              <button
                onClick={() => onStatusChange('All')}
                className="hover:opacity-70"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {assigneeFilter !== 'All' && (
            <span className="filter-chip">
              Assignee: {assigneeFilter}
              <button
                onClick={() => onAssigneeChange('All')}
                className="hover:opacity-70"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  );
}
