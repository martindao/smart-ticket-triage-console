export interface Agent {
  id: string;
  name: string;
  role: string;
  avatar?: string;
}

export interface Note {
  id: string;
  author: Agent;
  content: string;
  timestamp: string;
  isInternal: boolean;
}

export type Priority = 'Low' | 'Medium' | 'High' | 'Critical';
export type Status = 'Open' | 'In Progress' | 'Resolved' | 'Closed';

export interface Ticket {
  id: string;
  title: string;
  description: string;
  priority: Priority;
  status: Status;
  assignee: Agent | null;
  tags: string[];
  createdAt: string;
  slaDeadline: string;
  escalatedFrom?: string;
  notes: Note[];
  rca?: string;
}

export type ActivityType = 'created' | 'assigned' | 'escalated' | 'resolved' | 'closed' | 'note_added';

export interface Activity {
  id: string;
  type: ActivityType;
  ticketId: string;
  ticketTitle: string;
  agent: Agent;
  description: string;
  timestamp: string;
}
