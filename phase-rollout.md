# Wrkr — Phase Rollout

> **Living document** · Updated: 2026-05-17
> **Use when:** evaluating phase readiness, checking what is in/out of scope for a given phase, understanding success criteria, assessing risk.
> **Related:** [strategy.md](strategy.md) · [constraints.md](constraints.md)

---

## Sequencing Rules

1. **Phases are earned, not scheduled.** A phase opens when prior phase exit criteria are met — not when a date arrives.
2. **Trust is not transferable.** If Phase 1 trust is damaged, no Phase 2 feature recovers it.
3. **Never expose individuals to test a hypothesis.** All experimentation happens on aggregates.
4. **Each phase launches at minimum viable scope.** Expand after validation, not before.
5. **A phase with unresolved trust incidents does not proceed** regardless of other metrics. Trust is the exit criterion that cannot be traded against any other.

---

## Phase 0 — Foundation (Pre-Launch)

### Goal
Internal infrastructure, legal review, and zero-knowledge architecture before any worker touches the system.

### Required Work

| Area | Deliverable |
|---|---|
| Legal | Labor law review (NLRA, GDPR, state labor codes) across target jurisdictions |
| Legal | Written opinion on product classification — not a union, not a financial product |
| Architecture | Zero-knowledge verification system — no PII stored post-verification |
| Architecture | Anonymous token architecture — local device storage, no server-side identity |
| Architecture | Aggregate data architecture — minimum group sizes before any data surfaces |
| Trust & Safety | Threat model: management infiltration, re-identification attacks, token theft |
| Policy | Acceptable use policy — what proposals are and aren't permitted |
| Policy | Content moderation framework for PII in free-form text fields |
| Pilot | 3–5 pilot workspaces identified via worker champions (not employer purchase) |

### Exit Criteria
- [ ] Legal sign-off on product classification and data architecture
- [ ] Zero-knowledge verification passes independent security audit
- [ ] Threat model complete with documented mitigations
- [ ] 3 pilot workspaces confirmed with worker champions
- [ ] Acceptable use policy finalized and legal-reviewed

---

## Phase 1 — Coordination & Visibility (MVP)

### Core Bet
Workers will adopt a coordination tool they genuinely trust — and that trust is built through architecture, not promises.

### In Scope

| Feature | Description |
|---|---|
| Anonymous verification | Work email OTP (email not stored), SSO domain confirmation, or peer invite token |
| Workspace | Company-scoped, verified-member-only |
| Proposal creation | Structured templates only — no free-form |
| Conditional commitments | Threshold-based, anonymized |
| Threshold progress | Aggregate count/progress bar — no individual data |
| Threshold activation | Synchronized notification and action coordination when threshold met |
| Invite links | Workspace-scoped; creator-anonymous |

### Explicitly Out of Scope for Phase 1
- Org-facing dashboard (any form)
- Management accounts
- Free-form text proposals
- Public-facing content
- Any revenue model requiring employer access

### Launch Strategy: Cohort-Based, Not Open

Seed with 3–5 specific workspaces where a worker champion has agreed to introduce the tool. Closed beta. No public sign-up.

**Why:** Network effects require density within a workspace. A single worker in a workspace has no one to coordinate with.

**Minimum viable workspace:** ~20 verified workers.

**Target profiles:** Mid-size companies (100–2,000 employees) in industries with known coordination gaps (tech, healthcare, logistics, retail). Workspaces with existing informal Slack/Signal channels are the strongest signal of coordination desire.

### Success Metrics (Exit Criteria)

| Metric | Target |
|---|---|
| Verified workspaces with ≥ 20 members | 5 |
| Proposals published per workspace (90 days) | ≥ 3 |
| Threshold reach rate | ≥ 30% |
| Worker return rate (active in 2+ weeks) | ≥ 40% |
| Anonymity breach incidents | 0 (required) |
| Worker NPS | ≥ 50 |

### Phase 1 Risks

| Risk | Signal | Mitigation |
|---|---|---|
| Low density — no quorum ever reached | < 10 verified members at 30 days | Proactive invite flow; cohort seeding |
| Anonymity breach | Any credible re-identification report | Immediate incident response; architectural review; phase pause |
| Platform becomes venting channel | High volume, near-zero threshold reach | Structured templates only; no free-form fields |
| Management retaliation against known workers | Reports from worker champions | Legal support protocol; document retaliatory patterns |
| Token loss — workers locked out | High support volume for account recovery | Clear onboarding warning; multiple recovery phrase formats |

