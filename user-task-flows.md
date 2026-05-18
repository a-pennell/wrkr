# Wrkr — User & Task Flows

> **Living document** · Updated: 2026-05-17
> **Use when:** designing or evaluating features, checking interaction logic, understanding system behavior at a step level.
> **Not for:** high-level strategy (see [strategy.md](strategy.md)) or user motivation (see [jobs-to-be-done.md](jobs-to-be-done.md)).
> **Related:** [constraints.md](constraints.md) for hard rules that govern these flows.

**Notation:**
- `[Screen/State]` — UI context
- `<Action>` — user action
- `{Response}` — system response
- `⚠` — risk point where anonymity, trust, or integrity could be compromised

---

## Phase 1 — Coordination & Visibility

### 1.1 · Anonymous Verification & Onboarding

**Trigger:** Worker arrives via invite link or direct discovery.
**Goal:** Prove employment at a company without revealing personal identity.

```
[Landing]
  <Worker selects "Verify my employment">

[Verification Method]
  A. Work email one-time code   → code sent; email address NOT stored
  B. SSO domain confirmation    → proves domain membership; identity NOT stored
  C. Peer invite token          → chain of trust from verified coworker

  ⚠ System generates a blinded membership token — proves belonging, stores nothing identifiable

[Anonymous Identity Creation]
  {System issues session token — the ONLY link between worker and their submissions}
  {Token stored locally on device; not on server}
  ⚠ Warn clearly: "We cannot recover this token. Save your recovery phrase."

[Workspace Entry]
  {Show: verified member count, active proposals, threshold activity — no names, no identities}
```

**Design invariant:** Email address and SSO identity are destroyed immediately after generating the membership token. There is no way to reverse this, by design.

---

### 1.2 · Viewing Active Proposals

**Trigger:** Worker enters workspace or receives a notification.

```
[Workspace Home]
  {Proposal cards show:}
    - Title (structured template output — not free-form)
    - Category tag
    - Threshold progress: "X of Y needed — Z committed"
    - Time remaining (if deadline set)
    - Status: Open / Threshold Met / Closed / Expired

  <Worker selects a proposal>

[Proposal Detail]
  {Show: framing statement, commitment ask, threshold progress bar, deadline}
  {Option: submit an anonymous clarifying question → surfaces to proposer without attribution}
```

---

### 1.3 · Making a Conditional Commitment

**Trigger:** Worker reviews a proposal and decides to participate.

```
[Proposal Detail]
  <Worker selects "I would support this if the threshold is reached">

[Commitment Confirmation]
  {Show: plain-language description of what activates at threshold}
  {Show: "Your identity will not be revealed if this threshold is reached"}
  {Show: updated count — "X+1 of Y" — after commitment is added}
  <Worker confirms>

  {System: records commitment against anonymous token only}
  {System: recalculates aggregate threshold display for all workspace members}
  ⚠ If this commitment reaches the threshold → trigger Flow 1.5

[Post-Commitment]
  {Show: updated progress bar}
  {Option: "Withdraw commitment" — available until threshold is reached}
```

---

### 1.4 · Creating a Proposal (Organizer)

**Trigger:** Verified worker wants to surface a concern and gauge collective support.

```
[Step 1: Category]
  Options: Compensation · Working Conditions · Communication · Safety · Governance · Culture · Other
  {System loads template prompts for selected category}

[Step 2: Framing]
  Guided fields:
    - Specific concern (max 280 chars)
    - Desired outcome (structured options + write-in)
    - Commitment ask: Sign a message · Attend a meeting · Submit a formal request · Other
  ⚠ PII screen runs on all text fields — flags names, emails, identifiers before saving

[Step 3: Threshold Configuration]
  Worker sets:
    - Type: fixed count OR % of verified workspace members
    - Value
    - Deadline: None / 7d / 14d / 30d / Custom
  {System: warns if threshold < 10% or > 90% of workspace}

[Step 4: Attribution Level]
  A. Fully anonymous (creator unknown to everyone including Wrkr)
  B. Pseudonymous (persistent pseudonym visible within this workspace only)
  C. Identified membership (verified status visible; name still hidden)

[Publish]
  <Worker confirms>
  {System: proposal goes live; anonymous push notification to workspace members}
  {Optional: worker generates a shareable invite link — workspace-scoped, not attributed to creator}
```

