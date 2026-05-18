# Wrkr — Glossary

> **Living document** · Updated: 2026-05-17
> **Use when:** any term below appears in a feature discussion, design decision, or product conversation. These definitions are canonical — do not redefine them in context.
> **Related:** [constraints.md](constraints.md) for hard rules. [strategy.md](strategy.md) for the platform overview.

---

## Core Terms

### Threshold
The minimum number (or percentage) of verified workspace members who must make the same conditional commitment before any commitment activates. The threshold is set by the proposal creator at proposal creation. It cannot be changed after the proposal is published.

**Is NOT:** a quorum for discussion, a petition signature count, or a simple majority. A threshold is a synchronization trigger — nothing activates until it is reached.

### Conditional Commitment
A worker's pledge to take a specific action *if and only if* the threshold is reached by the deadline. Commitments are anonymous and reversible before the threshold is met. Once the threshold is met, all commitments activate simultaneously.

**Is NOT:** a vote, a signature, an opinion, or a preference signal. A commitment is a conditional promise to act.

### Threshold Activation
The synchronized event that occurs when the commitment count reaches the threshold. All committed workers are notified simultaneously. The committed action (sign a message, attend a meeting, submit a request) initiates for all participants at once.

**Is NOT:** a publication, a broadcast to management, or a public disclosure. Activation is to the committed workers, not to the organization.

### Workspace
A company-scoped environment containing verified employees of that company. Each workspace is isolated — no worker can see another company's workspace or its data. A workspace is not a chat room or a forum — it is a coordination container.

**Is NOT:** open to management by default. Management cannot access a workspace unless a worker consent vote approves an org-facing dashboard (which is separate from the workspace itself).

### Verified Member
A worker who has passed the anonymous verification process for their company's workspace. Verified member status proves company membership without revealing personal identity. The platform tracks verified member count (used for threshold percentage calculations) but not who those members are.

**Is NOT:** a registered user in the traditional sense. The platform does not maintain a user database with identity records.

### Anonymous Token (Session Token)
The only persistent identifier linking a worker to their activity on the platform. Generated locally during verification; stored on the worker's device; never held on Wrkr servers. If a worker loses their token, their account cannot be recovered — by design.

**Is NOT:** a pseudonym, a username, or a recoverable credential. It is a cryptographic proof of verified membership with no identity attached.

### Organizer
Any verified worker who initiates a proposal. "Organizer" is a functional role, not a platform role — there is no special account type. The platform treats all verified members equally.

**Is NOT:** a union organizer, a formal representative, or a platform admin. The term is used informally to describe the worker who starts a proposal.

### Proposal
A structured instrument for gauging collective support and coordinating action. Proposals are created from templates (not free-form) and contain: a concern framing, a commitment ask, a threshold, and optionally a deadline.

**Is NOT:** a complaint, a vote, a petition, or a message to management. A proposal is a coordination instrument — it is internal to the workspace.

### Aggregate Minimum
The minimum number of data points required before any aggregate signal is surfaced to workers or to an org dashboard. Default: 5. This prevents reverse-engineering individual identity from small group data.

**Is NOT:** a threshold (see above). The aggregate minimum governs when data is *displayed*, not when a commitment *activates*.

### Org-Facing Dashboard
An aggregate-only view of workspace health data — topic clusters, threshold reach rates, sentiment trends — made available to employers only after a successful worker consent vote. Contains no individual data, no proposal text, and no identifying signals.

**Is NOT:** a management monitoring tool. It is an aggregate signal, consented to by workers, of systemic organizational patterns.

### Consent Vote
A formal vote by all verified workspace members on whether to grant the org-side dashboard access. Requires a simple majority of verified members (configurable). Workers can trigger a revocation vote at any time.

**Is NOT:** a survey, a feedback mechanism, or a management decision. The consent vote is a binding collective decision by workers about their own data.

### Governance Proposal
A formal instrument for organizational decision-making (Phase 3). Unlike a standard proposal, a governance proposal goes through a structured pipeline: Draft → Comment Period → Formal Vote → Decision Record. Governance proposals have defined decision authority and produce immutable legitimacy records.

**Is NOT:** a standard proposal (Phase 1). Governance proposals involve deliberation, amendment, and binding outcomes — not just threshold commitment.

### Decision Record
An immutable, tamper-evident record of a governance decision, including: date, vote count, quorum met status, decision authority, and outcome. Used as evidence of collective legitimacy. Stored on-platform and may be exported.

**Is NOT:** meeting minutes, a summary, or a recommendation. A decision record is a formal artifact with legitimacy attestation.

### Worker Council
A representative body elected by verified workspace members (Phase 3). Council members participate in governance on behalf of the broader worker body. Councils have defined scope, term lengths, and seat counts configured per workspace.

**Is NOT:** a union, a works council (in the European legal sense), or a management advisory committee. The council is an internal governance structure with scope defined by the workspace configuration and management acknowledgment.

### Legitimacy Attestation
The platform's certification that a governance decision or threshold activation occurred with sufficient participation and met the configured criteria. Attached to Decision Records and threshold activation records. Provides evidence that outcomes reflect genuine collective support, not individual action.

### Transition Mandate
A formal ownership transition authorization generated after a governance vote that meets supermajority (≥ 66%) and high quorum (≥ 75%) thresholds (Phase 4). Connects to legal and financing partner workflows.

**Is NOT:** a legally binding contract. The transition mandate is a platform-generated legitimacy record — legal instruments are handled by partners.

---

## Phrases to Avoid (and Why)

| Phrase | Why it's wrong | Use instead |
|---|---|---|
| "Anonymous complaint" | Implies venting; no action pathway | "Conditional commitment" or "proposal" |
| "Voting on proposals" | Implies ballot-style polling; Phase 1 is commitments, not votes | "Committing to a proposal" |
| "Union organizing tool" | Incorrect product classification with legal implications | "Coordination infrastructure" |
| "Management dashboard" | Implies employer ownership of the tool | "Org-facing dashboard (worker-consented)" |
| "User account" | Implies identity-linked registration | "Verified member" or "anonymous session" |
| "Sign a petition" | Implies public, named signatures | "Make a conditional commitment" |
| "Enough support" | Vague — triggers no mechanism | "Threshold reached" |
