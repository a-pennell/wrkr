# Wrkr — MVP Architecture

> **Living document** · Created: 2026-05-17
> **Use when:** making implementation decisions, evaluating a technical approach, understanding how a feature maps to system components, or onboarding an engineer.
> **Scope:** Day 1 only. See [mvp-scope.md](mvp-scope.md).
> **Related:** [threat-model.md](threat-model.md) — security decisions this architecture implements. [constraints.md](constraints.md) — hard rules.

---

## System Overview

```
┌─────────────────────────────────────────────────────────────┐
│  Client (Browser — Desktop & Mobile Web)                    │
│  React SPA · All routes serve identical HTML bundle         │
│  Anonymous token stored in localStorage                     │
└────────────────────────┬────────────────────────────────────┘
                         │ HTTPS
                         ▼
┌─────────────────────────────────────────────────────────────┐
│  Cloudflare                                                 │
│  CDN · DDoS protection · IP truncation to /24              │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│  API Server (Node.js / TypeScript / Fastify)                │
│                                                             │
│  ┌─────────────────┐  ┌──────────────────┐                 │
│  │ Verification    │  │ Workspace &       │                 │
│  │ Service         │  │ Proposal Service  │                 │
│  │ (OTP → token)   │  │                  │                 │
│  └────────┬────────┘  └────────┬─────────┘                 │
│           │                    │                            │
│  ┌────────▼────────────────────▼─────────┐                 │
│  │  Commitment & Threshold Service        │                 │
│  │  Notification Queue (async)            │                 │
│  └────────────────────┬──────────────────┘                 │
└───────────────────────┼─────────────────────────────────────┘
                        │
          ┌─────────────┴──────────────┐
          ▼                            ▼
┌──────────────────┐        ┌──────────────────────┐
│  PostgreSQL      │        │  Email Provider       │
│  (no PII tables) │        │  (Resend)             │
└──────────────────┘        │  OTP send only        │
                            │  No address logging   │
                            └──────────────────────┘
```

---

## Tech Stack

| Layer | Choice | Why |
|---|---|---|
| Frontend framework | React + TypeScript | Large ecosystem, strong typing, component model suits the workspace/proposal UI |
| Frontend build | Vite | Fast dev cycle, minimal config |
| Styling | Tailwind CSS | Consistent, no runtime overhead, good for design system discipline |
| Backend runtime | Node.js + TypeScript | Same language across stack, strong typing, large ecosystem |
| Backend framework | Fastify | Faster than Express, built-in schema validation, TypeScript-first |
| ORM | Prisma | Type-safe queries, migration management, prevents raw SQL injection |
| Database | PostgreSQL | Strong data integrity, row-level security, mature tooling |
| Email | Resend | Configurable log retention, good deliverability, simple API |
| Hosting | Render | Managed infrastructure, low ops burden at MVP scale, easy migration path |
| CDN / Proxy | Cloudflare | Free tier, DDoS protection, IP truncation via transform rules |
| Token hashing | Argon2id | Industry standard for one-way credential hashing; bcrypt acceptable fallback |

**On Render vs. AWS:** Render is correct for MVP. AWS adds operational complexity that a pre-traction product doesn't need. Migration is straightforward when scale demands it.

**On Fastify vs. Express:** Fastify's built-in JSON schema validation is architecturally important here — it enforces that no PII fields accidentally make it into request handlers.

---

## Frontend Architecture

### SPA Routing (Critical for Traffic Analysis Prevention)

All routes are client-side only. The server serves a single `index.html` for every path. This means a traffic analysis observer can see that a device accessed `wrkr.com` — but cannot determine which workspace, proposal, or action was involved.

```
Server routes:
  GET /*  →  index.html (always)

Client routes (React Router):
  /               →  Landing / verification
  /verify         →  OTP entry
  /onboarding     →  Recovery phrase setup
  /w              →  Workspace home (workspace ID in client state only)
  /w/proposal     →  Proposal detail
  /w/create       →  Proposal creation
```

