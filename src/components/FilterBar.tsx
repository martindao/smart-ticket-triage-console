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

  return (
    <div className="p-4 bg-white border-b border-gray-200">
      <div className="flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="flex-1 min-w-[200px]">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search tickets..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
          />
        </div>

        {/* Priority Filter */}
        <select
          value={priorityFilter}
          onChange={(e) => onPriorityChange(e.target.value as Priority | 'All')}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white"
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
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white"
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
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white"
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
            className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900"
          >
            <X className="w-4 h-4" />
            Clear
          </button>
        )}
      </div>

      {/* Active Filter Chips */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2 mt-3">
          <Filter className="w-4 h-4 text-gray-400" />
          {searchQuery && (
            <span className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-blue-50 text-blue-700 rounded border border-blue-200">
              Search: "{searchQuery}"
              <button onClick={() => onSearchChange('')} className="hover:text-blue-900">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {priorityFilter !== 'All' && (
            <span className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-purple-50 text-purple-700 rounded border border-purple-200">
              Priority: {priorityFilter}
              <button onClick={() => onPriorityChange('All')} className="hover:text-purple-900">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {statusFilter !== 'All' && (
            <span className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-green-50 text-green-700 rounded border border-green-200">
              Status: {statusFilter}
              <button onClick={() => onStatusChange('All')} className="hover:text-green-900">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {assigneeFilter !== 'All' && (
            <span className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-orange-50 text-orange-700 rounded border border-orange-200">
              Assignee: {assigneeFilter}
              <button onClick={() => onAssigneeChange('All')} className="hover:text-orange-900">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  );
}
