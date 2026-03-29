import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { useTickets, TICKETS_STORAGE_KEY } from '../useTickets';
import { agents, tickets as seedTickets } from '../../data';
import type { Ticket } from '../../types/ticket';

describe('useTickets', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('loads initial tickets when localStorage is empty', () => {
    const { result } = renderHook(() => useTickets(agents[0]));

    expect(result.current.tickets).toHaveLength(seedTickets.length);
    expect(result.current.tickets[0].id).toBe('TKT-001');
  });

  it('loads ticket state from localStorage when present', () => {
    const persisted: Ticket[] = [
      {
        ...seedTickets[0],
        id: 'TKT-900',
        title: 'Persisted ticket',
      },
    ];
    window.localStorage.setItem(TICKETS_STORAGE_KEY, JSON.stringify(persisted));

    const { result } = renderHook(() => useTickets(agents[0]));

    expect(result.current.tickets).toHaveLength(1);
    expect(result.current.tickets[0].id).toBe('TKT-900');
  });

  it('supports assign, escalate, resolve, close, and add-note workflows', () => {
    const { result } = renderHook(() => useTickets(agents[0]));

    act(() => {
      result.current.assignTicket('TKT-003', 'AG-002');
    });
    expect(result.current.tickets.find((t) => t.id === 'TKT-003')?.assignee?.name).toBe('Mike Rodriguez');
    expect(result.current.tickets.find((t) => t.id === 'TKT-003')?.status).toBe('In Progress');

    act(() => {
      result.current.escalateTicket('TKT-003');
    });
    const escalated = result.current.tickets.find((t) => t.id === 'TKT-006');
    expect(escalated?.escalatedFrom).toBe('TKT-003');
    expect(escalated?.status).toBe('Open');

    act(() => {
      result.current.resolveTicket('TKT-003', 'Caching fix applied');
    });
    expect(result.current.tickets.find((t) => t.id === 'TKT-003')?.status).toBe('Resolved');

    act(() => {
      result.current.closeTicket('TKT-003');
    });
    expect(result.current.tickets.find((t) => t.id === 'TKT-003')?.status).toBe('Closed');

    act(() => {
      result.current.addNote('TKT-003', 'Validated by support', true);
    });
    expect(result.current.tickets.find((t) => t.id === 'TKT-003')?.notes.at(-1)?.content).toBe('Validated by support');
  });

  it('persists changes and clears saved data', () => {
    const { result } = renderHook(() => useTickets(agents[0]));

    act(() => {
      result.current.assignTicket('TKT-003', 'AG-001');
    });

    const persistedValue = window.localStorage.getItem(TICKETS_STORAGE_KEY);
    expect(persistedValue).toContain('TKT-003');
    expect(persistedValue).toContain('In Progress');

    act(() => {
      result.current.clearSavedData();
    });

    expect(window.localStorage.getItem(TICKETS_STORAGE_KEY)).toBeTruthy();
    expect(result.current.tickets).toHaveLength(seedTickets.length);
    expect(result.current.selectedTicket).toBeNull();
  });
});