The workspace identifier is **never in the URL**. It lives in localStorage alongside the session token. Deep links to proposals are not supported at Day 1 — workers navigate from workspace home.

### Anonymous Token Storage

```typescript
// localStorage schema (client-side only — never sent to or stored on server)
{
  "wrkr_token": "raw_256bit_hex_string",     // the anonymous session token
  "wrkr_workspace": "opaque_workspace_id",   // which workspace this token belongs to
}
```

The raw token is sent in the `Authorization` header on authenticated requests:
```
Authorization: Bearer <raw_token>
```

The server hashes the incoming token (Argon2id) and looks up the `workspace_tokens` table. The raw token never touches the database.

### Recovery Phrase

Generated from the raw token using a BIP-39-compatible mnemonic library. 24 words derived deterministically from the 256-bit token. Worker stores this offline; if they lose their localStorage, they enter the recovery phrase to restore their session.

Recovery phrase entry → derive raw token → hash → lookup → restore session.

---

## Backend Architecture

### API Structure

```
POST /auth/request-otp        — send OTP (email destroyed immediately after)
POST /auth/verify-otp         — verify OTP, return anonymous token + workspace ID
POST /auth/recover             — recover session from recovery phrase

GET  /workspace               — workspace summary (member count, proposal list)
POST /proposals               — create proposal (queued, not immediately published)
GET  /proposals/:id           — proposal detail + current threshold count
POST /proposals/:id/commit    — add commitment
DELETE /proposals/:id/commit  — withdraw commitment

GET  /notifications           — poll for unread notifications
POST /notifications/:id/read  — mark notification read
```

No endpoints expose individual worker data. All responses are aggregate-only where worker activity is concerned.

### Request Authentication

Every authenticated request carries the raw anonymous token in the Authorization header. The server:
1. Extracts the raw token
2. Hashes it (Argon2id)
3. Looks up `workspace_tokens` by hash
4. If found: request is authenticated as that workspace member
5. If not found: 401

The raw token is used only in memory during this lookup. It is never logged, stored, or passed to downstream services.

### Proposal Publication Queue

Proposals are not published immediately on submission. A background worker runs every 60 seconds:

```
1. SELECT proposals WHERE status = 'pending' AND publish_at <= NOW()
2. For each: SET status = 'active'
3. Notify workspace members (queue notification records)
```

`publish_at` is set at submission time: `NOW() + random(0, 30 minutes)`. This implements the timing correlation mitigation from the threat model (T-05).

### Threshold Check (runs after every commitment or withdrawal)

```
1. Count commitments WHERE proposal_id = X AND withdrawn_at IS NULL
2. If count >= threshold_value AND proposal.status != 'activated':
   a. SET proposal.status = 'activated', proposal.activated_at = NOW()
   b. Generate threshold attestation record
   c. Queue activation notifications for all committed workers
   d. Generate signed statement document
```

This is synchronous within the commit transaction to prevent race conditions (two simultaneous commitments that both push over the threshold).

---

## Verification Service (Critical Path)

This is the most security-sensitive component. The email address must never persist beyond the OTP send step.

```
Worker submits email address
         │
         ▼
Extract domain from email address
         │
         ▼
Look up workspace by domain_hash
         │
    ┌────┴────┐
    │ Found?  │
    └────┬────┘
    No ──┴──▶ Return: "domain not recognized" (no workspace created)
    Yes
         │
         ▼
Generate OTP (6 digits, crypto.randomInt)
Hash OTP (bcrypt, cost 10)
Store: { otp_hash, domain_hash, expires_at: NOW()+5min, attempts: 0 }
         │
         ▼
Send email via Resend API
  To: <email address — in memory only, never stored>
  Subject: "Your Wrkr verification code"
  Body: code only, no identifying workspace or company info
         │
         ▼
Email address reference dropped from memory
Return: { message: "Check your email" } — no confirmation of domain existence
         │
         ▼ (worker enters OTP)
Verify: hash(submitted_code) matches otp_hash AND not expired AND attempts < 5
         │
    ┌────┴────┐
    │ Valid?  │
    └────┬────┘
    No ──┴──▶ Increment attempts. If attempts >= 5: delete OTP record. Return 401.
    Yes
         │
         ▼
Generate anonymous token: crypto.randomBytes(32)
Generate recovery phrase: bip39.entropyToMnemonic(token)
Hash token: argon2id(token)
Store: { token_hash, workspace_id, created_at } — NOTHING ELSE
         │
         ▼
DELETE OTP record immediately
         │
         ▼
Return to client: { token (raw), workspace_id, recovery_phrase }
Client stores token + workspace_id in localStorage
Client displays recovery phrase ONCE — never retrievable again from server
```

