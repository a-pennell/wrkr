# Wrkr — MVP Scope Lock

> **Decision document** · Locked: 2026-05-17
> **Use when:** making architecture decisions, evaluating whether a feature belongs in v1, or resisting scope creep during design and build.
> **The rule:** if it's not on the Day 1 list, it does not get designed, built, or discussed until the core bet is proved.

---

## The Core Bet

> Workers will use a coordination tool they genuinely trust — and that trust will produce proposals that reach threshold.

Everything in Day 1 exists to prove this single bet. Nothing else.

---

## Day 1 Feature List

### Verification
- OTP via work email (email destroyed immediately after token generation)
- One verification method only — no SSO, no invite chain at launch

### Workspace
- Company-scoped, verified-member-only environment
- Displays: verified member count, active proposals, closed proposals
- Non-enumerable workspace identifier (random token, not company name)

### Proposals
- 3 categories: **Compensation · Working Conditions · Other**
- Structured template per category — no free-form title or description
- One commitment type: **"Sign a message if the threshold is reached"**
- Attribution: **fully anonymous only** — no pseudonymous or identified options
- Deadline: **required** — worker chooses 7, 14, or 30 days
- Threshold: worker sets a fixed count or % of verified workspace members

### Commitments
- Make a conditional commitment
- Withdraw a commitment (available until threshold is reached)
- View aggregate threshold progress (count + progress bar — no individual data)

### Threshold Activation
- Simultaneous in-app notification to all committed workers
- Platform generates a signed statement with threshold attestation (date, count, proposal summary)
- Committed workers receive the statement in-app
- Public output: aggregate signature count only — no individual signers listed

### Threshold Expiry
- Proposal closes at deadline without reaching threshold
- Committed workers notified in-app: final count, no action taken
- Organizer offered option to revise and reopen

### Invite
- Organizer can generate a workspace-scoped invite link
- Link is not attributed to the creator

---

## Explicitly Cut from Day 1

| Feature | Cut reason | Target |
|---|---|---|
| SSO / domain verification | Adds OAuth complexity; OTP proves the verification bet alone | v1.1 |
| Invite-chain verification | Slows workspace growth; add after density is established | v1.1 |
| Additional proposal categories (Safety, Communication, Governance, Culture) | 3 categories is enough to prove the bet | v1.1 |
| Pseudonymous / identified attribution | Adds decision complexity; fully anonymous is the correct default | v1.1 |
| Additional commitment types | One action type proves the threshold mechanism; expand after validation. Identified types: **Attend a meeting** (workers self-coordinate logistics), **Submit a formal request** (platform generates document, workers choose how/whether to submit), **Participate in a structured survey** (gather more granular data before acting) | v1.1 |
| Anonymous clarifying questions | Nice UX, not essential to the core bet | v1.1 |
| Custom deadline lengths | 7/14/30 days covers all real cases | v1.1 |
| Web push notifications | Requires permission flow; in-app is sufficient to prove the bet | v1.1 |
| Email notifications | Cannot store email addresses — architecturally incompatible | Never (by constraint) |
| Workspace integrity reporting | Low-frequency; handle manually at this scale | v1.2 |
| Aggregate insights / patterns tab | Phase 2 feature — requires a base of proposal history first | Phase 2 |
| Org-facing dashboard | Phase 2 feature | Phase 2 |
| Any governance features | Phase 3 | Phase 3 |

---

## Day 1 Flows (from user-task-flows.md)

| Flow | Included |
|---|---|
| 1.1 · Anonymous Verification & Onboarding | Yes |
| 1.2 · Viewing Active Proposals | Yes |
| 1.3 · Making a Conditional Commitment | Yes |
| 1.4 · Creating a Proposal | Yes — simplified (see cuts above) |
| 1.5 · Threshold Reached | Yes — sign a message only |
| 1.6 · Threshold Not Reached (Expiry) | Yes |
| X.2 · Withdrawal of Commitment | Yes |
| X.1 · Anonymous Question Submission | No |
| X.3 · Workspace Integrity Concern | No |

---

## Surfaces

| Surface | Day 1 |
|---|---|
| Web (desktop + mobile browser) | Yes |
| Native mobile (iOS / Android) | No — post-validation |
| Any org/employer-facing surface | No |

---

## What Proving the Bet Looks Like

The core bet is proved when, across 5 seeded workspaces over 90 days:
- ≥ 30% of published proposals reach threshold
- ≥ 40% of verified workers return after their first session
- Zero anonymity breach incidents
- Worker NPS ≥ 50

If these hold, the bet is proved and v1.1 planning begins. If they don't, we learn why before building more.
