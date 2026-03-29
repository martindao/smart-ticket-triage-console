import type { Agent } from '../types/ticket';

interface AgentAvatarProps {
  agent: Agent | null;
  size?: 'sm' | 'md' | 'lg';
}

const sizeClasses = {
  sm: 'w-6 h-6 text-xs',
  md: 'w-8 h-8 text-sm',
  lg: 'w-10 h-10 text-base',
};

export function AgentAvatar({ agent, size = 'md' }: AgentAvatarProps) {
  if (!agent) {
    return (
      <div
        className={`${sizeClasses[size]} rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-400`}
        title="Unassigned"
      >
        ?
      </div>
    );
  }

  const initials = agent.avatar || agent.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  return (
    <div
      className={`${sizeClasses[size]} rounded-full bg-blue-100 border border-blue-200 flex items-center justify-center text-blue-700 font-medium`}
      title={`${agent.name} (${agent.role})`}
    >
      {initials}
    </div>
  );
}