---

### 1.5 · Threshold Reached

**Trigger:** Commitment count crosses the configured threshold.

```
{System: triggers synchronized notification to all committed workers}

[Notification]
  {Push: "Threshold reached. N workers have committed to [Proposal Title]."}
  {Show: next step — what the commitment activates}

[Commitment Activation — by type]

  SIGN A MESSAGE:
    {System generates signed, timestamped document}
    {Each committed worker receives a copy}
    {Public output: aggregate signature count — individual signers NOT listed}

  ATTEND A MEETING:
    {System surfaces a secure coordination link for logistics}
    {Workers self-organize timing — platform does not manage scheduling}

  SUBMIT A FORMAL REQUEST:
    {System generates a formal statement with threshold attestation}
    {Workers decide collectively how/whether to submit — platform does not submit on their behalf}

[Post-Threshold Record]
  {Proposal closes to new commitments}
  {Record: date reached, threshold number, action taken — anonymized}
  {Record is available to workspace members as evidence of collective legitimacy}
```

---

### 1.6 · Threshold Not Reached (Expiry)

**Trigger:** Deadline passes without reaching threshold.

```
{System closes proposal}
{Notification to committed workers: "Proposal expired. X of Y committed. No action taken."}
{No individual commitment data disclosed}

[Organizer Options]
  {Show: option to extend deadline, revise threshold, or archive}
```

**Design invariant:** Expiry leaves no trace of who participated. No individual exposure regardless of outcome.

---

## Phase 2 — Organizational Health Intelligence

### 2.1 · Worker Views Aggregate Patterns

**Trigger:** Worker opens the Insights tab.

```
[Insights Tab]
  {Show: topic clusters, trend lines, frequency — aggregate only}
  ⚠ Minimum group threshold applies: no pattern surfaces until ≥ 5 signals exist in a cluster

  <Worker selects a topic cluster>

[Topic Detail]
  {Show: proposal frequency (last 90d), trend direction, threshold reach %, related clusters}
```

---

### 2.2 · Org Dashboard Consent Vote

**Trigger:** Employer requests access to the organizational health dashboard.

```
{System notifies workspace: "Your employer has requested access to aggregate health data.
 Workers must vote to approve or deny. Here is what would be shared / not shared."}

[Vote — All Verified Workers]
  Options: Approve / Deny / Abstain
  {Deadline configurable — default 7 days}
  {Quorum required: simple majority of verified members (configurable at workspace setup)}

[Outcome A: Majority Approves]
  {Org dashboard activates — aggregate topic clusters, threshold outcomes, trend data}
  {No individual data; no proposal text; no identifying signals}
  {Workers can trigger a revocation vote at any time}

[Outcome B: Majority Denies or No Quorum]
  {Org dashboard remains inactive}
  {Org-side receives: "Access denied." No detail on vote count or breakdown.}
```

**Design invariant:** Org-side access is always gated on active worker majority consent. There is no admin override, no management bypass, and no legacy access that persists after a revocation vote passes.

---

### 2.3 · People Leader Reviews Org Dashboard

**Trigger:** Org dashboard is active; leader opens their account.

```
[Org Dashboard]
  {Show: topic clusters with trend data, threshold reach rates by category,
   sentiment trajectory by topic}
  {No individual worker data. No proposal text. No identifying signals.}

  <Leader drills into a topic cluster>
  {Show: frequency trend (90d), proposal categories, % reaching threshold,
   suggested intervention categories — not prescriptive}

  <Leader selects "Flag for organizational review">
  {System: creates a private internal note — not visible to workers}
```

---

## Phase 3 — Democratic Workplace Infrastructure

### 3.1 · Full Governance Proposal Pipeline

**Trigger:** Worker wants to propose a formal governance decision.

