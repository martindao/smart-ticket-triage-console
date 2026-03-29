import {
  LayoutDashboard,
  Ticket,
  BookOpen,
  Settings,
  Users,
  BarChart3,
} from 'lucide-react';

interface SidebarProps {
  activeView: 'tickets' | 'dashboard';
  onViewChange: (view: 'tickets' | 'dashboard') => void;
}

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'tickets', label: 'Tickets', icon: Ticket },
  { id: 'customers', label: 'Customers', icon: Users },
  { id: 'kb', label: 'Knowledge Base', icon: BookOpen },
  { id: 'reports', label: 'Reports', icon: BarChart3 },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export function Sidebar({ activeView, onViewChange }: SidebarProps) {
  return (
    <aside className="w-56 bg-white border-r border-gray-200 flex flex-col">
      {/* Logo Area */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <Ticket className="w-4 h-4 text-white" />
          </div>
          <span className="font-semibold text-gray-900">TicketTriage</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            (item.id === 'dashboard' && activeView === 'dashboard') ||
            (item.id === 'tickets' && activeView === 'tickets');
          const isClickable = item.id === 'dashboard' || item.id === 'tickets';

          return (
            <button
              key={item.id}
              onClick={() => {
                if (isClickable) {
                  onViewChange(item.id as 'tickets' | 'dashboard');
                }
              }}
              disabled={!isClickable}
              className={`
                w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-colors
                ${isActive
                  ? 'bg-indigo-50 text-indigo-700'
                  : isClickable
                    ? 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    : 'text-gray-400 cursor-not-allowed'
                }
              `}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-600' : ''}`} />
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* Bottom Section */}
      <div className="p-3 border-t border-gray-200">
        <div className="px-3 py-2 text-xs text-gray-500">
          <p className="font-medium text-gray-700">Support Console</p>
          <p>v1.0.0</p>
        </div>
      </div>
    </aside>
  );
}
