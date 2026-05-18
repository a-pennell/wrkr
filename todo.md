# Wrkr — Master To-Do

> **Living document** · Updated: 2026-05-18
> **Use when:** planning a sprint, deciding what to build next, assessing phase readiness.
> **Status keys:** ✅ Done · 🔄 In progress · ⬜ Not started · 🔒 Blocked (dependency noted)

---

## Phase 0 — Foundation (Pre-Launch)

### Legal
- ⬜ Labor law review across target jurisdictions (NLRA, GDPR, state labor codes)
- ⬜ Written legal opinion on product classification (not a union, not a financial product)
- ⬜ Acceptable use policy — what proposals are and aren't permitted
- ⬜ Content moderation framework for PII in free-form text fields
- ⬜ Retain legal counsel experienced in labor law and platform liability

### Security & Trust
- ✅ Threat model complete with documented mitigations
- ⬜ Independent security audit of zero-knowledge verification system
- ⬜ Canary token system (synthetic DB entries that reveal breach source if exposed)
- ⬜ Principle of least privilege enforced for all production database access
- ⬜ Audit logging for all production database access

### Pilots
- ⬜ Identify 3–5 pilot workspaces via worker champions (not employer purchase)
- ⬜ Confirm worker champions in each pilot workspace

---

## Phase 1 — MVP (Coordination & Visibility)

### Authentication & Verification
- ⬜ Email OTP flow — send code to work email address
- ⬜ Email address destroyed immediately after anonymous token generation (never stored, never hashed, never logged)
- ⬜ Anonymous membership token written to worker's device (localStorage) only — no server-side storage
- ⬜ Recovery phrase generation on first verification — worker controls their own recovery
- ⬜ Recovery phrase onboarding screen with clear warning ("if you lose this, access is gone")
- ⬜ Token validation on subsequent visits (no login — token presence = access)
- ⬜ OTP expiry: 5 minutes, single use, rate limited
- ⬜ Rate limiting on OTP requests per domain (prevent enumeration)
- ⬜ Rate limiting on workspace account creation per domain (max 5 new accounts / domain / 24h)

### Workspace
- ✅ Workspace page — verified member count, active proposals, closed proposals
- ✅ Non-enumerable workspace identifier (UUID, not company name)
- ⬜ Workspace is gated — requires valid anonymous token to access (currently open)
- ⬜ Invite link generation — workspace-scoped, creator-anonymous
- ⬜ Invite link acceptance flow — verifies invite is valid, grants workspace access

### Proposals
- ✅ Proposal list on workspace page (active + closed)
- ✅ Proposal detail page
- ✅ 3 categories: Compensation · Working Conditions · Other
- ✅ Structured template (framing field) — no free-form title
- ✅ Deadline selection: 7 / 14 / 30 days
- ✅ Threshold: fixed count (worker-set)
- ✅ Create proposal flow (multi-step)
- ⬜ Threshold as percentage of verified workspace members (alternative to fixed count)
- ⬜ Proposal publication micro-delay: 0–30 minutes random (breaks timing correlation — T-05)
- ⬜ Proposal timestamps displayed at day/hour granularity only — not minute (T-05)
- ⬜ PII screening on all free-form text fields before saving (C-07)
- ⬜ Proposals gated to verified workspace members only (currently public)

### Commitments
- ✅ Make a conditional commitment
- ✅ Withdraw a commitment
- ✅ Aggregate threshold progress (count + progress bar)
- ⬜ Prevent committing after threshold reached
- ⬜ Prevent committing after deadline (proposal expired)

### Threshold Activation
- ✅ Proposal status transitions: active → activated (when threshold met)
- ✅ Proposal status transitions: active → expired (when deadline passes)
- ✅ Visual treatment for activated state (gold color system)
- ⬜ Simultaneous in-app notification to all committed workers on activation
- ⬜ Platform-generated threshold attestation statement (date, count, proposal summary, digital signature)
- ⬜ Committed workers receive the statement in-app
- ⬜ Notification to committed workers on expiry (final count, no action taken)
- ⬜ Organizer offered option to revise and reopen after expiry (currently: "Start a similar proposal" button exists, needs pre-fill)
- ⬜ Scheduled job to transition active → expired proposals at deadline

### Infrastructure & DevOps
- ✅ Fastify backend on Railway
- ✅ PostgreSQL on Railway
- ✅ React + Vite frontend on Railway
- ✅ Demo route with seeded workspace (`/demo`)
- ✅ Dev nav chips (bottom-right, demo-only)
- ⬜ Switch from `prisma db push` to `prisma migrate deploy` for production deployments (current approach risks silent data loss)
- ⬜ Consider migrating from Prisma to Drizzle ORM (lighter, faster cold starts, SQL-native) — low urgency, do at next schema change
- ⬜ Scheduled job infrastructure (proposal expiry, micro-delays) — Railway cron or background worker
- ⬜ Error monitoring (Sentry or equivalent)
- ⬜ Uptime monitoring

### Security (Phase 1)
- ✅ CORS configured
- ⬜ Content Security Policy headers (prevents XSS / T-04)
- ⬜ IP addresses truncated to /24 subnet in all server logs (T-08, GDPR standard)
- ⬜ ECH via Cloudflare — route production domain through Cloudflare to enable encrypted SNI (T-02). No code changes required; infrastructure only.
- ⬜ `HttpOnly` / `Secure` flags on any session cookies used

### Design & UX
- ✅ Workspace page — prototype-matched design
- ✅ Proposal detail page — prototype-matched design
- ✅ Create proposal flow — prototype-matched design
- ✅ Gold color system for activated/threshold-reached state
- ⬜ Verification / onboarding screens (OTP entry, recovery phrase, token warning)
- ⬜ In-app notification UI (threshold reached, proposal expired)
- ⬜ Mobile browser testing and fixes
- ⬜ Empty state — workspace with no proposals (partially done, review on real data)

