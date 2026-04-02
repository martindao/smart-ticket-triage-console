import type { Priority, Status } from '../types/ticket';
import { Filter, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

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
          <Input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search tickets..."
            className="w-full"
            style={{
              background: 'var(--surface-700)',
              border: '1px solid var(--border-default)',
              color: 'var(--text-200)',
            }}
          />
        </div>

        {/* Priority Filter */}
        <Select
          value={priorityFilter}
          onValueChange={(value) => onPriorityChange(value as Priority | 'All')}
        >
          <SelectTrigger
            className="w-[140px]"
            style={{
              background: 'var(--surface-700)',
              border: '1px solid var(--border-default)',
              color: 'var(--text-200)',
            }}
          >
            <SelectValue placeholder="All Priorities" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Priorities</SelectItem>
            <SelectItem value="Critical">Critical</SelectItem>
            <SelectItem value="High">High</SelectItem>
            <SelectItem value="Medium">Medium</SelectItem>
            <SelectItem value="Low">Low</SelectItem>
          </SelectContent>
        </Select>

        {/* Status Filter */}
        <Select
          value={statusFilter}
          onValueChange={(value) => onStatusChange(value as Status | 'All')}
        >
          <SelectTrigger
            className="w-[140px]"
            style={{
              background: 'var(--surface-700)',
              border: '1px solid var(--border-default)',
              color: 'var(--text-200)',
            }}
          >
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Statuses</SelectItem>
            <SelectItem value="Open">Open</SelectItem>
            <SelectItem value="In Progress">In Progress</SelectItem>
            <SelectItem value="Resolved">Resolved</SelectItem>
            <SelectItem value="Closed">Closed</SelectItem>
          </SelectContent>
        </Select>

        {/* Assignee Filter */}
        <Select
          value={assigneeFilter}
          onValueChange={(value) => onAssigneeChange(value ?? 'All')}
        >
          <SelectTrigger
            className="w-[140px]"
            style={{
              background: 'var(--surface-700)',
              border: '1px solid var(--border-default)',
              color: 'var(--text-200)',
            }}
          >
            <SelectValue placeholder="All Assignees" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Assignees</SelectItem>
            <SelectItem value="Unassigned">Unassigned</SelectItem>
            {agentNames.map((name) => (
              <SelectItem key={name} value={name}>
                {name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
            className="gap-1"
          >
            <X className="w-4 h-4" />
            Clear
          </Button>
        )}
      </div>

      {/* Active Filter Chips */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2 mt-3">
          <Filter className="w-4 h-4" style={{ color: 'var(--text-400)' }} />
          {searchQuery && (
            <Badge variant="secondary" className="gap-1">
              Search: "{searchQuery}"
              <button
                onClick={() => onSearchChange('')}
                className="hover:opacity-70"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          )}
          {priorityFilter !== 'All' && (
            <Badge variant="secondary" className="gap-1">
              Priority: {priorityFilter}
              <button
                onClick={() => onPriorityChange('All')}
                className="hover:opacity-70"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          )}
          {statusFilter !== 'All' && (
            <Badge variant="secondary" className="gap-1">
              Status: {statusFilter}
              <button
                onClick={() => onStatusChange('All')}
                className="hover:opacity-70"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          )}
          {assigneeFilter !== 'All' && (
            <Badge variant="secondary" className="gap-1">
              Assignee: {assigneeFilter}
              <button
                onClick={() => onAssigneeChange('All')}
                className="hover:opacity-70"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}
