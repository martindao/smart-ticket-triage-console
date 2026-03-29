# Ticketing source map (Peppermint base + Frappe polish)

## Source split

### Base reference (structure + primary IA): Peppermint
Primary repo: `https://github.com/Peppermint-Lab/peppermint`

Use Peppermint as the **direct structural baseline** for the ticketing experience:

1. **Ticket queue/list view**
   - `apps/client/pages/queue/[id].js`
   - `apps/client/components/TicketViews/admin.tsx`
   - Signals: dense tabular queue, inline filters, compact badges for priority/status, desktop table + mobile list fallback.

2. **Ticket detail view**
   - `apps/client/pages/issue/[id].tsx`
   - `apps/client/components/TicketDetails/index.tsx`
   - Signals: split detail layout, editable title/body, activity feed, inline ticket actions.

3. **Customer info panel / context**
   - `apps/client/components/TicketDetails/index.tsx`
   - Signals: client association chip, assignee/client transfer controls, created-by/client metadata near header.

4. **Internal notes area**
   - `apps/client/components/TicketDetails/index.tsx`
   - Signals: comment workflow with internal/public toggle, timeline-style activity list.

5. **Status + priority chips**
   - `apps/client/components/TicketViews/admin.tsx`
   - `apps/client/components/TicketDetails/index.tsx`
   - Signals: color-coded badge treatment for priority and issue state, compact chip footprint.

### Secondary reference (polish + operational workflows): Frappe Helpdesk
Primary repo: `https://github.com/frappe/helpdesk`

Use Frappe as **secondary UX/workflow polish layer** (not base information architecture):

1. **SLA timers and fulfillment/failure states**
   - `desk/src/components/ticket-agent/TicketSLA.vue`
   - `desk/src/pages/ticket/Tickets.vue`
   - Signals: first-response/resolution countdowns, due-in/fulfilled/failed badges, paused SLA treatment.

2. **Knowledge base integration in ticket flow**
   - `desk/src/components/SearchArticles.vue`
   - `desk/src/components/knowledge-base/*`
   - Signals: contextual article recommendation while composing/responding, searchable KB handoff.

3. **Agent dashboard**
   - `desk/src/pages/dashboard/Dashboard.vue`
   - Signals: filterable KPI cards + trends for queue health and team performance.

4. **Assignment rules / controlled assignment UX**
   - `desk/src/components/AssignmentModal.vue`
   - `desk/src/components/conditions-filter/*`
   - README feature reference: “Assignment Rules”.
   - Signals: assignee picker constraints, team-restricted assignment, condition-driven automation/filter framing.

---

## Must-copy workflows (enumerated)

These are the workflows that should be copied into the target app behavior.

1. **Queue triage loop (must copy)**
   - Start in dense queue.
   - Scan by status + priority chips.
   - Filter quickly by assignee/client/state.
   - Open ticket directly from row.

2. **Ticket detail execution loop (must copy)**
   - Header context first (ticket id/title/customer/status/priority).
   - Read/edit ticket body.
   - Take ownership actions (assign, status, priority, transfer).
   - Maintain activity continuity on same screen.

3. **Notes/conversation loop (must copy)**
   - Append internal/public note from detail screen.
   - Keep chronological conversation history visible.
   - Preserve author/time attribution per entry.

4. **SLA awareness loop (must copy from Frappe polish)**
   - Surface first-response and resolution clocks in ticket context.
   - Convert to compact badges in queue (due/fulfilled/failed/paused).
   - Ensure urgency is visible before opening each ticket.

5. **Knowledge deflection assist loop (must copy from Frappe polish)**
   - While replying, suggest relevant KB articles.
   - Support quick open/view of suggested article.
   - Keep this as optional helper, not a modal detour.

6. **Assignment governance loop (must copy from Frappe polish)**
   - Allow direct assignment from detail screen.
   - Support team-scoped assignee constraints.
   - Keep room for rule/condition-driven auto-assignment extension.

---

## Visual targets to mirror

1. **List density**
   - Prefer compact rows with high information density (Peppermint baseline).
   - Avoid card-heavy queue layouts.

2. **Information hierarchy**
   - Queue: subject + status/priority + assignee/client + SLA signal.
   - Detail: header context first, editable content second, activity third, sidebar metadata fourth.

3. **Notes/conversation layout**
   - Chronological timeline/thread with clear avatar, actor, timestamp, and body separation.

4. **Assignee/customer context**
   - Keep assignee + customer identity visible and editable without leaving ticket detail.

5. **Status/priority treatment**
   - Compact, color-semantic chips/badges everywhere (queue + detail).
   - Use consistent label vocabulary between queue and detail.

---

## Current target repo touchpoints (for implementation alignment only)

Current project: `Tech Support Portfolio/smart-ticket-triage-console`

Relevant existing components from local structure:
- `src/components/TicketCard.tsx`
- `src/components/TicketDetail.tsx`
- `src/components/PriorityBadge.tsx`
- `src/components/StatusBadge.tsx`
- `src/components/SLABadge.tsx`
- `src/components/NoteItem.tsx`

These align naturally with the source map above: Peppermint for base structure, Frappe for SLA/KB/dashboard/assignment polish.