---

## Phase 2 — Organizational Health Intelligence

> Entry criteria: ≥ 10 active workspaces, ≥ 30% threshold reach rate (6 months), zero anonymity breaches, NPS ≥ 50, legal review of aggregate data product complete.

### Infrastructure & Privacy
- ⬜ **OHTTP relay architecture** — route API requests through a neutral relay (Cloudflare or equivalent). Wrkr server never receives real IP addresses. Requires: client-side OHTTP library (`@cloudflare/oblivious-http`), relay agreement with neutral third party, gateway key management and rotation. Eliminates IP from server logs entirely — stronger than /24 truncation. (T-08)
- ⬜ Key rotation infrastructure for OHTTP gateway keys
- ⬜ Transparency report publication process (aggregate, workspace-level, when compelled)

### Worker-Facing
- ⬜ Aggregate pattern view for workers — topic clusters and trends in their workspace
- ⬜ Consent vote UI — workers vote to approve/deny org-side dashboard access
- ⬜ Consent revocation — workers can trigger a new revocation vote at any time
- ⬜ Consent status always visible to workers

### Org-Facing (requires active worker consent vote)
- ⬜ Org account type (separate from worker accounts)
- ⬜ Org-facing dashboard — aggregate clusters, threshold rates, trend data
- ⬜ Zero individual data in org dashboard (enforced at architecture level)
- ⬜ Org dashboard access revoked automatically on consent revocation vote passing

### Features (from mvp-scope.md cuts)
- ⬜ SSO / domain verification (alternative to email OTP)
- ⬜ Invite-chain verification (high-integrity workspace option)
- ⬜ Additional proposal categories (Safety, Communication, Governance, Culture)
- ⬜ Additional commitment types: Attend a meeting · Submit a formal request · Participate in a structured survey
- ⬜ Anonymous clarifying questions on proposals
- ⬜ Custom deadline lengths
- ⬜ Web push notifications
- ⬜ Workspace integrity concern reporting (Flow X.3)
- ⬜ Pseudonymous attribution option (for workspaces that want it)

### Revenue
- ⬜ Org subscription billing infrastructure
- ⬜ Worker tier: free (always)
- ⬜ Pricing model finalized

---

## Phase 3 — Democratic Workplace Infrastructure

> Entry criteria: ≥ 20 active workspaces with mature coordination history, ≥ 3 expressing interest in formal governance, NPS ≥ 55, legal review of governance infrastructure, org executive champion per pilot.

### Governance
- ⬜ Governance proposal pipeline: Draft → Comment period → Vote → Legitimacy record
- ⬜ Per-workspace quorum and legitimacy configuration
- ⬜ Immutable, tamper-evident decision records
- ⬜ Worker council infrastructure: seat config, elections, term tracking
- ⬜ Election system: nomination, statement, vote, results
- ⬜ Collaborative/participatory budgeting (experimental)

### Legal & Partners
- ⬜ Legal review of governance infrastructure (decision legitimacy, binding vs. advisory, jurisdiction)
- ⬜ Governance scope definition tooling at workspace setup

---

## Phase 4 — Cooperative Transition Infrastructure

> Entry criteria: ≥ 5 workspaces with ≥ 12 months Phase 3 usage, ≥ 1 org requesting transition support, legal/financial partner ecosystem in place, ownership modeling tools legally validated, NPS ≥ 60.

### Product
- ⬜ Ownership pathway explorer (ESOP, cooperative, trust, hybrid)
- ⬜ Scenario modeling tool (illustrative only — not financial advice)
- ⬜ Transition readiness assessment (from Phase 1–3 platform history)
- ⬜ Worker education modules (plain-language explainers per model)
- ⬜ Ownership transition governance (supermajority vote infrastructure)
- ⬜ Partner directory (legal, financial, advisory)
- ⬜ Transition mandate record (formal democratic mandate documentation)

### Partner Ecosystem
- ⬜ Cooperative law firm partnerships
- ⬜ ESOP attorney partnerships
- ⬜ Cooperative finance institution partnerships
- ⬜ Transition advisors
- ⬜ Worker cooperative network relationships

---

## Cross-Phase

### Architecture Invariants (must hold across all phases)
- ✅ No PII stored post-verification (C-01)
- ⬜ Anonymous token is worker-controlled, no server-side copy (C-02) — *current implementation uses a simple UUID, not a cryptographically anonymous token with zero server-side residue*
- ✅ No individual behavioral data collected (C-03)
- ⬜ Aggregate minimum of 5 enforced before any data surfaces (C-04) — *not yet enforced in API*
- ✅ Org-side access requires active worker majority consent (C-05) — *by absence: no org accounts exist*
- ✅ Threshold must be met before commitments activate (C-06)
- ⬜ PII screening on all free-form fields (C-07) — *not yet implemented*
- ⬜ Immutable decision/activation records (C-08) — *activated_at timestamp exists; full attestation record not yet generated*
- ⬜ Workers can always trigger consent revocation vote (C-09) — *Phase 2*

### Documentation
- ✅ strategy.md
- ✅ jobs-to-be-done.md
- ✅ user-task-flows.md
- ✅ phase-rollout.md
- ✅ threat-model.md
- ✅ architecture.md
- ✅ constraints.md
- ✅ mvp-scope.md
- ✅ glossary.md
- ✅ error-states.md
- ⬜ API reference (endpoints, request/response shapes, auth headers)
- ⬜ Runbook (how to deploy, how to handle incidents, how to respond to legal requests)
- ⬜ Worker-facing privacy explainer (plain language, publishable)
