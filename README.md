# Smart Ticket Triage Console

Smart Ticket Triage Console is a React helpdesk UI remake built to feel close to a modern internal support desk: dense queue navigation, SLA-aware triage, ticket detail context, and support-first workflows instead of generic CRUD screens.

![React](https://img.shields.io/badge/React-19-blue?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue?logo=typescript)
![Vite](https://img.shields.io/badge/Vite-8-purple?logo=vite)
![Tailwind](https://img.shields.io/badge/Tailwind-4-cyan?logo=tailwindcss)
![Tests](https://img.shields.io/badge/Tests-174_passing-green?logo=vitest)

## Case Study

### The Problem

High-volume support queues need sub-10-second triage. When a ticket lands, the agent needs to know: *Who owns it? How urgent? What's the SLA?* Generic ticket systems hide this in dropdowns and detail pages — every click costs seconds.

### The Approach

Built a dense queue with SLA visibility, escalation context, and keyboard shortcuts for power users:

- **Split-panel layout** — Queue and detail visible together, no context switching
- **SLA badges with overdue highlighting** — Amber glow on tickets breaching SLA, visible in queue
- **Queue tabs** — All Tickets, My Tickets, Unassigned, Critical, Overdue — one click to filter
- **Keyboard shortcuts** — J/K to navigate, E to escalate, R to resolve — no mouse needed

### Key Design Decisions

| Decision | Why |
|----------|-----|
| Dense queue (420px panel) | More tickets visible = faster scanning, less scrolling |
| Inline priority/status badges | Color-coded urgency at a glance, no clicking into tickets |
| Overdue tab with amber styling | SLA breaches are the most urgent — make them impossible to miss |
| localStorage persistence | Simulates agent returning to in-progress queue without losing state |

### What This Proves

I understand support triage workflows and build tools that help agents work faster. This isn't a generic CRUD app — it's designed for the specific cognitive load of high-volume ticket triage.

---

## What the remake delivers

The current UI focuses on the parts of a support console that matter during live triage:

- a dense ticket queue with quick triage tabs
- a split-panel workflow where queue and detail stay visible together
- SLA visibility, escalation context, and RCA notes where a support rep actually needs them
- dashboard previews that still route back into active ticket work

## Support relevance

This repo is meant to show work that maps directly to application support and production triage responsibilities.

| Support workflow | Relevance |
|------------------|-----------|
| Queue rendering | Prioritize open work quickly by ownership, urgency, and overdue state |
| Ticket detail review | Read customer impact, notes, tags, assignee, and SLA context in one place |
| Escalation flow | Move work to a deeper support tier while preserving source-ticket context |
| Resolution + RCA | Capture why the issue happened, not just that it was closed |
| localStorage persistence | Simulates an agent returning to an in-progress queue without losing state |
| Keyboard shortcuts | Reflects the speed-oriented habits common in high-volume support tools |

## Key workflows in the app

- **Queue tabs:** All Tickets, My Tickets, Unassigned, Critical, Overdue
- **Filtering:** search + priority/status/assignee filters
- **Ticket actions:** assign, escalate, resolve, close, add note
- **Detail panel:** note thread, escalation context, RCA reveal, SLA visibility
- **Dashboard preview:** unassigned work and recent activity with quick routing back into tickets

## Run commands

```bash
npm install
npm run dev
npm test
npm run build
npm run preview
```

## Tech stack

| Layer | Technology |
|-------|-----------|
| Framework | React 19 |
| Language | TypeScript 5.9 |
| Build | Vite 8 |
| Styling | Tailwind CSS 4 |
| Testing | Vitest + React Testing Library |
| Persistence | localStorage |

## Testing

`npm test`

Current automated coverage includes:

- queue rendering and triage tab behavior
- dashboard-to-ticket navigation
- ticket detail actions and stored RCA display
- filter behavior
- stats card counts
- ticket state workflow coverage in `useTickets`

## License

MIT