---

## Phase 2 — Organizational Health Intelligence

### Entry Criteria (all required)
- [ ] ≥ 10 active workspaces with consistent engagement
- [ ] ≥ 30% threshold reach rate sustained over 6 months
- [ ] Zero anonymity breach incidents
- [ ] Worker NPS ≥ 50 sustained
- [ ] Legal review of aggregate data product and org-side access model complete

### Core Bet
Organizations will pay for aggregate worker sentiment data — but only if workers trust and consent to it. The consent mechanism is the product differentiator.

### In Scope

| Feature | Description |
|---|---|
| Aggregate pattern engine | Topic clustering and trend analysis across workspace proposals |
| Worker insight view | Pattern visibility for workers in their workspace — always on |
| Org consent vote | Workers vote to approve/deny org-side dashboard access |
| Org-facing dashboard | Aggregate clusters, threshold rates, trend data — zero individual data |
| Consent revocation | Workers can trigger a revocation vote at any time |

### Revenue Model
- **Worker tier:** Free. Coordination infrastructure must remain accessible.
- **Org tier:** Subscription for dashboard access — requires active worker consent.

**Sales positioning:** "The first organizational health signal your workers actually trust — because they consented to share it with you." Target: progressive CPOs, people-first CEOs. Avoid: traditional HR buyers focused on compliance and performance management.

### Success Metrics (Exit Criteria)

| Metric | Target |
|---|---|
| Workspaces with active worker-consented org dashboard | ≥ 5 |
| Consent vote approval rate | ≥ 60% of votes that occur |
| Org subscriber renewal rate | ≥ 80% |
| Worker NPS — no degradation | ≥ 50 |
| Insight-to-action rate (orgs reporting policy change from insight) | ≥ 40% |
| Consent revocation rate | < 10% of consented workspaces |

### Phase 2 Risks

| Risk | Signal | Mitigation |
|---|---|---|
| Worker trust erosion from org-side product | Worker NPS decline post-launch | Hard architectural separation; worker-visible consent status always on |
| Org buyers attempt to expand data access | Requests for individual-level data or longer retention | Hard no — policy and architecture both block; see [constraints.md](constraints.md) |
| Consent vote manipulation — management pressure | Anomalous voting patterns; worker reports | Anonymous voting architecture; retaliation reporting channel |
| Orgs pay but don't act on insights | Low insight-to-action rate | Org onboarding includes action planning; insight reports suggest interventions |

---

## Phase 3 — Democratic Workplace Infrastructure

### Entry Criteria (all required)
- [ ] ≥ 20 active workspaces with mature coordination history
- [ ] ≥ 3 workspaces where workers have expressed interest in formal governance
- [ ] Worker NPS sustained ≥ 55
- [ ] Legal review of governance infrastructure (decision legitimacy, binding vs. advisory, jurisdiction)
- [ ] At least one org-side executive champion per pilot workspace — governance requires management acknowledgment to function

### Core Bet
Workers who have coordinated anonymously are ready for structured governance — and organizations with progressive leadership will formalize that participation.

**Why Phase 3 is harder than Phase 1–2:** Unlike earlier phases, Phase 3 requires organizational buy-in. Governance features are meaningless if the organization doesn't recognize the legitimacy of decisions made through them. This phase requires explicit partnership with leadership at each target organization.

### In Scope

| Feature | Description |
|---|---|
| Governance proposal pipeline | Draft → Comment period → Vote → Legitimacy record |
| Quorum and legitimacy configuration | Per-workspace governance rules |
| Decision records | Immutable, tamper-evident, with legitimacy attestation |
| Worker council infrastructure | Seat configuration, elections, term tracking |
| Election system | Nomination, statement, vote, results |
| Collaborative budgeting (experimental) | Participatory budget allocation |

### Launch Approach: Co-Design, Not Feature Launch
Phase 3 is a supported engagement with specific workspaces that have: active Phase 1–2 history, leadership willing to formally recognize worker governance outcomes, and a defined initial governance scope.

**Starting scope examples:** workers vote on office/remote policy; workers prioritize top 3 issues for quarterly leadership review; workers elect 2 representatives to a standing feedback council.

### Success Metrics (Exit Criteria)

