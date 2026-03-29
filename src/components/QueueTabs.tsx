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

  return (
    <div className="flex items-center gap-1 p-2 bg-gray-50 border-b border-gray-200 overflow-x-auto">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`
            flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-colors
            ${activeTab === tab.id
              ? 'bg-white text-blue-700 shadow-sm border border-gray-200'
              : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
            }
          `}
        >
          {tab.label}
          <span
            className={`
              inline-flex items-center justify-center min-w-[20px] px-1.5 py-0.5 text-xs rounded-full
              ${activeTab === tab.id
                ? 'bg-blue-100 text-blue-700'
                : 'bg-gray-200 text-gray-600'
              }
            `}
          >
            {tab.count}
          </span>
        </button>
      ))}
    </div>
  );
}