```
[Stage 1: Draft]
  Guided format:
    - Problem statement
    - Proposed policy or change
    - Scope (who is affected)
    - Resource implications
    - Proposed decision authority: workers vote / council decides / shared with management
  {Visible only to creator and invited co-authors}

[Stage 2: Comment Period]
  <Creator publishes for comment>
  {All workspace members can comment anonymously}
  {Comments visible to all — attribution not required}
  {Creator can revise in response to comments}
  {Default duration: 7 days; configurable}

[Stage 3: Formal Vote]
  {Vote type: Simple majority / Supermajority / Consensus — configurable}
  {Quorum required: % of workspace — configurable}
  <Workers vote: Support / Oppose / Abstain>

[Stage 4: Outcome]
  PASSES (quorum + majority met):
    {Decision record generated with legitimacy attestation: date, quorum met, vote count}
    {Binding per decision authority agreed at Stage 1}

  FAILS (quorum or majority not met):
    {Record: attempt date, final count, failure reason}
    {Creator can revise and resubmit}
```

---

### 3.2 · Worker Council Election

**Trigger:** Seats are open for election per the workspace's council configuration.

```
[Nomination Phase]
  <Any verified worker can nominate themselves>
  {Brief statement of intent — bounded text}
  {Open for configurable period}

[Statement Phase]
  {Each nominee publishes a statement visible to all workspace members}
  {Anonymous questions can be submitted to nominees; nominees may respond publicly}

[Voting Phase]
  <Workers vote for up to N candidates>
  {Vote method: single transferable vote or simple plurality — configurable}
  {Minimum quorum required}

[Results]
  {Tallied anonymously; results published with vote counts}
  {No individual voter data disclosed}
  {Winners take council seats; legitimacy record generated}
```

---

## Phase 4 — Cooperative Transition Infrastructure

### 4.1 · Ownership Transition Modeling

**Trigger:** Executive or Worker Council initiates exploration of employee ownership.

```
[Ownership Tab]
  {Overview of pathways: ESOP · Worker cooperative · Perpetual Purpose Trust · Phased buyout · Hybrid}
  <User selects a pathway>

[Scenario Modeling]
  Configurable inputs: valuation estimate, eligible worker count, timeline, financing mechanism, post-transition governance model
  {System generates illustrative scenario — explicitly NOT financial advice}
  {Show: tradeoffs, typical timelines, legal considerations, example organizations}

[Transition Readiness Assessment]
  {System reviews workspace Phase 1–3 activity}
  {Show readiness signals: worker participation %, governance capacity, trust signals, areas of concern}
```

---

### 4.2 · Worker Ownership Vote

**Trigger:** Council and workers are ready to formally vote on an ownership transition.

Uses the full governance pipeline (Flow 3.1) with elevated parameters:
- Extended comment period: **30 days** (default)
- Supermajority required: **66%** (default, configurable)
- High quorum required: **75%** of verified workers (default, configurable)

```
[Outcome: Supermajority + High Quorum Met]
  {Transition mandate record generated with full legitimacy attestation}
  {Formal transition authorization document produced}
  {Connects to: legal and financing partner integrations}

[Outcome: Threshold Not Met]
  {Record: which condition failed (quorum or majority)}
  {Suggests: re-engagement pathways, education gaps, timeline revision}
```

---

## Cross-Cutting Flows

### X.1 · Anonymous Question Submission
Available in: Proposal Detail (Phase 1+), Governance Proposals (Phase 3+)

```
<Worker selects "Ask a question">
{Text input — max 280 chars; PII screen runs}
{Question surfaces to proposer — no attribution}
<Proposer may answer publicly (visible to all) or decline>
```

### X.2 · Withdrawal of Commitment
Available in: Phase 1, before threshold reached

```
[My Commitments]
  <Worker selects "Withdraw commitment"> → confirms
  {System: removes from aggregate count; updates threshold display for workspace}
  {No record of who withdrew — the withdrawal is also anonymous}
```

### X.3 · Workspace Integrity Concern
**Trigger:** Worker believes member count is inaccurate (potential infiltration or under-registration).

```
[Trust & Safety]
  <Worker reports concern — describe pattern, no individual accusations required>

[Platform Review]
  {Wrkr admin reviews anonymized verification logs for anomalous patterns}
  {Actions available: revoke suspicious tokens, adjust member count, notify workspace}
  {No individual exposures required to investigate}
```
