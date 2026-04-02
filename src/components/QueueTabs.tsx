import type { Ticket } from '../types/ticket';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';

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

  const getBadgeVariant = (tabId: string, isActive: boolean) => {
    if (isActive) {
      return tabId === 'overdue' ? 'destructive' : 'default';
    }
    if (tabId === 'overdue') return 'secondary';
    if (tabId === 'critical') return 'destructive';
    return 'secondary';
  };

  return (
    <div
      className="flex items-center gap-1 p-2 overflow-x-auto"
      style={{
        background: 'var(--surface-800)',
        borderBottom: '1px solid var(--border-default)',
      }}
    >
      <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
        <TabsList className="bg-transparent gap-1">
          {tabs.map((tab) => (
            <TabsTrigger
              key={tab.id}
              value={tab.id}
              className="flex items-center gap-2 px-4 py-2 data-[state=active]:bg-[var(--accent-primary-muted)] data-[state=active]:text-[var(--accent-primary-text)]"
              style={{
                background: activeTab === tab.id && tab.id === 'overdue'
                  ? 'var(--accent-secondary-muted)'
                  : undefined,
                color: activeTab === tab.id && tab.id === 'overdue'
                  ? 'var(--accent-secondary)'
                  : undefined,
              }}
            >
              {tab.label}
              <Badge
                variant={getBadgeVariant(tab.id, activeTab === tab.id)}
                className="ml-1"
              >
                {tab.count}
              </Badge>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </div>
  );
}
