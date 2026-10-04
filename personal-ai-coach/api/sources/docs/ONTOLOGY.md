# Personal AI Coach — Ontology (POC)

**Scope:** 10 entities · **v4.12** (2026-09-26: accepted 22-tool catalogue and lean domain definition boundary). The selected tool declarations and eval mappings are materialized; product execution remains pending. Entity fields are unchanged by this amendment.

> **The canonical data model.** Every entity, attribute, action, tool, enum, derived value, and
> delete-semantic is defined **here, once**; `packages/core/src/contracts/schema.ts` is materialised from this
> document. The entities' product-level definitions, journeys, stories, and FRs:
> [`./PRD.md`](./PRD.md). The prototype at `prototype/` is the executable expression of the
> interface this model serves; where a figure appears on a screen, the arithmetic behind it is
> defined in [§ Derived values](#derived-values).

---

## Executive summary

Ten entities, one API; the first read/update/lifecycle set is defined. A **User** runs one active **Cycle** at a time — a
time-bounded period (default 3 months) identified by its date range, with an optional guiding
intention, `active` until archived by the system at its end date or by hand earlier; an archived
cycle stays editable and can be re-activated. **Objectives** live in the cycle; **Results** measure
them in one of five ways — a `number` or `percentage` against a target, a `milestone` that either
happened or has not, a `habit` marked on the days it happened and scored as an execution rate, or a
`performance` figure whose readings are averaged against a target. **ResultLogs** append the
recorded evidence for the value types and the readings of a performance result; **HabitLogs** are
the days a habit happened, one toggleable row per day. **Actions** are dated commitments, usually
under an objective; **ActionLog** appends their status history — `open · in_progress · done`, no
`missed`, no `partial`, lateness derived from the clock, and a comment may ride an unchanged status.
**Sessions** carry the `briefing_notes` assembled at open, and the `headline`, `summary_notes`,
and `type` written at close, plus the `vendor` and `source_url` of the conversation they ran in.
**Notes** are standalone; capture time is their context.

Two value systems never mix. **Every figure is derived at read time, in one place, and never
stored**: a result's current value from its evidence, its progress from
`(current − start) / (target − start)`, an objective's as the mean of its results', a cycle's
achievement as the mean of its objectives', movement since the last completed session, time gone
in the cycle, overdue, and the short codes agents use to name records. One server-side derivation
module computes them; the web app, the widgets, `loadBriefing`, entity readers, and every figure
inside a session document read from it, so no two surfaces can disagree about a number. **Statuses
are set** — by the coach from judgement, overridable by the person — and never inferred from the
arithmetic: 100% never sets `completed`, and `off_track` never changes a number. **Deletion is
permanent and cascading** — no `deleted_at`, no recovery; deletion must satisfy its approval contract,
and archive is a cycle's normal end-of-life. A POC compromises on scope, never on safety: validity
is enforced by the database, evidence tables are insert-only, and every enum is a database enum.

The selected public catalogue contains 22 tools grouped by domain (§ MCP tools). Collections
organize definitions; each tool has exclusive operations. `session_start` calls the existing
`loadBriefing` service and returns typed `access_state`; `session_close` calls `closeSession` to
persist the headline, summary and type. `progress_record` owns evidence/outcomes; readers own
retrieval. Writes return the contracted bounded result, with supported reader continuations.
Identity comes from the authorized token, never a caller-supplied `user_id`. Cycle creation requires
original-outcome replay; other MCP writes retain their declared retry policy. Destructive annotations
are honest and a host warning is not consent. Cycle deletion requires complete server impact and
trusted application approval. The catalogue and eval specifications are materialized; service implementation remains separate.

## Document map (read top-down)

1. [Principles](#principles) — the semantic rules (API-first, deletion semantics, lifecycles, agents-are-users, single-path derivation, schema-readiness).
2. [Entity index & relationships](#entity-index--relationships) — one row per entity + the containment tree.
3. [Entities 1–10](#entity-1--user) — per-entity attributes + actions (the drill-down).
4. [Derived values](#derived-values) — every computed figure, its formula, and its edge cases, defined once.
5. [MCP tools](#mcp-tools) — the agent-facing surface, act-based, with contract notes.
6. [Contract mapping](#contract-mapping) — entity and tool → `packages/core/src/contracts/*`.
7. [Deferred to MVP / Growth](#deferred-to-mvp--growth).

---

> **API vocabulary:** grouped oRPC calls use resource-scoped names (`objectives.create`,
> `sessions.start`, `record.query`). Standalone action/service names below retain their domain
> vocabulary; the complete API inventory is Technical Design’s API contract table and
> `packages/core/src/contracts/api.ts`.

> **Service vocabulary:** `loadBriefing`, `closeSession` and `updateUser` below remain application
> operations. Their selected public MCP names are `session_start`, `session_close` and `user_update`.
> Source contracts using earlier tool names are pending migration, not additional public aliases.

## Principles

- **API layer is what matters.** MCP wraps a subset.
- For each action: **MCP** = agent calls directly; **internal** = called by other API functions; **system** = handled outside the API; **web-only** = exposed on the web API surface only and deliberately not an MCP tool.
- **Session briefing, headline, and summary are attributes on Session**, not separate entities (permanent design decision — applies to POC AND target). Their _content_ is a contract (Entity 8): the briefing is a standardised template of retrievals, the summary a six-part coaching note, the headline one sentence.
- **Deletion is permanent in the POC.** There is **no `deleted_at` column on any entity** and no recovery of any kind: a confirmed delete removes the row and its descendants for good. Cycle, Objective, Result, Action, and Note deletion remains available on both web and chat; whole-account deletion is web-only and requires fresh identity confirmation. Archive is the normal end-of-life for a Cycle. Because nothing is recoverable, confirmation is the safety net: it reads back the named consequence, and the agent confirms one record at a time. Soft delete, a purge horizon, and recovery surfaces are Growth (§ Deferred to MVP / Growth).
- **Derived values are computed at read time, in one place, never stored.** A result's current value, lifetime Result, Objective, and Cycle percentages, movement since the last completed session, time gone in the cycle, overdue, done-since-session, and short codes are arithmetic over recorded evidence, dates, and the clock (§ Derived values). None is a column or status. They are computed by **one server-side derivation module** and every consumer — web screens, widget projections, `loadBriefing`, entity readers, and every figure written into a session document — reads from it. No client recomputes; an API response and a screen cannot disagree. Statuses (`Objective.status`, `Result.status`, `Action.status`) are set by a person or the coach and never inferred from arithmetic.
- **Evidence is append-only, and the rule is scoped.** `ResultLog` and `ActionLog` are insert-only tables (no `UPDATE` or `DELETE` grants), with one deliberate exception: a row's `comment` may be cleared by the person, because the prose is theirs; the value, status, and timestamp are immutable. `HabitLog` is **state, not history** — a day is marked or it is not, and unmarking deletes the row. Charts and documents are projections of the record: no chart-specific column exists or may be added.
- **A POC compromises on scope, never on safety.** Per-type validity is a database `CHECK`, every enum is a database enum, `metric_type` is immutable once evidence exists, and identity and tenancy are enforced on every row. What is deferred is feature breadth, not correctness.
- **Entity-oriented tool design:** dedicated read/write/delete responsibilities follow § MCP tools; coherent operations may share a tool. Collections organize definitions without becoming tools. Writes return bounded affected records and supported reader continuations.
- **One coaching session:** the POC has a **single flexible session**. The user starts "a coaching session"; the agent adapts within it — goal-setup when there are no objectives, review near cycle-end, a quick check-in, or open coaching. `Session.type` is the agent's **classification of what the session turned out to be, written at close** (Entity 8) — never a user choice and never known at the start. One starter prompt.
- **Agents are users** (PRD § Persona Contract). The coach agent (ChatGPT/Claude) is a user of this data model in its own right: the **briefing** is its read surface and the **summary** is its write-back, the same way the dashboard is the human's. Tools, briefing, and summary are designed for the agent-user with the same care as the human screens; every record has a short code so the agent can name it in one token.
- **Cycle lifecycle is two states:** a cycle is **active** until **archived** — by the system once its `end_at` passes, or manually earlier. Archived is a flag, not a scope state: an archived cycle stays editable, and re-activating it archives the incumbent (POC: maintenance runbook / computed-on-read; MVP: scheduled job). A cycle has no name; its date range is its identity.
- **Schema-readiness:** every entity carries `created_at`; every **mutable** entity also carries `updated_at` (auto-maintained). **No table carries `deleted_at`** — deletes are permanent (§ Principles). All FKs are indexed; the derived subscription projection has a four-value contract; one-active-cycle and one-active-session are partial unique indexes; `HabitLog` is unique on `(result_id, day)`; `Result` carries one `CHECK` per `metric_type` (Entity 4).

---

## Entity index & relationships

**10 entities, eleven named tool entries** — one row per entity; each links to its drill-down. "Deletable" = the
person can delete the entity (permanently, cascading — FR-002); history entities are never user-deleted.

| #   | Entity                            | Purpose                                                   | Parent                     | Deletable          | MCP tools owned                                                                    |
| --- | --------------------------------- | --------------------------------------------------------- | -------------------------- | ------------------ | ---------------------------------------------------------------------------------- |
| 1   | [User](#entity-1--user)           | Account, profile, entitlement, coach context              | —                          | **yes** (web-only) | `user_read` · `user_update`                                                        |
| 2   | [Cycle](#entity-2--cycle)         | Time-bounded coaching period (+ intention)                | User                       | **yes**            | `cycle_lifecycle` · `cycle_update` · `cycle_read` · `cycle_delete`                 |
| 3   | [Objective](#entity-3--objective) | Goal inside the active cycle                              | Cycle                      | **yes**            | `objective_read` · `objective_write` · `objective_delete`                          |
| 4   | [Result](#entity-4--result)       | Measurable outcome, one of five metric types              | Objective                  | **yes**            | `result_read` · `result_write` · `result_delete`                                   |
| 5   | [ResultLog](#entity-5--resultlog) | Timestamped Result value or reading                       | Result                     | no (history)       | `progress_record` (Result half)                                                    |
| 6   | [Action](#entity-6--action)       | Short-term commitment with a due date                     | Cycle (Objective optional) | **yes**            | `action_read` · `action_write` · `action_delete` · `progress_record` (status half) |
| 7   | [ActionLog](#entity-7--actionlog) | Status history behind `Action.status`                     | Action                     | no (history)       | `progress_record` (writes the row)                                                 |
| 8   | [Session](#entity-8--session)     | Coaching session (briefing, headline, summary attributes) | User                       | no                 | `session_read` · `session_start` · `session_close`                                 |
| 9   | [Note](#entity-9--note)           | Free-form coaching context, standalone                    | User                       | **yes**            | `note_read` · `note_write` · `note_delete`                                         |
| 10  | [HabitLog](#entity-10--habitlog)  | A day a habit happened — state, toggleable                | Result (`habit`)           | no (state)         | `progress_record` (habit shape)                                                    |

```
User
├── Cycle (1 active at a time; archived ones browsable and editable)
│   ├── Objective (×N)
│   │   ├── Result (×N) — number · percentage · milestone · habit · performance
│   │   │   ├── ResultLog (×N) — values and readings, append-only
│   │   │   └── HabitLog (×N) — habit results only; one row per marked day
│   │   └── Action (×N) — via objective_id
│   └── Action (×N) — unassigned: cycle_id set, objective_id null
│       └── ActionLog (×N)
│
├── Session (×N)
│   ├── briefing_notes (markdown — assembled at open)
│   ├── headline (one sentence — at close)
│   └── summary_notes (markdown, six parts — at close)
│
└── Note (×N) — standalone; no target. What relates a note to the rest
                 of the record is *when* it was captured
```

---

## Entity 1 — User

| Attribute            | Type          | Auto?          | Description                                                                                                                                                                                                                                                                       |
| -------------------- | ------------- | -------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `id`                 | uuid          | auto           |                                                                                                                                                                                                                                                                                   |
| `name`               | string        | no             | Chosen coaching/display name, used verbatim. Optional to provide: empty string means unknown and gives a neutral greeting. Editable as “What should we call you?”; social login may initialize it but must preserve later user edits. Billing names are separate.                 |
| `email`              | string        | auto (OAuth)   | Login identifier; unique; read-only on every surface in the POC. **Never a key:** every relationship uses `user.id`, and Stripe events resolve by `stripe_customer_id`, so a later change-email feature (MVP, CB-050 Let people change their login email) needs no data migration |
| `about_me`           | text          | no             | Free-form context                                                                                                                                                                                                                                                                 |
| `timezone`           | string (IANA) | no             | Defaults to the zone the client reports at sign-up; shown as the zone name with its current UTC offset. Drives the boundary, due dates, and cycle-position arithmetic                                                                                                             |
| `stripe_customer_id` | string?       | auto (billing) | Nullable, **unique** — maps Stripe webhooks back to the user                                                                                                                                                                                                                      |
| `created_at`         | timestamp     | auto           |                                                                                                                                                                                                                                                                                   |

| #   | Action                                        | Description                                                                                                                                                                                                                                                                                                                                       | MCP?         |
| --- | --------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------ |
| 1   | `createUser(email, timezone)`                 | Creates the account (names come later)                                                                                                                                                                                                                                                                                                            | system       |
| 2   | `getUser(id)`                                 | Read user profile                                                                                                                                                                                                                                                                                                                                 | internal     |
| 3   | `updateUser({ name?, about_me?, timezone? })` | Update editable POC profile fields. Web: an account action, available in every subscription state. Chat (`user_update`): requires an active subscription                                                                                                                                                                                          | **MCP**      |
| 4   | `getSubscriptionProjection(id)`               | Derive billing read state from local subscription rows; official Stripe plugin owns lifecycle writes                                                                                                                                                                                                                                              | system       |
| 5   | `createCheckoutSession()`                     | Create a short-lived Stripe Checkout destination — the path to a **new** subscription: the first one from Onboarding, or a replacement from Settings **Resubscribe** after a canceled plan (PRD A1). Refused while an active or past-due subscription exists. Entitlement is granted by the webhook projection, never by the return from checkout | **web-only** |
| 6a  | `getBillingDetails()`                         | Web-only Settings display read of plan, price and payment method from Stripe (see below); account-management access, nulls for no subscription                                                                                                                                                                                                    |
| 6   | `createBillingPortalSession()`                | Create a short-lived Stripe Customer Portal destination — every transactional act on an **existing** subscription                                                                                                                                                                                                                                 | **web-only** |
| 7   | `deleteUser(reauth_context)`                  | Cancel billing; permanently delete the account and descendants; revoke sessions                                                                                                                                                                                                                                                                   | **web-only** |

The following User read fields are **derived from local subscription storage**, not columns on
User. One shared projection selects existing paid access ahead of incomplete checkout attempts and
maps raw Stripe states to the product states. No live Stripe request runs on ordinary reads.

| Derived field                       | Type       | Source                                                                               |
| ----------------------------------- | ---------- | ------------------------------------------------------------------------------------ |
| `subscription_status`               | enum       | `incomplete · active · past_due · canceled`; default incomplete; entitled iff active |
| `subscription_cancel_at_period_end` | boolean    | Selected subscription cancellation flag; false without a subscription                |
| `subscription_current_period_end`   | timestamp? | Selected subscription period end; null without a subscription                        |

Settings shows status and the renewal or scheduled-cancellation date from this projection. Plan,
price and payment method are not stored or projected: the web-only `billing.get_details`
read (CB-049 Reconcile API and prototype language differences) fetches them from Stripe for the
selected subscription when the Subscription section loads or is retried — the **only** read that may
contact Stripe. It returns `plan { name, amount_minor, currency, interval: month, interval_count: 1 }`
or null, `payment_method { display }` or null, and `retrieved_at`; no subscription returns nulls
without a provider call, and a provider outage is a retryable `billing_details_unavailable` error
that never blocks local status, reads or recovery. It never grants entitlement, is never persisted,
and is not an MCP tool. Every transactional act happens in the Stripe Customer Portal. The progress boundary, once a per-user setting, is now derived from the
sessions record ([§ Derived values › Boundary](#boundary-and-movement-since-the-last-session)).

---

## Entity 2 — Cycle

| Attribute    | Type      | Auto? | Description                                                                                                                                                                                                                         |
| ------------ | --------- | ----- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `id`         | uuid      | auto  |                                                                                                                                                                                                                                     |
| `user_id`    | FK → User | auto  |                                                                                                                                                                                                                                     |
| `intention`  | text?     | no    | The guiding intention for the cycle — the focus/identity the user wants to hold this period, beyond any single goal (e.g. "Become someone who writes daily and finishes what they start"). Optional; surfaced in session briefings. |
| `start_at`   | date      | no    | Defaults to today on create                                                                                                                                                                                                         |
| `end_at`     | date      | no    | Defaults to three months after `start_at`; must be after `start_at`                                                                                                                                                                 |
| `status`     | enum      | auto  | `active · archived`                                                                                                                                                                                                                 |
| `created_at` | timestamp | auto  |                                                                                                                                                                                                                                     |

**A cycle has no name.** Its identity everywhere — header line, sidebar footer, Cycles list, Cycle
detail, confirmation dialogs, briefings — is its date range (`8 Jun – 30 Aug 2026`). The
intention is the conversational handle if one is wanted.

**One active Cycle per user.** `createCycle` archives the previous. **Two states:** `active` until archived — by the system once `end_at` passes, or manually earlier; an archived cycle stays editable and can be re-activated, which archives the incumbent. (The end-of-cycle archive is a system transition — see Principles.) Archive retains the full subtree forever; nothing is snapshotted.

**Derived, not stored** (§ Derived values): **achievement %** — the mean of the cycle's objectives' progress %, computed over the retained subtree for archived cycles too; **time gone %** — how much of the cycle's span has elapsed; **length in weeks**. A cycle whose objectives all lack a percentage has no achievement figure.

| #   | Action                                                         | Description                                                                                                                                                                                                    | MCP?                                                                  |
| --- | -------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| 1   | `createCycle(start_at, end_at, idempotency_key, intention?)`   | Creates cycle + archives previous                                                                                                                                                                              | via `cycle_lifecycle(create)`                                         |
| 2   | `getActiveCycle(user_id)`                                      | Get current active cycle                                                                                                                                                                                       | internal                                                              |
| 3   | `getCycle(id)`                                                 | Read one cycle — active or archived — with its objectives and its derived time gone, length, and achievement. Backs Cycle detail (`/cycles/:id`)                                                               | via `cycle_read(get)`, cycle summary only                             |
| 4   | `listCycles()`                                                 | Every cycle the person has run, active first and then archived by `start_at` descending, each with its derived achievement and length. Backs the Cycles screen (`/cycles`)                                     | via `cycle_read(list)`                                                |
| 5   | `updateCycle(id, { status?, intention?, start_at?, end_at? })` | **Archive / re-activate** (`status`) / set intention / adjust dates (recomputes length, time gone, and every boundary-dependent figure)                                                                        | via `cycle_update (field edits) / cycle_lifecycle(archive\|activate)` |
| 6   | `archiveExpiredCycles()`                                       | System maintenance: mark `active → archived` once `end_at` passes                                                                                                                                              | system                                                                |
| 7   | `deleteCycle(id, preview_id)`                                  | **Hard delete** — the row and its descendants are removed permanently. Destructive annotation. The mistake-recovery path — archive is the normal end-of-life. Deleting the active cycle leaves no active cycle | via `cycle_delete(commit)`                                            |
| 8   | `previewCycleDeletion(id)`                                     | Complete server impact and genuine application approval handoff; no domain deletion                                                                                                                            | via `cycle_delete(preview)`                                           |
| 9   | `getStoredActiveCycle()`                                       | Pure owned stored-active summary or null; never runs expiry                                                                                                                                                    | via `cycle_read(get, id=active)`                                      |

---

## Entity 3 — Objective

| Attribute     | Type       | Auto? | Description                                                                                   |
| ------------- | ---------- | ----- | --------------------------------------------------------------------------------------------- |
| `id`          | uuid       | auto  |                                                                                               |
| `cycle_id`    | FK → Cycle | auto  | Inherited from active Cycle                                                                   |
| `title`       | string     | no    | Short goal name                                                                               |
| `description` | text       | no    | The goal in detail                                                                            |
| `deadline_at` | date?      | no    | Optional mid-cycle deadline; null means never set. Once set it can be replaced, never cleared |
| `status`      | enum       | no    | `on_track · off_track · completed` (default `on_track`) — agent-set, person-overridable       |
| `created_at`  | timestamp  | auto  |                                                                                               |

**Objective status is a coaching judgement.** `on_track · off_track · completed` — set by the agent from the conversation and the evidence, and overridable by the person on the web. It is deliberately **not derived**: "off track" needs a pace judgement no formula in this product produces, and the coach must be able to disagree with the arithmetic. `completed` is **suggested, never applied**: when every Result under the objective is `completed`, surfaces offer "Mark completed"; nothing sets it automatically.

**Derived, not stored** (§ Derived values): **progress %** — the unweighted mean of the objective's Results' progress % (every Result counts the same; the POC has no weighting concept); an objective with no Results, or none with a percentage, has no percentage — surfaces show no bar and no figure, not 0%. **Movement since the last session** in percentage points. **Short code** — `A`, `B`, `C`… by position in the cycle's objective list.

**Percentage and status are independent and both are real.** The percentage is
arithmetic over recorded evidence; the status is the coach's judgement. 100% does not set
`completed`, and `off_track` does not change the arithmetic — an objective can be 80% and off track
(the pace is wrong) or 40% and on track (the plan expects that). Surfaces show both and never
substitute one for the other; a percentage is never coloured by a status.

| #   | Action                                                                 | Description                                                                                                                                          | MCP?                          |
| --- | ---------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------- |
| 1   | `createObjective(title, description, deadline_at?)`                    | Creates within active Cycle                                                                                                                          | via `objective_write(create)` |
| 2   | `getObjective(id)`                                                     | Read with Results + Actions                                                                                                                          | internal                      |
| 3   | `listObjectives(cycle_id?)`                                            | List objectives for a cycle, in creation order (the order short codes follow)                                                                        | internal                      |
| 4   | `updateObjective(id, { title?, description?, deadline_at?, status? })` | Edit fields, including `status` (`on_track · off_track · completed`). `deadline_at` sets or replaces; null is rejected — a deadline is never cleared | via `objective_write(update)` |
| 5   | `deleteObjective(id, preview_id)`                                      | **Hard delete** — permanent, with its results and actions. Destructive annotation. No restore in POC — recovery is Growth                            | via `objective_delete`        |

---

## Entity 4 — Result

| Attribute      | Type           | Auto? | Description                                                                                                                                                           |
| -------------- | -------------- | ----- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `id`           | uuid           | auto  |                                                                                                                                                                       |
| `objective_id` | FK → Objective | no    | Changeable — moving a result between objectives moves its evidence with it and recomputes both roll-ups                                                               |
| `title`        | string         | no    | "Publish 10 articles"                                                                                                                                                 |
| `description`  | text?          | no    | Optional detail                                                                                                                                                       |
| `metric_type`  | enum           | no    | `number · percentage · milestone · habit · performance` — immutable once the result carries evidence (§ validity)                                                     |
| `start_value`  | number?        | no    | Value types: the baseline (default 0). Performance: optional; when present it makes the share of target direction-aware. Milestone: fixed 0. Habit: derived 0         |
| `target_value` | number?        | no    | Value types and performance: the goal. Milestone: fixed 1. Habit: derived 100                                                                                         |
| `unit`         | string?        | no    | The word or symbol rendered after a value — "words", "kg", "h", "bpm". Prose derives from it. Not used by `percentage`, `milestone`, or `habit`                       |
| `cadence`      | enum?          | no    | Habit only: `weekly · monthly` — the unit the execution rate is scored over                                                                                           |
| `per`          | integer?       | no    | Habit only: how many times per cadence unit, `≥ 1`; reads `3x per week`                                                                                               |
| `since`        | date?          | no    | Habit and performance: when measuring began. Clips the first cadence unit and anchors the trend axis. Defaults to the cycle's `start_at`                              |
| `status`       | enum           | no    | `in_progress · completed` (default `in_progress`) — suggested `completed` when the current value reaches the target, but settable so a person can close one out early |
| `created_at`   | timestamp      | auto  |                                                                                                                                                                       |

**Five metric types, two evidence shapes.** Three types store a figure through ResultLogs; two
store _evidence_ and derive their figure from it:

| `metric_type` | What it stores                                                                  | What it shows                                                                 | Current value (derived)                                                             |
| ------------- | ------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| `number`      | `start_value`, `target_value`, `unit`; ResultLogs                               | `12,000 / 50,000` (unit in the hero target phrase and the editable Unit fact) | The latest ResultLog's value, else `start_value`                                    |
| `percentage`  | `start_value`, `target_value`; ResultLogs                                       | `61% / 80%`                                                                   | The latest ResultLog's value, else `start_value`                                    |
| `milestone`   | ResultLogs with value 0 or 1                                                    | `0 / 1`                                                                       | The latest ResultLog's value, else 0                                                |
| `habit`       | `cadence`, `per`, `since`; HabitLogs (the days it happened)                     | `55% / 100%` — an execution rate where 100% is perfect                        | The habit rate (§ Derived values)                                                   |
| `performance` | `target_value`, `unit`, `since`, optional `start_value`; ResultLogs as readings | `6.9 / 7.5 h` — the running average against the target                        | The mean of all readings in the cycle, to one decimal; `start_value` or 0 when none |

**Per-type validity matrix** — enforced as one database `CHECK` per `metric_type`, and restated by
`result_write` as input validation so the agent gets a legible error before the constraint fires
(two layers, database authoritative):

| `metric_type` | Required                      | Forbidden                             | Fixed / derived                                     |
| ------------- | ----------------------------- | ------------------------------------- | --------------------------------------------------- |
| `number`      | `start_value`, `target_value` | `cadence`, `per`, `since`             | current derived                                     |
| `percentage`  | `start_value`, `target_value` | `cadence`, `per`, `since`, `unit`     | current derived; values 0–100                       |
| `milestone`   | —                             | `cadence`, `per`, `since`, `unit`     | `start_value` 0, `target_value` 1; current ∈ {0, 1} |
| `habit`       | `cadence`, `per`, `since`     | `start_value`, `target_value`, `unit` | start 0, target 100, current = rate                 |
| `performance` | `target_value`, `since`       | `cadence`, `per`                      | `start_value` optional; current = running average   |

- **`metric_type` is immutable once evidence exists.** A result with no ResultLog and no
  HabitLog may change type (its type-scoped fields reset to the new type's defaults); once
  evidence exists, a type change is delete-and-recreate, because evidence shapes are incompatible.
- **`target_value` must differ from `start_value`** for `number` and `percentage`; a result whose
  target equals its start has no percentage and is excluded from its objective's mean (§ Derived
  values).
- The `CHECK` is independent of tenancy and identity rules, which apply to every row.

**Computed (§ Derived values): Progress % = `(current − start) / (target − start) × 100`**, one
formula for all five types through the mappings in the table above — `habit` maps to start 0,
target 100, current = rate; `performance` to start (0 when absent), target, current = average.
Display-clamped to 0–100; a descending target (62 → 55 bpm) works through the same formula because
numerator and denominator are both negative; `target == start` has no percentage; no evidence yet
is a real 0% that counts in the objective's mean.

**Percentage is not status.** `status` (`in_progress · completed`) is set, not computed; reaching
100% only _suggests_ `completed`. A Result may read 100% and stay `in_progress`, or be closed out
early at 40%.

**Derived, not stored:** current value; boundary value; progress %; movement since the last
session; short code (`A1`, `B2`); the trend series. Charts are projections of the record — no
chart-specific column exists or may be added, and lower-is-better needs no `direction` field: it
falls out of `start_value > target_value`.

| #   | Action                                                                                                                                         | Description                                                                                                                    | MCP?                       |
| --- | ---------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ | -------------------------- |
| 1   | `createResult(objective_id, title, metric_type, { target_value?, start_value?, unit?, cadence?, per?, since?, description? })`                 | Create Result; the type-scoped fields are validated against the matrix                                                         | via `result_write(create)` |
| 2   | `getResult(id)`                                                                                                                                | Read with its evidence and derived figures                                                                                     | internal                   |
| 3   | `listResults(objective_id)`                                                                                                                    | List Results for an objective, in creation order (the order short codes follow)                                                | internal                   |
| 4   | `updateResult(id, { title?, description?, objective_id?, metric_type?, target_value?, start_value?, unit?, cadence?, per?, since?, status? })` | Adjust the measure, move it to another objective, set `status`; `metric_type` only while no evidence exists                    | via `result_write(update)` |
| 5   | `deleteResult(id, preview_id)`                                                                                                                 | **Hard delete** — permanent, with its ResultLogs and HabitLogs. Destructive annotation. No restore in POC — recovery is Growth | via `result_delete`        |

---

## Entity 5 — ResultLog

_The recorded evidence behind a `number`, `percentage`, `milestone`, or `performance` result —
append-only, with one deletion escape hatch. For a performance result every row is a reading; the
average is derived._

| Attribute     | Type          | Auto? | Description                                                                                                                      |
| ------------- | ------------- | ----- | -------------------------------------------------------------------------------------------------------------------------------- |
| `id`          | uuid          | auto  |                                                                                                                                  |
| `result_id`   | FK → Result   | no    |                                                                                                                                  |
| `value`       | number?       | no    | The recorded value or reading (one decimal for performance; 0 or 1 for milestone). Null only on a comment-only entry for a habit |
| `comment`     | text?         | no    | Prose about the evidence. The one mutable field on this table: the person may clear it                                           |
| `session_id`  | FK → Session? | auto  | From MCP call context when an open session exists; NULL for web-originated updates                                               |
| `recorded_at` | timestamp     | auto  |                                                                                                                                  |

**A comment may ride an unchanged value.** Adding a comment on Result detail records a ResultLog
at the current value with the comment — the same shape the ActionLog uses for a comment on an
unchanged status — so the evidence stays append-only and the comment has a timestamp. For a
`habit`, whose value is derived, the comment-only entry carries `value = null`.

**Two exceptions to append-only, both deliberate (Solo 2026-09-04).**

1. **Clearing a comment** sets `comment` to null and leaves the row: the measurement and its time
   survive, only the prose goes. No other field is ever updated.
2. **Deleting an entry.** Each row in the Updates table of a number, percentage, or performance
   result carries a delete control, confirmed before it acts (UI-SPEC § Delete an update), so a person can
   remove an update they should not have recorded — a mistake, or a duplicate a host retry
   produced. The row is removed permanently; there is no restore. Every figure the result reports
   is derived, so a delete simply recomputes: removing the latest entry returns `current_value` to
   the previous one, and removing a middle entry closes the gap in the history and the trend.
   Deletion is **web-only** and is never exposed to the agent — the person removes their own
   record, the coach never edits it. A milestone's rows carry no delete (the milestone flips
   through `createResultLog`), and a habit's rows are marks (Entity 10), removed by unmarking.

The record is therefore honest-by-default rather than immutable: the surfaces still never rewrite a
value, and a correction is still normally an append, but the person owns their history and can take
an entry out of it.

| #   | Action                                         | Description                                                                   | MCP?                          |
| --- | ---------------------------------------------- | ----------------------------------------------------------------------------- | ----------------------------- |
| 1   | `createResultLog(result_id, value?, comment?)` | Creates a ResultLog — the result's current value derives from it at read time | via `progress_record(result)` |
| 2   | `listResultLogs(result_id, since?)`            | History, newest first                                                         | internal                      |
| 3   | `clearResultLogComment(id)`                    | Sets `comment` to null; the row stays                                         | **web-only**                  |
| 4   | `deleteResultLog(id)`                          | Removes the entry permanently; derived figures recompute from what remains    | **web-only**                  |

---

## Entity 6 — Action

| Attribute      | Type            | Auto? | Description                                                                                                                                                                                   |
| -------------- | --------------- | ----- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `id`           | uuid            | auto  |                                                                                                                                                                                               |
| `cycle_id`     | FK → Cycle      | auto  | The cycle the action belongs to; set from the objective when one is given, else the active cycle. What an unassigned action cascades with                                                     |
| `objective_id` | FK → Objective? | no    | Optional. An action with no objective is "unassigned" and lists first, because an action with nothing behind it is the one that needs a decision                                              |
| `title`        | string          | no    | **Required.** The short commitment shown in every action list — "Write article #4"                                                                                                            |
| `description`  | text?           | no    | Optional longer context — the detail behind the commitment, read on Action detail                                                                                                             |
| `due_at`       | date?           | no    | Required once set and required by `action_write(create)`; a web-created empty action may lack it until the person sets it (UI-SPEC § Create via empty detail screen)                          |
| `status`       | enum            | no    | `open · in_progress · done` (default `open`) — set only through `progress_record`                                                                                                             |
| `sort_order`   | decimal?        | no    | The person's own arrangement of the outstanding list, within its objective group. Decimal so a drop between two rows writes one row. Null sorts last, by `due_at`. **Never set by the agent** |
| `session_id`   | FK → Session?   | auto  | Auto-set from the originating session at create; reassignable by the person on Action detail, including to none                                                                               |
| `created_at`   | timestamp       | auto  |                                                                                                                                                                                               |

**Three statuses, no failure state.** An action is `open`, `in_progress`, or
`done` — the Todoist model, with one addition for work already under way:

| Status        | Means                                                                               |
| ------------- | ----------------------------------------------------------------------------------- |
| `open`        | Committed to, not started. The default on create                                    |
| `in_progress` | Started, not finished. A sibling of `open` — still outstanding, just already moving |
| `done`        | Finished                                                                            |

**There is no `missed` and no `partial`.**
Lateness is **derived from `due_at` and the clock, never stored**: an action past its due date is
_overdue_, which is a property of an open or in-progress action, not a fourth status — so an overdue
action that gets done is simply `done`, with the whole story readable in its ActionLog. This is what
keeps the record free of a failure state: the product holds people to commitments through evidence
and honest comments, never by marking them failed. What "partial" used to express is now either
`in_progress` or a comment on an unchanged status (Entity 7).

**`title` is what a list shows; `description` is what the detail adds.** Every
action list — web Actions, the objective's Actions section, the briefing's action lines, the Due
actions card — renders `title` alone, single-line and ellipsis-truncated. `description` is optional,
appears only on Action detail and in tool results, and is never required to understand what was
committed to: if it takes a `description` to know what the action is, the `title` is wrong.

**Order is the person's.** `sort_order` applies to `open` and `in_progress` actions and holds
within an objective group; `done` actions list newest-first. `loadBriefing` and the Due actions
card read the same order as the Actions screen, so a card and the screen never disagree.

**Derived, not stored** (§ Derived values): overdue; done since the last session.

| #   | Action                                                                                         | Description                                                                                                                 | MCP?                       |
| --- | ---------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- | -------------------------- |
| 1   | `createAction(title, due_at, { objective_id?, description? })`                                 | Commit to a new action; `cycle_id` follows the objective or the active cycle                                                | via `action_write(create)` |
| 2   | `getAction(id)`                                                                                | Read                                                                                                                        | internal                   |
| 3   | `listActions(cycle_id, { objective_id?, status?, due_before? })`                               | Filtered list, in the person's order                                                                                        | internal                   |
| 4   | `updateAction(id, { title?, description?, due_at?, objective_id?, session_id?, sort_order? })` | Edit intent, links, and order — **never status** (status moves via `progress_record`); `sort_order` is web-only in practice | via `action_write(update)` |
| 5   | `deleteAction(id, preview_id)`                                                                 | **Hard delete** — permanent, with its ActionLog rows. Destructive annotation. No restore in POC — recovery is Growth        | via `action_delete`        |

---

## Entity 7 — ActionLog

_Timestamped status record — the history behind Action.status._

| Attribute     | Type          | Auto? | Description                                                                                                                                      |
| ------------- | ------------- | ----- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| `id`          | uuid          | auto  |                                                                                                                                                  |
| `action_id`   | FK → Action   | auto  |                                                                                                                                                  |
| `status`      | enum          | auto  | `open · in_progress · done`                                                                                                                      |
| `comment`     | text?         | no    | The one mutable field on this table: the person may clear it                                                                                     |
| `session_id`  | FK → Session? | auto  | Populated from MCP call context when an open session exists; NULL for web-originated changes. Lets `closeSession` read session activity directly |
| `recorded_at` | timestamp     | auto  |                                                                                                                                                  |

| #   | Action                                         | Description                                              | MCP?                          |
| --- | ---------------------------------------------- | -------------------------------------------------------- | ----------------------------- |
| 1   | `createActionLog(action_id, status, comment?)` | Append an entry — a status change **or** a comment alone | via `progress_record(action)` |
| 2   | `listActionLogs(action_id)`                    | History                                                  | internal                      |
| 3   | `clearActionLogComment(id)`                    | Sets `comment` to null; the row stays                    | **web-only**                  |

**A repeated status is a valid entry, not a no-op.** `status` may equal
the action's current status; the entry then records a **comment against an unchanged status** — how a
person or the coach adds "still blocked on the interview" without pretending something moved. The
action's `status` is set from the entry either way (unchanged in this case), a row is appended with
its own `recorded_at`, and history reads back as an honest sequence of observations rather than only
of transitions. The web's three-state checkbox writes one entry per step (open → in progress →
done → open); the web's "Add comment" writes a comment against the unchanged status.

- A comment-only entry with no `comment` text **is** a no-op and is rejected — there is nothing to
  record. Status changes may still carry an empty comment.
- **No retry dedupe in the POC (Solo 2026-09-04).** This is the one write where an identical repeat
  can be genuine intent — the same observation, made again later — so any content-derived dedupe
  risks swallowing a real entry. The POC therefore does not dedupe MCP writes at all: a host retry
  appends a second entry, and the person removes it. Server-side dedupe was designed and measured
  (AD-10 / AD-11 / CB-023) and is deferred to MVP, to be decided against observed duplicate rates
  rather than in advance. Whatever is chosen there, keying on the call's _identity_ is ruled out:
  on a stateless transport a request id is not unique, so it swallows unrelated writes while
  missing real retries.
- Nothing here is editable except the comment's removal (Entity 5's rule applies). A correction is a further append, which is why the same status can recur.
- **No per-row delete here, deliberately** (Solo, 2026-09-04 — the asymmetry with Entity 5 is the point). `Action.status` is a **stored** column that this entry sets; it is never derived from the log. So a duplicate entry costs a redundant line in the history and nothing else — the person still owns the current status and can move it `done → open` or back at any time by recording again. Entity 5 is the opposite case: a result's `current_value` **derives** from its evidence, so there the row _is_ the state, and removing a bad row is the only way to correct it. Delete exists where evidence is state; it is unnecessary where state is a column the person can simply set.
- Surfaces show the comments; status transitions are recorded but not listed, because the current status is already stated and a table of transitions is noise.

---

## Entity 8 — Session

_Briefing, headline, and summary are attributes, not separate entities (permanent design decision)._

| Attribute        | Type             | Auto? | Description                                                                                                                                                                                                                                                              |
| ---------------- | ---------------- | ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `id`             | uuid             | auto  |                                                                                                                                                                                                                                                                          |
| `user_id`        | FK → User        | auto  |                                                                                                                                                                                                                                                                          |
| `vendor`         | enum             | auto  | `claude · openai` — the chat application the session ran in, known at `loadBriefing` from the calling surface. Shown as Claude / ChatGPT. Not user-editable                                                                                                              |
| `source_url`     | string?          | auto  | The deep link back to the conversation, when the host provides one; "Open the conversation" renders only when present. Not user-editable                                                                                                                                 |
| `type`           | enum?            | auto  | `goal_setup · check_in · review · open_coaching` — **the agent's classification of what the session turned out to be**, written by `closeSession`, never chosen by the person and never known at session start. Null while open. A label on history, not a mode selector |
| `briefing_notes` | text (markdown)  | auto  | The standardised briefing assembled by `loadBriefing` at session start and persisted as written — a snapshot of retrievals, so a session from an earlier cycle keeps the document it was prepared with                                                                   |
| `headline`       | text?            | auto  | **One sentence** written by `closeSession`: the session's focus, key insight, and commitments, compressed so headlines read in sequence as the coaching history. The session's one-line representation everywhere — lists, cards, the briefing's session history         |
| `summary_notes`  | text (markdown)? | auto  | The session narrative written at close — the six-part coaching note below. Its first part is the excerpt Session detail shows                                                                                                                                            |
| `started_at`     | timestamp        | auto  |                                                                                                                                                                                                                                                                          |
| `ended_at`       | timestamp?       | auto  | Set by `closeSession`. **The most load-bearing timestamp in the model**: the latest `ended_at` is the progress boundary                                                                                                                                                  |

Actions created in a session are found through `Action.session_id`; actions reviewed in one
through `ActionLog.session_id`. Neither needs a column here.

### Content contract — the briefing

`loadBriefing` **assembles** the briefing from retrievals against the record, in a fixed section
order, with template language only. Reasoning about what the figures mean happens in the session,
never in the document. Every figure inside it comes from § Derived values, so a briefing can never
disagree with the app.

| Order | Section                       | Content (retrieval only)                                                                                                                                                                                                    |
| ----- | ----------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| lede  | `Prepared <date>`             | Cycle date range and time gone; achievement against time gone; open actions and how many are overdue                                                                                                                        |
| 1     | How to read this document     | The id key (O objective, R result, A action, N note, S session), the line grammar for Result and Action lines, and the absolute since-boundary ("since S2, Mon 22 Jun")                                                     |
| 2     | Flags                         | Threshold retrievals, no reasoning: overdue actions; results never updated; results silent since the boundary; habits with no marks since the boundary. Empty state names the thresholds passed                             |
| 3     | Cycle position                | Four fields: Cycle (date range, time gone), Intention, Pace (achievement against time gone: ahead of / behind / level with the clock), Scope (counts of objectives, results, actions)                                       |
| 4     | ResultLogs since S<n>, <date> | Per moved result: `From X to Y (up Δ), N updates`, with result comments as `Comment (date): "…"`; then **Results with no updates** (standing value, last recorded); habits report marked days and the rate change in points |
| 5     | Progress by type              | Objectives by status; results by count and completion with the average across the measurable; actions by status with the overdue count; notes on record and since the boundary                                              |
| 6     | Objectives in full            | Every objective (status, completion, deadline, movement) with every result beneath it (value of target, completion, status, movement)                                                                                       |
| 7     | Actions, open                 | Every open and in-progress action in the person's order: status, due date, overdue, `Objective:` and `Source session:` as named fields, description                                                                         |
| 8     | Notes                         | Notes since the boundary as date-plus-text lines; if none, the four most recent on record, so labelled                                                                                                                      |
| 9     | Last session, in summary      | The previous session's id and date, its facts (type, vendor, duration, actions created), its summary in full                                                                                                                |
| 10    | Session history               | Up to six earlier sessions: id, date, type, vendor, duration, actions created, and the headline verbatim                                                                                                                    |
| 11    | Recap                         | Pace, every overdue action, the next due action, and the last session's headline — primacy and recency against lost-in-the-middle recall                                                                                    |

Rules: **every line opens with its record id** (`R4 Run 120 km.`); **every line is labelled fields
in a fixed order**, never a sentence about the person; **section names are ontology names**;
dates are absolute. A person with no active cycle gets the lede and a `No active cycle` line, and
the enablement instruction if unpaid (`loadBriefing`).

### Content contract — the summary

`closeSession` persists `summary_notes` in six parts, aligned with ICF coaching-note practice. The
computed session facts (type, vendor, duration, actions created and reviewed) lead; the parts
follow in order: **I. Session focus and key topics** (client-presented material included) ·
**II. Client insights and challenges** (client-generated insight quoted verbatim) · **III. Action
steps and next steps** (in the client's wording, with each action's id and current status) ·
**IV. Coaching interventions and support** (the techniques used) · **V. Accountability and
follow-up** (opens with a progress-versus-goals read, reviews prior commitments, closes with
next-session preparation) · **VI. Additional notes and observations** (patterns). Every figure
inside it is derived, never authored. The `headline` compresses I–III into one sentence.

| #   | Action                                          | Description                                                               | MCP?                                |
| --- | ----------------------------------------------- | ------------------------------------------------------------------------- | ----------------------------------- |
| 1   | `createSession(user_id, vendor, source_url?)`   | Start a session; `type`, `headline`, `summary_notes` are null until close | internal (called by `loadBriefing`) |
| 2   | `getSession(id)`                                | Read                                                                      | internal                            |
| 3   | `getLastSession(user_id)`                       | Most recent                                                               | internal                            |
| 4   | `endSession(id, type, headline, summary_notes)` | Set the close attributes + `ended_at`                                     | internal (called by `closeSession`) |
| 5   | `listSessions(user_id, since?)`                 | History, newest first                                                     | internal                            |

---

## Entity 9 — Note

| Attribute     | Type      | Auto? | Description                                 |
| ------------- | --------- | ----- | ------------------------------------------- |
| `id`          | uuid      | auto  |                                             |
| `user_id`     | FK → User | auto  |                                             |
| `text`        | text      | no    | Never empty — an empty draft is not written |
| `recorded_at` | timestamp | auto  | The note's only context; immutable          |

Notes have no type and no target in the POC. Relevance comes from _when_ a note was captured — it is
read alongside the result logs, action outcomes, and session that fall in the same window, and
the web groups it as "Since last session" or "Earlier" against the boundary.

| #   | Action                       | Description                                                                                                         | MCP?                     |
| --- | ---------------------------- | ------------------------------------------------------------------------------------------------------------------- | ------------------------ |
| 1   | `addNote(text)`              | Capture free text; rejected when `text` is blank                                                                    | via `note_write(create)` |
| 2   | `updateNote(id, { text })`   | Revise the text; blanking a saved note is rejected rather than wiping it                                            | via `note_write(update)` |
| 3   | `getNote(id)`                | Read                                                                                                                | internal                 |
| 4   | `listNotes(since?)`          | Reverse-chronological timeline                                                                                      | internal                 |
| 5   | `deleteNote(id, preview_id)` | **Hard delete** — permanent. Destructive annotation. Ships on both surfaces. No restore in POC — recovery is Growth | via `note_delete`        |

---

## Entity 10 — HabitLog

_A day a habit happened. State, not history: a checkbox per day, toggleable; a day's absence is
itself the record that it did not happen._

| Attribute    | Type          | Auto? | Description                                                                      |
| ------------ | ------------- | ----- | -------------------------------------------------------------------------------- |
| `id`         | uuid          | auto  |                                                                                  |
| `result_id`  | FK → Result   | no    | A `habit` result only (`CHECK` via the result's `metric_type`)                   |
| `day`        | date          | no    | The day it happened, in the user's `timezone`. **Unique on `(result_id, day)`**  |
| `session_id` | FK → Session? | auto  | From MCP call context when an open session exists; NULL for web-originated marks |
| `created_at` | timestamp     | auto  |                                                                                  |

- A mark is valid only for a day between the result's `since` and today — neither the past before
  measuring began nor the future can be evidence.
- Every cadence marks days: a monthly habit with `per` 2 is two marked days in the month.
- Unmarking deletes the row. There is no negation record and no history of marks; the rate is
  recomputed from the marks on hand.
- A comment on a habit is a `ResultLog` with `value = null` (Entity 5).

| #   | Action                                                  | Description                               | MCP?                                 |
| --- | ------------------------------------------------------- | ----------------------------------------- | ------------------------------------ |
| 1   | `setHabitLog(result_id, day, marked)`                   | Insert or delete the row for that day     | via `progress_record(result, habit)` |
| 2   | `listHabitLogs(result_id, from?, to?, cursor?, limit?)` | A bounded page of marked days in a window | internal                             |

---

## Derived values

Every figure below is computed at read time by **one server-side derivation module** and read from
there by every consumer. None is stored. Formulas are stated once here; UI-SPEC decides how each
is formatted and where it appears.

### Boundary and movement since the last session

- **Boundary** = `max(Session.ended_at)` over the user's sessions with a non-null `ended_at`; when
  no session has completed, the active cycle's `start_at` at local midnight. Evaluated in `timezone`.
  Closing a session moves the boundary, so every movement figure re-bases at that moment.
- **Boundary value of a result** — value types: the latest ResultLog at or before the boundary,
  else `start_value`; performance: the average of readings at or before the boundary; habit: the
  rate as of the day before the boundary's date.
- **Movement since the last session**, per type:

| Type          | Figure                                                                                                                                                                                                                                                    | Empty / flat                      |
| ------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------- |
| `number`      | `current − boundary`, signed, in the native metric, grouped (`+2,200`)                                                                                                                                                                                    | no change → no figure (`-`)       |
| `percentage`  | `current − boundary`, signed, with `%` (`+3%`)                                                                                                                                                                                                            | no change → `-`                   |
| `milestone`   | `+1` when it flipped to 1 since the boundary, `-1` when back to 0                                                                                                                                                                                         | no change → `-`                   |
| `habit`       | The count of marks with `day ≥` the boundary's date (`+4`), annotated with `N% of expected`, where expected = `max(1, round(per × elapsedDays ÷ 7))` for weekly and `÷ 30` for monthly, `elapsedDays` counting the boundary's day through today inclusive | no marks → `-`                    |
| `performance` | The running average with its share of target beside it (`59 bpm`, `93%`), share = progress % below                                                                                                                                                        | no readings → `-`                 |
| Objective     | Current progress % minus the mean of its results' boundary progress %, in percentage points (`+3.8pp`)                                                                                                                                                    | `\|Δ\| < 0.05` → `-`; no % → none |

- **Progress-point movement of a result** = current progress % − boundary progress %; it drives the
  bar's segments: pine to the boundary %, sage for a positive difference, brick for the ground given
  up when the difference is negative. A regression is a signed value, never a negative segment.
- **Done since the last session** (actions): a `done` action whose latest `done` ActionLog entry is
  at or after the boundary; with no log entry, whose `due_at` is on or after the boundary's date.
- **Notes since the last session**: `recorded_at ≥ boundary`.

### Results

- **Current value** — `number`/`percentage`/`milestone`: the latest ResultLog's value, else
  `start_value` (0 for a milestone). `performance`: the mean of all readings in the cycle, to one
  decimal; **with no readings, `start_value` when set, else 0** — so a performance result with no
  readings is a real 0% that counts in its objective's mean, like every other type with no evidence
  (Solo, 2026-09-08; movement stays `-`). `habit`: the rate below, rounded to a whole percent (0
  when no unit is in scope).
- **Progress %** = `(current − start) / (target − start) × 100` with the per-type mapping of Entity
  4; **null when `target == start`** (never 0%); display-clamped to 0–100 while the underlying
  ratio is not (over-achievement reads 100% with a full bar and the real value beside it). Formatted
  to one decimal, except exactly 0 and 100 as integers.
- **Habit rate** — units are the calendar weeks (Monday–Sunday) or calendar months from `since`
  through today. For each unit: `actual` = marks in the unit; `expected` = `per` for a whole unit,
  and for a unit clipped by `since` or by today `max(1, round(per × daysInUnitInScope ÷ unitLength))`.
  The headline **rate = Σ actual ÷ Σ expected × 100**, null when Σ expected = 0. Two denominators
  serve two questions: the headline rate is pro-rata (_am I on track today_); a per-period breakdown
  reads a running unit against its whole target, `expectedFull = per` (_how did each period compare_),
  while a unit clipped by `since` keeps the pro-rata figure because it genuinely had fewer days.
- **Performance share of target** = progress % with start 0 (or the stored `start_value`, which
  makes 62 → 55 bpm read as ground covered); a reading's own gap = `reading − target`, its share =
  `reading ÷ target × 100`.
- **Short code** = the objective's letter + the result's 1-based position in the objective's results
  in creation order (`A1`, `B3`). Never stored; may change when results are added, removed, or
  moved.
- **Trend series** — a projection of the evidence over the elapsed cycle: value types as a line
  through the ResultLogs from `start_value` at the cycle start with a straight pace guide from
  start to target; habits as per-unit bars (`actual` of `expectedFull`); performance as one bar per
  reading against the target; milestones have none. Nothing about it is stored.

### Objectives and cycles

- **Objective progress %** = the unweighted mean of its results' progress %, excluding results with
  no percentage; null when none remain.
- **Objective short code** = `A`, `B`, `C`… by position in the cycle's objectives in creation order.
- **Cycle achievement %** = the mean of its objectives' progress %, excluding null; null when none
  remain; computed over the retained subtree for archived cycles, rounded to a whole percent.
- **Time gone %** = `(now − start_at) ÷ (end_at − start_at) × 100`, clamped to 0–100, rounded to a
  whole percent.
- **Length in weeks** = `round((end_at − start_at) ÷ 7 days)`.
- **Pace read** (briefing only): achievement against time gone — ahead of, behind, or level with the
  clock; "nothing measurable yet" when achievement is null.

### Actions

- **Overdue** = `status ≠ done` and `due_at <` today (in `timezone`).
- **Outstanding order** = `sort_order` ascending within the objective group; nulls last by `due_at`;
  groups ordered unassigned first, then objectives in creation order.
- **Done order** = newest first by the `done` entry's `recorded_at`, else `due_at`.

### Sessions

- **Duration** = `ended_at − started_at` in whole minutes; null while open.
- **Actions created** = actions with `session_id` = this session; **actions reviewed** = actions with
  an ActionLog entry carrying this session's id.

### Briefing aggregates ("Progress by type")

Objectives by status; results in play, completed, in progress, and the average completion across
the measurable; actions by status with the overdue count; notes on record and since the boundary.
All from the figures above.

---

## MCP tools

**Selected target: 22 tools in eight authored collections (Solo, 2026-09-26).** Collection and
inventory ownership is [Architecture — MCP contract boundary](./ARCHITECTURE-DOC.md#mcp-contract-boundary).
Definitions are declarations under `packages/core/src/features/`; runtime availability is
separate from contract existence. The complete declaration catalogue and operation eval mappings are materialized; shared-service
implementation and live evaluation remain pending. See [contract handoff](../packages/core/src/contracts/evals/MCP-CONTRACTS.md).

| Collection / declaration module    | Dedicated public tools                                          | Exclusive responsibility                                                              |
| ---------------------------------- | --------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| Cycles — `tools/cycles.ts`         | `cycle_read`, `cycle_update`, `cycle_lifecycle`, `cycle_delete` | list/get; field edits; create/archive/activate; deletion preview/commit               |
| Objectives — `tools/objectives.ts` | `objective_read`, `objective_write`, `objective_delete`         | list/get; create/update; permanent deletion                                           |
| Results — `tools/results.ts`       | `result_read`, `result_write`, `result_delete`                  | list/get and result evidence reads; create/update; permanent deletion                 |
| Actions — `tools/actions.ts`       | `action_read`, `action_write`, `action_delete`                  | list/get and action history reads; create/update intent and links; permanent deletion |
| Notes — `tools/notes.ts`           | `note_read`, `note_write`, `note_delete`                        | list/get; create/update; permanent deletion                                           |
| User — `tools/users.ts`            | `user_read`, `user_update`                                      | read permitted coaching profile; update editable profile fields                       |
| Sessions — `tools/sessions.ts`     | `session_read`, `session_start`, `session_close`                | list/get; open/resume with briefing; explicitly end and persist summary               |
| Progress — `tools/progress.ts`     | `progress_record`                                               | record result evidence/habit logs and action outcomes; no generic record reads        |

Read tools require `coach:read`; writes, including `session_start`, require `coach:write`.
Annotations cover every arm's actual effects. Action field edits exclude status and order:
`progress_record` owns outcomes; ordering remains web-only. Evidence-row deletion remains web-only.
No generic public `queryRecord`, `manage*`, `loadBriefing`, `closeSession`, `recordProgress` or
`updateUser` alias is part of the target surface. Internal service and oRPC names remain unchanged.

The operation notes below retain domain requirements while detailed schemas are reconciled to the
selected catalogue. A `delete` row belongs only to the separate entity delete tool, never its write
tool. For cycles, server impact preview and trusted application approval are already mandatory.
Other entity deletion contracts now also require complete server preview and trusted application
approval before commit. Their service support remains a publication blocker.

### 1 · `session_start(force_new?: boolean)`

Opens a coaching session and returns everything needed to coach in one read. Call this **first, once**
per session, before any other tool. The calling surface supplies `vendor` and, when it can, the
conversation's `source_url`.

Returns a **typed** `access_state`, never prose the model must interpret:

| `access_state` | Rest of the payload                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| -------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `active`       | The standardised briefing (Entity 8 content contract) as `briefing_notes`, plus its structured twin: cycle (date range, intention, time gone, achievement — or `null` for no active cycle) · objectives with results, statuses, progress, and movement since the last session · actions open in the person's order, with overdue · notes since the boundary with canonical web URLs · the last session's headline and summary · profile (chosen name, about-me, timezone) · stale-session context if one is open |
| `unpaid`       | `enablement` only: the instruction to relay and the signup link. **No coaching state.** Do not coach, do not write, do not imply access                                                                                                                                                                                                                                                                                                                                                                          |

`force_new: true` closes a stale open session without a summary and starts a fresh one — use only
when the person declines to resume. Creates the Session row and persists `briefing_notes`; it is a
write, not a read.

### 2 · `session_close(session_id, type, headline, summary_notes)`

Ends the session and persists three things: **`type`** — the agent's classification of what the
session turned out to be (`goal_setup` · `check_in` · `review` · `open_coaching`), decided at the
end from what actually happened and never chosen by the person; the one-sentence **`headline`**;
and the six-part **`summary_notes`** (Entity 8 content contract). Sets `ended_at`, which becomes
the new progress boundary for every surface.

**This is an irreversible act, named for the act.** A mid-session request to "summarise where I am,"
"recap," or "what have we covered" is **not** a trigger — answer those in conversation. Call this only
when the person explicitly ends the session. Never fabricate a summary for a session that was not
closed by the person.

### 3 · `cycle_lifecycle(operation, ...)`

| Operation | Required                                              | Effect                                                               |
| --------- | ----------------------------------------------------- | -------------------------------------------------------------------- |
| create    | start_at, end_at, idempotency_key; intention optional | Create active cycle and archive incumbent atomically; explicit dates |
| archive   | owned UUID                                            | Archive while retaining descendants                                  |
| activate  | owned UUID                                            | Activate selected cycle and archive incumbent                        |

Field edits use cycle_update; permanent deletion uses cycle_delete. Shared services return the
application detail receipt; MCP projects cycle and changed identifiers. Create keys are scoped to
actor and logical operation. Identical retries recover the original committed outcome; conflicting
payloads reject. This supersedes AD-12 MCP dedupe leaves POC scope for cycle creation only.

Mutations never run lazy expiry. Past-ended cycles can be stored active until the existing
expiry-triggering application lookup runs. MCP stored-active selection is pure and does not invoke
that lookup. F2 Cycles § MCP contract owns detailed replay, lifecycle and failure obligations.

### 4 · `objective_write(operation, ...)` and `objective_delete`

| `operation` | Required                                                     | Effect                                                                                                                                                                                                                                                                 |
| ----------- | ------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `create`    | `title`, `description`; `deadline_at?`                       | Creates within the active cycle. Requires an active cycle to exist                                                                                                                                                                                                     |
| `update`    | `id`; any of `title`, `description`, `deadline_at`, `status` | Edits the goal, including `status` (`on_track` · `off_track` · `completed`) — your judgement from the conversation and the evidence, not a calculation; the person can override it on the web. A deadline can be moved, never removed: `deadline_at: null` is rejected |
| `delete`    | `id`                                                         | Removes the objective and its results and actions. Permanent, no recovery in POC. Confirm with the person first                                                                                                                                                        |

"Drop it" and "delete it" are the same act in the POC — there is no separate drop state. Returns the
objective with its results, actions, its status, its short code, and its derived progress % and
movement.

### 5 · `result_write(operation, ...)` and `result_delete`

| `operation` | Required                                                                                                                                                                                                                                                               | Effect                                                                                                                                                                                   |
| ----------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `create`    | `objective_id`, `title`, `metric_type`; then per type — `number`/`percentage`: `target_value`, `start_value?`, `unit?` · `milestone`: nothing · `habit`: `cadence`, `per`, `since?` · `performance`: `target_value`, `unit?`, `since?`, `start_value?`; `description?` | Defines how progress on the objective is measured. Fields outside the type's matrix are rejected                                                                                         |
| `update`    | `id`; any of `title`, `description`, `objective_id`, `target_value`, `start_value`, `unit`, `cadence`, `per`, `since`, `status`; `metric_type` only while the result has no evidence                                                                                   | Adjusts what the result aims at, moves it to another objective, or sets its status (`in_progress` · `completed`) — suggested `completed` once the value reaches target, settable earlier |
| `delete`    | `id`                                                                                                                                                                                                                                                                   | Removes the result and its evidence. Permanent, no recovery in POC. Confirm first                                                                                                        |

Use `progress_record`, never `update`, to log evidence. Returns the result with its recent evidence,
its short code, and its derived value, progress, and movement.

### 6 · `action_write(operation, ...)` and `action_delete`

| `operation` | Required                                                                    | Effect                                                                                                           |
| ----------- | --------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| `create`    | `title`, `due_at`; `objective_id?`, `description?`                          | Commits to a dated action, under an objective when one is given; `session_id` is set from the open session       |
| `update`    | `id`; any of `title`, `description`, `due_at`, `objective_id`, `session_id` | Edits the **intent** and links — what the commitment is, its context, when, under which goal, from which session |
| `delete`    | `id`                                                                        | Removes the action and its ActionLog history. Confirm first                                                      |

`title` is the one-line commitment every list shows; `description` is optional longer context (Entity
6). **This tool never changes status, and never sets `sort_order`** — position is the person's
arrangement, not a coaching judgement. Started and done are outcomes, not edits — they go through
`progress_record`, and so does a comment on an unchanged status. Returns the action with its
comments, links, and overdue state.

### 7 · `progress_record(target, ...)`

The single tool for logging what actually happened. Append-only for values, readings, and action
outcomes; a toggle for habit days. It adds evidence, never overwrites it.

| `target` | Required                                                                                                                                                                       | Effect                                                                                                                                                                                                                                                                                        |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `result` | `result_id`; then by type — value types: `value`; `milestone`: `value` 0 or 1; `performance`: `value` (a reading, one decimal); `habit`: `day`, `marked`; any type: `comment?` | Value types and performance: records a ResultLog, from which the current value derives. Habit: inserts or deletes the HabitLog for `day`; a `comment` alone records a ResultLog with `value = null`. A `comment` with no new value on a value type records a ResultLog at the unchanged value |
| `action` | `action_id`, `status` (`open \| in_progress \| done`); `comment?`                                                                                                              | Records an ActionLog row and sets the action's status to the one supplied                                                                                                                                                                                                                     |

**`status` may repeat the action's current status.** That is the comment path: "still blocked on the
interview" is recorded by passing the unchanged status with a `comment`, which appends a timestamped
entry without pretending the commitment moved. A repeat with no `comment` is rejected — there would
be nothing to record (Entity 7).

Clarify an uncertain value or status **before** calling — the evidence cannot be edited afterwards,
only superseded by a later entry (a habit day can be unmarked). Returns the updated result or action
with its history and, for a result, the new value, target, percentage, and movement so the result
can be narrated exactly.

### 8 · `note_write(operation, ...)` and `note_delete`

| `operation` | Required     | Effect                                                                                                                          |
| ----------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------- |
| `create`    | `text`       | Captures the note. **No target** — relevance comes from _when_ it was captured, read alongside what else changed in that window |
| `update`    | `id`; `text` | Revises the note                                                                                                                |
| `delete`    | `id`         | Removes the note. Confirm first                                                                                                 |

**Notes carry no target and no type in the POC.** Relevance comes from _when_ a note was captured —
it is read alongside the result logs, action outcomes, and session that fall in the same window.
Every returned Note includes a canonical web URL derived from its id; the URL is not stored.

### 9 · `user_update({ name?, about_me?, timezone? })`

Keeps the profile the coach greets and reasons with accurate. Returns the updated profile.

### 10 · `cycle_read(operation, ...)`

Read only; requires coach:read and actor ownership, but no active subscription. List reuses
listCycles and returns items, next_cursor and a supported continuation with reader/call arguments.
Ordering is active first, then start_at and id descending. Get accepts UUID or active and returns
{cycle: CycleView|null}; null means no stored active cycle. An unknown/foreign UUID returns NOT_FOUND.
Active means stored status at execution, not calendar-current, and never runs lazy expiry.
Fresh list/selected context can be used directly for a write without another read. Related records
have their own readers; cycle summaries exclude child collections. Stored prose is untrusted data.

### 11 · `cycle_update(id, start_at?, end_at?, intention?)`

Edit only supplied fields of the selected UUID or stored active cycle. Resolve active inside the
shared update service. Missing active never falls back; explicit UUIDs retain their identity even
when status changes. Omission preserves and null clears intention. Validate merged dates; never
implicitly archive/activate or run expiry. Requires coach:write, ownership and entitlement.
The application receipt remains shared; MCP returns only the cycle and changed identifiers.

### 12 · `cycle_delete(operation, id, preview_id?)`

Permanent deletion has its own tool. Preview requires an owned UUID and returns complete server
impact counts, target, expiry and application approval URL. Commit requires the same UUID and
preview_id plus genuine user approval recorded server-side through the trusted application.
A model flag, preview possession or conversational yes is not approval. Bind approval to actor,
target, impact and expiry; revalidate and consume it with deletion. Incomplete or changed impact
blocks deletion. Notes and sessions remain; descendant objectives, results, result/habit logs,
actions and action logs cascade. Commit returns operation, id and active_remaining, never a subtree.
No automatic replacement activation. See F2 Cycles § MCP contract for exact schemas and errors.

### Exclusive read ownership

Solo approved read/update/lifecycle grouping on 2026-09-14. The first materialized set is
`cycle_read` / `cycle_update` / `cycle_lifecycle`. This supersedes cycle_write without an alias. Their operation sets are disjoint; no legacy
name or `queryRecord` alias is exposed. Internal services and oRPC procedures may still compose
records; that does not make them MCP tools. The registry in `contracts/tools.ts` is the only
executable definition inventory, and only implemented entries are published.

| Read capability formerly supplied by queryRecord                               | Exclusive intended owner | Contract state                          |
| ------------------------------------------------------------------------------ | ------------------------ | --------------------------------------- |
| Cycle index and selected cycle, dates/status/derived figures                   | cycle_read               | Defined, service implementation pending |
| Permitted profile and user timezone                                            | user_read                | Defined, implementation pending         |
| Objectives and their current/boundary figures, filtered by cycle               | objective_read           | Defined, implementation pending         |
| Results, derived figures and trend; result-log and habit-log evidence windows  | result_read              | Defined, implementation pending         |
| Actions/current status and action-log evidence windows                         | action_read              | Defined, implementation pending         |
| Notes and note timeline/window                                                 | note_read                | Defined, implementation pending         |
| Saved sessions, briefing/summary documents and last-completed-session boundary | session_read             | Defined, implementation pending         |

Evidence histories belong to their result/action reader; do not additionally expose another
reader for the same evidence operation. Date windows, retention, isolation and current-versus-past
semantics remain requirements for those future contracts. Cross-entity requests compose the
appropriate readers. A parent-ID filter selects child records; it does not authorize returning
a duplicate parent view or independently pageable collections owned by another reader.

The existing loadBriefing session-start operation may return its prescribed session briefing,
and mutations may return bounded receipts. Neither is a standalone query gateway. Never repeat
a mutation or open a session to retrieve unavailable context. Cycle deletion obtains complete consequences from its server preview, independently of related
reader availability; unavailable preview or approval blocks deletion. The reader declarations and operation eval mappings are now defined; bounded service support and
actual agent evidence remain pending.

### Materialized MCP reader and deletion semantics

Readers expose only their entity and owned evidence, with the exact filters/windows documented in
[the contract handoff](../packages/core/src/contracts/evals/MCP-CONTRACTS.md). Results can list within
one objective or cycle; attention selectors preserve the existing briefing thresholds. Action
outstanding selection means open/in_progress, never done. Briefing pages now use executable owning-reader
continuations in an MCP-specific projection; shared application briefing receipts remain unchanged.
All permanent entity deletion tools use server preview and genuine application approval before commit.
This materializes the selected safety pattern without changing cascade meaning or implementing services.

### Internal record query (not an MCP tool)

The following former generic read specification is retained for internal application composition
and migration traceability only. It is not a public tool contract; no MCP adapter may wrap it.
Its old MCP publication instruction is superseded by Exclusive read ownership above. New entity
contracts inherit relevant data semantics without inheriting the generic return surface.

Internal composition reads the coaching record without opening a session. All input
fields are optional: `queryRecord()` returns current context; `filters` narrow the records;
`window` adds historical evidence. Continuation cursors page the same request.

- **Current context is always present:** chosen name, about-me, timezone, server `as_of`
  time and the last-completed-session boundary; a paged cycle index (active first, then newest
  archived); the selected cycle's dates, intention, position and derived achievement; objectives,
  results with current and boundary figures, and outstanding actions in the person's order.
  Reuse the briefing's recent-notes and last-completed-session context. Return canonical web URLs,
  IDs and short codes where defined (profile fields exclude email, billing and OAuth data). Include unchanged records; a recent-write window never
  determines whether an outstanding action is visible.
- **Selection:** default to the active cycle. `cycle_id` selects any owned cycle, including an
  archived one. `objective_id`, `result_id` or `action_id` selects that record and its parent context;
  a directly selected action is returned even if done. `note_id` or `session_id` retrieves that
  owned document. A record selector without `cycle_id` resolves its owning cycle; contradictory
  selectors fail validation. No active cycle returns `cycle: null`, profile and the cycle index,
  plus available note/session context. Do not load every cycle's descendants into one response.
- **History is optional and separate:** only a supplied `window` adds a `history` section of
  ResultLog, HabitLog, ActionLog, Note and Session records in that window. An omitted window
  means no history section; an empty window defaults to since the last completed session.
  `since` accepts a date, `last_session` or `cycle_start`; `until` accepts a date and defaults to
  server time. Resolve calendar dates in the person's timezone to UTC using inclusive `since`
  and exclusive `until`; invalid or reversed bounds fail validation. Optional `filters.kinds`
  narrows history to `result_logs`, `habit_logs`, `action_logs`, `notes`, `sessions` and requires a window.
  Current values remain current at `as_of`, even for a past window; the window selects evidence,
  not a reconstruction of past mutable profile, status, target or cycle fields. Without an
  explicit record filter, history spans the tenant’s record across cycles; the default active
  cycle used for current context does not restrict it. Cycle/objective/result/action selectors
  narrow related records and evidence; standalone notes and sessions stay window-scoped unless
  selected directly, because they have no goal/cycle attachment. Notes carry
  canonical URLs. Habit logs describe the days currently marked, not an unmark audit trail.
- **Bounded output:** each collection carries a continuation when truncated; callers repeat the same
  filters and returned resolved window bounds when following it. A truncated page is not the whole record.
  Server-derived figures use the full relevant evidence, not just the returned page.
- **Access and effects:** require authenticated domain identity.
  Apply tenant predicates and RLS to every read. Reads remain available without entitlement,
  following F1 Identity's retained-read policy; writes and session starts keep their existing
  entitlement checks. Return `{ as_of, current, history? }`, without exposing billing fields.
  Unknown and other-tenant selectors return the same not-found response. Reading never creates
  or closes a Session, changes its saved briefing, or moves the progress boundary. Internal telemetry remains separate from domain changes.

For internal composition, use a briefing or prior result when it still answers the question. Retrieve when context is
missing, stale or outside the returned evidence window. MCP callers use the entity readers above; an agreed coaching session still starts with
`loadBriefing`. If several records fit the person's wording, ask which one before writing.

---

**Cross-cutting contracts.** Identity comes from authenticated context, never user_id arguments.
Cycle creation requires actor-scoped logical keys and original-outcome replay. Other MCP writes
retain AD-12 MCP dedupe leaves POC scope; wider dedupe remains an MVP question. An annotation is
not consent: cycle_delete requires genuine application approval of complete server impact, bound
to actor, target, impact and expiry. Other deletion contracts retain their stated approval rules.
Returned figures come from the shared derivation module; the agent does not recompute them.

**Log naming convention.** Use `ResultLog`, `HabitLog` and `ActionLog` as domain entities;
`result_logs`, `habit_logs` and `action_logs` identically as physical tables, schema exports, API
groups and response/history/continuation collection keys.
Result evidence is created with `createResultLog` and read with `listResultLogs`; habit days use
`setHabitLog` and `listHabitLogs`; action evidence uses `createActionLog` and `listActionLogs`.
The shared “log” vocabulary does not change lifecycle semantics: HabitLog stores current checked-day
state, unique on `(result_id, day)`, and unchecking deletes the row. It is not an append-only habit
audit trail. “Update”, “mark” and “unmark” remain ordinary interaction verbs; the Result's Updates
table retains its user-facing label.

## Contract mapping

Support storage is not additional domain ontology: auth framework models, `product_events`,
`idempotency_keys` and the retained `example` teaching table are excluded from the ten entities.
Receipts have an account FK and are independent of coaching records and browser sessions.
User profile fields map to user; billing read fields derive from subscription through the shared
entitlement projection. Better Auth owns auth_session (logical model authSession), account,
verification, jwks and its seven OAuth Provider tables; Stripe owns subscription. Coaching Session
continues to map to sessions. Product events contain id/user_id/event_type/occurred_at/properties/
created_at and allow tenant-owned INSERT only; reporting/retention uses the system path.

The executable expression of this document is `packages/core/src/contracts/*` (PD-0007 Ontology as domain spec). Materialised at
step 5.4 Contract definition. The ten entity schemas are materialized and independently
checked, pending Solo review in the ERD. Procedure/tool surfaces remain pending; drafts are
not accepted contracts. Physical `user` extends the existing auth identity rather than creating
a second identity table. The table below names physical SQL tables; matching API resource identifiers use the same
snake_case spelling. Internal TypeScript helpers and ORM column aliases may follow SDK conventions;
public payload fields retain the physical column spelling. Grouped MCP tools use singular entity
prefixes (`cycle_read`) with explicit membership in plural collections (`cycles`); this does not
change schema/API naming or imply single-row output for a grouped reader. Custom SQL in `drizzle/0006_product_integrity.sql`
completes grants, trigger invariants and the Action session-reference delete column list.

| Ontology                    | `packages/core/src/contracts/schema.ts`    | `packages/core/src/contracts/tools.ts` / `router.ts`                                        | Status                                              |
| --------------------------- | ------------------------------------------ | ------------------------------------------------------------------------------------------- | --------------------------------------------------- |
| Entity 1 User               | `user` + derived `subscription` projection | `updateUser`; web-only `createCheckoutSession`, `createBillingPortalSession`, `deleteUser`  | schema ready; surfaces pending                      |
| Entity 2 Cycle              | `cycles`                                   | `cycle_read`, `cycle_update`, `cycle_lifecycle`                                             | schema ready; tools contract-only                   |
| Entity 3 Objective          | `objectives`                               | `objective_write`                                                                           | schema ready; surfaces pending                      |
| Entity 4 Result             | `results` (+ per-type `CHECK`s)            | `result_write`                                                                              | schema ready; surfaces pending                      |
| Entity 5 ResultLog          | `result_logs` (insert-only)                | `progress_record(result)`; web-only `clearResultLogComment`                                 | schema ready; surfaces pending                      |
| Entity 6 Action             | `actions`                                  | `action_write`; web-only `sort_order` write                                                 | schema ready; surfaces pending                      |
| Entity 7 ActionLog          | `action_logs` (insert-only)                | `progress_record(action)`; web-only `clearActionLogComment`                                 | schema ready; surfaces pending                      |
| Entity 8 Session            | `sessions`                                 | `loadBriefing`, `closeSession`                                                              | schema ready; surfaces pending                      |
| Entity 9 Note               | `notes`                                    | `note_write`                                                                                | schema ready; surfaces pending                      |
| Entity 10 HabitLog          | `habit_logs` (unique `result_id, day`)     | `progress_record(result, habit)`                                                            | schema ready; surfaces pending                      |
| § Tool 12 cycle_delete      | — (no domain entity changes)               | cycleDeleteInput; cycleDeleteTool; previewCycleDeletion/deleteCycle; cycle-delete.json      | contract-only; preview/approval persistence pending |
| § Tool 11 cycle_update      | — (no new tables)                          | cycleUpdateInput; cycleUpdateTool; updateCycle; cycle-update.json                           | contract-only                                       |
| § Tool 10 cycle_read        | — (no new tables)                          | cycleReadInput; cycleReadTool; listCycles/getCycle; cycle-read.json                         | contract-only                                       |
| § Exclusive read ownership  | — (no new tables)                          | Future entity readers replace public queryRecord; internal RecordQuery composition retained | pending                                             |
| § Derived values            | — (no columns)                             | one derivation module, imported by every procedure and tool                                 | pending                                             |
| § Briefing content contract | —                                          | `loadBriefing` assembler                                                                    | pending                                             |

## Deferred to MVP / Growth

Capability tiers live in PRD § Product Scope; this table carries only the deferred **data-model**
items:

| Item                                                                                                                                                                                                                                                                                             | Tier   |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------ |
| Drumbeat (weekly_checkin, mid_cycle, cycle_end — computed from timestamps in POC)                                                                                                                                                                                                                | MVP    |
| Theme · Observation · Followup · CoachingApproach (Coach Memory layer)                                                                                                                                                                                                                           | MVP    |
| Document (persistent artifacts)                                                                                                                                                                                                                                                                  | MVP    |
| ActivityEvent (event stream)                                                                                                                                                                                                                                                                     | MVP    |
| Objective predecessor/successor (cross-cycle carry-forward)                                                                                                                                                                                                                                      | MVP    |
| AccountabilityPartner · PartnerLink                                                                                                                                                                                                                                                              | Growth |
| **Note tagging** — attaching a note to an objective, result, action, or session (`attached_to_type`/`attached_to_id`). In POC a note is standalone; relevance comes from **when** it was captured, read alongside what else changed in that window. Note classification (`type`) returns with it | MVP    |
| **Soft delete + recovery** — `deleted_at` on every user entity, the default-scope filter, the 30-day purge horizon, and any restore/recently-deleted surface. POC deletes are permanent                                                                                                          | Growth |
| **Drop an objective as a coaching event** (preserves history, distinct from delete — mirrors cycle archive vs delete). Deferred to keep the POC simple; in POC, drop = delete                                                                                                                    | MVP    |
| **Habit mark history** — a record of when a day was marked and unmarked. In POC a mark is state; the rate is recomputed from the marks on hand                                                                                                                                                   | Growth |
| **Config JSON on Result** — a schema-validated column for per-type display settings the system never branches on, or a user-defined metric type. In POC every field the system branches on is a typed column with a `CHECK`                                                                      | Growth |

### Shared service declarations

The approved executable operation inventory is `packages/core/src/contracts/application.ts` (`services`);
feature `service.contract.ts` files own schemas and obligations. API/MCP consumer bindings are
explicit and the service review is generated from those declarations.

Objective, Result, Action and Note deletion each has a `preview<Entity>Deletion(id)` service before
`delete<Entity>(id, preview_id)`. Both surfaces use complete server impact and trusted application
approval, revalidated atomically at commit. Preview possession is not consent. Result/action history
services return bounded evidence and resolved windows. Stored-session lookup accepts a UUID or
`last_completed` without lifecycle effects. A habit day and its optional comment form one atomic
operation. Habit-log listing returns `{ items, next_cursor }`, not an unbounded array.
