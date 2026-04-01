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
    <aside className="hidden md:flex w-56 flex-col border-r" style={{ background: 'var(--surface-900)', borderColor: 'var(--border-default)' }}>
      {/* Logo Area */}
      <div className="p-4 border-b" style={{ borderColor: 'var(--border-default)' }}>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'var(--accent-primary)' }}>
            <Ticket className="w-4 h-4 text-white" />
          </div>
          <span className="font-semibold" style={{ color: 'var(--text-100)' }}>TicketTriage</span>
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
              className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-colors"
              style={{
                background: isActive ? 'var(--accent-primary-muted)' : 'transparent',
                color: isActive ? 'var(--accent-primary-text)' : isClickable ? 'var(--text-300)' : 'var(--text-500)',
                cursor: isClickable ? 'pointer' : 'not-allowed',
              }}
            >
              <Icon className="w-4 h-4" style={{ color: isActive ? 'var(--accent-primary)' : 'inherit' }} />
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* Bottom Section */}
      <div className="p-3 border-t" style={{ borderColor: 'var(--border-default)' }}>
        <div className="px-3 py-2 text-xs" style={{ color: 'var(--text-400)' }}>
          <p className="font-medium" style={{ color: 'var(--text-300)' }}>Support Console</p>
          <p>v1.0.0</p>
        </div>
      </div>
    </aside>
  );
}
