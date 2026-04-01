import type { Ticket } from '../types/ticket';

interface QueueTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  tickets: Ticket[];
  currentAgentId: string;
}

export function QueueTabs({ activeTab, onTabChange, tickets, currentAgentId }: QueueTabsProps) {
  const tabs = [
    { id: 'all', label: 'All Tickets', count: tickets.length },
    {
      id: 'mine',
      label: 'My Tickets',
      count: tickets.filter((t) => t.assignee?.id === currentAgentId).length,
    },
    {
      id: 'unassigned',
      label: 'Unassigned',
      count: tickets.filter((t) => t.assignee === null).length,
    },
    {
      id: 'critical',
      label: 'Critical',
      count: tickets.filter((t) => t.priority === 'Critical').length,
    },
    {
      id: 'overdue',
      label: 'Overdue',
      count: tickets.filter((t) => {
        const deadline = new Date(t.slaDeadline);
        return deadline < new Date();
      }).length,
    },
  ];

  const getTabStyle = (tabId: string, isActive: boolean): React.CSSProperties => {
    const isOverdue = tabId === 'overdue';

    if (isActive) {
      return {
        background: isOverdue
          ? 'var(--accent-secondary-muted)'
          : 'var(--accent-primary-muted)',
        color: isOverdue
          ? 'var(--accent-secondary)'
          : 'var(--accent-primary-text)',
        borderColor: isOverdue
          ? 'var(--accent-secondary)'
          : 'var(--accent-primary)',
      };
    }

    return {
      background: 'transparent',
      color: 'var(--text-300)',
    };
  };

  const getCountStyle = (tabId: string, isActive: boolean): React.CSSProperties => {
    const isOverdue = tabId === 'overdue';
    const isCritical = tabId === 'critical';

    if (isActive) {
      return {
        background: isOverdue
          ? 'var(--accent-secondary)'
          : 'var(--accent-primary)',
        color: 'white',
      };
    }

    if (isOverdue) {
      return {
        background: 'var(--accent-secondary-muted)',
        color: 'var(--accent-secondary)',
      };
    }

    if (isCritical) {
      return {
        background: 'var(--semantic-critical-muted)',
        color: 'var(--semantic-critical)',
      };
    }

    return {
      background: 'var(--surface-700)',
      color: 'var(--text-300)',
    };
  };

  return (
    <div
      className="flex items-center gap-1 p-2 overflow-x-auto"
      style={{
        background: 'var(--surface-800)',
        borderBottom: '1px solid var(--border-default)',
      }}
    >
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`queue-tab flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-all duration-200 border border-transparent ${
            tab.id === 'critical' ? 'queue-tab-critical' : ''
          } ${tab.id === 'overdue' ? 'queue-tab-overdue' : ''} ${activeTab === tab.id ? 'active' : ''}`}
          style={getTabStyle(tab.id, activeTab === tab.id)}
        >
          {tab.label}
          <span
            className="inline-flex items-center justify-center min-w-[20px] px-1.5 py-0.5 text-xs font-semibold rounded-full"
            style={getCountStyle(tab.id, activeTab === tab.id)}
          >
            {tab.count}
          </span>
        </button>
      ))}
    </div>
  );
}
