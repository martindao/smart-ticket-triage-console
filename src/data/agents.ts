import type { Agent } from '../types/ticket';

export const agents: Agent[] = [
  {
    id: 'AG-001',
    name: 'Sarah Chen',
    role: 'L1 Support',
    avatar: 'SC',
  },
  {
    id: 'AG-002',
    name: 'Mike Rodriguez',
    role: 'L2 Engineer',
    avatar: 'MR',
  },
  {
    id: 'AG-003',
    name: 'Lisa Park',
    role: 'Manager',
    avatar: 'LP',
  },
];

export const getAgentById = (id: string): Agent | undefined => {
  return agents.find((agent) => agent.id === id);
};
