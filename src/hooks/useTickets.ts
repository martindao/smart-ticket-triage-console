import { useState, useCallback, useMemo, useEffect } from 'react';
import type { Ticket, Agent, Priority, Status, Note } from '../types/ticket';
import { tickets as initialTickets, agents } from '../data';

export const TICKETS_STORAGE_KEY = 'smart-ticket-triage-console:tickets';

const cloneTickets = (data: Ticket[]): Ticket[] =>
  JSON.parse(JSON.stringify(data)) as Ticket[];

const getInitialTickets = (): Ticket[] => {
  if (typeof window === 'undefined') {
    return cloneTickets(initialTickets);
  }

  const saved = window.localStorage.getItem(TICKETS_STORAGE_KEY);
  if (!saved) {
    return cloneTickets(initialTickets);
  }

  try {
    const parsed = JSON.parse(saved) as Ticket[];
    if (!Array.isArray(parsed)) {
      return cloneTickets(initialTickets);
    }
    return parsed;
  } catch {
    return cloneTickets(initialTickets);
  }
};

export function useTickets(currentAgent: Agent) {
  const [tickets, setTickets] = useState<Ticket[]>(getInitialTickets);
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(TICKETS_STORAGE_KEY, JSON.stringify(tickets));
  }, [tickets]);

  // Actions
  const assignTicket = useCallback((ticketId: string, agentId: string) => {
    const agent = agents.find((a) => a.id === agentId);
    if (!agent) return;

    setTickets((prev) =>
      prev.map((ticket) =>
        ticket.id === ticketId
          ? { ...ticket, assignee: agent, status: 'In Progress' as Status }
          : ticket
      )
    );
  }, []);

  const escalateTicket = useCallback((ticketId: string) => {
    setTickets((prev) => {
      const ticket = prev.find((t) => t.id === ticketId);
      if (!ticket) return prev;

      const newPriority: Priority =
        ticket.priority === 'Low'
          ? 'Medium'
          : ticket.priority === 'Medium'
          ? 'High'
          : 'Critical';

      const latestTicketNumber = prev.reduce((max, current) => {
        const numericPart = Number(current.id.replace('TKT-', ''));
        return Number.isNaN(numericPart) ? max : Math.max(max, numericPart);
      }, 0);

      const newTicket: Ticket = {
        ...ticket,
        id: `TKT-${String(latestTicketNumber + 1).padStart(3, '0')}`,
        priority: newPriority,
        status: 'Open',
        assignee: null,
        escalatedFrom: ticketId,
        notes: [],
        createdAt: new Date().toISOString(),
        slaDeadline: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        rca: undefined,
      };

      return [...prev, newTicket];
    });
  }, []);

  const resolveTicket = useCallback((ticketId: string, rca: string) => {
    setTickets((prev) =>
      prev.map((ticket) =>
        ticket.id === ticketId
          ? { ...ticket, status: 'Resolved' as Status, rca }
          : ticket
      )
    );
  }, []);

  const closeTicket = useCallback((ticketId: string) => {
    setTickets((prev) =>
      prev.map((ticket) =>
        ticket.id === ticketId
          ? { ...ticket, status: 'Closed' as Status }
          : ticket
      )
    );
  }, []);

  const addNote = useCallback(
    (ticketId: string, content: string, isInternal: boolean) => {
      const newNote: Note = {
        id: `NOTE-${Date.now()}`,
        author: currentAgent,
        content,
        timestamp: new Date().toISOString(),
        isInternal,
      };

      setTickets((prev) =>
        prev.map((ticket) =>
          ticket.id === ticketId
            ? { ...ticket, notes: [...ticket.notes, newNote] }
            : ticket
        )
      );
    },
    [currentAgent]
  );

  const selectedTicket = useMemo(
    () => tickets.find((t) => t.id === selectedTicketId) || null,
    [tickets, selectedTicketId]
  );

  const clearSavedData = useCallback(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(TICKETS_STORAGE_KEY);
    }
    setTickets(cloneTickets(initialTickets));
    setSelectedTicketId(null);
  }, []);

  return {
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
  };
}