**What the database contains after successful verification:**
- `workspace_tokens`: `{ token_hash, workspace_id, created_at }`
- The original email address: **nowhere**

---

## Data Model

All tables shown. No table contains a column that could identify an individual worker.

```sql
-- Workspaces are identified by domain hash, not domain name
-- The domain name exists only during OTP verification (in memory)
CREATE TABLE workspaces (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  domain_hash   TEXT NOT NULL UNIQUE,  -- SHA-256 of the email domain
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Anonymous session tokens — no identity data
CREATE TABLE workspace_tokens (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token_hash    TEXT NOT NULL UNIQUE,  -- Argon2id of the raw client token
  workspace_id  UUID NOT NULL REFERENCES workspaces(id),
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- OTP records — ephemeral, deleted immediately after successful verification
CREATE TABLE otp_records (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  otp_hash      TEXT NOT NULL,         -- bcrypt of the 6-digit code
  domain_hash   TEXT NOT NULL,         -- which domain this OTP is for
  expires_at    TIMESTAMPTZ NOT NULL,
  attempts      INT DEFAULT 0,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);
-- Note: rows in this table should not exist for more than 5 minutes
-- A cleanup job runs every minute: DELETE FROM otp_records WHERE expires_at < NOW()

-- Proposals — template_fields stored as JSONB
CREATE TABLE proposals (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id    UUID NOT NULL REFERENCES workspaces(id),
  category        TEXT NOT NULL,       -- 'compensation' | 'working_conditions' | 'other'
  template_fields JSONB NOT NULL,      -- structured template output (PII-screened)
  threshold_type  TEXT NOT NULL,       -- 'count' | 'percentage'
  threshold_value INT NOT NULL,
  deadline        TIMESTAMPTZ NOT NULL,
  status          TEXT NOT NULL DEFAULT 'pending',
  -- 'pending' | 'active' | 'activated' | 'expired'
  publish_at      TIMESTAMPTZ NOT NULL, -- NOW() + random delay (0-30 min)
  activated_at    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);
-- Proposer identity: not stored. No foreign key to workspace_tokens.

-- Commitments — linked to token hash, not token record
-- This allows commitments to survive if a token record is ever deleted
CREATE TABLE commitments (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  proposal_id   UUID NOT NULL REFERENCES proposals(id),
  token_hash    TEXT NOT NULL,         -- same hash stored in workspace_tokens
  committed_at  TIMESTAMPTZ DEFAULT NOW(),
  withdrawn_at  TIMESTAMPTZ           -- NULL = active commitment
);
-- Unique constraint: one active commitment per token per proposal
CREATE UNIQUE INDEX ON commitments(proposal_id, token_hash)
  WHERE withdrawn_at IS NULL;

-- Threshold attestation — generated when threshold is reached
CREATE TABLE threshold_attestations (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  proposal_id     UUID NOT NULL REFERENCES proposals(id) UNIQUE,
  activated_at    TIMESTAMPTZ NOT NULL,
  commitment_count INT NOT NULL,       -- snapshot of count at activation
  statement_text  TEXT NOT NULL,       -- the generated signed statement
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- In-app notifications — polled by clients
CREATE TABLE notifications (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token_hash    TEXT NOT NULL,         -- which worker this notification is for
  type          TEXT NOT NULL,
  -- 'threshold_reached' | 'proposal_expired' | 'new_proposal'
  payload       JSONB NOT NULL,        -- proposal_id, message, etc.
  read_at       TIMESTAMPTZ,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);
```

