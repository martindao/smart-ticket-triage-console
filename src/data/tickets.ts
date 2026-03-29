import type { Ticket } from '../types/ticket';
import { agents } from './agents';

const now = new Date();
const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);
const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
const inTwoHours = new Date(now.getTime() + 2 * 60 * 60 * 1000);
const overdue = new Date(now.getTime() - 2 * 60 * 60 * 1000);

export const tickets: Ticket[] = [
  {
    id: 'TKT-001',
    title: 'Login page slow on mobile',
    description: 'Users are reporting that the login page takes over 10 seconds to load on mobile devices. This is affecting user experience and causing login abandonment.',
    priority: 'Medium',
    status: 'Resolved',
    assignee: agents[0],
    tags: ['performance', 'mobile', 'login'],
    createdAt: threeDaysAgo.toISOString(),
    slaDeadline: tomorrow.toISOString(),
    notes: [
      {
        id: 'NOTE-001',
        author: agents[0],
        content: 'Investigated the issue. Found that the mobile CSS bundle was loading unnecessary desktop assets.',
        timestamp: twoDaysAgo.toISOString(),
        isInternal: true,
      },
      {
        id: 'NOTE-002',
        author: agents[0],
        content: 'Optimized the mobile bundle and deployed to staging. Load time now under 2 seconds.',
        timestamp: oneDayAgo.toISOString(),
        isInternal: false,
      },
    ],
    rca: 'Mobile CSS bundle was loading desktop-specific assets causing 8+ second delay.',
  },
  {
    id: 'TKT-002',
    title: 'Invoice PDF not downloading',
    description: 'Multiple customers unable to download invoice PDFs. Error message: "Failed to generate PDF". Affects billing cycle.',
    priority: 'High',
    status: 'In Progress',
    assignee: agents[1],
    tags: ['billing', 'pdf', 'urgent'],
    createdAt: twoDaysAgo.toISOString(),
    slaDeadline: inTwoHours.toISOString(),
    notes: [
      {
        id: 'NOTE-003',
        author: agents[1],
        content: 'Reproduced the issue. PDF generation service is timing out on large invoices.',
        timestamp: oneDayAgo.toISOString(),
        isInternal: true,
      },
    ],
  },
  {
    id: 'TKT-003',
    title: 'Feature request: Dark mode',
    description: 'Customer requesting dark mode for the dashboard. This would improve usability for users working late hours.',
    priority: 'Low',
    status: 'Open',
    assignee: null,
    tags: ['feature-request', 'ui', 'enhancement'],
    createdAt: oneDayAgo.toISOString(),
    slaDeadline: tomorrow.toISOString(),
    notes: [],
  },
  {
    id: 'TKT-004',
    title: 'API rate limit errors',
    description: 'Critical: API returning 429 errors for all users. Breaking integrations and mobile app functionality.',
    priority: 'Critical',
    status: 'In Progress',
    assignee: agents[1],
    tags: ['api', 'critical', 'outage'],
    createdAt: now.toISOString(),
    slaDeadline: inTwoHours.toISOString(),
    notes: [
      {
        id: 'NOTE-004',
        author: agents[1],
        content: 'Identified Redis cache issue causing rate limit counters to not reset.',
        timestamp: now.toISOString(),
        isInternal: true,
      },
    ],
  },
  {
    id: 'TKT-005',
    title: 'Password reset email delayed',
    description: 'Password reset emails taking 30+ minutes to arrive. Users unable to access accounts.',
    priority: 'Medium',
    status: 'Open',
    assignee: agents[0],
    tags: ['email', 'auth', 'user-blocking'],
    createdAt: twoDaysAgo.toISOString(),
    slaDeadline: overdue.toISOString(),
    notes: [],
  },
];

export const getTicketById = (id: string): Ticket | undefined => {
  return tickets.find((ticket) => ticket.id === id);
};
