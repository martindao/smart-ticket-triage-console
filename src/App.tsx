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
    <div className="min-h-screen flex" style={{ background: 'var(--canvas)' }}>
      {/* Sidebar Navigation */}
      <Sidebar activeView={activeView} onViewChange={setActiveView} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
{/* Header */}
<header className="px-4 md:px-6 py-3 border-b" style={{ background: 'var(--surface-900)', borderColor: 'var(--border-default)' }}>
<div className="flex items-center justify-between">
<div className="flex items-center gap-2 md:gap-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: 'var(--accent-primary)' }}>
                  <TicketCheck className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-semibold" style={{ color: 'var(--text-100)' }}>TicketTriage</h1>
                </div>
              </div>
              <div className="h-6 w-px" style={{ background: 'var(--border-default)' }} />
              <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-300)' }}>
                <LayoutDashboard className="w-4 h-4" />
                <span>{tickets.length} tickets</span>
              </div>
            </div>
<div className="flex items-center gap-2 md:gap-3">
<div className="relative hidden sm:block">
<Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-400)' }} />
<input
  type="text"
  placeholder="Global search..."
  className="hidden lg:block pl-9 pr-4 py-2 text-sm rounded-lg w-64 focus:outline-none"
  style={{
    background: 'var(--surface-800)',
    border: '1px solid var(--border-default)',
    color: 'var(--text-200)'
  }}
/>
</div>
<button className="relative p-2 rounded-lg transition-colors" style={{ color: 'var(--text-300)' }}>
<Bell className="w-5 h-5" />
<span className="absolute top-1 right-1 w-2 h-2 rounded-full" style={{ background: 'var(--semantic-critical)' }} />
</button>
<button
onClick={() => setShowShortcutHelp(true)}
className="hidden md:flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors"
style={{
  background: 'var(--surface-700)',
  border: '1px solid var(--border-default)',
  color: 'var(--text-200)'
}}
>
<Keyboard className="w-4 h-4" />
Shortcuts
</button>
<button
onClick={clearSavedData}
className="hidden sm:flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors"
style={{
  background: 'var(--semantic-critical-muted)',
  border: '1px solid var(--semantic-critical)',
  color: 'var(--semantic-critical-text)'
}}
>
<RotateCcw className="w-4 h-4" />
Reset
</button>
<div className="hidden md:flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: 'var(--surface-700)' }}>
<AgentAvatar agent={CURRENT_AGENT} size="sm" />
<span className="text-sm font-medium" style={{ color: 'var(--text-200)' }}>{CURRENT_AGENT.name}</span>
</div>
</div>
          </div>
        </header>

        {/* Dashboard View */}
        {activeView === 'dashboard' && (
          <div className="flex-1 overflow-y-auto p-6" style={{ background: 'var(--surface-900)' }}>
            <div className="max-w-7xl mx-auto space-y-6">
              {/* Stats Cards */}
              <StatsCards tickets={tickets} />

{/* Main Content Grid */}
<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
{/* Ticket Queue Preview */}
<div className="col-span-1 lg:col-span-2 space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold" style={{ color: 'var(--text-100)' }}>Unassigned Tickets</h2>
                    <button
                      onClick={() => setActiveView('tickets')}
                      className="text-sm font-medium transition-colors"
                      style={{ color: 'var(--accent-primary)' }}
                    >
                      View All →
                    </button>
                  </div>
                  <div className="rounded-lg overflow-hidden" style={{ background: 'var(--surface-800)', border: '1px solid var(--border-default)' }}>
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
                      <div className="p-8 text-center" style={{ color: 'var(--text-400)' }}>
                        <p>No unassigned tickets</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Activity Feed */}
                <div className="space-y-4">
                  <h2 className="text-lg font-semibold" style={{ color: 'var(--text-100)' }}>Recent Activity</h2>
                  <ActivityFeed activities={activities} />
                </div>
              </div>
            </div>
          </div>
        )}

{/* Tickets View */}
{activeView === 'tickets' && (
<div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
  {/* Left Panel - Queue */}
  <div className="w-full lg:w-[420px] flex flex-col border-b lg:border-b-0 lg:border-r" style={{ background: 'var(--surface-800)', borderColor: 'var(--border-default)' }}>
              <div className="p-3 border-b flex items-center justify-between" style={{ borderColor: 'var(--border-default)' }}>
                <h2 className="font-semibold" style={{ color: 'var(--text-100)' }}>Tickets</h2>
                <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white rounded-lg transition-colors" style={{ background: 'var(--accent-primary)' }}>
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
                  <div className="text-center py-12" style={{ color: 'var(--text-400)' }}>
                    <p>No tickets match your filters</p>
                    <button
                      onClick={clearFilters}
                      className="mt-2 text-sm"
                      style={{ color: 'var(--accent-primary)' }}
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
            <div className="flex-1 overflow-hidden" style={{ background: 'var(--surface-900)' }}>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0, 0, 0, 0.7)' }}>
          <div className="shortcuts-modal w-full rounded-xl shadow-xl" style={{ background: 'var(--surface-800)', border: '1px solid var(--border-default)' }}>
            <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: 'var(--border-default)' }}>
              <h2 className="text-lg font-semibold" style={{ color: 'var(--text-100)' }}>Keyboard Shortcuts</h2>
              <button
                onClick={() => setShowShortcutHelp(false)}
                className="p-1 rounded transition-colors"
                style={{ color: 'var(--text-400)' }}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5">
              {/* Navigation Group */}
              <div className="shortcuts-group">
                <div className="shortcuts-group-title">Navigation</div>
                <div className="shortcut-row">
                  <span className="shortcut-desc">Next ticket</span>
                  <kbd className="shortcut-key">j</kbd>
                </div>
                <div className="shortcut-row">
                  <span className="shortcut-desc">Previous ticket</span>
                  <kbd className="shortcut-key">k</kbd>
                </div>
              </div>
              {/* Actions Group */}
              <div className="shortcuts-group">
                <div className="shortcuts-group-title">Actions</div>
                <div className="shortcut-row">
                  <span className="shortcut-desc">Assign selected ticket</span>
                  <kbd className="shortcut-key">a</kbd>
                </div>
                <div className="shortcut-row">
                  <span className="shortcut-desc">Escalate selected ticket</span>
                  <kbd className="shortcut-key">e</kbd>
                </div>
                <div className="shortcut-row">
                  <span className="shortcut-desc">Resolve in-progress ticket</span>
                  <kbd className="shortcut-key">r</kbd>
                </div>
              </div>
              {/* General Group */}
              <div className="shortcuts-group">
                <div className="shortcuts-group-title">General</div>
                <div className="shortcut-row">
                  <span className="shortcut-desc">Close details / help</span>
                  <kbd className="shortcut-key">Esc</kbd>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