**What is NOT in this schema:**
- Email addresses (anywhere)
- Names (anywhere)
- IP addresses (anywhere — truncated at Cloudflare before reaching the application)
- Behavioral data (page views, time-on-page, navigation paths)
- Who created which proposal (proposals have no creator foreign key)

---

## Security Implementation Map

Maps threat model findings to concrete implementation decisions.

| Threat | Implementation |
|---|---|
| T-01 · Verification data breach | Email destroyed in-memory after OTP send. `otp_records` table contains only OTP hash + domain hash. Cleanup job deletes expired OTPs every 60 seconds. |
| T-02 · Behavioral pattern analysis | SPA: all server routes return identical HTML. Workspace ID never in URL. No behavioral event tracking. |
| T-03 · Workspace infiltration | Domain-hash verification limits fake accounts to actors controlling the company email domain. Rate limit: 3 OTP requests per domain per 10 minutes. |
| T-04 · Token theft | CSP headers block inline scripts and `eval`. Token not in cookies (no CSRF risk). Token not in URLs (no referrer leakage). |
| T-05 · Timing correlation | `publish_at` = `NOW() + random(0, 30 minutes)`. Timestamps in API responses truncated to hour granularity. |
| T-06 · Collusion attack | Accepted residual risk at MVP scale. Aggregate minimums (≥ 5) limit usefulness of small group disclosure. |
| T-07 · Platform insider | No PII in database. Principle of least privilege on DB access. All production DB queries logged with engineer identity. |
| T-08 · Legal compulsion | Nothing to produce: no email addresses, no names, no IP addresses. Truncated IPs in Cloudflare logs only (not application logs). |
| T-09 · Proposal content leakage | PII screen runs server-side before `template_fields` is saved. Org-facing dashboard (Phase 2) never exposes proposal text. |
| T-10 · Fake threshold inflation | OTP rate limiting per domain. Workspace member count monitored for anomalous growth. |

---

## Infrastructure

```
Production environment (Render):
  - Web service: Node.js API (auto-scaling, 2+ instances)
  - Static site: React SPA (CDN-served via Cloudflare)
  - PostgreSQL: Render managed database (daily backups, point-in-time recovery)
  - Background worker: Render background worker (proposal publication queue, OTP cleanup)

Cloudflare configuration:
  - All traffic proxied through Cloudflare
  - Transform rule: truncate X-Forwarded-For to /24 before passing to origin
  - Cache: static assets only — API responses never cached
  - DDoS: default Cloudflare protection enabled

Email (Resend):
  - Transactional only — OTP codes
  - Log retention: 1 day (minimum available)
  - No suppression list syncing (would create an email address database)

Environment separation:
  - Production: wrkr.com
  - Staging: staging.wrkr.com (identical config, separate database)
  - Local: localhost (Docker Compose — Postgres + API + Vite dev server)
```

---

## What This Architecture Deliberately Excludes

| Excluded | Why |
|---|---|
| WebSockets / real-time updates | Async is sufficient. Real-time adds infrastructure cost and complexity for a psychological benefit (live counter) that isn't core to the bet. Add in v1.1 if workers request it. |
| Redis / caching layer | Not needed at MVP scale. Add when database query latency becomes a problem. |
| Microservices | One API server is correct at this stage. Services are logical separations within a monolith — not separate deployments. |
| Native mobile | Web (responsive) at launch. Native when the bet is proved and usage patterns are understood. |
| Analytics / telemetry (user behavior) | Structurally excluded by the anonymity architecture. Server-side metrics (request counts, error rates, latency) are fine — individual behavior tracking is not. |
| Feature flags | Unnecessary at closed beta scale. Re-evaluate at public launch. |
