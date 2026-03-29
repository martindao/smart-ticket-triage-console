import { useState, useMemo, useCallback, useEffect } from 'react';
import { useTickets } from './hooks/useTickets';
import { agents } from './data';
import { TicketCard } from './components/TicketCard';
import { TicketDetail } from './components/TicketDetail';
import { FilterBar } from './components/FilterBar';
import { QueueTabs } from './components/QueueTabs';
import { AgentAvatar } from './components/AgentAvatar';
import { StatsCards } from './components/StatsCards';
import { ActivityFeed } from './components/ActivityFeed';
import { Sidebar } from './components/Sidebar';
import type { Priority, Status } from './types/ticket';
import {
  TicketCheck,
  LayoutDashboard,
  Keyboard,
  RotateCcw,
  X,
  Plus,
  Search,
  Bell,
} from 'lucide-react';

// Current user (for demo purposes)
const CURRENT_AGENT = agents[0]; // Sarah Chen

function App() {
  const {
    tickets,
    selectedTicket,
    selectedTicketId,
    setSelectedTicketId,
    assignTicket,
    escalateTicket,
    resolveTicket,
    closeTicket,
    addNote,
    clearSavedData,
  } = useTickets(CURRENT_AGENT);

  // Derive activities from ticket data for the dashboard feed
  const activities = useMemo(() => {
    const acts: import('./types/ticket').Activity[] = [];
    for (const t of tickets) {
      acts.push({
        id: `act-created-${t.id}`,
        type: 'created',
        ticketId: t.id,
        ticketTitle: t.title,
        agent: t.assignee ?? CURRENT_AGENT,
        description: `created ticket ${t.id}`,
        timestamp: t.createdAt,
      });
      if (t.assignee) {
        acts.push({
          id: `act-assigned-${t.id}`,
          type: 'assigned',
          ticketId: t.id,
          ticketTitle: t.title,
          agent: t.assignee,
          description: `was assigned ${t.id}`,
          timestamp: t.createdAt,
        });
      }
      if (t.status === 'Resolved' || t.status === 'Closed') {
        acts.push({
          id: `act-resolved-${t.id}`,
          type: 'resolved',
          ticketId: t.id,
          ticketTitle: t.title,
          agent: t.assignee ?? CURRENT_AGENT,
          description: `resolved ${t.id}`,
          timestamp: t.createdAt,
        });
      }
    }
    return acts.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [tickets]);

  // Filter states
  const [priorityFilter, setPriorityFilter] = useState<Priority | 'All'>('All');
  const [statusFilter, setStatusFilter] = useState<Status | 'All'>('All');
  const [assigneeFilter, setAssigneeFilter] = useState<string | 'All'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [showShortcutHelp, setShowShortcutHelp] = useState(false);
  const [activeView, setActiveView] = useState<'tickets' | 'dashboard'>('tickets');

  // Filter tickets
  const filteredTickets = useMemo(() => {
    let result = [...tickets];

    // Tab filter
    if (activeTab === 'mine') {
      result = result.filter((t) => t.assignee?.id === CURRENT_AGENT.id);
    } else if (activeTab === 'unassigned') {
      result = result.filter((t) => t.assignee === null);
    } else if (activeTab === 'critical') {
      result = result.filter((t) => t.priority === 'Critical');
    } else if (activeTab === 'overdue') {
      result = result.filter((t) => new Date(t.slaDeadline) < new Date());
    }

    // Dropdown filters
    if (priorityFilter !== 'All') {
      result = result.filter((t) => t.priority === priorityFilter);
    }
    if (statusFilter !== 'All') {
      result = result.filter((t) => t.status === statusFilter);
    }
    if (assigneeFilter !== 'All') {
      if (assigneeFilter === 'Unassigned') {
        result = result.filter((t) => t.assignee === null);
      } else {
        result = result.filter((t) => t.assignee?.name === assigneeFilter);
      }
    }

    // Search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (t) =>
          t.id.toLowerCase().includes(query) ||
          t.title.toLowerCase().includes(query) ||
          t.description.toLowerCase().includes(query) ||
          t.tags.some((tag) => tag.toLowerCase().includes(query))
      );
    }

    return result;
  }, [tickets, priorityFilter, statusFilter, assigneeFilter, searchQuery, activeTab]);

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (priorityFilter !== 'All') count++;
    if (statusFilter !== 'All') count++;
    if (assigneeFilter !== 'All') count++;
    return count;
  }, [priorityFilter, statusFilter, assigneeFilter]);

  const agentNames = useMemo(() => agents.map((a) => a.name), []);

  const clearFilters = () => {
    setPriorityFilter('All');
    setStatusFilter('All');
    setAssigneeFilter('All');
    setSearchQuery('');
  };

  const selectedFilteredIndex = useMemo(
    () => filteredTickets.findIndex((ticket) => ticket.id === selectedTicketId),
    [filteredTickets, selectedTicketId]
  );

  const assignSelectedTicket = useCallback(() => {
    if (!selectedTicket) return;
    if (selectedTicket.status === 'Closed' || selectedTicket.status === 'Resolved') return;
    assignTicket(selectedTicket.id, CURRENT_AGENT.id);
  }, [assignTicket, selectedTicket]);

  const escalateSelectedTicket = useCallback(() => {
    if (!selectedTicket) return;
    if (
      selectedTicket.priority === 'Critical' ||
      selectedTicket.status === 'Closed' ||
      selectedTicket.status === 'Resolved'
    ) {
      return;
    }
    escalateTicket(selectedTicket.id);
  }, [escalateTicket, selectedTicket]);

  const resolveSelectedTicket = useCallback(() => {
    if (!selectedTicket) return;
    if (selectedTicket.status !== 'In Progress') return;

    resolveTicket(
      selectedTicket.id,
      'Resolved via keyboard shortcut after triage verification and support validation.'
    );
  }, [resolveTicket, selectedTicket]);

  const isTypingInField = (target: EventTarget | null) => {
    if (!(target instanceof HTMLElement)) return false;
    const tag = target.tagName.toLowerCase();
    return tag === 'input' || tag === 'textarea' || tag === 'select' || target.isContentEditable;
  };

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (isTypingInField(event.target)) return;

      if (event.key === 'Escape') {
        if (showShortcutHelp) {
          setShowShortcutHelp(false);
        } else {
          setSelectedTicketId(null);
        }
        return;
      }

      const key = event.key.toLowerCase();

      if (key === 'j') {
        event.preventDefault();
        if (filteredTickets.length === 0) return;
        const nextIndex =
          selectedFilteredIndex >= 0 && selectedFilteredIndex < filteredTickets.length - 1
            ? selectedFilteredIndex + 1
            : 0;
        setSelectedTicketId(filteredTickets[nextIndex].id);
      }

      if (key === 'k') {
        event.preventDefault();
        if (filteredTickets.length === 0) return;
        const prevIndex = selectedFilteredIndex > 0 ? selectedFilteredIndex - 1 : filteredTickets.length - 1;
        setSelectedTicketId(filteredTickets[prevIndex].id);
      }

      if (key === 'a') {
        assignSelectedTicket();
      }

      if (key === 'e') {
        escalateSelectedTicket();
      }

      if (key === 'r') {
        resolveSelectedTicket();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [
    assignSelectedTicket,
    escalateSelectedTicket,
    filteredTickets,
    resolveSelectedTicket,
    selectedFilteredIndex,
    setSelectedTicketId,
    showShortcutHelp,
  ]);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar Navigation */}
      <Sidebar activeView={activeView} onViewChange={setActiveView} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-indigo-600 rounded-lg flex items-center justify-center">
                  <TicketCheck className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-semibold text-gray-900">TicketTriage</h1>
                </div>
              </div>
              <div className="h-6 w-px bg-gray-200" />
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <LayoutDashboard className="w-4 h-4" />
                <span>{tickets.length} tickets</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Global search..."
                  className="pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 w-64"
                />
              </div>
              <button className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
              </button>
              <button
                onClick={() => setShowShortcutHelp(true)}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <Keyboard className="w-4 h-4" />
                Shortcuts
              </button>
              <button
                onClick={clearSavedData}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-700 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100"
              >
                <RotateCcw className="w-4 h-4" />
                Reset
              </button>
              <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg">
                <AgentAvatar agent={CURRENT_AGENT} size="sm" />
                <span className="text-sm font-medium text-gray-700">{CURRENT_AGENT.name}</span>
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard View */}
        {activeView === 'dashboard' && (
          <div className="flex-1 overflow-y-auto p-6">
            <div className="max-w-7xl mx-auto space-y-6">
              {/* Stats Cards */}
              <StatsCards tickets={tickets} />

              {/* Main Content Grid */}
              <div className="grid grid-cols-3 gap-6">
                {/* Ticket Queue Preview */}
                <div className="col-span-2 space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-900">Unassigned Tickets</h2>
                    <button
                      onClick={() => setActiveView('tickets')}
                      className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                    >
                      View All →
                    </button>
                  </div>
                  <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                    {tickets
                      .filter((t) => t.assignee === null)
                      .slice(0, 5)
                      .map((ticket) => (
                        <TicketCard
                          key={ticket.id}
                          ticket={ticket}
                          isSelected={ticket.id === selectedTicketId}
                          onClick={() => {
                            setSelectedTicketId(ticket.id);
                            setActiveView('tickets');
                          }}
                          compact
                        />
                      ))}
                    {tickets.filter((t) => t.assignee === null).length === 0 && (
                      <div className="p-8 text-center text-gray-400">
                        <p>No unassigned tickets</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Activity Feed */}
                <div className="space-y-4">
                  <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
                  <ActivityFeed activities={activities} />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tickets View */}
        {activeView === 'tickets' && (
          <div className="flex-1 flex overflow-hidden">
            {/* Left Panel - Queue */}
            <div className="w-[420px] flex flex-col bg-white border-r border-gray-200">
              <div className="p-3 border-b border-gray-200 flex items-center justify-between">
                <h2 className="font-semibold text-gray-900">Tickets</h2>
                <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700">
                  <Plus className="w-4 h-4" />
                  New Ticket
                </button>
              </div>
              <QueueTabs
                activeTab={activeTab}
                onTabChange={setActiveTab}
                tickets={tickets}
                currentAgentId={CURRENT_AGENT.id}
              />
              <FilterBar
                priorityFilter={priorityFilter}
                statusFilter={statusFilter}
                assigneeFilter={assigneeFilter}
                searchQuery={searchQuery}
                onPriorityChange={setPriorityFilter}
                onStatusChange={setStatusFilter}
                onAssigneeChange={setAssigneeFilter}
                onSearchChange={setSearchQuery}
                onClearFilters={clearFilters}
                agentNames={agentNames}
                activeFiltersCount={activeFiltersCount}
              />
              <div className="flex-1 overflow-y-auto">
                {filteredTickets.length === 0 ? (
                  <div className="text-center py-12 text-gray-400">
                    <p>No tickets match your filters</p>
                    <button
                      onClick={clearFilters}
                      className="mt-2 text-indigo-600 hover:text-indigo-700 text-sm"
                    >
                      Clear filters
                    </button>
                  </div>
                ) : (
                  <div>
                    {filteredTickets.map((ticket) => (
                      <TicketCard
                        key={ticket.id}
                        ticket={ticket}
                        isSelected={ticket.id === selectedTicketId}
                        onClick={() => setSelectedTicketId(ticket.id)}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right Panel - Detail */}
            <div className="flex-1 bg-gray-50 overflow-hidden">
              <TicketDetail
                ticket={selectedTicket}
                agents={agents}
                currentAgent={CURRENT_AGENT}
                onAssign={assignTicket}
                onEscalate={escalateTicket}
                onResolve={resolveTicket}
                onClose={closeTicket}
                onAddNote={addNote}
                onSelectTicket={setSelectedTicketId}
              />
            </div>
          </div>
        )}
      </div>

      {/* Keyboard Shortcuts Modal */}
      {showShortcutHelp && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-xl shadow-xl border border-gray-200">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Keyboard Shortcuts</h2>
              <button
                onClick={() => setShowShortcutHelp(false)}
                className="p-1 text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 space-y-2 text-sm text-gray-700">
              <p>
                <kbd className="font-mono bg-gray-100 px-1.5 py-0.5 rounded">j</kbd> Next ticket
              </p>
              <p>
                <kbd className="font-mono bg-gray-100 px-1.5 py-0.5 rounded">k</kbd> Previous ticket
              </p>
              <p>
                <kbd className="font-mono bg-gray-100 px-1.5 py-0.5 rounded">a</kbd> Assign selected ticket
              </p>
              <p>
                <kbd className="font-mono bg-gray-100 px-1.5 py-0.5 rounded">e</kbd> Escalate selected ticket
              </p>
              <p>
                <kbd className="font-mono bg-gray-100 px-1.5 py-0.5 rounded">r</kbd> Resolve selected in-progress ticket
              </p>
              <p>
                <kbd className="font-mono bg-gray-100 px-1.5 py-0.5 rounded">Esc</kbd> Close details/help
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