| Metric | Target |
|---|---|
| Workspaces with active governance pipelines | ≥ 5 |
| Formal governance decisions with legitimacy attestation | ≥ 10 across pilots |
| Worker participation rate in governance votes | ≥ 50% of verified members |
| Organization recognition rate (decisions acted on by management) | ≥ 70% |
| Worker council elections completed | ≥ 3 |
| Worker NPS — no degradation | ≥ 55 |

### Phase 3 Risks

| Risk | Signal | Mitigation |
|---|---|---|
| Management ignores governance decisions | Low org recognition rate | Only proceed with workspaces where exec buy-in is pre-committed |
| Scope creep into legally contentious areas | Governance proposals touching employment terms, labor law | Governance scope defined at workspace setup; legal review required |
| Governance fatigue | < 30% participation rate | Limit concurrent active proposals; async-first design |
| Council capture — organized faction dominates | Uncontested elections; homogeneous composition | Proportional representation options; contested election design |
| Legitimacy disputes | Management contests vote count or process | Immutable decision records; audit trail; third-party attestation option |

---

## Phase 4 — Cooperative Transition Infrastructure

### Entry Criteria (all required)
- [ ] ≥ 5 workspaces with ≥ 12 months of Phase 3 usage
- [ ] ≥ 1 organization that has formally requested cooperative transition support
- [ ] Legal infrastructure: cooperative law firms, ESOP attorneys, cooperative finance partners in place
- [ ] Ownership modeling tools validated by legal and financial experts
- [ ] Worker NPS sustained ≥ 60

### Core Bet
Worker ownership transitions fail primarily because organizations lack the trust, coordination, and governance capacity to navigate them — not because of financing or legal barriers. Workspaces at Phase 4 have already built that capacity.

### This Phase Is Not Universal
Phase 4 is for a small subset of organizations: genuine leadership commitment to worker ownership, established governance experience, and a transition trigger (founder exit, acquisition approach, mission alignment). Do not position as a general feature.

### In Scope

| Feature | Description |
|---|---|
| Ownership pathway explorer | Overview and comparison of ESOP, cooperative, trust, hybrid models |
| Scenario modeling tool | Configurable illustrative models — not financial advice |
| Transition readiness assessment | Platform-generated readiness signals from Phase 1–3 history |
| Worker education modules | Plain-language explainers for each model |
| Ownership transition governance | Extended deliberation + supermajority vote infrastructure |
| Partner directory | Legal, financial, and advisory partners for each pathway |
| Transition mandate record | Formal documentation of democratic mandate |

### Required Partner Ecosystem

| Partner Type | Role |
|---|---|
| Cooperative law firms | Legal structure design, articles of incorporation |
| ESOP attorneys | ESOP plan design, IRS compliance |
| Cooperative finance institutions | Acquisition financing, patient capital |
| Transition advisors | Project management of transition process |
| Worker cooperative networks | Peer support, case studies |

### Success Metrics

| Metric | Target |
|---|---|
| Ownership transitions initiated | ≥ 1 (Year 1 of Phase 4) |
| Worker vote participation in ownership decisions | ≥ 75% of verified members |
| Transitions completed | ≥ 1 (Year 2 of Phase 4) |
| Worker satisfaction post-transition (12 months) | ≥ 70% positive |

### Phase 4 Risks

| Risk | Signal | Mitigation |
|---|---|---|
| Financial complexity derails transition | Transition initiated but stalls | Partner integrations provide expert support; platform enables process, not outcomes |
| Platform treated as giving financial advice | Users acting on scenario models as advice | Explicit disclaimers; illustrative-only framing throughout |
| Failed transition — workers blame platform | Post-transition satisfaction < 50% | Set clear expectations upfront; platform provides infrastructure, not guarantees |
| Regulatory classification as securities product | Legal review flags modeling tools | Conservative design; no investment recommendations, ever |

---

## Cross-Phase Architecture Commitments

These apply across all phases and cannot be traded away to accelerate a phase or close a deal.

| Commitment | Rule |
|---|---|
| No PII storage post-verification | Email and SSO identity destroyed after membership token is generated |
| Aggregate minimums | No data surface until minimum group size is met (default: 5) |
| Worker consent gate | Org-side data access always requires active worker majority consent — no admin override |
| Anonymous token architecture | Worker identity never stored server-side; recovery is worker-controlled |
| Immutable decision records | Governance and threshold outcomes are tamper-evident |
| No individual behavioral data | Platform does not track which proposals individuals viewed, time spent, or navigation patterns |

→ For the full list of hard constraints and settled decisions, see [constraints.md](constraints.md).
